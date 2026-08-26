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

import type { Rule, RuleStats } from "../api/dashboard";
import { OVERVIEW_EMPTY, compactRollup, humanOverviewCtas, overviewPrimaryCta, proofRollup, recentJournalEvents, ruleActivitySummary, rulesByRecentActivity, statsIndex, storyTarget, storyWho, trustDetailKey, trustHeadlineKey, trustTone, } from "./overviewActivity";
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
const rules: Rule[] = [
    {
        id: "old",
        name: "Old",
        kind: "protected_path",
        severity: "warn",
        updated_at: "2026-01-01T00:00:00Z",
    },
    {
        id: "hot",
        name: "Hot",
        kind: "protected_path",
        severity: "block",
        updated_at: "2026-06-01T00:00:00Z",
    },
    {
        id: "idle",
        name: "Idle",
        kind: "protected_path",
        severity: "warn",
        updated_at: "2026-08-01T00:00:00Z",
    },
];
const stats: RuleStats[] = [
    { rule_id: "old", hits: 1, blocked: 1, warned: 0, bypasses: 0, last_hit_at: "2026-08-01T00:00:00Z" },
    { rule_id: "hot", hits: 2, blocked: 2, warned: 0, bypasses: 0, last_hit_at: "2026-08-13T00:00:00Z" },
];
{
    const ordered = rulesByRecentActivity(rules, stats, 6);
    check("hottest rule first", ordered[0]?.id === "hot");
    check("older hit second", ordered[1]?.id === "old");
    check("never-hit keeps updated_at after hits", ordered[2]?.id === "idle");
}
{
    const empty = rulesByRecentActivity(rules, [], 6);
    check("no stats sorts by updated_at", empty.map((r) => r.id).join(",") === "idle,hot,old");
    check("missing stats degrades the same way", rulesByRecentActivity(rules, undefined, 6)
        .map((r) => r.id)
        .join(",") === "idle,hot,old");
}
{
    check("empty rules stay empty", rulesByRecentActivity([], stats, 6).length === 0);
    check("empty state opens agents", OVERVIEW_EMPTY.actionTo === "/agents");
    check("empty state title is no checks", OVERVIEW_EMPTY.titleKey === "overview.noChecksTitle");
    check("empty state action is go to agents", OVERVIEW_EMPTY.actionKey === "overview.goToAgents");
}
{
    const totals = compactRollup({
        workspace_id: "ws",
        project_slug: "p",
        day: "2026-08-13",
        checks: 4,
        files_checked: 40,
        warned: 1,
        block_advised: 2,
        block_forced: 1,
        incidents: 0,
    });
    check("compact rollup uses the same four numbers as /rules", Boolean(totals &&
        totals.checks === 4 &&
        totals.warned === 1 &&
        totals.block_advised === 2 &&
        totals.block_forced === 1));
    check("missing activity degrades to null", compactRollup(undefined) === null);
}
{
    const pending: Rule[] = [
        { id: "p", name: "Wait", kind: "protected_path", severity: "block", status: "pending" },
    ];
    check("pending becomes a CTA", humanOverviewCtas(pending, false).join(",") === "pending");
    check("open lock becomes a CTA", humanOverviewCtas([], true).join(",") === "lock");
    check("both CTAs when both wait", humanOverviewCtas(pending, true).join(",") === "pending,lock");
    check("empty has no CTA", humanOverviewCtas([], false).length === 0);
}
{
    check("missing events degrade to empty", recentJournalEvents(undefined).length === 0);
    check("recent events keep the first page order", recentJournalEvents([{ id: "a" } as never, { id: "b" } as never], 1)
        .map((e) => e.id)
        .join(",") === "a");
}
{
    const byId = statsIndex(stats);
    check("stats index is O(1) by rule", byId.get("hot")?.hits === 2);
    check("missing stats summary is null", ruleActivitySummary(undefined) === null);
    check("summary reports hits and last hit", ruleActivitySummary(byId.get("hot"))?.hits === 2);
    check("summary last hit matches stats", ruleActivitySummary(byId.get("hot"))?.lastHitAt === "2026-08-13T00:00:00Z");
}
{
    const proof = proofRollup({
        workspace_id: "ws",
        project_slug: "p",
        day: "2026-08-13",
        checks: 10,
        files_checked: 40,
        warned: 1,
        block_advised: 4,
        block_forced: 1,
        incidents: 2,
    }, 3);
    check("proof uses server respected when given", proof?.respected === 3);
    check("proof integrity is 75 when 1 of 4 forced", proof?.integrity === 75);
    check("proof keeps incidents", proof?.incidents === 2);
    check("missing totals stay null", proofRollup(undefined) === null);
}
{
    check("no checks points at agents", overviewPrimaryCta(0) === "agents");
    check("checks point at the graph", overviewPrimaryCta(4) === "graph");
}
{
    const base = { integrity: 100, warned: 0, respected: 0, block_forced: 0, incidents: 0 };
    check("clean week is quiet", trustTone(base) === "quiet");
    check("respected blocks are obeyed", trustTone({ ...base, respected: 2 }) === "obeyed");
    check("warnings without force are watched", trustTone({ ...base, warned: 3 }) === "watched");
    check("respected wins over warnings", trustTone({ ...base, respected: 1, warned: 2 }) === "obeyed");
    check("forced breaks trust", trustTone({ ...base, integrity: 75, block_forced: 1 }) === "broken");
    check("incidents do not steal the headline", trustTone({ ...base, incidents: 8 }) === "quiet");
    check("incidents keep obeyed when blocks were respected", trustTone({ ...base, respected: 2, incidents: 8 }) === "obeyed");
    check("obeyed headline is a count", trustHeadlineKey("obeyed", { block_forced: 0, block_advised: 2, warned: 0 }) ===
        "overview.trust.obeyed");
    check("obeyed headline is singular for one block", trustHeadlineKey("obeyed", { block_forced: 0, block_advised: 1, warned: 0 }) ===
        "overview.trust.obeyed.one");
    check("watched headline is singular for one warning", trustHeadlineKey("watched", { block_forced: 0, block_advised: 0, warned: 1 }) ===
        "overview.trust.watched.one");
    check("broken headline is many for several ignores", trustHeadlineKey("broken", { block_forced: 2, block_advised: 3, warned: 0 }) ===
        "overview.trust.broken.many");
    check("obeyed detail names several respected blocks", trustDetailKey("obeyed", { block_forced: 0, block_advised: 2 }) ===
        "overview.trust.obeyed.detail");
    check("obeyed detail is singular for one block", trustDetailKey("obeyed", { block_forced: 0, block_advised: 1 }) ===
        "overview.trust.obeyed.detail.one");
    check("broken detail is singular for one force", trustDetailKey("broken", { block_forced: 1, block_advised: 3 }) ===
        "overview.trust.broken.detail");
    check("broken detail is many for several forces", trustDetailKey("broken", { block_forced: 2, block_advised: 3 }) ===
        "overview.trust.broken.detail.many");
}
{
    check("story who prefers the agent label", storyWho({ agent_label: "Claude", user_id: "u1" }) === "Claude");
    check("story who falls back to user", storyWho({ agent_label: null, user_id: "u1" }) === "u1");
    check("story target uses the rule name", storyTarget({ rule_id: "r1" }, new Map([["r1", "Auth"]])) === "Auth");
    check("structural target is blank", storyTarget({ rule_id: "structural" }, new Map()) === "");
}
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("ok overview activity");
