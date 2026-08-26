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

import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fetchRuleNodes } from "../../api/dashboard";
import type { DoNotTouchEntry, Rule, RuleStats } from "../../api/dashboard";
import { Badge, Button, Card, CardHeader, Dialog, EASE, EmptyState, LiveDot, Reveal, Skeleton, cn, useToast, } from "../../design";
import { useApproveRule, useDeleteRule, useDoNotTouch, useRejectRule, useRuleActivity, useRuleEvents, useRuleNodes, useRules, } from "../../hooks/useDashboardQueries";
import { getLocale, useT } from "../../i18n";
import { integrityPct, rangeForPeriod, utcDayKey, RULE_EVENTS_SUMMARY_LIMIT, type RuleDailyRollup, } from "../../api/ruleEventsQuery";
import { useUiStore } from "../../shell/uiStore";
import { useViewerOverlays } from "../../viewer/useViewerOverlays";
import { rulesByRecentActivity } from "../overviewActivity";
import { RuleEditor } from "./RuleEditor";
import { BypassAlert, openIncidents, statsByRule } from "./SentinelPanel";
import { JournalPanel } from "./JournalPanel";
import { seedStudio } from "./studio/studioStore";
import { RULE_KIND_HINT_KEY, RULE_KIND_LABEL_KEY, authorAgentLabel, authorKind, formatInstant, formatRelative, pendingRules, ruleActivation, ruleTargetSummary, } from "./ruleDisplay";
function interventionsKey(count: number) {
    return count === 1 ? ("rules.interventions.one" as const) : ("rules.interventions" as const);
}
const ACTIVATION_DOT: Record<"ok" | "warn" | "neutral", string> = {
    ok: "bg-ok",
    warn: "bg-warn",
    neutral: "bg-faint",
};
const PULSE_SEGMENTS = [
    { field: "checks", color: "var(--db-ok)" },
    { field: "warned", color: "var(--db-warn)" },
    { field: "block_advised", color: "var(--db-primary)" },
    { field: "block_forced", color: "var(--db-danger)" },
] as const;
function dayLabel(dayKey: string, locale: string): string {
    const t = Date.parse(`${dayKey}T00:00:00Z`);
    if (Number.isNaN(t))
        return dayKey;
    return new Date(t).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
}
function periodDays(days: 7 | 30): string[] {
    const { from_day } = rangeForPeriod(days);
    const start = new Date(`${from_day}T00:00:00Z`);
    return Array.from({ length: days }, (_, i) => {
        const d = new Date(start);
        d.setUTCDate(d.getUTCDate() + i);
        return utcDayKey(d);
    });
}
function PulseChart({ days, daily }: {
    days: 7 | 30;
    daily: RuleDailyRollup[];
}) {
    const reduce = useReducedMotion();
    const t = useT();
    const dayKeys = periodDays(days);
    const byDay = new Map<string, RuleDailyRollup>();
    for (const row of daily)
        byDay.set(row.day, row);
    const totals = dayKeys.map((key) => {
        const row = byDay.get(key);
        if (!row)
            return 0;
        return PULSE_SEGMENTS.reduce((sum, s) => sum + (row[s.field] ?? 0), 0);
    });
    const max = Math.max(1, ...totals);
    const area = 104;
    return (<div className="w-full">
      <div className="grid h-28 items-end border-b border-line pb-px" style={{
            gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`,
            columnGap: days === 7 ? 8 : 3,
        }}>
        {dayKeys.map((key, dayIndex) => {
            const row = byDay.get(key);
            const total = totals[dayIndex];
            const isToday = dayIndex === dayKeys.length - 1;
            return (<motion.div key={key} title={`${dayLabel(key, getLocale())} · ${total}`} className="flex h-full flex-col justify-end gap-px" animate={isToday && !reduce ? { opacity: [1, 0.65, 1] } : undefined} transition={isToday && !reduce
                    ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
                    : undefined}>
              {total === 0 ? (<div className={cn("h-0.5 rounded-[1px]", isToday ? "bg-ok/60" : "bg-overlay")}/>) : ([...PULSE_SEGMENTS].reverse().map((segment) => {
                    const count = row?.[segment.field] ?? 0;
                    if (count === 0)
                        return null;
                    const h = Math.max(3, (count / max) * area);
                    return (<motion.div key={segment.field} className="w-full rounded-[2px]" style={{ background: segment.color }} initial={reduce ? { height: h } : { height: 0 }} animate={{ height: h }} transition={{
                            duration: 0.5,
                            delay: 0.15 + dayIndex * 0.03,
                            ease: EASE,
                        }}/>);
                }))}
            </motion.div>);
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-faint">
        <span>{dayLabel(dayKeys[0], getLocale())}</span>
        <span className="flex items-center gap-1.5 font-medium text-ok">
          <LiveDot />
          {dayLabel(dayKeys[dayKeys.length - 1], getLocale())}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
        {([
            ["overview.tile.checks", "bg-ok"],
            ["overview.tile.warned", "bg-warn"],
            ["overview.tile.blocked", "bg-primary"],
            ["overview.tile.forced", "bg-danger"],
        ] as const).map(([labelKey, dot]) => (<span key={labelKey} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={cn("h-1.5 w-1.5 rounded-full", dot)}/>
            {t(labelKey)}
          </span>))}
      </div>
    </div>);
}
function HeroChip({ text, dotClass }: {
    text: string;
    dotClass: string;
}) {
    return (<span className="flex items-center gap-2 text-sm text-foreground">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)}/>
      <span>{text}</span>
    </span>);
}
function GuardHero({ days, onDaysChange, }: {
    days: 7 | 30;
    onDaysChange: (days: 7 | 30) => void;
}) {
    const rulesQuery = useRules();
    const { data: activity } = useRuleActivity();
    const danger = useDoNotTouch();
    const journal = useRuleEvents({
        ...rangeForPeriod(days),
        limit: RULE_EVENTS_SUMMARY_LIMIT,
    });
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const t = useT();
    const graphSelection = useUiStore((s) => s.graphSelection);
    const rules = rulesQuery.data?.rules ?? [];
    const activeCount = rules.filter((rule) => ruleActivation(rule).labelKey === "status.active").length;
    const guarded = (danger.data ?? []).filter((e) => e.reason.kind !== "derived").length;
    const totals = journal.data?.totals;
    const interventions = totals ? totals.warned + totals.block_advised : 0;
    const integrity = totals ? integrityPct(totals) : 100;
    const incidents = openIncidents(activity).length;
    const alarmed = incidents > 0 || integrity < 100;
    const color = alarmed ? "var(--db-danger)" : "var(--db-primary)";
    function pinSelection() {
        if (!graphSelection)
            return;
        seedStudio(t("studio.entry.pinPrompt", { name: graphSelection.name }), `node_id: ${graphSelection.nodeId}\nname: ${graphSelection.name}`);
        void navigate({ to: "/rules/studio" });
    }
    if (rulesQuery.isLoading) {
        return (<div className="space-y-4">
        <Skeleton className="h-3 w-24"/>
        <Skeleton className="h-12 w-96"/>
        <Skeleton className="h-5 w-2/3"/>
      </div>);
    }
    return (<div className="relative">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 h-80 w-[640px] max-w-[90vw] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl" style={{ background: `radial-gradient(closest-side, ${color}, transparent 72%)` }}/>
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-xl">
          <p className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-faint">
            <LiveDot />
            {t("rules.title")}
          </p>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE }} className="mt-4 font-display text-[46px] font-semibold leading-[1.05] tracking-tight text-foreground">
            {rules.length === 0
            ? t("rules.hero.none")
            : t("rules.hero.standing", { count: activeCount })}
          </motion.h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <HeroChip text={t("overview.protection.guarded", { count: guarded })} dotClass="bg-ok"/>
            <HeroChip text={t(interventionsKey(interventions), { count: interventions })} dotClass="bg-primary"/>
            <HeroChip text={`${t("sentinel.integrity")} ${integrity}%`} dotClass={integrity < 100 ? "bg-danger" : "bg-ok"}/>
            {incidents > 0 ? (<HeroChip text={`${t("sentinel.bypasses")} · ${incidents}`} dotClass="bg-danger"/>) : null}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/rules/studio">
              <Button variant="primary">
                {rules.length === 0 ? t("overview.createFirstRule") : t("rules.openStudio")}
              </Button>
            </Link>
            {graphSelection ? (<Button variant="ghost" onClick={pinSelection}>
                {t("rules.pinSelection", { name: graphSelection.name })}
              </Button>) : null}
          </div>
        </div>
        <div className="w-full shrink-0 lg:w-[460px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
              {t("overview.live")}
            </span>
            <div className="flex items-center gap-1">
            {([7, 30] as const).map((option) => (<button key={option} type="button" onClick={() => onDaysChange(option)} className={cn("rounded border px-2.5 py-1 text-xs transition-colors duration-fast", days === option
                ? "border-line-strong bg-overlay text-foreground"
                : "border-line bg-inset text-muted hover:text-foreground")}>
                {option === 7 ? t("metrics.days7") : t("metrics.days30")}
              </button>))}
            </div>
          </div>
          {journal.isLoading ? (<Skeleton className="h-28 w-full"/>) : (<PulseChart days={days} daily={journal.data?.daily ?? []}/>)}
        </div>
      </div>
    </div>);
}
function GuardCard({ rule, stats, index, zoneLoading, onOpen, onZone, }: {
    rule: Rule;
    stats: RuleStats | undefined;
    index: number;
    zoneLoading: boolean;
    onOpen: () => void;
    onZone: () => void;
}) {
    const reduce = useReducedMotion();
    const t = useT();
    const activation = ruleActivation(rule);
    const interventions = stats ? stats.blocked + stats.warned : 0;
    const bypassed = Boolean(stats && stats.bypasses > 0);
    return (<motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 + index * 0.05, ease: EASE }} className="h-full">
      <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onOpen();
            }
        }} className={cn("group flex h-full cursor-pointer flex-col rounded-lg border bg-surface p-5 transition-all duration-fast hover:-translate-y-0.5", bypassed
            ? "border-danger/40 hover:border-danger/70"
            : "border-line hover:border-line-strong")}>
        <div className="flex items-start justify-between gap-3">
          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", ACTIVATION_DOT[activation.tone])}/>
          <p className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
            {rule.name}
          </p>
          {bypassed ? <Badge tone="danger">{t("sentinel.bypassBadge")}</Badge> : null}
        </div>
        <p className="mt-1.5 pl-4 text-xs text-faint">
          {t(RULE_KIND_LABEL_KEY[rule.kind])}
          {" · "}
          {authorKind(rule) === "agent"
            ? t("rules.authorAgent", { label: authorAgentLabel(rule) })
            : t("rules.authorHuman")}
        </p>
        <div className="mt-5 flex-1 pl-4">
          {interventions > 0 ? (<>
              <p className="text-sm font-medium text-foreground">
                {t(interventionsKey(interventions), { count: interventions })}
              </p>
              {stats?.last_hit_at ? (<p className="mt-1 text-xs text-muted">
                  {t("sentinel.lastHit", { when: formatRelative(stats.last_hit_at) })}
                </p>) : null}
            </>) : (<p className="text-xs text-faint">{t("rules.neverFired")}</p>)}
        </div>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3.5">
          <span className="flex items-center gap-1.5">
            <Badge tone={rule.severity === "block" ? "danger" : "warn"}>
              {t(rule.severity === "block" ? "severity.block" : "severity.warn")}
            </Badge>
            <Badge tone={activation.tone}>{t(activation.labelKey)}</Badge>
          </span>
          <Button size="sm" disabled={zoneLoading} onClick={(ev) => {
            ev.stopPropagation();
            onZone();
        }}>
            {zoneLoading ? t("common.loading") : t("rules.showZone")}
          </Button>
        </div>
      </div>
    </motion.div>);
}
function StartHere() {
    const danger = useDoNotTouch();
    const navigate = useNavigate();
    const t = useT();
    const exposed = (danger.data ?? []).filter((e) => e.reason.kind === "derived");
    if (exposed.length === 0)
        return null;
    function protect(entry: DoNotTouchEntry) {
        const name = entry.name || entry.fqn || entry.node_id;
        seedStudio(t("studio.entry.pinPrompt", { name }), `node_id: ${entry.node_id}\nname: ${name}`);
        void navigate({ to: "/rules/studio" });
    }
    return (<Card>
      <CardHeader title={t("rules.startHere")}/>
      <ul className="divide-y divide-line">
        {exposed.slice(0, 3).map((entry) => (<li key={entry.node_id} className="flex items-center gap-3 px-5 py-3.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warn"/>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm text-foreground">
                {entry.name || entry.fqn || entry.node_id}
              </p>
              <p className="truncate text-xs text-faint">{entry.reason.detail}</p>
            </div>
            <Button size="sm" onClick={() => protect(entry)}>
              {t("overview.protect")}
            </Button>
          </li>))}
      </ul>
    </Card>);
}
function ZoneFacts({ ruleId }: {
    ruleId: string;
}) {
    const zone = useRuleNodes(ruleId);
    const t = useT();
    if (zone.isLoading)
        return <Skeleton className="h-3 w-44"/>;
    if (!zone.data)
        return null;
    return (<p className="text-xs text-muted">
      {t("rules.zoneSize", {
            core: zone.data.core.length,
            halo: zone.data.halo.length,
        })}
      {zone.data.truncated ? "+" : ""}
    </p>);
}
function RuleDetail({ rule, onEdit, onDelete, }: {
    rule: Rule;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const targets = ruleTargetSummary(rule);
    const t = useT();
    return (<div className="space-y-4">
      <p className="text-xs text-muted">{t(RULE_KIND_HINT_KEY[rule.kind])}</p>
      <ZoneFacts ruleId={rule.id}/>
      {rule.description ? (<p className="text-sm text-foreground">{rule.description}</p>) : null}
      {targets.length > 0 ? (<div>
          <p className="mb-1 text-xs font-medium text-faint">{t("rules.targets")}</p>
          <ul className="space-y-0.5">
            {targets.map((target) => (<li key={target} className="truncate font-mono text-xs text-foreground">
                {target}
              </li>))}
          </ul>
        </div>) : null}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3">
        {rule.max_distance != null ? (<div>
            <dt className="text-faint">{t("rules.maxDistance")}</dt>
            <dd className="tabular-nums text-foreground">{rule.max_distance}</dd>
          </div>) : null}
        {rule.max_radius != null ? (<div>
            <dt className="text-faint">{t("rules.maxRadius")}</dt>
            <dd className="tabular-nums text-foreground">{rule.max_radius}</dd>
          </div>) : null}
        {rule.max_impacted_nodes != null ? (<div>
            <dt className="text-faint">{t("rules.maxImpacted")}</dt>
            <dd className="tabular-nums text-foreground">{rule.max_impacted_nodes}</dd>
          </div>) : null}
        {rule.tag ? (<div>
            <dt className="text-faint">{t("rules.tag")}</dt>
            <dd className="font-mono text-foreground">{rule.tag}</dd>
          </div>) : null}
        {rule.active_from || rule.active_until ? (<div className="col-span-2">
            <dt className="text-faint">{t("rules.window")}</dt>
            <dd className="tabular-nums text-foreground">
              {formatInstant(rule.active_from)} {t("rules.windowTo")}{" "}
              {formatInstant(rule.active_until)}
            </dd>
          </div>) : null}
        <div>
          <dt className="text-faint">{t("rules.updatedAt")}</dt>
          <dd className="tabular-nums text-foreground">
            {formatInstant(rule.updated_at)}
          </dd>
        </div>
      </dl>
      {rule.reasons && rule.reasons.length > 0 ? (<div>
          <p className="mb-1 text-xs font-medium text-faint">{t("rules.reasons")}</p>
          <ul className="space-y-1">
            {rule.reasons.map((reason, index) => (<li key={`${reason.at}-${index}`} className="text-xs text-foreground">
                <span className="text-faint">
                  {reason.author.type === "agent"
                    ? t("rules.reasonByAgent", {
                        label: reason.author.agent?.label || reason.author.agent?.token_id || "agent",
                    })
                    : t("rules.reasonByHuman")}
                  {" · "}
                  {formatInstant(reason.at)}
                </span>
                <p className="mt-0.5">{reason.text}</p>
              </li>))}
          </ul>
        </div>) : null}
      <div className="flex justify-end gap-1.5 border-t border-line pt-3">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          {t("common.edit")}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          {t("common.delete")}
        </Button>
      </div>
    </div>);
}
function PendingQueue({ rules }: {
    rules: Rule[];
}) {
    const t = useT();
    const toast = useToast();
    const approve = useApproveRule();
    const reject = useRejectRule();
    const pending = pendingRules(rules);
    if (pending.length === 0)
        return null;
    const busy = approve.isPending || reject.isPending;
    async function decide(rule: Rule, action: "approve" | "reject") {
        try {
            if (action === "approve")
                await approve.mutateAsync(rule.id);
            else
                await reject.mutateAsync(rule.id);
            toast({
                title: action === "approve" ? t("rules.approved") : t("rules.rejected"),
                detail: rule.name,
                tone: "ok",
            });
        }
        catch (err) {
            toast({
                title: t("rules.decideFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
    }
    return (<Card data-pending-queue className="border-warn/30">
      <CardHeader title={t("rules.pendingTitle")}/>
      <ul className="divide-y divide-line">
        {pending.map((rule) => (<li key={rule.id} className="flex items-center gap-3 px-5 py-3.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warn"/>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{rule.name}</p>
              <p className="text-xs text-faint">
                {t("rules.authorAgent", { label: authorAgentLabel(rule) })}
                {" · "}
                {t(rule.severity === "block" ? "severity.block" : "severity.warn")}
              </p>
            </div>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void decide(rule, "reject")}>
              {t("rules.reject")}
            </Button>
            <Button size="sm" variant="primary" disabled={busy} onClick={() => void decide(rule, "approve")}>
              {t("rules.approve")}
            </Button>
          </li>))}
      </ul>
    </Card>);
}
const VISIBLE_RULES = 6;
function ruleMatches(rule: Rule, query: string, kindLabel: string): boolean {
    const needle = query.trim().toLowerCase();
    if (!needle)
        return true;
    const author = authorKind(rule) === "agent" ? authorAgentLabel(rule) : "";
    return (rule.name.toLowerCase().includes(needle) ||
        kindLabel.toLowerCase().includes(needle) ||
        author.toLowerCase().includes(needle));
}
export function RulesPage() {
    const { data, isLoading, isError } = useRules();
    const { data: activity } = useRuleActivity();
    const [days, setDays] = useState<7 | 30>(7);
    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [openRuleId, setOpenRuleId] = useState<string | null>(null);
    const [zoneLoadingId, setZoneLoadingId] = useState<string | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<Rule | null>(null);
    const [deleting, setDeleting] = useState<Rule | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const deleteRule = useDeleteRule();
    const overlays = useViewerOverlays();
    const navigate = useNavigate();
    const toast = useToast();
    const t = useT();
    const rules = data?.rules ?? [];
    function openEdit(rule: Rule) {
        setOpenRuleId(null);
        setEditing(rule);
        setEditorOpen(true);
    }
    async function confirmDelete() {
        if (!deleting)
            return;
        setDeleteBusy(true);
        try {
            await deleteRule.mutateAsync(deleting.id);
            toast({ title: t("rules.deleted"), detail: deleting.name, tone: "ok" });
            setDeleting(null);
            setOpenRuleId(null);
        }
        catch (err) {
            toast({
                title: t("rules.deleteFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setDeleteBusy(false);
        }
    }
    async function showZone(rule: Rule) {
        setZoneLoadingId(rule.id);
        try {
            const zone = await fetchRuleNodes(rule.id);
            overlays.showZone(`rule:${rule.id}`, zone.core.map((n) => n.id), zone.halo.map((n) => ({ id: n.id, distance: n.distance ?? 1 })));
            void navigate({ to: "/graph" });
            if (zone.truncated) {
                toast({
                    title: t("rules.zoneTruncatedTitle"),
                    detail: t("rules.zoneTruncatedDetail"),
                    tone: "neutral",
                });
            }
        }
        catch (err) {
            toast({
                title: t("rules.zoneLoadFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setZoneLoadingId(null);
        }
    }
    const ruleStats = statsByRule(activity);
    const ordered = rulesByRecentActivity(rules, activity?.stats, rules.length);
    const filtered = ordered.filter((rule) => ruleMatches(rule, query, t(RULE_KIND_LABEL_KEY[rule.kind])));
    const shown = showAll || query ? filtered : filtered.slice(0, VISIBLE_RULES);
    const hiddenCount = filtered.length - shown.length;
    const openRule = ordered.find((rule) => rule.id === openRuleId) ?? null;
    return (<div className="flex min-h-full flex-col gap-12 overflow-hidden px-8 py-10 lg:px-12">
      <Reveal>
        <GuardHero days={days} onDaysChange={setDays}/>
      </Reveal>

      <Reveal delay={0.08} className="space-y-5">
        <BypassAlert incidents={openIncidents(activity)} rules={rules}/>
        <PendingQueue rules={rules}/>

        {rules.length > 0 ? (<div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {t("rules.title")}
              <span className="ml-1.5 text-faint">({rules.length})</span>
            </p>
            {rules.length > 4 ? (<input value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder={t("rules.searchPlaceholder")} aria-label={t("rules.searchPlaceholder")} className="h-9 w-64 max-w-full rounded border border-line bg-inset px-3 text-sm text-foreground outline-none transition-colors duration-fast placeholder:text-faint focus:border-line-strong"/>) : null}
          </div>) : null}

        {isLoading ? (<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-44 w-full"/>
            <Skeleton className="h-44 w-full"/>
            <Skeleton className="h-44 w-full"/>
          </div>) : isError ? (<EmptyState title={t("rules.title")} detail={t("rules.unavailable")} action={<Link to="/settings">
                <Button variant="primary" size="sm">
                  {t("nav.settings")}
                </Button>
              </Link>}/>) : rules.length === 0 ? (<EmptyState title={t("overview.noRulesTitle")} detail={t("rules.noRulesDetail")} action={<Link to="/rules/studio">
                <Button variant="primary" size="sm">
                  {t("overview.createFirstRule")}
                </Button>
              </Link>}/>) : filtered.length === 0 ? (<p className="py-6 text-center text-sm text-muted">{t("rules.noMatch")}</p>) : (<>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {shown.map((rule, index) => (<GuardCard key={rule.id} rule={rule} stats={ruleStats.get(rule.id)} index={index} zoneLoading={zoneLoadingId === rule.id} onOpen={() => setOpenRuleId(rule.id)} onZone={() => void showZone(rule)}/>))}
            </div>
            {hiddenCount > 0 ? (<div className="flex justify-center pt-1">
                <Button variant="ghost" onClick={() => setShowAll(true)}>
                  {t("rules.showMore", { count: filtered.length })}
                </Button>
              </div>) : null}
          </>)}

        <StartHere />
      </Reveal>

      <Reveal delay={0.16}>
        <JournalPanel days={days}/>
      </Reveal>

      <Dialog open={Boolean(openRule)} onOpenChange={(open) => {
            if (!open)
                setOpenRuleId(null);
        }} title={openRule?.name ?? ""}>
        {openRule ? (<RuleDetail rule={openRule} onEdit={() => openEdit(openRule)} onDelete={() => {
                setOpenRuleId(null);
                setDeleting(openRule);
            }}/>) : null}
      </Dialog>

      <RuleEditor open={editorOpen} onOpenChange={setEditorOpen} editing={editing}/>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => {
            if (!open)
                setDeleting(null);
        }} title={t("rules.deleteTitle")} description={deleting
            ? t("rules.deleteDescription", { name: deleting.name })
            : undefined}>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)} disabled={deleteBusy}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={() => void confirmDelete()} disabled={deleteBusy}>
            {deleteBusy ? t("common.deleting") : t("common.delete")}
          </Button>
        </div>
      </Dialog>
    </div>);
}
