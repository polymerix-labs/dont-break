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

import type { BypassIncident, Rule } from "../../api/dashboard";
import { classifyTouched, pathInZone, protectedZoneLines, repairPrompt, } from "./incidentDetail";
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
const incident: BypassIncident = {
    id: "inc_1",
    at: "2026-08-16T00:00:00Z",
    session_id: "s1",
    kind: "bypassed",
    rule_id: "rule_room",
    rule_name: "Room schema",
    severity: "block",
    files: ["core-database/DatabaseModule.kt", "README.md"],
    acknowledged: false,
};
const rule: Rule = {
    id: "rule_room",
    name: "Room schema",
    kind: "protected_path",
    severity: "block",
    targets: {
        path_globs: ["core-database/**"],
        node_ids: ["n1"],
    },
};
{
    const zone = protectedZoneLines(rule, {
        rule_id: "rule_room",
        kind: "protected_path",
        active: true,
        core: [{ id: "n1", fqn: "core.database.DatabaseModule" }],
        halo: [],
        truncated: false,
    });
    check("zone lists the glob", zone.some((l) => l.includes("core-database/**")));
    check("zone lists the node id", zone.some((l) => l.includes("n1")));
    check("zone lists the resolved fqn", zone.includes("core.database.DatabaseModule"));
}
{
    check("file under glob is in the zone", pathInZone("core-database/DatabaseModule.kt", rule));
    check("file outside the glob is beside", !pathInZone("README.md", rule));
    const touched = classifyTouched(incident.files, rule);
    check("touched marks the zone hit", touched[0]?.inZone === true);
    check("touched marks the neighbour", touched[1]?.inZone === false);
}
{
    const text = repairPrompt(incident);
    check("prompt names the files", text.includes("core-database/DatabaseModule.kt"));
    check("prompt names the rule", text.includes("Room schema"));
    check("prompt asks to undo only this change", text.includes("Undo only this change"));
    check("prompt ends on check_change", text.includes("call check_change"));
    check("prompt is not YAML context", !text.includes("already_protected"));
}
{
    const unchecked: BypassIncident = { ...incident, kind: "unchecked" };
    check("unchecked prompt says nobody asked", repairPrompt(unchecked).includes("without asking dont-break first"));
}
if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
}
console.log("\nall tests passed");
