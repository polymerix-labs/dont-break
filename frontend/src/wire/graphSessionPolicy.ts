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

import type { ReadyMessage, ReadyStatus } from "../viewer/graphSessionPolicy.types";
import type { SessionSnapshot } from "../api/session";
import { GraphReadyMode, ReadyStatusKind } from "./graphStream";
import { SyncPhase, SyncUploadMode } from "./sync";
export function isSyncInProgress(session: SessionSnapshot | null): boolean {
    if (!session)
        return false;
    const phase = String(session.sync_phase || "").trim();
    if (phase === SyncPhase.UPLOADING || phase === SyncPhase.SEALING)
        return true;
    return Boolean(String(session.sync_session_id || "").trim());
}
export function isColdSyncInProgress(session: SessionSnapshot | null): boolean {
    if (!session || !isSyncInProgress(session))
        return false;
    const mode = String(session.sync_upload_mode || "").trim();
    return mode === SyncUploadMode.STREAMING || mode === "";
}
export function isDeltaSyncInProgress(session: SessionSnapshot | null): boolean {
    if (!session || !isSyncInProgress(session))
        return false;
    return String(session.sync_upload_mode || "").trim() === SyncUploadMode.DELTA;
}
export function isCanonicalSnapshotReady(session: SessionSnapshot | null): boolean {
    if (!session || isSyncInProgress(session))
        return false;
    const phase = String(session.sync_phase || "").trim();
    return phase === SyncPhase.READY || Boolean(session.snapshot_saved);
}
export function lastSyncFailed(session: SessionSnapshot | null): boolean {
    if (!session)
        return false;
    return (String(session.sync_phase || "").trim() === SyncPhase.FAILED ||
        Boolean(session.graph_error));
}
export function hasReadableSnapshot(session: SessionSnapshot | null): boolean {
    if (!session)
        return false;
    const phase = String(session.sync_phase || "").trim();
    if (phase === SyncPhase.READY || Boolean(session.snapshot_saved))
        return true;
    return Number(session.graph_version ?? 0) > 0;
}
export function shouldConnectGraphStream(session: SessionSnapshot | null): boolean {
    if (!session)
        return false;
    if (isSyncInProgress(session)) {
        return Boolean(String(session.sync_session_id || "").trim());
    }
    return hasReadableSnapshot(session);
}
export const GraphViewState = {
    CURRENT: "current",
    STALE: "stale",
    PARTIAL: "partial",
    UNAVAILABLE: "unavailable",
} as const;
export type GraphViewState = (typeof GraphViewState)[keyof typeof GraphViewState];
export type ViewerCounters = {
    streamComplete: boolean;
    nodesShown: number;
};
export function graphViewState(session: SessionSnapshot | null, viewer?: ViewerCounters): GraphViewState {
    if (!hasReadableSnapshot(session))
        return GraphViewState.UNAVAILABLE;
    const complete = viewer
        ? Boolean(viewer.streamComplete)
        : Boolean(session?.graph_bootstrap_complete);
    const nodesShown = viewer
        ? Number(viewer.nodesShown) || 0
        : Number(session?.graph_nodes_received ?? 0);
    if (nodesShown > 0 && !complete)
        return GraphViewState.PARTIAL;
    if (lastSyncFailed(session))
        return GraphViewState.STALE;
    return GraphViewState.CURRENT;
}
export type GraphViewNotice = {
    text: string;
    kind: "warn" | "err";
    action?: "sync";
} | null;
export function graphViewNotice(state: GraphViewState, counts: {
    nodesShown?: number;
    totalNodes?: number | null;
} = {}): GraphViewNotice {
    const shown = Number(counts.nodesShown ?? 0);
    const total = Number(counts.totalNodes ?? 0);
    switch (state) {
        case GraphViewState.PARTIAL: {
            const countable = shown > 0 && total > 0 && shown <= total;
            const of = countable ? ` (${shown.toLocaleString()} of ${total.toLocaleString()} nodes)` : "";
            return {
                text: `Incomplete graph${of} — part of your project is missing from this view. Retry the sync.`,
                kind: "err",
                action: "sync",
            };
        }
        case GraphViewState.STALE:
            return {
                text: "Last sync failed — showing your project as of the last successful snapshot.",
                kind: "warn",
                action: "sync",
            };
        case GraphViewState.UNAVAILABLE:
            return {
                text: "No snapshot to show yet — run a sync.",
                kind: "warn",
                action: "sync",
            };
        default:
            return null;
    }
}
export function effectiveSyncSessionId(session: SessionSnapshot | null): string {
    if (!session)
        return "";
    if (isSyncInProgress(session)) {
        return String(session.sync_session_id || "").trim();
    }
    const phase = String(session.sync_phase || "").trim();
    if (phase === SyncPhase.READY || phase === SyncPhase.FAILED || session.snapshot_saved) {
        return "";
    }
    return String(session.sync_session_id || "").trim();
}
export function shouldSessionReadyReload(session: SessionSnapshot | null, prevLive: boolean, prevSyncId: string, prevSession?: SessionSnapshot | null): boolean {
    if (!session)
        return false;
    const ready = session.sync_phase === SyncPhase.READY || Boolean(session.snapshot_saved);
    if (!ready || isSyncInProgress(session))
        return false;
    if (prevLive || prevSyncId)
        return true;
    if (prevSession && isColdSyncInProgress(prevSession) && Boolean(session.snapshot_saved)) {
        return true;
    }
    return false;
}
export function readyStatusFromMessage(msg: ReadyMessage): ReadyStatus {
    const mode = String(msg.mode || "").trim();
    if (mode === GraphReadyMode.LIVE)
        return { kind: ReadyStatusKind.LIVE };
    if (mode === GraphReadyMode.COLD_WAIT)
        return { kind: ReadyStatusKind.COLD_WAIT };
    if (msg.total_nodes == null)
        return { kind: ReadyStatusKind.WAITING };
    const totalNodes = Number(msg.total_nodes);
    if (!Number.isFinite(totalNodes))
        return { kind: ReadyStatusKind.WAITING };
    return { kind: ReadyStatusKind.READY, totalNodes };
}
export function readyStatusLabel(status: ReadyStatus): string {
    switch (status.kind) {
        case ReadyStatusKind.COLD_WAIT:
            return "Sealing snapshot on server…";
        case ReadyStatusKind.LIVE:
            return "Sync in progress…";
        case ReadyStatusKind.WAITING:
            return "Waiting for graph snapshot…";
        case ReadyStatusKind.READY:
            return `Graph ready (${status.totalNodes.toLocaleString()} nodes). Streaming…`;
        default:
            return "Waiting for graph snapshot…";
    }
}
export const FULL_RELAYOUT_OVERLAP_THRESHOLD = 0.5;
export function shouldFullRelayout(prevIds: Iterable<string> | null | undefined, nextIds: Iterable<string> | null | undefined): boolean {
    const prev = prevIds ? [...prevIds] : [];
    const next = nextIds ? [...nextIds] : [];
    if (prev.length === 0)
        return true;
    if (next.length === 0)
        return true;
    const prevSet = new Set(prev);
    let overlap = 0;
    for (const id of next) {
        if (prevSet.has(id))
            overlap += 1;
    }
    const denom = Math.max(prev.length, next.length);
    return overlap / denom < FULL_RELAYOUT_OVERLAP_THRESHOLD;
}
export function seedPositionFromNeighbors(neighborPositions: Array<[
    number,
    number,
    number
]>, fallback: [
    number,
    number,
    number
], jitter: [
    number,
    number,
    number
] = [0, 0, 0]): [
    number,
    number,
    number
] {
    const jx = Number(jitter[0]) || 0;
    const jy = Number(jitter[1]) || 0;
    const jz = Number(jitter[2]) || 0;
    if (!neighborPositions || neighborPositions.length === 0) {
        return [fallback[0] + jx, fallback[1] + jy, fallback[2] + jz];
    }
    let x = 0;
    let y = 0;
    let z = 0;
    for (const p of neighborPositions) {
        x += p[0];
        y += p[1];
        z += p[2];
    }
    const n = neighborPositions.length;
    return [x / n + jx, y / n + jy, z / n + jz];
}
export const CAMERA_AUTO_FRAME_COOLDOWN_MS = 5000;
export function shouldAutoFrameCamera(lastUserInteractionMs: number | null | undefined, nowMs: number, cooldownMs: number = CAMERA_AUTO_FRAME_COOLDOWN_MS): boolean {
    if (lastUserInteractionMs == null || !Number.isFinite(lastUserInteractionMs))
        return true;
    return nowMs - lastUserInteractionMs >= cooldownMs;
}
export { progressFromSnapshot } from "./syncProgress";
