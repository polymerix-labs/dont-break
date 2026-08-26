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
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AssistAssessment, AssistCoverage, AssistProbe, } from "../../../api/assistProxy";
import type { Rule } from "../../../api/dashboard";
import { Badge, Button, Card, cn, Disclosure, useToast, } from "../../../design";
import { useCreateRule, useUpdateRule } from "../../../hooks/useDashboardQueries";
import { useT, useVoice } from "../../../i18n";
import { useUiStore } from "../../../shell/uiStore";
import { useViewerOverlays } from "../../../viewer/useViewerOverlays";
import { RULE_KIND_LABEL_KEY, ruleTargetSummary } from "../ruleDisplay";
import { RuleEditor } from "../RuleEditor";
import { draftFromRule } from "../ruleForm";
import type { StudioEvent } from "./studioStore";
import { useStudioStore } from "./studioStore";
import { STUDIO_OVERLAY_ID } from "./useStudioOverlays";
export type ContractDraft = Omit<Rule, "id">;
const KNOWN_KINDS: ReadonlySet<string> = new Set([
    "pinned_do_not_touch",
    "protected_path",
    "regulatory",
    "forbidden_dependency",
    "impact_budget",
    "layer_boundary",
]);
export function deriveContract(events: StudioEvent[]): ContractDraft | null {
    for (let i = events.length - 1; i >= 0; i--) {
        const { ev } = events[i];
        if (ev.event !== "final")
            continue;
        const draft = ev.data.draft;
        if (!draft || ev.data.status === "failed")
            return null;
        if (typeof draft.kind !== "string" || !KNOWN_KINDS.has(draft.kind)) {
            return null;
        }
        return draft as unknown as ContractDraft;
    }
    return null;
}
export function deriveDecisionTone(events: readonly StudioEvent[]): "ready" | "partial" | null {
    for (let i = events.length - 1; i >= 0; i--) {
        const { ev } = events[i];
        if (ev.event !== "final")
            continue;
        if (ev.data.status === "failed")
            return null;
        return ev.data.status === "draft_ready" ? "ready" : "partial";
    }
    return null;
}
export function deriveAdjustSeed(events: readonly StudioEvent[]): {
    gaps: string[];
    overBlocks: string[];
} {
    let probes: AssistProbe[] = [];
    let assessment: AssistAssessment | null = null;
    for (const { ev } of events) {
        if (ev.event === "simulation_started")
            probes = ev.data.probes;
        else if (ev.event === "simulation_result")
            assessment = ev.data.assessment;
        else if (ev.event === "final" && ev.data.assessment) {
            assessment = ev.data.assessment;
        }
    }
    const label = (id: string) => probes.find((p) => p.id === id)?.label ?? id;
    return {
        gaps: (assessment?.gaps ?? []).map(label),
        overBlocks: (assessment?.over_blocks ?? []).map(label),
    };
}
export function buildAdjustContextSeed(mission: string, draft: ContractDraft, flaws: {
    gaps: string[];
    overBlocks: string[];
}): string {
    const d = draft as ContractDraft & {
        targets?: unknown;
        from?: unknown;
        to?: unknown;
    };
    const shape: Record<string, unknown> = { kind: draft.kind, name: draft.name };
    if (d.targets !== undefined)
        shape.targets = d.targets;
    if (d.from !== undefined)
        shape.from = d.from;
    if (d.to !== undefined)
        shape.to = d.to;
    const lines = [
        "Adjustment of a rule proposed in a previous run; the user's mission is unchanged.",
        `Original mission: ${mission}`,
        `Previous draft: ${JSON.stringify(shape)}`,
    ];
    if (flaws.gaps.length) {
        lines.push(`Forbidden changes that were NOT blocked: ${flaws.gaps.join(", ")}`);
    }
    if (flaws.overBlocks.length) {
        lines.push(`Normal changes that were wrongly blocked: ${flaws.overBlocks.join(", ")}`);
    }
    lines.push("Refine the rule to fix these flaws while keeping the original mission.");
    return lines.join("\n");
}
export const TOGGLABLE_KINDS: ReadonlySet<string> = new Set([
    "pinned_do_not_touch",
    "protected_path",
    "regulatory",
    "impact_budget",
]);
export function toggleTargetNode(draft: ContractDraft, nodeId: string): ContractDraft {
    if (!TOGGLABLE_KINDS.has(draft.kind))
        return draft;
    const current = draft.targets?.node_ids ?? [];
    const node_ids = current.includes(nodeId)
        ? current.filter((id) => id !== nodeId)
        : [...current, nodeId];
    const targets = { ...draft.targets };
    if (node_ids.length)
        targets.node_ids = node_ids;
    else
        delete targets.node_ids;
    return { ...draft, targets };
}
export type RuleSeverity = "block" | "warn";
export function proposedSeverity(draft: Pick<ContractDraft, "severity"> | null): RuleSeverity | null {
    if (!draft)
        return null;
    return draft.severity === "block" || draft.severity === "warn" ? draft.severity : null;
}
export function deriveSeverityPrefill(events: StudioEvent[]): {
    severity: RuleSeverity;
    goal: string;
} | null {
    const draft = deriveContract(events);
    const severity = proposedSeverity(draft);
    if (!severity)
        return null;
    let goal = draft?.description?.trim() ?? "";
    for (let i = events.length - 1; i >= 0; i--) {
        const ev = events[i].ev;
        if (ev.event !== "intent")
            continue;
        const stated = ev.data.business_goal?.trim();
        if (stated) {
            goal = stated;
            break;
        }
    }
    return { severity, goal };
}
export function applySeverityChoice(draft: ContractDraft, severity: RuleSeverity): ContractDraft {
    return { ...draft, severity };
}
export function canPersistAfterSeverityConfirm(confirmed: boolean): boolean {
    return confirmed;
}
export function sameRulePayload(a: unknown, b: unknown): boolean {
    const canon = (value: unknown): unknown => {
        if (Array.isArray(value))
            return value.map(canon);
        if (value && typeof value === "object") {
            const entries = Object.entries(value as Record<string, unknown>)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => [k, canon(v)] as const)
                .sort(([x], [y]) => (x < y ? -1 : 1));
            return Object.fromEntries(entries);
        }
        return value;
    };
    return JSON.stringify(canon(a)) === JSON.stringify(canon(b));
}
function latestCoverage(events: readonly StudioEvent[]): AssistCoverage | null {
    for (let i = events.length - 1; i >= 0; i--) {
        const { ev } = events[i];
        if (ev.event === "coverage")
            return ev.data;
    }
    return null;
}
export function ContractPanel({ onRetest }: {
    onRetest: () => void;
}) {
    const events = useStudioStore((s) => s.events);
    const status = useStudioStore((s) => s.status);
    const playback = useStudioStore((s) => s.playback);
    const requestComposer = useStudioStore((s) => s.requestComposer);
    const setContextSeed = useStudioStore((s) => s.setContextSeed);
    const setAdjustContext = useStudioStore((s) => s.setAdjustContext);
    const createRule = useCreateRule();
    const updateRule = useUpdateRule();
    const toast = useToast();
    const t = useT();
    const voice = useVoice();
    const reduce = useReducedMotion();
    const overlays = useViewerOverlays();
    const [editorOpen, setEditorOpen] = useState(false);
    const [saved, setSaved] = useState<Rule | null>(null);
    const [busy, setBusy] = useState(false);
    const [working, setWorking] = useState<ContractDraft | null>(null);
    const [severityConfirmed, setSeverityConfirmed] = useState(false);
    const [spotlight, setSpotlight] = useState(false);
    const base = useMemo(() => deriveContract(events), [events]);
    const tone = useMemo(() => deriveDecisionTone(events), [events]);
    const prefill = useMemo(() => deriveSeverityPrefill(events), [events]);
    const draft = working ?? base;
    const cardRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setWorking(null);
        setSaved(null);
        setSeverityConfirmed(false);
    }, [base]);
    const showReady = status === "done" &&
        base != null &&
        (playback.phase === "idle" || playback.roundComplete);
    const celebratedRef = useRef<ContractDraft | null>(null);
    useEffect(() => {
        if (!showReady || !base || celebratedRef.current === base)
            return;
        celebratedRef.current = base;
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setSpotlight(true);
        const timer = setTimeout(() => setSpotlight(false), 2000);
        if (tone === "ready")
            overlays.celebrateShield();
        return () => clearTimeout(timer);
    }, [showReady, base, tone, overlays]);
    const draftRef = useRef(draft);
    draftRef.current = draft;
    useEffect(() => {
        if (!draft)
            return;
        return useUiStore.subscribe((state, prev) => {
            const sel = state.graphSelection;
            if (!sel || sel === prev.graphSelection)
                return;
            const current = draftRef.current;
            if (!current || !TOGGLABLE_KINDS.has(current.kind))
                return;
            const next = toggleTargetNode(current, sel.nodeId);
            setWorking(next);
            const ids = next.targets?.node_ids ?? [];
            if (ids.length)
                overlays.showCandidates(STUDIO_OVERLAY_ID, ids);
        });
    }, [draft != null, overlays]);
    if (status !== "done" || !draft || !base)
        return null;
    const editedSinceSim = working != null && !sameRulePayload(working, base);
    const savedDiffers = saved != null && !sameRulePayload({ ...saved, id: undefined }, base);
    const stale = editedSinceSim || savedDiffers;
    const savedCurrent = saved != null && sameRulePayload({ ...saved, id: undefined }, draft);
    const targets = ruleTargetSummary(draft as Rule);
    const coverage = latestCoverage(events);
    const targetLabel = (expr: string): string => {
        for (const list of [coverage?.core, coverage?.halo, coverage?.frontier]) {
            const hit = list?.find((n) => n.id === expr);
            if (hit?.name)
                return hit.name;
        }
        return expr;
    };
    function handleAdjust() {
        const seed = deriveAdjustSeed(events);
        const mission = useStudioStore.getState().prompt;
        if (draft)
            setContextSeed(buildAdjustContextSeed(mission, draft, seed));
        setAdjustContext(seed);
        requestComposer();
    }
    function handleSeverityChoice(severity: RuleSeverity) {
        if (!draft || draft.severity === severity)
            return;
        setWorking(applySeverityChoice(draft, severity));
        setSeverityConfirmed(false);
    }
    async function handleSave() {
        if (!draft || !canPersistAfterSeverityConfirm(severityConfirmed))
            return;
        setBusy(true);
        try {
            const rule = saved
                ? await updateRule.mutateAsync({ ruleId: saved.id, input: draft })
                : await createRule.mutateAsync(draft);
            setSaved(rule);
            toast({ title: t("studio.contract.saved"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("editor.createFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    return (<motion.div ref={cardRef} initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.25, 0.6, 0.3, 1] }}>
    <Card className={cn("transition-shadow duration-slow", spotlight &&
            (tone === "ready"
                ? "ring-2 ring-ok/50 shadow-[0_0_32px_var(--db-ok-subtle)]"
                : "ring-2 ring-warn/50"))}>
      <div className={cn("border-b px-4 py-3", tone === "ready"
            ? "border-ok/30 bg-ok-subtle"
            : "border-warn/30 bg-warn-subtle")}>
        <p className={cn("text-sm font-semibold", tone === "ready" ? "text-ok" : "text-warn")}>
          {tone === "ready"
            ? t("studio.decision.readyTitle")
            : t("studio.decision.partialTitle")}
        </p>
        <p className="mt-0.5 break-words text-xs text-muted">
          {tone === "ready"
            ? t("studio.decision.readyDetail")
            : t("studio.decision.partialDetail")}
        </p>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{t(RULE_KIND_LABEL_KEY[draft.kind])}</Badge>
          <Badge tone={draft.severity === "block" ? "danger" : "warn"}>
            {t(draft.severity === "block" ? "severity.block" : "severity.warn")}
          </Badge>
          {draft.kind === "layer_boundary" && draft.boundary_mode ? (<Badge tone="neutral">
              {t(draft.boundary_mode === "no_path"
                ? "studio.contract.noPath"
                : "studio.contract.noDirect")}
            </Badge>) : null}
        </div>
        
        <div>
          <p className="text-sm font-medium text-foreground">{draft.name}</p>
          {draft.description &&
            draft.description.replace(/[.\s]+$/, "") !==
                draft.name.replace(/[.\s]+$/, "") ? (<p className="mt-0.5 text-xs text-muted">{draft.description}</p>) : null}
        </div>
        {draft.layer_labels?.length === 2 ? (<p className="text-xs text-muted">
            {t("studio.contract.layers", {
                from: draft.layer_labels[0],
                to: draft.layer_labels[1],
            })}
          </p>) : null}
        
        {targets.length ? (<div className="space-y-0.5">
            <ul className="space-y-0.5">
              {targets.slice(0, 3).map((expr) => (<li key={expr} title={expr} className="truncate font-mono text-xs text-muted">
                  {targetLabel(expr)}
                </li>))}
            </ul>
            {targets.length > 3 ? (<Disclosure summary={t("studio.contract.moreTargets", {
                    count: targets.length - 3,
                })}>
                <ul className="space-y-0.5">
                  {targets.slice(3).map((expr) => (<li key={expr} title={expr} className="truncate font-mono text-xs text-muted">
                      {targetLabel(expr)}
                    </li>))}
                </ul>
              </Disclosure>) : null}
          </div>) : null}
        {TOGGLABLE_KINDS.has(draft.kind) ? (<p className="text-xs text-faint">{t("studio.contract.clickHint")}</p>) : null}

        <div className="rounded border border-line px-3 py-2" data-severity-confirm>
          <p className="text-xs font-medium text-foreground">{t("studio.severity.title")}</p>
          <p className="mt-0.5 text-xs text-muted">
            {t(draft.severity === "block"
            ? "studio.severity.whyBlock"
            : "studio.severity.whyWarn")}
          </p>
          
          {prefill?.goal && prefill.goal.trim() !== draft.description?.trim() ? (<p className="mt-1 text-xs text-faint">{prefill.goal}</p>) : null}
          <div className="mt-2 flex gap-1.5">
            {(["warn", "block"] as const).map((severity) => (<button key={severity} type="button" onClick={() => handleSeverityChoice(severity)} disabled={busy} className={cn("flex-1 rounded border px-3 py-1.5 text-sm transition-colors duration-fast", draft.severity === severity
                ? severity === "block"
                    ? "border-danger/60 bg-danger-subtle text-danger"
                    : "border-warn/60 bg-warn-subtle text-warn"
                : "border-line bg-inset text-muted hover:border-line-strong")}>
                {t(severity === "block" ? "severity.block" : "severity.warn")}
              </button>))}
          </div>
          <div className="mt-2">
            {severityConfirmed ? (<p className="text-xs text-ok">{t("studio.severity.confirmed")}</p>) : (<Button size="sm" variant="secondary" onClick={() => setSeverityConfirmed(true)} disabled={busy}>
                {t("studio.severity.confirm")}
              </Button>)}
          </div>
        </div>

        {stale ? (<div className="rounded border border-warn/40 bg-warn-subtle px-3 py-2">
            <p className="text-xs text-warn">{t("studio.contract.staleNote")}</p>
            <Button size="sm" variant="ghost" className="mt-1.5" onClick={onRetest}>
              {t("studio.contract.retest")}
            </Button>
          </div>) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
          {voice === "technical" ? (<button type="button" onClick={() => setEditorOpen(true)} disabled={busy} className="mr-auto text-xs text-faint underline-offset-2 hover:text-muted hover:underline disabled:opacity-50">
              {t("studio.contract.advancedEdit")}
            </button>) : null}
          {saved ? (<Link to="/rules" className="text-xs text-faint underline-offset-2 hover:text-muted hover:underline">
              {t("studio.contract.viewRules")}
            </Link>) : null}
          <Button size="sm" variant="ghost" onClick={requestComposer} disabled={busy}>
            {t("studio.decision.rephrase")}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleAdjust} disabled={busy}>
            {t("studio.contract.adjust")}
          </Button>
          <Button size="sm" variant="primary" onClick={() => void handleSave()} disabled={busy ||
            savedCurrent ||
            !canPersistAfterSeverityConfirm(severityConfirmed)}>
            {busy
            ? t("common.saving")
            : savedCurrent
                ? t("studio.contract.savedShort")
                : t("studio.decision.activate")}
          </Button>
          {!severityConfirmed && !savedCurrent ? (<p className="w-full text-right text-xs text-muted">
              {t("studio.severity.needConfirm")}
            </p>) : null}
        </div>
      </div>

      <RuleEditor open={editorOpen} onOpenChange={setEditorOpen} editing={saved} initialDraft={draftFromRule({ ...draft, id: "" } as Rule)} onSaved={(rule) => setSaved(rule)}/>
    </Card>
    </motion.div>);
}
