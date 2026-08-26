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

import type { StudioEvent, StudioStatus } from "./studioStore";
export type MissionStep = "describe" | "understand" | "test" | "decide";
export const MISSION_STEPS: readonly MissionStep[] = [
    "describe",
    "understand",
    "test",
    "decide",
];
export function deriveMissionStep(events: readonly StudioEvent[], status: StudioStatus): MissionStep {
    if (status === "idle")
        return "describe";
    if (status === "done")
        return "decide";
    let step: MissionStep = "understand";
    for (const { ev } of events) {
        if (ev.event === "simulation_started")
            step = "test";
        else if (ev.event === "final")
            step = "decide";
    }
    return step;
}
export function deriveGatedMissionStep(events: readonly StudioEvent[], status: StudioStatus, armed: boolean): MissionStep {
    const gated = !armed &&
        status !== "failed" &&
        events.some(({ ev }) => ev.event === "candidates");
    if (gated)
        return "understand";
    return deriveMissionStep(events, status);
}
