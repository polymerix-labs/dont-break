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

import { hookInstallButtonLabel } from "./hookInstall";
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
const t = (key: string) => ({ "agents.upToDate": "already up to date", "agents.installHook": "Install write hook" }[key] ??
    key);
check("installed shows the up-to-date label", hookInstallButtonLabel(true, t) === "already up to date");
check("missing shows the install label", hookInstallButtonLabel(false, t) === "Install write hook");
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("ok hook install labels");
