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

import { GraphReadyMode, GraphStreamErrorCode, ReadyStatusKind } from "./graphStream.mjs";
import { SyncPhase, SyncUploadMode } from "./sync.mjs";
export function isSyncInProgress(session) {
    if (!session)
        return false;
    const phase = String(session.sync_phase || "").trim();
    if (phase === SyncPhase.UPLOADING || phase === SyncPhase.SEALING)
        return true;
    return Boolean(String(session.sync_session_id || "").trim());
}
export function isColdSyncInProgress(session) {
    if (!session || !isSyncInProgress(session))
        return false;
    const mode = String(session.sync_upload_mode || "").trim();
    return mode === SyncUploadMode.STREAMING || mode === "";
}
export function isDeltaSyncInProgress(session) {
    if (!session || !isSyncInProgress(session))
        return false;
    return String(session.sync_upload_mode || "").trim() === SyncUploadMode.DELTA;
}
export function isCanonicalSnapshotReady(session) {
    if (!session || isSyncInProgress(session))
        return false;
    const phase = String(session.sync_phase || "").trim();
    return phase === SyncPhase.READY || Boolean(session.snapshot_saved);
}
export function lastSyncFailed(session) {
    if (!session)
        return false;
    return (String(session.sync_phase || "").trim() === SyncPhase.FAILED ||
        Boolean(session.graph_error));
}
export function hasReadableSnapshot(session) {
    if (!session)
        return false;
    const phase = String(session.sync_phase || "").trim();
    if (phase === SyncPhase.READY || Boolean(session.snapshot_saved))
        return true;
    return Number(session.graph_version ?? 0) > 0;
}
export function shouldConnectGraphStream(session) {
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
};
export function graphViewState(session, viewer) {
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
export function graphViewNotice(state, counts = {}) {
    const shown = Number(counts.nodesShown ?? 0);
    const total = Number(counts.totalNodes ?? 0);
    switch (state) {
        case GraphViewState.PARTIAL: {
            const countable = shown > 0 && total > 0 && shown <= total;
            const of = countable
                ? ` (${shown.toLocaleString()} of ${total.toLocaleString()} nodes)`
                : "";
            return {
                text: `Incomplete graph${of} — part of your project is missing from this view. Retry the sync.`,
                kind: "err",
            };
        }
        case GraphViewState.STALE:
            return {
                text: "Last sync failed — showing your project as of the last successful snapshot.",
                kind: "warn",
            };
        case GraphViewState.UNAVAILABLE:
            return { text: NO_SNAPSHOT_YET, kind: "warn" };
        default:
            return null;
    }
}
export const NO_SNAPSHOT_YET = "No snapshot to show yet — run a sync.";
export const CONNECTION_LOST = "Lost the connection to the Polymerix service. Check your internet connection — the viewer keeps retrying.";
export const CONNECTION_GIVEN_UP = "Lost the connection to the Polymerix service and stopped retrying. Reload the page to try again.";
export const GRAPH_NOT_DRAWN = "Your graph could not be drawn. Reload the page.";
export const SESSION_UNREADABLE = "Can't read the current project from dont-break. Check it is still running, then reload the page.";
export const VIEWER_FAILURE_UNNAMED = "Something went wrong in the graph view.";
export const FAILURE_REPORT_HINT = "If it keeps happening, send us this: ";
const FAILURE_DETAIL_MAX = 200;
function failureDetail(raw) {
    if (raw == null)
        return "";
    const text = typeof raw === "string" ? raw : String(raw?.message ?? raw);
    if (!text || text === "[object Object]")
        return "";
    const compact = text.split(/\s+/).filter(Boolean).join(" ");
    if (compact.length <= FAILURE_DETAIL_MAX)
        return compact;
    return `${compact.slice(0, FAILURE_DETAIL_MAX - 1).trimEnd()}…`;
}
function failureText(observed, raw) {
    const detail = failureDetail(raw);
    return detail ? `${observed} ${FAILURE_REPORT_HINT}${detail}` : observed;
}
const GRAPH_STREAM_ERROR_TEXT = new Map([
    [GraphStreamErrorCode.GRAPH_UNAVAILABLE, { text: NO_SNAPSHOT_YET, kind: "warn" }],
    [GraphStreamErrorCode.PROXY_FAILED, { text: CONNECTION_LOST, kind: "warn" }],
    [GraphStreamErrorCode.SOCKET_ERROR, { text: CONNECTION_LOST, kind: "warn" }],
]);
export function graphStreamErrorNotice(msg) {
    const known = GRAPH_STREAM_ERROR_TEXT.get(String(msg?.code || "").trim());
    if (known)
        return { ...known };
    return { text: failureText(VIEWER_FAILURE_UNNAMED, msg?.message), kind: "err" };
}
export function graphNotDrawnNotice(err) {
    return { text: failureText(GRAPH_NOT_DRAWN, err), kind: "err" };
}
export function sessionUnreadableNotice(err) {
    return { text: failureText(SESSION_UNREADABLE, err), kind: "err" };
}
export function effectiveSyncSessionId(session) {
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
export function shouldSessionReadyReload(session, prevLive, prevSyncId, prevSession) {
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
export function readyStatusFromMessage(msg) {
    const mode = String(msg?.mode || "").trim();
    if (mode === GraphReadyMode.LIVE)
        return { kind: ReadyStatusKind.LIVE };
    if (mode === GraphReadyMode.COLD_WAIT)
        return { kind: ReadyStatusKind.COLD_WAIT };
    if (msg?.total_nodes == null)
        return { kind: ReadyStatusKind.WAITING };
    const totalNodes = Number(msg.total_nodes);
    if (!Number.isFinite(totalNodes))
        return { kind: ReadyStatusKind.WAITING };
    return { kind: ReadyStatusKind.READY, totalNodes };
}
export function readyStatusLabel(status) {
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
export function shouldFullRelayout(prevIds, nextIds) {
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
export function seedPositionFromNeighbors(neighborPositions, fallback, jitter = [0, 0, 0]) {
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
export function shouldAutoFrameCamera(lastUserInteractionMs, nowMs, cooldownMs = CAMERA_AUTO_FRAME_COOLDOWN_MS) {
    if (lastUserInteractionMs == null || !Number.isFinite(lastUserInteractionMs))
        return true;
    return nowMs - lastUserInteractionMs >= cooldownMs;
}
