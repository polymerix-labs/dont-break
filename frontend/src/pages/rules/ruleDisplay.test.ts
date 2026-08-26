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

import { approveRulePath, rejectRulePath, type Rule } from "../../api/dashboard";
import { authorAgentLabel, authorKind, pendingRules, ruleActivation, } from "./ruleDisplay";
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
function rule(partial: Partial<Rule> & Pick<Rule, "id" | "name">): Rule {
    return {
        kind: "protected_path",
        severity: "block",
        ...partial,
    };
}
{
    const human = rule({
        id: "r1",
        name: "Billing",
        status: "active",
        author: { type: "human", user_id: "u1", at: "2026-08-01T00:00:00Z" },
    });
    const agent = rule({
        id: "r2",
        name: "Auth",
        status: "active",
        author: {
            type: "agent",
            user_id: "u1",
            at: "2026-08-01T00:00:00Z",
            agent: { token_id: "tok_1", label: "Cursor MCP" },
        },
    });
    const paused = rule({
        id: "r3",
        name: "Paused agent rule",
        status: "paused",
        author: {
            type: "agent",
            user_id: "u1",
            at: "2026-08-01T00:00:00Z",
            agent: { token_id: "tok_1", label: "Cursor MCP" },
        },
    });
    const pending = rule({
        id: "r4",
        name: "Wait",
        status: "pending",
        author: {
            type: "agent",
            user_id: "u1",
            at: "2026-08-01T00:00:00Z",
            agent: { token_id: "tok_1", label: "Cursor MCP" },
        },
    });
    check("human author", authorKind(human) === "human");
    check("agent author", authorKind(agent) === "agent");
    check("agent label", authorAgentLabel(agent) === "Cursor MCP");
    check("human is active", ruleActivation(human).labelKey === "status.active");
    check("paused is not the temporal active label", ruleActivation(paused).labelKey === "status.paused");
    check("pending is not active", ruleActivation(pending).labelKey === "status.pending");
    check("paused tone stays neutral", ruleActivation(paused).tone === "neutral");
    check("pending tone is warn", ruleActivation(pending).tone === "warn");
    const queue = pendingRules([human, agent, paused, pending]);
    check("only pending rules enter the queue", queue.length === 1 && queue[0]!.id === "r4");
}
check("approval hits the human approve route", approveRulePath("rule_x") === "/nebula/rules/rule_x/approve");
check("reject hits the human reject route", rejectRulePath("rule_x") === "/nebula/rules/rule_x/reject");
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("ok rule governance display");
