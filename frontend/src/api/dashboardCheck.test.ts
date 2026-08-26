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

import { checkResponseBasis } from "./dashboard";
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
check("ok with no rule evaluated is no_rules, not a clearance", checkResponseBasis({ checked_rules: 0 }) === "no_rules");
check("a rule that ran is rules", checkResponseBasis({ checked_rules: 3 }) === "rules");
check("the engine's structural stamp is trusted, never inferred", checkResponseBasis({ checked_rules: 0, verdict_basis: "structural" }) === "structural");
check("an explicit no_rules stamp does not override a rule that ran", checkResponseBasis({ checked_rules: 2, verdict_basis: "no_rules" }) === "rules");
check("structural is not inferred from a warn-shaped payload without the stamp", checkResponseBasis({ checked_rules: 0, verdict_basis: undefined }) === "no_rules");
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("dashboardCheck ok");
