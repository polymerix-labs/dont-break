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

export const ArchSeverity = {
    GOOD: "good",
    MID: "mid",
    BAD: "bad",
} as const;
export const ArchSeverityThresholds = {
    GOOD: 80,
    MID: 50,
} as const;
export function archSeverityFromScore(score: number): string {
    const n = Number(score);
    if (!Number.isFinite(n))
        return ArchSeverity.BAD;
    if (n >= ArchSeverityThresholds.GOOD)
        return ArchSeverity.GOOD;
    if (n >= ArchSeverityThresholds.MID)
        return ArchSeverity.MID;
    return ArchSeverity.BAD;
}
