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

import type { TFunc } from "../i18n";
export function remainingLabel(remainingSec: number | null, t: TFunc): string {
    if (remainingSec == null)
        return t("lockdown.remainingNever");
    const minutes = Math.max(1, Math.ceil(remainingSec / 60));
    return t("lockdown.remaining", { minutes });
}
export function policyTtlValue(ttlSec: number): -1 | 1800 {
    return ttlSec < 0 ? -1 : 1800;
}
