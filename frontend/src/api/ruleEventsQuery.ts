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

export const RULE_EVENT_FILTER_AXES = [
    "project_slug",
    "agent_token_id",
    "rule_id",
    "rule_author_type",
    "user_id",
    "kind",
] as const;
export type RuleEventFilterAxis = (typeof RULE_EVENT_FILTER_AXES)[number];
export type RuleEventKind = "checked" | "warned" | "block_advised" | "block_forced" | "rule_proposed" | "rule_activated" | "rule_paused" | "rule_approved" | "lockdown_opened" | "lockdown_released";
export type RuleEventListFilters = {
    project_slug?: string;
    agent_token_id?: string;
    rule_id?: string;
    rule_author_type?: string;
    user_id?: string;
    kind?: string;
};
export type ListRuleEventsQuery = RuleEventListFilters & {
    from_day: string;
    to_day: string;
    cursor?: string;
    limit?: number;
};
export type RuleEvent = {
    id: string;
    kind: RuleEventKind;
    workspace_id: string;
    project_slug: string;
    day: string;
    at: string;
    rule_id: string | null;
    rule_author_type: "human" | "agent" | null;
    user_id: string;
    agent_token_id: string | null;
    agent_label: string | null;
    agent_session_id: string | null;
    verdict: "ok" | "warn" | "block" | null;
    expires_at: string;
    files_count?: number;
    rules_evaluated?: number;
    release_origin?: "human" | "expiration" | null;
};
export type RuleDailyRollup = {
    workspace_id: string;
    project_slug: string;
    day: string;
    checks: number;
    files_checked: number;
    warned: number;
    block_advised: number;
    block_forced: number;
    incidents: number;
};
export type ListRuleEventsResponse = {
    events: RuleEvent[];
    next_cursor: string | null;
    totals: RuleDailyRollup;
    daily: RuleDailyRollup[];
    block_respected: number;
};
export const RULE_EVENTS_SUMMARY_LIMIT = 1;
export function utcDayKey(at: Date | string): string {
    const date = typeof at === "string" ? new Date(at) : at;
    return date.toISOString().slice(0, 10);
}
export function defaultEventRange(now: Date = new Date(), days = 7): {
    from_day: string;
    to_day: string;
} {
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    return { from_day: utcDayKey(from), to_day: utcDayKey(to) };
}
export function ruleEventsSearchParams(query: ListRuleEventsQuery): URLSearchParams {
    const params = new URLSearchParams();
    params.set("from_day", query.from_day);
    params.set("to_day", query.to_day);
    for (const axis of RULE_EVENT_FILTER_AXES) {
        const value = query[axis];
        if (value)
            params.set(axis, value);
    }
    if (query.cursor)
        params.set("cursor", query.cursor);
    if (query.limit != null && Number.isFinite(query.limit)) {
        params.set("limit", String(query.limit));
    }
    return params;
}
export function nextPageQuery(query: ListRuleEventsQuery, nextCursor: string | null): ListRuleEventsQuery | null {
    if (!nextCursor)
        return null;
    return { ...query, cursor: nextCursor };
}
export function blockRespected(totals: Pick<RuleDailyRollup, "block_advised" | "block_forced">): number {
    return Math.max(0, totals.block_advised - totals.block_forced);
}
export function integrityPct(totals: Pick<RuleDailyRollup, "block_advised" | "block_forced">): number {
    if (totals.block_advised <= 0)
        return 100;
    return Math.round((blockRespected(totals) / totals.block_advised) * 100);
}
export function rangeForPeriod(days: 7 | 30, now: Date = new Date()): {
    from_day: string;
    to_day: string;
} {
    return defaultEventRange(now, days);
}
export function mergeEventPages(pages: RuleEvent[][]): RuleEvent[] {
    const seen = new Set<string>();
    const out: RuleEvent[] = [];
    for (const page of pages) {
        for (const event of page) {
            if (seen.has(event.id))
                continue;
            seen.add(event.id);
            out.push(event);
        }
    }
    return out;
}
export function summarizeLockdowns(events: RuleEvent[]): {
    opened: number;
    releasedHuman: number;
    releasedExpired: number;
} {
    let opened = 0;
    let releasedHuman = 0;
    let releasedExpired = 0;
    for (const event of events) {
        if (event.kind === "lockdown_opened")
            opened += 1;
        if (event.kind === "lockdown_released") {
            if (event.release_origin === "expiration")
                releasedExpired += 1;
            else
                releasedHuman += 1;
        }
    }
    return { opened, releasedHuman, releasedExpired };
}
export function journalInvalidatesOnReady(phase: string): boolean {
    return phase === "READY";
}
export type CheckVerdictBasis = "rules" | "structural" | "no_rules";
export function eventCheckBasis(event: Pick<RuleEvent, "kind" | "verdict" | "rules_evaluated" | "rule_id">): CheckVerdictBasis | null {
    if (event.kind !== "checked" &&
        event.kind !== "warned" &&
        event.kind !== "block_advised" &&
        event.kind !== "block_forced") {
        return null;
    }
    if (event.rule_id === "structural")
        return "structural";
    if (event.kind === "checked" && (event.rules_evaluated ?? 0) === 0) {
        return event.verdict === "warn" ? "structural" : "no_rules";
    }
    return "rules";
}
