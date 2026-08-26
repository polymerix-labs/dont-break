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

import { policyTtlValue, remainingLabel } from "./lockdownCopy";
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
const t = (key: string, vars?: Record<string, string | number>) => {
    if (key === "lockdown.remainingNever")
        return "until a person releases";
    if (key === "lockdown.remaining")
        return `${vars?.minutes}m left`;
    return key;
};
check("never-expiring lock names a person", remainingLabel(null, t) === "until a person releases");
check("ninety seconds rounds up to two minutes", remainingLabel(90, t) === "2m left");
check("a second left still shows a minute", remainingLabel(1, t) === "1m left");
check("negative ttl is until a person", policyTtlValue(-1) === -1);
check("thirty minutes stays thirty minutes", policyTtlValue(1800) === 1800);
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("ok lockdown remaining copy");
