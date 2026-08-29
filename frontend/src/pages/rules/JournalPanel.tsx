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

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRuleEvents, useRules } from "../../hooks/useDashboardQueries";
import { getLocale, useT, type MessageKey } from "../../i18n";
import { Badge, Button, Card, EASE, LiveDot, Skeleton, cn } from "../../design";
import { eventCheckBasis, integrityPct, mergeEventPages, rangeForPeriod, ruleEventsSearchParams, summarizeLockdowns, utcDayKey, type ListRuleEventsQuery, type RuleEvent, type RuleEventKind, type RuleEventListFilters, } from "../../api/ruleEventsQuery";
import { useLockdownStatus } from "../../shell/LockdownBanner";
import { remainingLabel } from "../../shell/lockdownCopy";
import { storyMessageKey, storyTarget, storyWho } from "../overviewActivity";
import { formatRelative } from "./ruleDisplay";
const EVENT_KINDS: RuleEventKind[] = [
    "checked",
    "warned",
    "block_advised",
    "block_forced",
    "rule_proposed",
    "rule_activated",
    "rule_paused",
    "rule_approved",
    "lockdown_opened",
    "lockdown_released",
];
const EVENT_KIND_KEY: Record<RuleEventKind, MessageKey> = {
    checked: "event.checked",
    warned: "event.warned",
    block_advised: "event.block_advised",
    block_forced: "event.block_forced",
    rule_proposed: "event.rule_proposed",
    rule_activated: "event.rule_activated",
    rule_paused: "event.rule_paused",
    rule_approved: "event.rule_approved",
    lockdown_opened: "event.lockdown_opened",
    lockdown_released: "event.lockdown_released",
};
const EVENT_DOT: Record<RuleEventKind, string> = {
    checked: "bg-ok",
    warned: "bg-warn",
    block_advised: "bg-primary",
    block_forced: "bg-danger",
    rule_proposed: "bg-faint",
    rule_activated: "bg-faint",
    rule_paused: "bg-faint",
    rule_approved: "bg-faint",
    lockdown_opened: "bg-danger",
    lockdown_released: "bg-faint",
};
const KIND_CHIPS: Array<{
    kind: RuleEventKind | "";
    labelKey: MessageKey;
}> = [
    { kind: "", labelKey: "metrics.kindAll" },
    { kind: "checked", labelKey: "overview.tile.checks" },
    { kind: "warned", labelKey: "overview.tile.warned" },
    { kind: "block_advised", labelKey: "overview.tile.blocked" },
    { kind: "block_forced", labelKey: "overview.tile.forced" },
];
function FilterSelect({ label, value, onChange, children, }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    const active = value !== "";
    return (<label className="block min-w-0">
      <span className={cn("mb-1 block text-xs", active ? "font-medium text-foreground" : "text-muted")}>
        {label}
      </span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("h-8 w-full appearance-none truncate rounded border bg-surface pl-2 pr-7 text-xs outline-none transition-colors duration-fast", active
            ? "border-primary/50 text-foreground"
            : "border-line text-muted hover:border-line-strong focus:border-line-strong")}>
          {children}
        </select>
        <span aria-hidden className={cn("pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px]", active ? "text-primary" : "text-faint")}>
          ▼
        </span>
      </span>
    </label>);
}
function dayHeading(dayKey: string, locale: string): string {
    const day = Date.parse(`${dayKey}T00:00:00Z`);
    if (Number.isNaN(day))
        return dayKey;
    const today = Date.parse(`${utcDayKey(new Date())}T00:00:00Z`);
    const diff = Math.round((day - today) / 86400000);
    if (diff >= -1 && diff <= 0) {
        return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(diff, "day");
    }
    return new Date(day).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    });
}
function groupByDay(events: RuleEvent[]): Array<{
    day: string;
    items: RuleEvent[];
}> {
    const sections: Array<{
        day: string;
        items: RuleEvent[];
    }> = [];
    for (const event of events) {
        const last = sections[sections.length - 1];
        if (last && last.day === event.day)
            last.items.push(event);
        else
            sections.push({ day: event.day, items: [event] });
    }
    return sections;
}
function SummaryChip({ count, labelKey, dot, }: {
    count: number;
    labelKey: MessageKey;
    dot: string;
}) {
    const t = useT();
    return (<span className="flex items-center gap-1.5 text-xs text-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)}/>
      <span className="font-medium tabular-nums text-foreground">{count}</span>
      {t(labelKey)}
    </span>);
}
export function JournalPanel({ days = 7 }: {
    days?: 7 | 30;
}) {
    const t = useT();
    const reduce = useReducedMotion();
    const [filters, setFilters] = useState<RuleEventListFilters>({});
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>();
    const [prior, setPrior] = useState<RuleEvent[]>([]);
    const range = rangeForPeriod(days);
    const query: ListRuleEventsQuery = { ...range, ...filters, cursor, limit: 50 };
    const { data, isError, isLoading } = useRuleEvents(query);
    const rulesQuery = useRules();
    const ruleNames = new Map<string, string>();
    for (const rule of rulesQuery.data?.rules ?? [])
        ruleNames.set(rule.id, rule.name);
    const optionsQuery = useRuleEvents({ ...range, limit: 200 });
    const agentOptions = new Map<string, string>();
    const memberOptions = new Set<string>();
    const projectOptions = new Set<string>();
    for (const event of optionsQuery.data?.events ?? []) {
        if (event.agent_token_id) {
            agentOptions.set(event.agent_token_id, event.agent_label || event.agent_token_id);
        }
        if (event.user_id)
            memberOptions.add(event.user_id);
        if (event.project_slug)
            projectOptions.add(event.project_slug);
    }
    if (filters.agent_token_id && !agentOptions.has(filters.agent_token_id)) {
        agentOptions.set(filters.agent_token_id, filters.agent_token_id);
    }
    if (filters.user_id)
        memberOptions.add(filters.user_id);
    if (filters.project_slug)
        projectOptions.add(filters.project_slug);
    const activeAdvanced = [
        filters.rule_id,
        filters.agent_token_id,
        filters.rule_author_type,
        filters.user_id,
        filters.project_slug,
    ].filter(Boolean).length;
    const lockOpened = useRuleEvents({ ...range, kind: "lockdown_opened", limit: 100 });
    const lockReleased = useRuleEvents({ ...range, kind: "lockdown_released", limit: 100 });
    const { status: lock } = useLockdownStatus(null);
    const events = mergeEventPages(cursor ? [prior, data?.events ?? []] : [data?.events ?? []]);
    const totals = data?.totals;
    const lockSummary = summarizeLockdowns([
        ...(lockOpened.data?.events ?? []),
        ...(lockReleased.data?.events ?? []),
    ]);
    function resetPages() {
        setCursor(undefined);
        setPrior([]);
    }
    function patchFilter(patch: Partial<RuleEventListFilters>) {
        setFilters((current) => ({ ...current, ...patch }));
        resetPages();
    }
    function loadMore() {
        if (!data?.next_cursor)
            return;
        setPrior(events);
        setCursor(data.next_cursor);
    }
    function eventSentence(event: RuleEvent): string {
        const basis = eventCheckBasis(event);
        const basisKey = basis === "no_rules" || basis === "structural"
            ? (`check.basis.${basis}` as MessageKey)
            : null;
        const who = storyWho(event, t("overview.you"), t("overview.anAgent"));
        const target = basisKey
            ? t(basisKey)
            : storyTarget(event, ruleNames) || t("overview.theGraph");
        const storyKey = storyMessageKey(event) as MessageKey;
        let sentence = t(storyKey, {
            who,
            kind: t(EVENT_KIND_KEY[event.kind]),
            target,
        });
        if (event.kind === "checked" && event.files_count != null) {
            sentence += ` · ${t(event.files_count === 1 ? "metrics.filesChecked.one" : "metrics.filesChecked", { count: event.files_count })}`;
        }
        if (event.kind === "lockdown_released" && event.release_origin) {
            sentence += ` · ${event.release_origin === "expiration"
                ? t("metrics.lockExpired")
                : t("metrics.lockReleasedHuman")}`;
        }
        return sentence;
    }
    const sections = groupByDay(events);
    const locale = getLocale();
    return (<Card data-journal-panel>
      <div className="space-y-4 border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <LiveDot />
            {t("metrics.title")}
          </p>
          <div className="flex items-center gap-3">
            {lock?.locked ? (<Badge tone="danger">
                {t("metrics.lockOpen")}
                {" · "}
                {lock.scope === "project"
                ? t("lockdown.scopeProject")
                : t("lockdown.scopeSession")}
                {" · "}
                {remainingLabel(lock.remaining_sec, t)}
              </Badge>) : null}
            {totals ? (<span className="text-xs text-muted">
                {t("sentinel.integrity")}{" "}
                <span className={cn("font-medium tabular-nums", integrityPct(totals) < 100 ? "text-danger" : "text-ok")}>
                  {integrityPct(totals)}%
                </span>
              </span>) : null}
          </div>
        </div>

        {totals ? (<div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <SummaryChip count={totals.checks} labelKey="overview.tile.checks" dot="bg-ok"/>
            <SummaryChip count={totals.warned} labelKey="overview.tile.warned" dot="bg-warn"/>
            <SummaryChip count={totals.block_advised} labelKey="overview.tile.blocked" dot="bg-primary"/>
            <SummaryChip count={totals.block_forced} labelKey="overview.tile.forced" dot="bg-danger"/>
          </div>) : null}

        <div className="flex flex-wrap items-center gap-1.5">
          {KIND_CHIPS.map((chip) => {
            const active = (filters.kind ?? "") === chip.kind;
            return (<button key={chip.kind || "all"} type="button" onClick={() => patchFilter({ kind: chip.kind || undefined })} className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors duration-fast", active
                    ? "border-primary/50 bg-primary-subtle text-foreground"
                    : "border-line bg-inset text-muted hover:border-line-strong hover:text-foreground")}>
                {t(chip.labelKey)}
              </button>);
        })}
          <button type="button" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen} className={cn("ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-fast", activeAdvanced > 0
            ? "border-primary/50 bg-primary-subtle text-foreground"
            : advancedOpen
                ? "border-line-strong bg-overlay text-foreground"
                : "border-line bg-inset text-muted hover:border-line-strong hover:text-foreground")}>
            {t("metrics.filters")}
            {activeAdvanced > 0 ? (<span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-background">
                {activeAdvanced}
              </span>) : null}
            <span aria-hidden className={cn("inline-block text-[9px] text-faint transition-transform duration-fast", advancedOpen && "rotate-90")}>
              ▶
            </span>
          </button>
        </div>

        {advancedOpen ? (<motion.div initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="rounded-md border border-line bg-inset/60 p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <FilterSelect label={t("metrics.filterRule")} value={filters.rule_id ?? ""} onChange={(value) => patchFilter({ rule_id: value || undefined })}>
                <option value="">{t("metrics.authorAll")}</option>
                {(rulesQuery.data?.rules ?? []).map((rule) => (<option key={rule.id} value={rule.id}>
                    {rule.name}
                  </option>))}
              </FilterSelect>
              <FilterSelect label={t("metrics.filterAgent")} value={filters.agent_token_id ?? ""} onChange={(value) => patchFilter({ agent_token_id: value || undefined })}>
                <option value="">{t("metrics.authorAll")}</option>
                {[...agentOptions.entries()].map(([tokenId, label]) => (<option key={tokenId} value={tokenId}>
                    {label}
                  </option>))}
              </FilterSelect>
              <FilterSelect label={t("metrics.filterAuthor")} value={filters.rule_author_type ?? ""} onChange={(value) => patchFilter({ rule_author_type: value || undefined })}>
                <option value="">{t("metrics.authorAll")}</option>
                <option value="human">{t("metrics.authorHuman")}</option>
                <option value="agent">{t("metrics.authorAgent")}</option>
              </FilterSelect>
              <FilterSelect label={t("metrics.filterMember")} value={filters.user_id ?? ""} onChange={(value) => patchFilter({ user_id: value || undefined })}>
                <option value="">{t("metrics.authorAll")}</option>
                {[...memberOptions].map((userId) => (<option key={userId} value={userId}>
                    {userId}
                  </option>))}
              </FilterSelect>
              <FilterSelect label={t("metrics.filterProject")} value={filters.project_slug ?? ""} onChange={(value) => patchFilter({ project_slug: value || undefined })}>
                <option value="">{t("metrics.authorAll")}</option>
                {[...projectOptions].map((slug) => (<option key={slug} value={slug}>
                    {slug}
                  </option>))}
              </FilterSelect>
              <FilterSelect label={t("metrics.filterKind")} value={filters.kind ?? ""} onChange={(value) => patchFilter({ kind: value || undefined })}>
                <option value="">{t("metrics.kindAll")}</option>
                {EVENT_KINDS.map((kind) => (<option key={kind} value={kind}>
                    {t(EVENT_KIND_KEY[kind])}
                  </option>))}
              </FilterSelect>
            </div>
            {activeAdvanced > 0 || filters.kind ? (<div className="mt-3 flex justify-end border-t border-line pt-2.5">
                <button type="button" onClick={() => {
                    setFilters({});
                    resetPages();
                }} className="text-xs text-faint transition-colors duration-fast hover:text-foreground">
                  {t("metrics.reset")}
                </button>
              </div>) : null}
          </motion.div>) : null}
      </div>

      {isLoading && events.length === 0 ? (<div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-5/6"/>
          <Skeleton className="h-4 w-2/3"/>
        </div>) : isError && events.length === 0 ? (<p className="px-5 py-6 text-sm text-muted">{t("rules.unavailable")}</p>) : events.length === 0 ? (<p className="px-5 py-6 text-sm text-muted">{t("metrics.empty")}</p>) : (<div>
          {sections.map((section) => (<div key={section.day}>
              <p className="border-b border-line bg-inset/60 px-5 py-1.5 text-xs font-medium capitalize text-faint">
                {dayHeading(section.day, locale)}
              </p>
              <ul className="divide-y divide-line">
                {section.items.map((event) => (<li key={event.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", EVENT_DOT[event.kind] ?? "bg-faint")}/>
                      <p className="min-w-0 truncate text-sm text-foreground">
                        {eventSentence(event)}
                      </p>
                    </div>
                    <span title={event.at} className="shrink-0 tabular-nums text-xs text-faint">
                      {formatRelative(event.at)}
                    </span>
                  </li>))}
              </ul>
            </div>))}
        </div>)}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-2.5">
        <span className="text-xs text-faint">
          {t("metrics.lockReleasedHuman")}: {lockSummary.releasedHuman}
          {" · "}
          {t("metrics.lockExpired")}: {lockSummary.releasedExpired}
        </span>
        {data?.next_cursor ? (<Button size="sm" variant="ghost" onClick={loadMore}>
            {t("metrics.loadMore")}
          </Button>) : null}
      </div>
    </Card>);
}
export function journalFilterKey(query: ListRuleEventsQuery): string {
    return ruleEventsSearchParams(query).toString();
}
