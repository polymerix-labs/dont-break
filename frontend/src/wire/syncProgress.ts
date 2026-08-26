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

import type { SessionSnapshot } from "../api/session";
import { isSyncInProgress } from "./graphSessionPolicy";
import { SyncPhase, SyncProgressLabel, SyncProgressThresholds, phaseLabel, syncPhaseStatusLabel, } from "./sync";
export type SyncProgressView = {
    active: boolean;
    pct: number | null;
    label: string;
};
export function progressFromSnapshot(session: SessionSnapshot | null): SyncProgressView {
    if (!session) {
        return { active: false, pct: null, label: "" };
    }
    const phase = String(session.sync_phase || "").trim();
    const pctRaw = Number(session.coverage_pct ?? 0);
    const active = !Boolean(session.snapshot_saved) &&
        (phase === SyncPhase.UPLOADING ||
            phase === SyncPhase.SEALING ||
            isSyncInProgress(session));
    if (!active) {
        return { active: false, pct: null, label: "" };
    }
    const pushed = String(session.sync_progress_label || "").trim();
    const fallback = pctRaw >= SyncProgressThresholds.SEALING_MIN_PCT
        ? SyncProgressLabel.SEALING
        : phaseLabel(phase);
    const label = pushed || fallback;
    if (phase === SyncPhase.UPLOADING && pushed) {
        return {
            active: true,
            pct: pctRaw > 0 ? Math.max(0, Math.min(100, pctRaw)) : null,
            label,
        };
    }
    if (phase === SyncPhase.SEALING && pctRaw < SyncProgressThresholds.SEALING_MIN_PCT) {
        return { active: true, pct: null, label };
    }
    return { active: true, pct: Math.max(0, Math.min(100, pctRaw)), label };
}
export function syncStatusLabel(session: SessionSnapshot | null): string {
    const progress = progressFromSnapshot(session);
    if (progress.active)
        return progress.label;
    return syncPhaseStatusLabel(session?.sync_phase);
}
