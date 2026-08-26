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
import { SyncPhase, SyncProgressLabel, phaseLabel, syncPhaseStatusLabel } from "./sync";
import { progressFromSnapshot, syncStatusLabel } from "./syncProgress";
import * as shared from "../../shared/wire/syncProgress.mjs";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
function session(partial: Partial<SessionSnapshot>): SessionSnapshot {
    return {
        authenticated: true,
        org_slug: "labs",
        workspace_id: "labs",
        project_path: "/p",
        project_id: "prj_1",
        project_slug: "pokedex",
        project_display_name: "pokedex",
        snapshot_saved: false,
        graph_error: "",
        graph_stream_available: false,
        graph_bootstrap_complete: false,
        graph_nodes_received: 0,
        ...partial,
    } as SessionSnapshot;
}
const stuck = progressFromSnapshot(session({
    sync_phase: SyncPhase.UPLOADING,
    sync_session_id: "sess-1",
    coverage_pct: 98,
    sync_progress_label: "",
}));
check("a counter in the seal band is never labelled as an upload", stuck.label !== SyncProgressLabel.UPLOADING_FILES);
check("a counter in the seal band reads as a seal", stuck.label === SyncProgressLabel.SEALING);
check("the counter itself is untouched", stuck.pct === 98);
const uploading = progressFromSnapshot(session({
    sync_phase: SyncPhase.UPLOADING,
    sync_session_id: "sess-1",
    coverage_pct: 40,
    sync_progress_label: "",
}));
check("an upload in its own band still reads as an upload", uploading.label === SyncProgressLabel.UPLOADING_FILES);
check("the upload counter is shown", uploading.pct === 40);
const pushed = progressFromSnapshot(session({
    sync_phase: SyncPhase.UPLOADING,
    sync_session_id: "sess-1",
    coverage_pct: 82,
    sync_progress_label: SyncProgressLabel.BUILDING_GRAPH,
}));
check("a pushed label wins over the phase default", pushed.label === SyncProgressLabel.BUILDING_GRAPH);
check("a pushed label keeps its counter", pushed.pct === 82);
const earlySeal = progressFromSnapshot(session({
    sync_phase: SyncPhase.SEALING,
    sync_session_id: "sess-1",
    coverage_pct: 40,
    sync_progress_label: "",
}));
check("an early seal shows no number", earlySeal.pct === null);
check("an early seal says it is sealing", earlySeal.label === SyncProgressLabel.SEALING);
const failed = progressFromSnapshot(session({
    sync_phase: SyncPhase.FAILED,
    sync_session_id: "",
    coverage_pct: 0,
    graph_error: "The snapshot build stopped responding. Retry the sync.",
}));
check("a failed sync shows no progress", failed.active === false && failed.pct === null);
check("a phase we know still names itself", phaseLabel(SyncPhase.SEALING) === SyncProgressLabel.SEALING);
check("an unknown phase is not named as a build", phaseLabel("SOMETHING_NEW") !== SyncProgressLabel.BUILDING_GRAPH);
check("an unknown phase still says a sync is running", phaseLabel("SOMETHING_NEW") === SyncProgressLabel.SYNCING);
check("no phase at all is not named as a build", phaseLabel("") === SyncProgressLabel.SYNCING);
const unknownPhase = progressFromSnapshot(session({
    sync_phase: "SOMETHING_NEW",
    sync_session_id: "sess-1",
    coverage_pct: 30,
    sync_progress_label: "",
}));
check("a running sync under an unknown phase reads honestly", unknownPhase.active && unknownPhase.label === SyncProgressLabel.SYNCING);
check("a phase is never shown as its wire value", syncPhaseStatusLabel(SyncPhase.UPLOADING) !== SyncPhase.UPLOADING);
check("an upload reads with the words the progress bar already uses", syncPhaseStatusLabel(SyncPhase.UPLOADING) === SyncProgressLabel.UPLOADING_FILES);
check("a sealed snapshot says so", syncPhaseStatusLabel(SyncPhase.READY) === "Snapshot ready");
check("a failure says so", syncPhaseStatusLabel(SyncPhase.FAILED) === "Last sync failed");
check("no sync yet says nothing", syncPhaseStatusLabel("") === "");
const running = session({
    sync_phase: SyncPhase.UPLOADING,
    sync_session_id: "sess-1",
    coverage_pct: 55,
    sync_progress_label: `${SyncProgressLabel.UPLOADING_PARTS} (3/7)`,
});
check("a running sync shows the step the host pushed", syncStatusLabel(running) === `${SyncProgressLabel.UPLOADING_PARTS} (3/7)`);
check("the status line and the progress bar say the same thing", syncStatusLabel(running) === progressFromSnapshot(running).label);
check("a finished sync says where it ended", syncStatusLabel(session({ sync_phase: SyncPhase.READY, snapshot_saved: true })) === "Snapshot ready");
check("no session at all says nothing", syncStatusLabel(null) === "");
for (const [name, snap] of [
    ["stuck at the cap", { sync_phase: SyncPhase.UPLOADING, sync_session_id: "s", coverage_pct: 98 }],
    ["mid upload", { sync_phase: SyncPhase.UPLOADING, sync_session_id: "s", coverage_pct: 40 }],
    ["early seal", { sync_phase: SyncPhase.SEALING, sync_session_id: "s", coverage_pct: 40 }],
    ["unknown phase", { sync_phase: "SOMETHING_NEW", sync_session_id: "s", coverage_pct: 30 }],
] as const) {
    const snapshot = session(snap as Partial<SessionSnapshot>);
    check(`shared mirror agrees (${name})`, JSON.stringify(shared.progressFromSnapshot(snapshot)) ===
        JSON.stringify(progressFromSnapshot(snapshot)));
    check(`shared mirror agrees on the status line (${name})`, shared.syncStatusLabel(snapshot) === syncStatusLabel(snapshot));
}
if (failures > 0) {
    console.error(`${failures} syncProgress test(s) failed`);
    process.exit(1);
}
console.log("syncProgress tests passed");
