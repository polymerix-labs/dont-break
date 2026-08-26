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

import { useNavigate } from "@tanstack/react-router";
import { Badge, Button, Card, cn, useToast } from "../../design";
import { useT } from "../../i18n";
import type { BypassIncident, Rule, RuleActivity, RuleStats, RuleTargets, } from "../../api/dashboard";
import type { RuleDailyRollup } from "../../api/ruleEventsQuery";
import { integrityPct } from "../../api/ruleEventsQuery";
import { useAckIncident } from "../../hooks/useDashboardQueries";
import { formatInstant } from "./ruleDisplay";
import { seedStudio } from "./studio/studioStore";
function formatTargetAxes(targets: RuleTargets | undefined): string[] {
    if (!targets)
        return [];
    const lines: string[] = [];
    if (targets.node_ids?.length)
        lines.push(`node_ids: ${targets.node_ids.join(", ")}`);
    if (targets.path_globs?.length)
        lines.push(`path_globs: ${targets.path_globs.join(", ")}`);
    if (targets.fqns?.length)
        lines.push(`fqns: ${targets.fqns.join(", ")}`);
    return lines;
}
export function coachAgentContext(incident: BypassIncident, rule: Rule | undefined): string {
    const lines = [
        `rule_id: ${incident.rule_id}`,
        `incident: ${incident.kind}`,
        `files: ${incident.files.join(", ")}`,
    ];
    if (rule) {
        const covered = [
            ...formatTargetAxes(rule.targets),
            ...formatTargetAxes(rule.from).map((l) => `from.${l}`),
            ...formatTargetAxes(rule.to).map((l) => `to.${l}`),
        ];
        if (covered.length > 0) {
            lines.push("already_protected (keep these, extend the zone — do not replace it):", ...covered);
        }
    }
    return lines.join("\n");
}
export function statsByRule(activity: RuleActivity | undefined): Map<string, RuleStats> {
    const map = new Map<string, RuleStats>();
    for (const stat of activity?.stats ?? []) {
        map.set(stat.rule_id, stat);
    }
    return map;
}
export function openIncidents(activity: RuleActivity | undefined): BypassIncident[] {
    return (activity?.incidents ?? []).filter((i) => !i.acknowledged);
}
function Counter({ label, value, tone, sub, }: {
    label: string;
    value: string;
    tone?: "ok" | "danger";
    sub?: string;
}) {
    return (<div className="min-w-0 flex-1 px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-0.5 text-2xl font-semibold tabular-nums", tone === "danger"
            ? "text-danger"
            : tone === "ok"
                ? "text-ok"
                : "text-foreground")}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-faint">{sub}</p> : null}
    </div>);
}
export function SentinelStrip({ totals }: {
    totals: RuleDailyRollup | undefined;
}) {
    const t = useT();
    if (!totals)
        return null;
    const integrity = integrityPct(totals);
    return (<Card data-sentinel-strip>
      <div className="flex divide-x divide-line">
        <Counter label={t("metrics.checks")} value={String(totals.checks)} sub={t("metrics.filesChecked", { count: totals.files_checked })}/>
        <Counter label={t("sentinel.bypasses")} value={String(totals.incidents)} tone={totals.incidents > 0 ? "danger" : undefined}/>
        <Counter label={t("sentinel.integrity")} value={`${integrity}%`} tone={integrity < 100 ? "danger" : "ok"}/>
      </div>
    </Card>);
}
export function RuleActivityChips({ stats, formatWhen, }: {
    stats: RuleStats | undefined;
    formatWhen: (instant: string) => string;
}) {
    const t = useT();
    if (!stats || (stats.hits === 0 && stats.bypasses === 0))
        return null;
    return (<p className="mt-0.5 text-xs tabular-nums text-faint">
      {t("sentinel.ruleHits", { count: stats.blocked + stats.warned })}
      {stats.last_hit_at
            ? ` · ${t("sentinel.lastHit", { when: formatWhen(stats.last_hit_at) })}`
            : null}
    </p>);
}
export function RuleBypassBadge({ stats }: {
    stats: RuleStats | undefined;
}) {
    const t = useT();
    if (!stats || stats.bypasses === 0)
        return null;
    return <Badge tone="danger">{t("sentinel.bypassBadge")}</Badge>;
}
export function BypassAlert({ incidents, rules, }: {
    incidents: BypassIncident[];
    rules: Rule[];
}) {
    const t = useT();
    const toast = useToast();
    const navigate = useNavigate();
    const ack = useAckIncident();
    const incident = incidents[0];
    if (!incident)
        return null;
    function coachAgent() {
        const rule = rules.find((r) => r.id === incident.rule_id);
        seedStudio(t("sentinel.fixPrompt", { name: incident.rule_name }), coachAgentContext(incident, rule));
        void navigate({ to: "/rules/studio" });
    }
    async function acknowledge() {
        try {
            await ack.mutateAsync(incident.id);
        }
        catch (err) {
            toast({
                title: t("sentinel.ackFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
    }
    return (<div data-bypass-alert className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-danger">
            {t("sentinel.alertTitle")}
            {incidents.length > 1 ? ` (${incidents.length})` : ""}
          </p>
          <p className="mt-0.5 text-sm text-foreground">
            {t(incident.kind === "bypassed"
            ? "sentinel.alertBypassed"
            : "sentinel.alertUnchecked", { name: incident.rule_name })}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t("sentinel.incidentSeverity", { severity: incident.severity })}
            {" · "}
            {t("sentinel.incidentWhen", { when: formatInstant(incident.at) })}
          </p>
          {incident.files.length > 0 ? (<p className="mt-1 truncate font-mono text-xs text-muted">
              {incident.files.slice(0, 3).join("  ·  ")}
              {incident.files.length > 3 ? `  ·  +${incident.files.length - 3}` : ""}
            </p>) : null}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button size="sm" variant="ghost" disabled={ack.isPending} onClick={() => void acknowledge()}>
            {t("sentinel.ack")}
          </Button>
          <Button size="sm" variant="primary" onClick={coachAgent}>
            {t("sentinel.fixAgent")}
          </Button>
        </div>
      </div>
    </div>);
}
