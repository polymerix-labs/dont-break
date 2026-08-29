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

import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchHookObservations, fetchIncidentDiff } from "../../api/client";
import { Badge, Button, Card, CardHeader, Disclosure, Reveal, useToast, verdictTone, } from "../../design";
import { useAckIncident, useRuleActivity, useRuleNodes, useRules, } from "../../hooks/useDashboardQueries";
import { useT } from "../../i18n";
import { formatInstant } from "./ruleDisplay";
import { classifyTouched, protectedZoneLines, repairPrompt } from "./incidentDetail";
import { seedStudio } from "./studio/studioStore";
import { coachAgentContext } from "./SentinelPanel";
function diffLineClass(line: string): string {
    if (line.startsWith("+++") || line.startsWith("---"))
        return "text-faint";
    if (line.startsWith("diff ") || line.startsWith("index "))
        return "text-faint";
    if (line.startsWith("@@"))
        return "text-primary";
    if (line.startsWith("+"))
        return "text-ok";
    if (line.startsWith("-"))
        return "text-danger";
    return "text-muted";
}
function DiffView({ diff }: {
    diff: string;
}) {
    return (<pre className="max-h-[28rem] overflow-auto rounded-md bg-inset p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {diff.split("\n").map((line, index) => (<span key={index} className={`block ${diffLineClass(line)}`}>
          {line || " "}
        </span>))}
    </pre>);
}
function diffStats(diff: string): {
    added: number;
    removed: number;
} {
    let added = 0;
    let removed = 0;
    for (const line of diff.split("\n")) {
        if (line.startsWith("+") && !line.startsWith("+++"))
            added += 1;
        else if (line.startsWith("-") && !line.startsWith("---"))
            removed += 1;
    }
    return { added, removed };
}
function StepTitle({ step, children }: {
    step: number;
    children: React.ReactNode;
}) {
    return (<span className="flex items-center gap-2">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[11px] font-semibold text-primary">
        {step}
      </span>
      {children}
    </span>);
}
export function IncidentDetailPage() {
    const { incidentId } = useParams({ from: "/rules/incidents/$incidentId" });
    const t = useT();
    const toast = useToast();
    const navigate = useNavigate();
    const activity = useRuleActivity();
    const rules = useRules();
    const ack = useAckIncident();
    const [copied, setCopied] = useState(false);
    const [diff, setDiff] = useState<string>("");
    const [diffReason, setDiffReason] = useState<string>("");
    const [model, setModel] = useState<string>("");
    const incident = (activity.data?.incidents ?? []).find((row) => row.id === incidentId);
    const rule = rules.data?.rules.find((row) => row.id === incident?.rule_id);
    const nodes = useRuleNodes(incident?.rule_id ?? null);
    const zone = protectedZoneLines(rule, nodes.data);
    const touched = classifyTouched(incident?.files ?? [], rule);
    const inZone = touched.filter((file) => file.inZone);
    const beside = touched.filter((file) => !file.inZone);
    const prompt = incident ? repairPrompt(incident) : "";
    useEffect(() => {
        if (!incident)
            return;
        void fetchIncidentDiff(incident.files).then((result) => {
            setDiff(result.diff);
            setDiffReason(result.available ? "" : result.reason || "unavailable");
        });
        void fetchHookObservations().then((rows) => {
            const hit = rows.find((row) => incident.files.some((file) => file === row.relative_path || file.endsWith(row.relative_path || "")));
            if (hit?.model)
                setModel(hit.model);
        });
    }, [incident]);
    async function acknowledge() {
        if (!incident)
            return;
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
    async function copyPrompt() {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            toast({ title: t("incident.copied"), tone: "ok" });
        }
        catch {
            toast({ title: t("incident.copyFailed"), tone: "danger" });
        }
    }
    function tighten() {
        if (!incident)
            return;
        seedStudio(t("sentinel.fixPrompt", { name: incident.rule_name }), coachAgentContext(incident, rule));
        void navigate({ to: "/rules/studio" });
    }
    if (activity.isLoading || rules.isLoading) {
        return (<div className="p-6">
        <p className="text-sm text-muted">{t("incident.loading")}</p>
      </div>);
    }
    if (!incident) {
        return (<div className="p-6">
        <p className="text-sm text-foreground">{t("incident.notFound")}</p>
        <Link to="/rules" className="mt-3 inline-block text-sm text-primary">
          {t("incident.back")}
        </Link>
      </div>);
    }
    return (<div className="mx-auto max-w-5xl px-6 py-6 lg:px-8">
      <Link to="/rules" className="text-xs text-muted hover:text-foreground">
        {t("incident.back")}
      </Link>

      
      <Reveal className="mt-4">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface px-6 py-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-danger/70 via-danger/20 to-transparent"/>
          <p className="text-xs font-medium uppercase tracking-wide text-danger">
            {t("incident.kicker")}
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-xl font-semibold tracking-tight text-foreground">
            {t(incident.kind === "unchecked" ? "incident.storyUnchecked" : "incident.storyBypassed", { name: incident.rule_name })}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok"/>
            {t("incident.reassure")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={verdictTone(incident.severity)}>{incident.severity}</Badge>
            <span className="text-xs text-muted">{formatInstant(incident.at)}</span>
            {model ? <Badge tone="neutral">{model}</Badge> : null}
            <span className="flex-1"/>
            {incident.acknowledged ? (<Badge tone="ok">{t("incident.acknowledged")}</Badge>) : (<Button size="sm" variant="ghost" disabled={ack.isPending} onClick={() => void acknowledge()}>
                {t("sentinel.ack")}
              </Button>)}
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        
        <div className="flex min-w-0 flex-col gap-4">
          <Reveal delay={0.05}>
            <Card>
              <CardHeader title={t("incident.zoneCrossed")}/>
              <div className="px-4 py-4">
                {inZone.length === 0 ? (<p className="text-sm text-muted">
                    {touched.length === 0 ? t("incident.noFiles") : t("incident.noneInZone")}
                  </p>) : (<ul className="space-y-1.5">
                    {inZone.map((file) => (<li key={file.path} className="flex items-center gap-2.5 rounded-md bg-danger-subtle px-3 py-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger"/>
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                          {file.path}
                        </span>
                        <Badge tone="danger">{t("incident.inZone")}</Badge>
                      </li>))}
                  </ul>)}
                {beside.length > 0 ? (<Disclosure className="mt-3" summary={t("incident.besideToggle", { count: String(beside.length) })}>
                    <ul className="space-y-1 font-mono text-xs text-muted">
                      {beside.map((file) => (<li key={file.path} className="truncate">
                          {file.path}
                        </li>))}
                    </ul>
                  </Disclosure>) : null}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <CardHeader title={t("incident.diffTitle")} actions={diff ? (<>
                      <Badge tone="ok">+{diffStats(diff).added}</Badge>
                      <Badge tone="danger">−{diffStats(diff).removed}</Badge>
                    </>) : undefined}/>
              <div className="px-4 py-4">
                {diff ? (<DiffView diff={diff}/>) : (<p className="text-sm text-muted">
                    {diffReason === "not_git" || diffReason === "no_project"
                ? t("incident.diffLater")
                : t("incident.diffEmpty")}
                  </p>)}
              </div>
            </Card>
          </Reveal>
        </div>

        
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <Reveal delay={0.1}>
            <Card>
              <CardHeader title={<StepTitle step={1}>{t("incident.repairTitle")}</StepTitle>}/>
              <div className="px-4 py-4">
                <p className="text-sm text-muted">{t("incident.repairHint")}</p>
                <pre className="mt-3 max-h-44 overflow-auto rounded-md bg-inset p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {prompt}
                </pre>
                <Button size="sm" variant="primary" className="mt-3 w-full" onClick={() => void copyPrompt()}>
                  {copied ? t("incident.copied") : t("incident.copyPrompt")}
                </Button>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <Card>
              <CardHeader title={<StepTitle step={2}>{t("incident.avoidTitle")}</StepTitle>}/>
              <div className="px-4 py-4">
                <p className="text-sm text-muted">{t("incident.hardModeHint")}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button size="sm" onClick={() => void navigate({ to: "/settings" })}>
                    {t("incident.hardModeCta")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={tighten}>
                    {t("incident.tightenRule")}
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card>
              <CardHeader title={t("incident.protectedZone")}/>
              <ul className="space-y-1 px-4 py-4 font-mono text-xs text-muted">
                {zone.length === 0 ? (<li>{t("incident.noFiles")}</li>) : (zone.map((line) => (<li key={line} className="break-all">
                      {line}
                    </li>)))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>);
}
