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

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Badge, Button, Card, CardBody, CardHeader, CountUp, EASE, LiveDot, Reveal, Skeleton, cn, verdictTone, } from "../design";
import { useArchStatus, useDoNotTouch, useRuleEvents, useRules, } from "../hooks/useDashboardQueries";
import { useT, useVoice, type MessageKey } from "../i18n";
import { blockRespected, defaultEventRange, eventCheckBasis, type RuleEventKind, } from "../api/ruleEventsQuery";
import { useLockdownStatus } from "../shell/LockdownBanner";
import { formatInstant, pendingRules, ruleActivation } from "./rules/ruleDisplay";
import { OVERVIEW_EMPTY, humanOverviewCtas, overviewPrimaryCta, proofRollup, recentJournalEvents, storyMessageKey, storyTarget, storyWho, trustDetailKey, trustHeadlineKey, trustTone, type TrustTone, } from "./overviewActivity";
const VERDICT_KEYS: Record<string, MessageKey> = {
    healthy: "verdict.healthy",
    caution: "verdict.caution",
    critical: "verdict.critical",
    unknown: "verdict.unknown",
};
const TONE_COLOR: Record<TrustTone, string> = {
    obeyed: "var(--db-ok)",
    quiet: "var(--db-ok)",
    watched: "var(--db-warn)",
    broken: "var(--db-danger)",
};
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
interface DonutSegment {
    key: string;
    count: number;
    color: string;
}
function CompositionDonut({ segments, total, label, size = 216, stroke = 13, }: {
    segments: DonutSegment[];
    total: number;
    label: string;
    size?: number;
    stroke?: number;
}) {
    const reduce = useReducedMotion();
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const gap = total > 0 ? Math.min(6, c * 0.012) : 0;
    const visible = segments.filter((s) => s.count > 0);
    let start = 0;
    return (<div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--db-overlay)" strokeWidth={stroke}/>
        {visible.map((s, i) => {
            const len = Math.max(0, (s.count / total) * c - gap);
            const offset = -start;
            start += (s.count / total) * c;
            return (<motion.circle key={s.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="round" strokeDashoffset={offset} initial={reduce
                    ? { strokeDasharray: `${len} ${c - len}` }
                    : { strokeDasharray: `0 ${c}`, opacity: 0 }} animate={{ strokeDasharray: `${len} ${c - len}`, opacity: 1 }} transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: EASE }} style={{ filter: `drop-shadow(0 0 6px ${s.color}40)` }}/>);
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <CountUp value={total} className="font-display text-[44px] font-semibold leading-none text-foreground"/>
        <p className="mt-2 text-xs text-muted">{label}</p>
      </div>
    </div>);
}
function LegendTile({ label, count, dotClass, }: {
    label: string;
    count: number;
    dotClass: string;
}) {
    return (<div className="flex items-center gap-2">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)}/>
      <CountUp value={count} className="text-sm font-semibold text-foreground"/>
      <span className="text-xs text-muted">{label}</span>
    </div>);
}
function ArchStatLine() {
    const { data, isLoading, isError } = useArchStatus();
    const t = useT();
    if (isLoading)
        return <Skeleton className="h-4 w-72"/>;
    if (isError || !data)
        return null;
    const verdict = data.practicability.verdict;
    const stability = data.global?.stability?.score;
    const navigability = data.global?.navigability?.score;
    return (<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        {t("overview.practicability")}
        <Badge tone={verdictTone(verdict)}>
          {VERDICT_KEYS[verdict] ? t(VERDICT_KEYS[verdict]) : verdict}
        </Badge>
      </span>
      {stability != null ? (<span>
          {t("overview.stability")}{" "}
          <span className="font-medium tabular-nums text-foreground">
            {stability.toFixed(1)}
          </span>
        </span>) : null}
      {navigability != null ? (<span>
          {t("overview.navigability")}{" "}
          <span className="font-medium tabular-nums text-foreground">
            {navigability.toFixed(1)}
          </span>
        </span>) : null}
    </div>);
}
function OverviewCtas({ checks }: {
    checks: number;
}) {
    const rulesQuery = useRules();
    const { status: lock } = useLockdownStatus(null);
    const t = useT();
    const primary = overviewPrimaryCta(checks);
    const rules = rulesQuery.data?.rules ?? [];
    const ctas = humanOverviewCtas(rules, Boolean(lock?.locked));
    const pendingCount = pendingRules(rules).length;
    return (<div className="flex flex-wrap items-center gap-3">
      <Link to={primary === "agents" ? "/agents" : "/graph"}>
        <Button variant="primary">
          {primary === "agents" ? t("welcome.cta") : t("overview.seeGraph")}
        </Button>
      </Link>
      <Link to="/rules">
        <Button variant="ghost">{t("overview.seeRules")}</Button>
      </Link>
      {ctas.includes("pending") ? (<Link to="/rules">
          <Badge tone="warn">{t("overview.pendingCta", { count: pendingCount })}</Badge>
        </Link>) : null}
      {ctas.includes("lock") ? (<Link to="/settings">
          <Badge tone="danger">{t("overview.lockCta")}</Badge>
        </Link>) : null}
    </div>);
}
function TrustHero() {
    const range = defaultEventRange();
    const journal = useRuleEvents({ ...range, limit: 80 });
    const reduce = useReducedMotion();
    const t = useT();
    useVoice();
    if (journal.isLoading) {
        return (<div className="space-y-4">
        <Skeleton className="h-3 w-56"/>
        <Skeleton className="h-14 w-96"/>
        <Skeleton className="h-5 w-2/3"/>
        <Skeleton className="h-8 w-64"/>
      </div>);
    }
    const proof = journal.isError
        ? null
        : proofRollup(journal.data?.totals, journal.data?.block_respected ??
            (journal.data?.totals ? blockRespected(journal.data.totals) : undefined));
    const empty = !proof || proof.checks === 0;
    const tone: TrustTone = empty ? "quiet" : trustTone(proof);
    const color = empty ? "var(--db-primary)" : TONE_COLOR[tone];
    const counts = proof
        ? {
            checks: proof.checks,
            respected: proof.respected,
            warned: proof.warned,
            forced: proof.block_forced,
            advised: proof.block_advised,
            pct: proof.integrity,
        }
        : null;
    const headline = empty
        ? t(OVERVIEW_EMPTY.titleKey)
        : tone === "broken"
            ? t(trustHeadlineKey(tone, proof), counts ?? undefined)
            : t("overview.nothingBroke");
    const subline = empty
        ? journal.isError
            ? t("overview.journalUnavailable")
            : t(OVERVIEW_EMPTY.detailKey)
        : tone === "broken"
            ? `${t(trustDetailKey(tone, proof), counts ?? undefined)}`
            : `${t(trustHeadlineKey(tone, proof), counts ?? undefined)} · ${t(trustDetailKey(tone, proof), counts ?? undefined)}`;
    const clean = proof ? Math.max(0, proof.checks - proof.warned - proof.block_advised) : 0;
    const segments: DonutSegment[] = proof
        ? [
            { key: "checks", count: clean, color: "var(--db-ok)" },
            { key: "warned", count: proof.warned, color: "var(--db-warn)" },
            { key: "blocked", count: proof.respected, color: "var(--db-primary)" },
            { key: "forced", count: proof.block_forced, color: "var(--db-danger)" },
        ]
        : [];
    return (<div className="relative">
      
      <div aria-hidden className="pointer-events-none absolute -top-44 left-1/2 h-80 w-[640px] max-w-[90vw] -translate-x-1/2 rounded-full opacity-[0.22] blur-3xl" style={{ background: `radial-gradient(closest-side, ${color}, transparent 72%)` }}/>
      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-faint">
            <LiveDot />
            {t("overview.eyebrow")}
          </p>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE }} className="mt-4 font-display text-[46px] font-semibold leading-[1.05] tracking-tight" style={tone === "broken"
            ? { color, textShadow: `0 0 32px ${color}33` }
            : { color: "var(--db-foreground)" }}>
            {headline}
          </motion.h1>
          <p className="mt-4 text-lg text-muted">{subline}</p>
          {proof && proof.incidents > 0 ? (<p className="mt-2 text-sm text-warn">
              {t("overview.incidents", { count: proof.incidents })}
            </p>) : null}
          <div className="mt-7">
            <OverviewCtas checks={proof?.checks ?? 0}/>
          </div>
          <div className="mt-5">
            <ArchStatLine />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-5 lg:pr-4">
          <CompositionDonut segments={segments} total={proof?.checks ?? 0} label={`${t("overview.editsChecked")} · ${t("overview.thisWeek").toLowerCase()}`}/>
          {!empty ? (<div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <LegendTile label={t("overview.tile.checks")} count={clean} dotClass="bg-ok"/>
              <LegendTile label={t("overview.tile.warned")} count={proof.warned} dotClass="bg-warn"/>
              <LegendTile label={t("overview.tile.blocked")} count={proof.respected} dotClass="bg-primary"/>
              <LegendTile label={t("overview.tile.forced")} count={proof.block_forced} dotClass="bg-danger"/>
            </div>) : null}
        </div>
      </div>
    </div>);
}
function ProtectionCard() {
    const rulesQuery = useRules();
    const danger = useDoNotTouch();
    const t = useT();
    const rules = rulesQuery.data?.rules ?? [];
    const activeCount = rules.filter((rule) => ruleActivation(rule).labelKey === "status.active").length;
    const entries = danger.data ?? [];
    const guarded = entries.filter((e) => e.reason.kind !== "derived");
    const exposed = entries.filter((e) => e.reason.kind === "derived");
    return (<Card>
      <CardHeader title={t("overview.protection")} actions={<Link to="/rules">
            <Button size="sm">{t("overview.protect")}</Button>
          </Link>}/>
      {rulesQuery.isLoading || danger.isLoading ? (<CardBody className="space-y-2">
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-5/6"/>
          <Skeleton className="h-4 w-2/3"/>
        </CardBody>) : rules.length === 0 && entries.length === 0 ? (<CardBody className="space-y-3">
          <p className="text-sm font-medium text-foreground">{t("overview.noRulesTitle")}</p>
          <p className="text-sm text-muted">{t("overview.noRulesDetail")}</p>
          <Link to="/rules">
            <Button variant="primary" size="sm">
              {t("overview.createFirstRule")}
            </Button>
          </Link>
        </CardBody>) : (<CardBody className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
              {t("overview.protection.rules", { count: activeCount })}
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-ok"/>
              {t("overview.protection.guarded", { count: guarded.length })}
            </p>
            <p className={cn("flex items-center gap-2", exposed.length > 0 ? "text-warn" : "text-muted")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", exposed.length > 0 ? "bg-warn" : "bg-faint")}/>
              {t("overview.protection.exposed", { count: exposed.length })}
            </p>
          </div>
          {exposed.length > 0 ? (<ul className="space-y-1.5 border-t border-line pt-3">
              {exposed.slice(0, 3).map((entry) => (<li key={entry.node_id} className="truncate font-mono text-xs text-muted" title={entry.reason.detail}>
                  {entry.name || entry.fqn || entry.node_id}
                </li>))}
            </ul>) : null}
        </CardBody>)}
    </Card>);
}
function ActivityFeed() {
    const range = defaultEventRange();
    const journal = useRuleEvents({ ...range, limit: 80 });
    const rulesQuery = useRules();
    const reduce = useReducedMotion();
    const t = useT();
    const events = recentJournalEvents(journal.data?.events, 12);
    const names = new Map<string, string>();
    for (const rule of rulesQuery.data?.rules ?? [])
        names.set(rule.id, rule.name);
    return (<Card>
      <CardHeader title={<span className="flex items-center gap-2.5">
            <LiveDot />
            {t("overview.feed")}
            <span className="text-xs font-normal text-faint">{t("overview.live")}</span>
          </span>} actions={<Link to="/rules">
            <Button size="sm">{t("overview.seeRules")}</Button>
          </Link>}/>
      {journal.isLoading ? (<CardBody className="space-y-2">
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-5/6"/>
          <Skeleton className="h-4 w-2/3"/>
        </CardBody>) : journal.isError && events.length === 0 ? (<CardBody>
          <p className="text-sm text-muted">{t("overview.journalUnavailable")}</p>
        </CardBody>) : events.length === 0 ? (<CardBody>
          <p className="text-sm text-muted">{t("overview.noActivity")}</p>
        </CardBody>) : (<ul className="divide-y divide-line">
          {events.map((event, index) => {
                const basis = eventCheckBasis(event);
                const basisKey = basis === "no_rules" || basis === "structural"
                    ? (`check.basis.${basis}` as MessageKey)
                    : null;
                const who = storyWho(event, t("overview.you"), t("overview.anAgent"));
                const target = basisKey ? t(basisKey) : storyTarget(event, names) || t("overview.theGraph");
                const storyKey = storyMessageKey(event) as MessageKey;
                return (<motion.li key={event.id} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", EVENT_DOT[event.kind] ?? "bg-faint")}/>
                  <p className="min-w-0 truncate text-sm text-foreground">
                    {t(storyKey, {
                        who,
                        kind: t(EVENT_KIND_KEY[event.kind]),
                        target,
                    })}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-xs text-faint">
                  {formatInstant(event.at)}
                </span>
              </motion.li>);
            })}
        </ul>)}
    </Card>);
}
export function OverviewPage() {
    return (<div className="flex min-h-full flex-col gap-10 overflow-hidden px-8 py-8 lg:px-12 lg:py-10">
      <Reveal>
        <TrustHero />
      </Reveal>
      <Reveal delay={0.1} className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <ActivityFeed />
        <ProtectionCard />
      </Reveal>
    </div>);
}
