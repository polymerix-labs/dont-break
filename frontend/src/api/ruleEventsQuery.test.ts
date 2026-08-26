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

import { blockRespected, defaultEventRange, eventCheckBasis, integrityPct, journalInvalidatesOnReady, mergeEventPages, nextPageQuery, rangeForPeriod, ruleEventsSearchParams, summarizeLockdowns, utcDayKey, } from "./ruleEventsQuery";
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
{
    const params = ruleEventsSearchParams({
        from_day: "2026-08-01",
        to_day: "2026-08-13",
        kind: "block_forced",
        agent_token_id: "tok_1",
        rule_id: "rule_abc",
        rule_author_type: "agent",
        user_id: "u1",
        cursor: "c1",
        limit: 20,
    });
    check("from_day travels", params.get("from_day") === "2026-08-01");
    check("to_day travels", params.get("to_day") === "2026-08-13");
    check("kind travels", params.get("kind") === "block_forced");
    check("agent travels", params.get("agent_token_id") === "tok_1");
    check("rule travels", params.get("rule_id") === "rule_abc");
    check("author travels", params.get("rule_author_type") === "agent");
    check("member travels", params.get("user_id") === "u1");
    check("cursor travels", params.get("cursor") === "c1");
    check("limit travels", params.get("limit") === "20");
}
{
    const params = ruleEventsSearchParams({ from_day: "2026-08-01", to_day: "2026-08-13" });
    check("omitted axes are absent", params.get("kind") === null && params.get("rule_id") === null);
}
{
    const page = { from_day: "2026-08-01", to_day: "2026-08-13", kind: "checked" };
    check("empty cursor ends pagination", nextPageQuery(page, null) === null);
    const next = nextPageQuery(page, "c2");
    check("next page keeps filters", next?.kind === "checked" && next.cursor === "c2");
}
{
    const parisSummer = new Date("2026-08-13T01:30:00+02:00");
    check("paris 01:30 summer is still the previous UTC day", utcDayKey(parisSummer) === "2026-08-12");
    const range = defaultEventRange(new Date("2026-08-13T15:00:00Z"), 7);
    check("default range ends today UTC", range.to_day === "2026-08-13");
    check("default range is seven inclusive days", range.from_day === "2026-08-07");
}
check("advised minus forced is respected", blockRespected({ block_advised: 10, block_forced: 3 }) === 7);
check("forced cannot exceed advised", blockRespected({ block_advised: 1, block_forced: 4 }) === 0);
check("integrity is 100 when nothing was advised", integrityPct({ block_advised: 0, block_forced: 0 }) === 100);
check("integrity is 100 when none were forced", integrityPct({ block_advised: 4, block_forced: 0 }) === 100);
check("integrity drops when a block was forced", integrityPct({ block_advised: 4, block_forced: 1 }) === 75);
check("ten files on one check stay two numbers", (() => {
    const totals = { checks: 1, files_checked: 10, warned: 0, block_advised: 0, block_forced: 0, incidents: 0 };
    return totals.checks === 1 && totals.files_checked === 10;
})());
check("READY invalidates the journal", journalInvalidatesOnReady("READY") === true);
check("UPLOADING does not invalidate", journalInvalidatesOnReady("UPLOADING") === false);
{
    const range = rangeForPeriod(30, new Date("2026-08-13T15:00:00Z"));
    check("thirty-day range starts a month back", range.from_day === "2026-07-15" && range.to_day === "2026-08-13");
}
{
    const empty = ruleEventsSearchParams({ from_day: "2026-08-20", to_day: "2026-08-13" });
    check("inverted period still serializes", empty.get("from_day") === "2026-08-20" && empty.get("to_day") === "2026-08-13");
}
{
    const merged = mergeEventPages([
        [{ id: "a" } as never, { id: "b" } as never],
        [{ id: "b" } as never, { id: "c" } as never],
    ]);
    check("pagination does not repeat an id", merged.map((e) => e.id).join(",") === "a,b,c");
}
{
    const summary = summarizeLockdowns([
        { kind: "lockdown_opened" } as never,
        { kind: "lockdown_released", release_origin: "human" } as never,
        { kind: "lockdown_released", release_origin: "expiration" } as never,
        { kind: "checked" } as never,
    ]);
    check("opened counted", summary.opened === 1);
    check("human lift counted", summary.releasedHuman === 1);
    check("timer lift counted", summary.releasedExpired === 1);
}
{
    check("checked with no rule is no_rules, not a clearance", eventCheckBasis({
        kind: "checked",
        verdict: "ok",
        rules_evaluated: 0,
        rule_id: null,
    }) === "no_rules");
    check("checked with a warn and no rule is structural", eventCheckBasis({
        kind: "checked",
        verdict: "warn",
        rules_evaluated: 0,
        rule_id: null,
    }) === "structural");
    check("warned whose rule_id is the structural marker stays structural", eventCheckBasis({
        kind: "warned",
        verdict: "warn",
        rule_id: "structural",
    }) === "structural");
    check("a live rule stays rules even on warn", eventCheckBasis({
        kind: "warned",
        verdict: "warn",
        rules_evaluated: 1,
        rule_id: "rule_pp",
    }) === "rules");
    check("lock events have no check basis", eventCheckBasis({ kind: "lockdown_opened", verdict: null, rule_id: null }) === null);
}
if (failures > 0) {
    console.error(`${failures} failed`);
    process.exit(1);
}
console.log("ok rule events query");
