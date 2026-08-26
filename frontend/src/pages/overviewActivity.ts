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
import type { RuleDailyRollup, RuleEvent } from "../api/ruleEventsQuery";
import { blockRespected, integrityPct } from "../api/ruleEventsQuery";
import { pendingRules } from "./rules/ruleDisplay";
export const OVERVIEW_EMPTY = {
    titleKey: "overview.noChecksTitle",
    detailKey: "overview.noChecksDetail",
    actionKey: "overview.goToAgents",
    actionTo: "/agents",
} as const;
function parsedAt(value: string | null | undefined): number {
    if (!value)
        return 0;
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
}
export function rulesByRecentActivity(rules: Rule[], stats: RuleStats[] | undefined, limit = 6): Rule[] {
    const lastHit = new Map<string, number>();
    for (const stat of stats ?? []) {
        lastHit.set(stat.rule_id, parsedAt(stat.last_hit_at));
    }
    const ranked = rules.map((rule, index) => ({
        rule,
        hit: lastHit.get(rule.id) ?? 0,
        updated: parsedAt(rule.updated_at),
        index,
    }));
    ranked.sort((a, b) => {
        if (b.hit !== a.hit)
            return b.hit - a.hit;
        if (b.updated !== a.updated)
            return b.updated - a.updated;
        return a.index - b.index;
    });
    return ranked.slice(0, limit).map((row) => row.rule);
}
export function statsIndex(stats: RuleStats[] | undefined): Map<string, RuleStats> {
    const map = new Map<string, RuleStats>();
    for (const stat of stats ?? []) {
        map.set(stat.rule_id, stat);
    }
    return map;
}
export function ruleActivitySummary(stats: RuleStats | undefined): {
    hits: number;
    lastHitAt: string | null;
} | null {
    if (!stats)
        return null;
    return { hits: stats.hits, lastHitAt: stats.last_hit_at };
}
export function compactRollup(totals: RuleDailyRollup | undefined): {
    checks: number;
    warned: number;
    block_advised: number;
    block_forced: number;
} | null {
    if (!totals)
        return null;
    return {
        checks: totals.checks,
        warned: totals.warned,
        block_advised: totals.block_advised,
        block_forced: totals.block_forced,
    };
}
export function proofRollup(totals: RuleDailyRollup | undefined, respectedFromServer?: number): {
    checks: number;
    warned: number;
    block_advised: number;
    block_forced: number;
    respected: number;
    integrity: number;
    incidents: number;
} | null {
    if (!totals)
        return null;
    const compact = compactRollup(totals);
    if (!compact)
        return null;
    return {
        ...compact,
        respected: respectedFromServer ?? blockRespected(totals),
        integrity: integrityPct(totals),
        incidents: totals.incidents,
    };
}
export function humanOverviewCtas(rules: Rule[], locked: boolean): Array<"pending" | "lock"> {
    const ctas: Array<"pending" | "lock"> = [];
    if (pendingRules(rules).length > 0)
        ctas.push("pending");
    if (locked)
        ctas.push("lock");
    return ctas;
}
export function recentJournalEvents(events: RuleEvent[] | undefined, limit = 8): RuleEvent[] {
    if (!events)
        return [];
    return events.slice(0, limit);
}
export function overviewPrimaryCta(checks: number): "agents" | "graph" {
    return checks > 0 ? "graph" : "agents";
}
export type TrustTone = "obeyed" | "quiet" | "watched" | "broken";
export function trustTone(proof: {
    integrity: number;
    warned: number;
    respected: number;
    block_forced: number;
    incidents?: number;
}): TrustTone {
    if (proof.block_forced > 0 || proof.integrity < 100)
        return "broken";
    if (proof.respected > 0)
        return "obeyed";
    if (proof.warned > 0)
        return "watched";
    return "quiet";
}
export function trustHeadlineKey(tone: TrustTone, counts: {
    block_forced: number;
    block_advised: number;
    warned: number;
}): "overview.trust.obeyed" | "overview.trust.obeyed.one" | "overview.trust.quiet" | "overview.trust.watched" | "overview.trust.watched.one" | "overview.trust.broken" | "overview.trust.broken.many" {
    if (tone === "broken") {
        return counts.block_forced === 1
            ? "overview.trust.broken"
            : "overview.trust.broken.many";
    }
    if (tone === "obeyed") {
        return counts.block_advised === 1
            ? "overview.trust.obeyed.one"
            : "overview.trust.obeyed";
    }
    if (tone === "watched") {
        return counts.warned === 1
            ? "overview.trust.watched.one"
            : "overview.trust.watched";
    }
    return "overview.trust.quiet";
}
export function trustDetailKey(tone: TrustTone, counts: {
    block_forced: number;
    block_advised: number;
}): "overview.trust.obeyed.detail" | "overview.trust.obeyed.detail.one" | "overview.trust.quiet.detail" | "overview.trust.watched.detail" | "overview.trust.broken.detail" | "overview.trust.broken.detail.many" {
    if (tone === "broken") {
        return counts.block_forced === 1
            ? "overview.trust.broken.detail"
            : "overview.trust.broken.detail.many";
    }
    if (tone === "obeyed") {
        return counts.block_advised === 1
            ? "overview.trust.obeyed.detail.one"
            : "overview.trust.obeyed.detail";
    }
    if (tone === "watched")
        return "overview.trust.watched.detail";
    return "overview.trust.quiet.detail";
}
export function storyWho(event: Pick<RuleEvent, "agent_label" | "user_id">): string {
    const label = event.agent_label?.trim();
    if (label)
        return label;
    const user = event.user_id?.trim();
    return user || "";
}
export function storyTarget(event: Pick<RuleEvent, "rule_id">, names: Map<string, string>): string {
    if (!event.rule_id || event.rule_id === "structural")
        return "";
    return names.get(event.rule_id) ?? "";
}
