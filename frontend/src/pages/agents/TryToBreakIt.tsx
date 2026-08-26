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
import { useState } from "react";
import { checkChange, checkResponseBasis, fetchRuleNodes, type CheckViolation, type DoNotTouchEntry, } from "../../api/dashboard";
import type { AgentSetup } from "../../api/client";
import { Badge, Button, Card, CardBody, CardHeader, useToast } from "../../design";
import { useCreateRule, useDoNotTouch } from "../../hooks/useDashboardQueries";
import { useT, type TFunc, type MessageKey } from "../../i18n";
import { seedStudio } from "../rules/studio/studioStore";
import { useViewerOverlays } from "../../viewer/useViewerOverlays";
import type { AgentTarget } from "./agentTargets";
const AVG_FILE_READ_TOKENS = 700;
const TOOL_CALL_TOKENS = 150;
const CHECK_POLL_MS = 1500;
const CHECK_MAX_ATTEMPTS = 6;
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
type DemoState = {
    phase: "idle";
} | {
    phase: "arming";
} | {
    phase: "checking";
} | {
    phase: "blocked";
    ruleId: string;
    ruleName: string;
    violation: CheckViolation;
    zoneNodes: number | null;
} | {
    phase: "failed";
    message: string;
};
function witnessLine(violation: CheckViolation): string {
    const path = violation.witness_path;
    if (!path || path.nodes.length === 0) {
        return violation.protected_node.fqn ?? violation.protected_node.name ?? "";
    }
    return path.nodes.join(" -> ");
}
function CopyPrompt({ code, t }: {
    code: string;
    t: TFunc;
}) {
    const [copied, setCopied] = useState(false);
    return (<div className="relative" data-copy="ttb-prompt">
      <pre className="overflow-auto rounded border border-line bg-inset p-3 font-mono text-xs leading-relaxed text-foreground">
        {code}
      </pre>
      <Button size="sm" variant="ghost" className="absolute right-1.5 top-1.5 bg-surface" onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
            });
        }}>
        {copied ? t("common.copied") : t("common.copy")}
      </Button>
    </div>);
}
export function TryToBreakIt({ setup, target, }: {
    setup: AgentSetup;
    target: AgentTarget;
}) {
    const t = useT();
    const toast = useToast();
    const navigate = useNavigate();
    const overlays = useViewerOverlays();
    const createRule = useCreateRule();
    const danger = useDoNotTouch();
    const [state, setState] = useState<DemoState>({ phase: "idle" });
    const entry: DoNotTouchEntry | undefined = danger.data?.[0];
    const entryName = entry?.name ?? entry?.fqn ?? entry?.node_id ?? "";
    async function runDemo(node: DoNotTouchEntry) {
        const nodeName = node.name ?? node.fqn ?? node.node_id;
        setState({ phase: "arming" });
        try {
            const rule = await createRule.mutateAsync({
                kind: "pinned_do_not_touch",
                name: `Protect ${nodeName}`,
                severity: "block",
                targets: { node_ids: [node.node_id] },
            });
            setState({ phase: "checking" });
            let violation: CheckViolation | null = null;
            let lastBasis: ReturnType<typeof checkResponseBasis> | null = null;
            for (let attempt = 0; attempt < CHECK_MAX_ATTEMPTS; attempt += 1) {
                await sleep(CHECK_POLL_MS);
                const result = await checkChange({ nodes: [node.node_id] });
                lastBasis = checkResponseBasis(result);
                const hit = result.violations.find((v) => v.rule_id === rule.id);
                if (result.verdict === "block" && hit) {
                    violation = hit;
                    break;
                }
            }
            if (!violation) {
                const honesty = lastBasis === "no_rules" || lastBasis === "structural"
                    ? t(`check.basis.${lastBasis}` as MessageKey)
                    : null;
                setState({
                    phase: "failed",
                    message: honesty ?? "check never returned block",
                });
                return;
            }
            let zoneNodes: number | null = null;
            try {
                const zone = await fetchRuleNodes(rule.id);
                zoneNodes = zone.core.length + zone.halo.length;
            }
            catch {
            }
            setState({
                phase: "blocked",
                ruleId: rule.id,
                ruleName: rule.name,
                violation,
                zoneNodes,
            });
        }
        catch (err) {
            setState({
                phase: "failed",
                message: err instanceof Error ? err.message : "unknown error",
            });
        }
    }
    function ruleFromWitness(blocked: Extract<DemoState, {
        phase: "blocked";
    }>) {
        const node = blocked.violation.protected_node;
        const label = node.name ?? node.fqn ?? "";
        seedStudio(t("studio.entry.witnessPrompt", { name: label }), [
            node.fqn ? `protected fqn: ${node.fqn}` : null,
            `witness path: ${witnessLine(blocked.violation)}`,
            `violated rule: ${blocked.ruleName}`,
        ]
            .filter(Boolean)
            .join("\n"));
        void navigate({ to: "/rules/studio" });
    }
    function refineInStudio(blocked: Extract<DemoState, {
        phase: "blocked";
    }>) {
        const node = blocked.violation.protected_node;
        const label = node.name ?? node.fqn ?? "";
        seedStudio(t("studio.entry.refinePrompt", { name: label }), [
            `existing rule: ${blocked.ruleName} (${blocked.ruleId})`,
            node.fqn ? `protected fqn: ${node.fqn}` : null,
            `witness path: ${witnessLine(blocked.violation)}`,
        ]
            .filter(Boolean)
            .join("\n"));
        void navigate({ to: "/rules/studio" });
    }
    async function showZone(ruleId: string) {
        try {
            const zone = await fetchRuleNodes(ruleId);
            overlays.showZone(`rule:${ruleId}`, zone.core.map((n) => n.id), zone.halo.map((n) => ({ id: n.id, distance: n.distance ?? 1 })));
            void navigate({ to: "/graph" });
        }
        catch (err) {
            toast({
                title: t("ttb.failed", {
                    message: err instanceof Error ? err.message : "unknown error",
                }),
                tone: "danger",
            });
        }
    }
    const agentPrompt = entry
        ? [
            `Modify ${entry.fqn ?? entryName} in ${setup.project_slug}.`,
            `Call check_change on it first. It is protected: expect the verdict`,
            `"block" and show me the witness path instead of editing.`,
        ].join("\n")
        : "";
    return (<Card data-try-to-break>
      <CardHeader title={t("ttb.title")} actions={<Badge tone="danger">{t("agents.blockExit")}</Badge>}/>
      <CardBody className="space-y-3">
        <p className="text-xs text-muted">{t("ttb.subtitle")}</p>

        {danger.isLoading ? (<p className="text-xs text-faint">{t("common.loading")}</p>) : !entry ? (<p className="text-xs text-muted">{t("ttb.noDanger")}</p>) : (<div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-inset px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs text-faint">{t("ttb.dangerLabel")}</p>
                <p className="truncate font-mono text-sm text-foreground">
                  {entry.fqn ?? entryName}
                </p>
              </div>
              {state.phase === "idle" || state.phase === "failed" ? (<Button variant="primary" size="sm" onClick={() => void runDemo(entry)}>
                  {t("ttb.protectNow", { name: entryName })}
                </Button>) : state.phase === "arming" ? (<span className="text-xs text-warn">{t("ttb.arming")}</span>) : state.phase === "checking" ? (<span className="text-xs text-warn">{t("ttb.checking")}</span>) : null}
            </div>

            {state.phase === "failed" ? (<p className="text-xs text-danger">
                {t("ttb.failed", { message: state.message })}
              </p>) : null}

            {state.phase === "blocked" ? (<div className="space-y-2.5 rounded border border-danger/40 bg-danger/5 p-3" data-ttb-blocked>
                <p className="text-sm font-medium text-danger">{t("ttb.blockedTitle")}</p>
                <p className="text-xs text-muted">
                  {t("ttb.blockedDetail", {
                    rule: state.ruleName,
                    verdict: state.violation.severity,
                })}
                </p>
                <div>
                  <p className="text-xs font-medium text-muted">{t("ttb.witness")}</p>
                  <p className="mt-1 overflow-auto font-mono text-xs text-foreground">
                    {witnessLine(state.violation)}
                  </p>
                  <button type="button" onClick={() => ruleFromWitness(state)} className="mt-1 text-xs text-faint underline-offset-2 hover:text-muted hover:underline" data-ttb-witness-rule>
                    {t("ttb.witnessToStudio")}
                  </button>
                </div>
                {state.zoneNodes !== null && state.zoneNodes > 0 ? (<p className="text-xs text-muted">
                    {t("ttb.tokensLine", {
                        saved: (state.zoneNodes * AVG_FILE_READ_TOKENS -
                            TOOL_CALL_TOKENS).toLocaleString(),
                        nodes: state.zoneNodes,
                    })}
                  </p>) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void showZone(state.ruleId)}>
                    {t("rules.showZone")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => refineInStudio(state)} data-ttb-refine>
                    {t("ttb.refineInStudio")}
                  </Button>
                </div>
                <div className="space-y-1.5 border-t border-line pt-2.5">
                  <p className="text-xs font-medium text-muted">
                    {t("agents.promptLabel")}
                    <span className="ml-1.5 font-normal text-faint">
                      {t(target.promptHintKey)}
                    </span>
                  </p>
                  <CopyPrompt code={agentPrompt} t={t}/>
                </div>
              </div>) : null}
          </div>)}
      </CardBody>
    </Card>);
}
