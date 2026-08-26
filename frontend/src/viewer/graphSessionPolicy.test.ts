/**
 * Copyright 2026 Polymerix
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { strict as assert } from "node:assert";
import { SyncPhase } from "../wire/sync";
import { GraphReadyMode, ReadyStatusKind } from "../wire/graphStream";
import type { SessionSnapshot } from "../api/session";
import { GraphViewState, effectiveSyncSessionId, graphViewNotice, graphViewState, hasReadableSnapshot, isSyncInProgress, readyStatusFromMessage, readyStatusLabel, seedPositionFromNeighbors, shouldAutoFrameCamera, shouldConnectGraphStream, shouldFullRelayout, shouldSessionReadyReload, } from "./graphSessionPolicy.ts";
function session(partial: Partial<SessionSnapshot>): SessionSnapshot {
    return {
        authenticated: true,
        org_slug: "labs",
        workspace_id: "labs",
        project_path: "/p",
        project_slug: "app",
        snapshot_saved: false,
        graph_error: "",
        graph_stream_available: false,
        graph_bootstrap_complete: false,
        graph_nodes_received: 0,
        ...partial,
    };
}
function test(name: string, fn: () => void): void {
    try {
        fn();
        console.log(`ok ${name}`);
    }
    catch (err) {
        console.error(`fail ${name}`);
        throw err;
    }
}
test("isSyncInProgress during UPLOADING with sync_session_id", () => {
    assert.equal(isSyncInProgress(session({
        snapshot_saved: true,
        sync_phase: SyncPhase.UPLOADING,
        sync_session_id: "sess-1",
    })), true);
});
test("effectiveSyncSessionId keeps sync id during upload", () => {
    assert.equal(effectiveSyncSessionId(session({
        snapshot_saved: true,
        sync_phase: SyncPhase.UPLOADING,
        sync_session_id: "sess-1",
    })), "sess-1");
});
test("effectiveSyncSessionId clears when READY", () => {
    assert.equal(effectiveSyncSessionId(session({ snapshot_saved: true, sync_phase: SyncPhase.READY, sync_session_id: "" })), "");
});
test("shouldSessionReadyReload after SFS cold seal completes", () => {
    assert.equal(shouldSessionReadyReload(session({ snapshot_saved: true, sync_phase: SyncPhase.READY, sync_session_id: "" }), false, "", session({
        sync_phase: SyncPhase.SEALING,
        sync_session_id: "sess-1",
        sync_upload_mode: "streaming",
    })), true);
});
test("shouldSessionReadyReload after live sync transition", () => {
    assert.equal(shouldSessionReadyReload(session({ snapshot_saved: true, sync_phase: SyncPhase.READY, sync_session_id: "" }), false, "sess-old"), true);
});
test("shouldSessionReadyReload false while sync still running", () => {
    assert.equal(shouldSessionReadyReload(session({
        snapshot_saved: true,
        sync_phase: SyncPhase.SEALING,
        sync_session_id: "sess-1",
    }), true, "sess-1"), false);
});
test("shouldConnectGraphStream false during SEALING without sync id", () => {
    assert.equal(shouldConnectGraphStream(session({
        sync_phase: SyncPhase.SEALING,
        sync_session_id: "",
    })), false);
});
test("shouldConnectGraphStream true during SFS cold sync with sync_session_id", () => {
    assert.equal(shouldConnectGraphStream(session({
        sync_phase: SyncPhase.SEALING,
        sync_session_id: "sess-1",
        sync_upload_mode: "streaming",
    })), true);
});
test("shouldConnectGraphStream true during delta sync with sync_session_id", () => {
    assert.equal(shouldConnectGraphStream(session({
        sync_phase: SyncPhase.SEALING,
        sync_session_id: "sess-1",
        sync_upload_mode: "delta",
    })), true);
});
test("shouldConnectGraphStream true when READY with snapshot_saved", () => {
    assert.equal(shouldConnectGraphStream(session({ snapshot_saved: true, sync_phase: SyncPhase.READY, sync_session_id: "" })), true);
});
test("shouldConnectGraphStream false when FAILED with nothing sealed yet", () => {
    assert.equal(shouldConnectGraphStream(session({ sync_phase: SyncPhase.FAILED, graph_error: "COMPUTE_OOM" })), false);
});
test("a failed sync does not close the read of an already sealed snapshot", () => {
    const failed = session({
        sync_phase: SyncPhase.FAILED,
        graph_error: "The snapshot build stopped responding. Retry the sync.",
        graph_version: 11,
    });
    assert.equal(hasReadableSnapshot(failed), true);
    assert.equal(shouldConnectGraphStream(failed), true);
});
test("a readable snapshot after a failed sync is announced as stale, never as current", () => {
    const failed = session({
        sync_phase: SyncPhase.FAILED,
        graph_error: "The snapshot build stopped responding. Retry the sync.",
        graph_version: 11,
        graph_bootstrap_complete: true,
        graph_nodes_received: 727,
    });
    assert.equal(graphViewState(failed), GraphViewState.STALE);
    const notice = graphViewNotice(GraphViewState.STALE);
    assert.equal(notice?.kind, "warn");
    assert.match(notice?.text ?? "", /last successful snapshot/);
});
test("a graph that stopped mid-bootstrap is announced as incomplete", () => {
    const partial = session({
        sync_phase: SyncPhase.FAILED,
        graph_error: "The snapshot build stopped responding. Retry the sync.",
        graph_version: 11,
        graph_bootstrap_complete: false,
        graph_nodes_received: 702,
    });
    assert.equal(graphViewState(partial), GraphViewState.PARTIAL);
    const notice = graphViewNotice(GraphViewState.PARTIAL, {
        nodesShown: 702,
        totalNodes: 727,
    });
    assert.equal(notice?.kind, "err");
    assert.match(notice?.text ?? "", /702 of 727 nodes/);
    assert.match(notice?.text ?? "", /missing/);
});
test("a count that outran its total is dropped, not shown", () => {
    const notice = graphViewNotice(GraphViewState.PARTIAL, {
        nodesShown: 730,
        totalNodes: 727,
    });
    assert.equal(notice?.kind, "err");
    assert.match(notice?.text ?? "", /Incomplete graph/);
    assert.doesNotMatch(notice?.text ?? "", /\d/);
});
test("the host's tally never becomes a number on screen", () => {
    const notice = graphViewNotice(GraphViewState.PARTIAL);
    assert.doesNotMatch(notice?.text ?? "", /\d/);
});
test("the viewer's bootstrap is read with the viewer's own count", () => {
    const reconnecting = session({
        snapshot_saved: true,
        sync_phase: SyncPhase.READY,
        graph_version: 12,
        graph_bootstrap_complete: true,
        graph_nodes_received: 727,
    });
    assert.equal(graphViewState(reconnecting, { streamComplete: false, nodesShown: 100 }), GraphViewState.PARTIAL);
    assert.equal(graphViewState(reconnecting, { streamComplete: true, nodesShown: 727 }), GraphViewState.CURRENT);
});
test("a whole graph from a successful sync says nothing extra", () => {
    const current = session({
        snapshot_saved: true,
        sync_phase: SyncPhase.READY,
        graph_version: 12,
        graph_bootstrap_complete: true,
        graph_nodes_received: 727,
    });
    assert.equal(graphViewState(current), GraphViewState.CURRENT);
    assert.equal(graphViewNotice(GraphViewState.CURRENT), null);
});
test("no snapshot at all is not dressed up as one", () => {
    const nothing = session({ sync_phase: SyncPhase.FAILED, graph_error: "boom" });
    assert.equal(graphViewState(nothing), GraphViewState.UNAVAILABLE);
    assert.equal(graphViewNotice(GraphViewState.UNAVAILABLE)?.kind, "warn");
});
test("a sync in progress still needs its session id to stream", () => {
    assert.equal(shouldConnectGraphStream(session({ sync_phase: SyncPhase.UPLOADING, sync_session_id: "", graph_version: 11 })), false);
});
test("readyStatusFromMessage cold_wait", () => {
    assert.deepEqual(readyStatusFromMessage({ mode: GraphReadyMode.COLD_WAIT }), {
        kind: ReadyStatusKind.COLD_WAIT,
    });
    assert.match(readyStatusLabel({ kind: ReadyStatusKind.COLD_WAIT }), /Sealing snapshot/);
});
test("readyStatusFromMessage waiting without total_nodes", () => {
    assert.deepEqual(readyStatusFromMessage({}), {
        kind: ReadyStatusKind.WAITING,
    });
});
test("readyStatusFromMessage ready with nodes", () => {
    const status = readyStatusFromMessage({ total_nodes: 42 });
    assert.equal(status.kind, ReadyStatusKind.READY);
    if (status.kind === ReadyStatusKind.READY) {
        assert.equal(status.totalNodes, 42);
        assert.match(readyStatusLabel(status), /42 nodes/);
    }
});
test("readyStatusFromMessage waiting for invalid total_nodes", () => {
    assert.deepEqual(readyStatusFromMessage({ total_nodes: "?" as unknown as number }), {
        kind: ReadyStatusKind.WAITING,
    });
});
test("shouldFullRelayout on first load", () => {
    assert.equal(shouldFullRelayout([], ["a", "b"]), true);
    assert.equal(shouldFullRelayout(null, ["a"]), true);
});
test("shouldFullRelayout reconciles high overlap", () => {
    assert.equal(shouldFullRelayout(["a", "b", "c", "d"], ["a", "b", "c", "e"]), false);
});
test("shouldFullRelayout when identity changes", () => {
    assert.equal(shouldFullRelayout(["a", "b", "c", "d"], ["w", "x", "y", "z"]), true);
});
test("seedPositionFromNeighbors falls back", () => {
    assert.deepEqual(seedPositionFromNeighbors([], [1, 2, 3], [0.5, 0, 0]), [1.5, 2, 3]);
});
test("seedPositionFromNeighbors barycentre", () => {
    assert.deepEqual(seedPositionFromNeighbors([
        [0, 0, 0],
        [2, 4, 6],
    ], [9, 9, 9], [0, 0, 0]), [1, 2, 3]);
});
test("shouldAutoFrameCamera cooldown", () => {
    assert.equal(shouldAutoFrameCamera(null, 10000), true);
    assert.equal(shouldAutoFrameCamera(9000, 10000, 5000), false);
    assert.equal(shouldAutoFrameCamera(4000, 10000, 5000), true);
});
console.log("graphSessionPolicy tests passed");
