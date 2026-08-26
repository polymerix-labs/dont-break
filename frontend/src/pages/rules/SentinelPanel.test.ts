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
import { coachAgentContext } from "./SentinelPanel";
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
function incident(partial: Partial<BypassIncident> & Pick<BypassIncident, "rule_id">): BypassIncident {
    return {
        id: "inc_1",
        at: "2026-08-16T00:00:00Z",
        session_id: "s1",
        kind: "unchecked",
        rule_name: "Room schema",
        severity: "block",
        files: [],
        acknowledged: false,
        ...partial,
    };
}
function rule(partial: Partial<Rule> & Pick<Rule, "id" | "name">): Rule {
    return {
        kind: "pinned_do_not_touch",
        severity: "block",
        ...partial,
    };
}
{
    const inc = incident({
        rule_id: "rule_1",
        kind: "unchecked",
        files: ["core-database/DatabaseModule.kt"],
    });
    const ctx = coachAgentContext(inc, undefined);
    check("no rule found: still carries the incident basics", ctx.includes("rule_id: rule_1"));
    check("no rule found: carries the incident kind", ctx.includes("incident: unchecked"));
    check("no rule found: carries the incident files", ctx.includes("files: core-database/DatabaseModule.kt"));
    check("no rule found: no already_protected section", !ctx.includes("already_protected"));
}
{
    const inc = incident({
        rule_id: "rule_room_schema",
        kind: "unchecked",
        files: ["core-database/DatabaseModule.kt"],
    });
    const r = rule({
        id: "rule_room_schema",
        name: "Room schema",
        targets: {
            node_ids: ["06c9a0df95b2634b", "1ffb2ec690abe739"],
            path_globs: [
                "core-database/PokedexDatabase.kt",
                "core-database/DatabaseModule.kt",
            ],
        },
    });
    const ctx = coachAgentContext(inc, r);
    check("matched rule: keeps the incident files", ctx.includes("files: core-database/DatabaseModule.kt"));
    check("matched rule: surfaces already_protected", ctx.includes("already_protected"));
    check("matched rule: surfaces both node_ids, not just the incident's", ctx.includes("node_ids: 06c9a0df95b2634b, 1ffb2ec690abe739"));
    check("matched rule: surfaces the file the incident did NOT touch", ctx.includes("PokedexDatabase.kt"));
}
{
    const inc = incident({ rule_id: "rule_empty", files: ["a.kt"] });
    const r = rule({ id: "rule_empty", name: "Empty" });
    const ctx = coachAgentContext(inc, r);
    check("rule with no targets: no already_protected section", !ctx.includes("already_protected"));
}
{
    const inc = incident({ rule_id: "rule_layer", files: ["ui/Screen.kt"] });
    const r = rule({
        id: "rule_layer",
        name: "UI boundary",
        kind: "layer_boundary",
        from: { path_globs: ["ui/**"] },
        to: { path_globs: ["data/**"] },
    });
    const ctx = coachAgentContext(inc, r);
    check("layer_boundary: labels the from side", ctx.includes("from.path_globs: ui/**"));
    check("layer_boundary: labels the to side", ctx.includes("to.path_globs: data/**"));
}
if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
}
else {
    console.log("\nall tests passed");
}
