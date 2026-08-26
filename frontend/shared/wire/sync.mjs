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

export const SyncPhase = Object.freeze({
    UPLOADING: "UPLOADING",
    SEALING: "SEALING",
    READY: "READY",
    FAILED: "FAILED",
});
export const SyncEventType = Object.freeze({
    SESSION_OPEN: "session.open",
    UPLOAD_PROGRESS: "upload.progress",
    UPLOAD_ACCEPTED: "upload.accepted",
    UPLOAD_REJECTED: "upload.rejected",
    GRAPH_VERSION: "graph.version",
    L2_PARTIAL: "l2.partial",
    PHASE: "phase",
    SEALED: "sealed",
    FAILED: "failed",
    HEARTBEAT: "heartbeat",
});
export const SyncUploadMode = Object.freeze({
    DELTA: "delta",
    STREAMING: "streaming",
});
export const SyncResultKind = Object.freeze({
    SYNC_COLD: "sync_cold",
    SYNC_DELTA: "sync_delta",
});
export const SyncProgressThresholds = Object.freeze({
    SEALING_MIN_PCT: 85,
    L2_BLEND_BASE: 85,
    L2_BLEND_SCALE: 0.15,
});
export const SyncProgressLabel = Object.freeze({
    STARTING: "Starting sync…",
    EXTRACTING: "Extracting facts…",
    FACTS_EXTRACTED: "Facts extracted",
    UPLOADING_PARTS: "Uploading parts…",
    UPLOAD_COMPLETE: "Upload complete",
    BUILDING_GRAPH: "Building graph…",
    UPLOADING_FILES: "Uploading files…",
    SEALING: "Sealing snapshot…",
    RESOLVING: "Resolving references…",
    SYNCING: "Syncing…",
});
export function syncL2BlendPct(l2CoveragePct) {
    const l2 = Math.max(0, Math.min(100, Number(l2CoveragePct) || 0));
    return SyncProgressThresholds.L2_BLEND_BASE + Math.round(l2 * SyncProgressThresholds.L2_BLEND_SCALE);
}
export function phaseLabel(phase) {
    switch (String(phase || "").trim()) {
        case SyncPhase.UPLOADING:
            return SyncProgressLabel.UPLOADING_FILES;
        case SyncPhase.SEALING:
            return SyncProgressLabel.SEALING;
        default:
            return SyncProgressLabel.SYNCING;
    }
}
export function syncPhaseStatusLabel(phase) {
    const value = String(phase || "").trim();
    if (!value)
        return "";
    switch (value) {
        case SyncPhase.READY:
            return "Snapshot ready";
        case SyncPhase.FAILED:
            return "Last sync failed";
        default:
            return phaseLabel(value);
    }
}
