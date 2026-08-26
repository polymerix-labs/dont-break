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
import { useEffect, useMemo, useState } from "react";
import { fetchRuleNodes, findSymbols, type FindMatch, type Rule } from "../../api/dashboard";
import { Badge, Button, Dialog, Field, Input, cn, useToast } from "../../design";
import { useCreateRule, useUpdateRule } from "../../hooks/useDashboardQueries";
import { useT, type TFunc } from "../../i18n";
import { useUiStore } from "../../shell/uiStore";
import { useViewerOverlays } from "../../viewer/useViewerOverlays";
import { RULE_KIND_HINT_KEY, RULE_KIND_LABEL_KEY } from "./ruleDisplay";
import { buildRulePayload, draftFromRule, emptyDraft, parseLines, previewQueryFor, type DraftErrors, type RuleDraft, type TargetsDraft, } from "./ruleForm";
const KINDS: Rule["kind"][] = [
    "protected_path",
    "pinned_do_not_touch",
    "regulatory",
    "forbidden_dependency",
    "impact_budget",
    "layer_boundary",
];
const TWO_ZONE_KINDS: ReadonlySet<Rule["kind"]> = new Set([
    "forbidden_dependency",
    "layer_boundary",
]);
function TextArea({ value, onChange, placeholder, rows = 2, }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    return (<textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cn("w-full rounded border border-line bg-inset px-2.5 py-1.5 font-mono text-xs text-foreground", "placeholder:text-faint", "transition-colors duration-fast focus:border-primary/60 focus:outline-none")}/>);
}
function useMatchedNodesPreview(draft: TargetsDraft) {
    const [matches, setMatches] = useState<FindMatch[] | null>(null);
    const query = useMemo(() => {
        const first = parseLines(draft.pathGlobs)[0] ?? parseLines(draft.fqns)[0] ?? "";
        return previewQueryFor(first);
    }, [draft.pathGlobs, draft.fqns]);
    useEffect(() => {
        if (query.length < 2) {
            setMatches(null);
            return;
        }
        let cancelled = false;
        const timer = setTimeout(() => {
            findSymbols(query, 6)
                .then((found) => {
                if (!cancelled)
                    setMatches(found);
            })
                .catch(() => {
                if (!cancelled)
                    setMatches(null);
            });
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);
    return matches;
}
function TargetsFields({ label, draft, onChange, error, t, showPreview = true, }: {
    label: string;
    draft: TargetsDraft;
    onChange: (next: TargetsDraft) => void;
    error?: string;
    t: TFunc;
    showPreview?: boolean;
}) {
    const matches = useMatchedNodesPreview(draft);
    return (<div className="space-y-2">
      <p className="text-xs font-medium text-muted">{label}</p>
      <TextArea value={draft.pathGlobs} onChange={(pathGlobs) => onChange({ ...draft, pathGlobs })} placeholder={`${t("editor.pathGlobsPlaceholder")}\nsrc/auth/**`}/>
      <TextArea value={draft.fqns} onChange={(fqns) => onChange({ ...draft, fqns })} placeholder={`${t("editor.fqnsPlaceholder")}\ncom.acme.pay.Ledger`}/>
      <TextArea value={draft.nodeIds} onChange={(nodeIds) => onChange({ ...draft, nodeIds })} placeholder={t("editor.nodeIdsPlaceholder")} rows={1}/>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {showPreview && matches !== null ? (<div className="rounded border border-line bg-inset px-2.5 py-2">
          <p className="mb-1 text-xs text-faint">
            {matches.length === 0
                ? t("editor.noMatches")
                : t("editor.matches", { count: matches.length })}
          </p>
          <ul className="space-y-0.5">
            {matches.map((m) => (<li key={m.id} className="flex items-center gap-1.5">
                <span className="truncate font-mono text-xs text-foreground">
                  {m.fqn || m.name}
                </span>
                <span className="shrink-0 text-xs text-faint">{m.node_type}</span>
              </li>))}
          </ul>
        </div>) : null}
    </div>);
}
export function RuleEditor({ open, onOpenChange, editing, initialDraft, onSaved, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editing: Rule | null;
    initialDraft?: RuleDraft | null;
    onSaved?: (rule: Rule) => void;
}) {
    const [draft, setDraft] = useState<RuleDraft>(() => emptyDraft("protected_path"));
    const [errors, setErrors] = useState<DraftErrors>({});
    const [busy, setBusy] = useState(false);
    const createRule = useCreateRule();
    const updateRule = useUpdateRule();
    const overlays = useViewerOverlays();
    const setPendingRulePreview = useUiStore((s) => s.setPendingRulePreview);
    const navigate = useNavigate();
    const toast = useToast();
    const t = useT();
    useEffect(() => {
        if (!open)
            return;
        setErrors({});
        if (editing)
            setDraft(draftFromRule(editing));
        else if (initialDraft)
            setDraft(initialDraft);
        else
            setDraft(emptyDraft("protected_path"));
    }, [open, editing, initialDraft]);
    function set<K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) {
        setDraft((d) => ({ ...d, [key]: value }));
    }
    async function persist(): Promise<Rule | null> {
        const res = buildRulePayload(draft);
        if (!res.ok) {
            setErrors(res.errors);
            return null;
        }
        setErrors({});
        setBusy(true);
        try {
            const saved = editing
                ? await updateRule.mutateAsync({ ruleId: editing.id, input: res.payload })
                : await createRule.mutateAsync(res.payload);
            onSaved?.(saved);
            return saved;
        }
        catch (err) {
            toast({
                title: editing ? t("editor.updateFailed") : t("editor.createFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
            return null;
        }
        finally {
            setBusy(false);
        }
    }
    async function handleSave() {
        const saved = await persist();
        if (!saved)
            return;
        toast({ title: editing ? t("editor.updated") : t("editor.created"), tone: "ok" });
        onOpenChange(false);
    }
    async function handleSaveAndPreview() {
        const original = editing;
        const saved = await persist();
        if (!saved)
            return;
        onOpenChange(false);
        try {
            const zone = await fetchRuleNodes(saved.id);
            overlays.showZone(`rule:${saved.id}`, zone.core.map((n) => n.id), zone.halo.map((n) => ({ id: n.id, distance: n.distance ?? 1 })));
            setPendingRulePreview({
                ruleId: saved.id,
                name: saved.name,
                revert: original ? { kind: "restore", rule: original } : { kind: "delete" },
            });
            void navigate({ to: "/graph" });
        }
        catch (err) {
            toast({
                title: t("editor.previewFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "neutral",
            });
        }
    }
    const kindLocked = Boolean(editing);
    return (<Dialog open={open} onOpenChange={onOpenChange} title={editing ? t("editor.editTitle") : t("editor.newTitle")} description={editing ? undefined : t("editor.newDescription")} width="lg">
      <div className="space-y-5">
        {!kindLocked ? (<div className="grid gap-2 sm:grid-cols-2">
            {KINDS.map((kind) => (<button key={kind} type="button" onClick={() => set("kind", kind)} className={cn("rounded border px-3 py-2 text-left transition-colors duration-fast", draft.kind === kind
                    ? "border-primary/60 bg-primary-subtle"
                    : "border-line bg-inset hover:border-line-strong")}>
                <p className="text-sm font-medium text-foreground">
                  {t(RULE_KIND_LABEL_KEY[kind])}
                </p>
                <p className="mt-0.5 text-xs text-muted">{t(RULE_KIND_HINT_KEY[kind])}</p>
              </button>))}
          </div>) : (<Badge tone="primary">{t(RULE_KIND_LABEL_KEY[draft.kind])}</Badge>)}

        <Field label={t("editor.name")} error={errors.name ? t(errors.name) : undefined}>
          <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder={t("editor.namePlaceholder")}/>
        </Field>

        <Field label={t("editor.description")} hint={t("editor.descriptionHint")}>
          <Input value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder={t("editor.descriptionPlaceholder")}/>
        </Field>

        {TWO_ZONE_KINDS.has(draft.kind) ? (<div className="grid gap-4 sm:grid-cols-2">
            <TargetsFields label={t("editor.fromZone")} draft={draft.from} onChange={(from) => set("from", from)} error={errors.from ? t(errors.from) : undefined} t={t}/>
            <TargetsFields label={t("editor.toZone")} draft={draft.to} onChange={(to) => set("to", to)} error={errors.to ? t(errors.to) : undefined} t={t}/>
          </div>) : (<TargetsFields label={draft.kind === "impact_budget" ? t("editor.scope") : t("editor.targets")} draft={draft.targets} onChange={(targets) => set("targets", targets)} error={errors.targets ? t(errors.targets) : undefined} t={t}/>)}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("editor.severity")}>
            <div className="flex gap-1.5">
              {(["block", "warn"] as const).map((severity) => (<button key={severity} type="button" onClick={() => set("severity", severity)} className={cn("flex-1 rounded border px-3 py-1.5 text-sm transition-colors duration-fast", draft.severity === severity
                ? severity === "block"
                    ? "border-danger/60 bg-danger-subtle text-danger"
                    : "border-warn/60 bg-warn-subtle text-warn"
                : "border-line bg-inset text-muted hover:border-line-strong")}>
                  {t(severity === "block" ? "severity.block" : "severity.warn")}
                </button>))}
            </div>
          </Field>
          {draft.kind !== "impact_budget" && draft.kind !== "layer_boundary" ? (<Field label={t("editor.maxDistance")} hint={t("editor.maxDistanceHint")} error={errors.maxDistance ? t(errors.maxDistance) : undefined}>
              <Input value={draft.maxDistance} onChange={(e) => set("maxDistance", e.target.value)} placeholder="2" inputMode="numeric"/>
            </Field>) : null}
        </div>

        {draft.kind === "layer_boundary" ? (<div className="space-y-4">
            <Field label={t("editor.boundaryMode")} hint={t("editor.boundaryModeHint")}>
              <div className="flex gap-1.5">
                {(["no_direct", "no_path"] as const).map((mode) => (<button key={mode} type="button" onClick={() => set("boundaryMode", mode)} className={cn("flex-1 rounded border px-3 py-1.5 text-sm transition-colors duration-fast", draft.boundaryMode === mode
                    ? "border-primary/60 bg-primary-subtle text-foreground"
                    : "border-line bg-inset text-muted hover:border-line-strong")}>
                    {t(mode === "no_direct"
                    ? "editor.boundaryNoDirect"
                    : "editor.boundaryNoPath")}
                  </button>))}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.layerLabelFrom")} hint={t("editor.optional")} error={errors.layerLabels ? t(errors.layerLabels) : undefined}>
                <Input value={draft.layerLabelFrom} onChange={(e) => set("layerLabelFrom", e.target.value)} placeholder="UI"/>
              </Field>
              <Field label={t("editor.layerLabelTo")} hint={t("editor.optional")}>
                <Input value={draft.layerLabelTo} onChange={(e) => set("layerLabelTo", e.target.value)} placeholder="Database"/>
              </Field>
            </div>
          </div>) : null}

        {draft.kind === "regulatory" ? (<div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("editor.complianceTag")} error={errors.tag ? t(errors.tag) : undefined}>
              <Input value={draft.tag} onChange={(e) => set("tag", e.target.value)} placeholder="GDPR"/>
            </Field>
            <Field label={t("editor.reference")} hint={t("editor.referenceHint")}>
              <Input value={draft.reference} onChange={(e) => set("reference", e.target.value)} placeholder="https://..."/>
            </Field>
          </div>) : null}

        {draft.kind === "impact_budget" ? (<div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("editor.maxRadius")} error={errors.maxRadius ? t(errors.maxRadius) : undefined}>
              <Input value={draft.maxRadius} onChange={(e) => set("maxRadius", e.target.value)} placeholder="3" inputMode="numeric"/>
            </Field>
            <Field label={t("editor.maxImpactedNodes")} error={errors.maxImpactedNodes ? t(errors.maxImpactedNodes) : undefined}>
              <Input value={draft.maxImpactedNodes} onChange={(e) => set("maxImpactedNodes", e.target.value)} placeholder="25" inputMode="numeric"/>
            </Field>
          </div>) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("editor.activeFrom")} hint={t("editor.optional")} error={errors.activeFrom ? t(errors.activeFrom) : undefined}>
            <Input type="datetime-local" value={draft.activeFrom} onChange={(e) => set("activeFrom", e.target.value)}/>
          </Field>
          <Field label={t("editor.activeUntil")} hint={t("editor.optional")} error={errors.activeUntil ? t(errors.activeUntil) : undefined}>
            <Input type="datetime-local" value={draft.activeUntil} onChange={(e) => set("activeUntil", e.target.value)}/>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void handleSaveAndPreview()} disabled={busy}>
            {t("editor.saveAndPreview")}
          </Button>
          <Button variant="primary" onClick={() => void handleSave()} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </Dialog>);
}
