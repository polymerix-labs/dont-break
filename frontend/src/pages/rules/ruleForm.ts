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

import type { Rule, RuleTargets } from "../../api/dashboard";
import type { MessageKey } from "../../i18n";
export type TargetsDraft = {
    pathGlobs: string;
    fqns: string;
    nodeIds: string;
};
export type RuleDraft = {
    kind: Rule["kind"];
    name: string;
    description: string;
    severity: "block" | "warn";
    targets: TargetsDraft;
    from: TargetsDraft;
    to: TargetsDraft;
    maxDistance: string;
    tag: string;
    reference: string;
    maxRadius: string;
    maxImpactedNodes: string;
    activeFrom: string;
    activeUntil: string;
    boundaryMode: "no_direct" | "no_path";
    layerLabelFrom: string;
    layerLabelTo: string;
};
export const EMPTY_TARGETS: TargetsDraft = { pathGlobs: "", fqns: "", nodeIds: "" };
export function emptyDraft(kind: Rule["kind"]): RuleDraft {
    return {
        kind,
        name: "",
        description: "",
        severity: "block",
        targets: { ...EMPTY_TARGETS },
        from: { ...EMPTY_TARGETS },
        to: { ...EMPTY_TARGETS },
        maxDistance: "",
        tag: "",
        reference: "",
        maxRadius: "",
        maxImpactedNodes: "",
        activeFrom: "",
        activeUntil: "",
        boundaryMode: "no_direct",
        layerLabelFrom: "",
        layerLabelTo: "",
    };
}
export function parseLines(value: string): string[] {
    return value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}
function targetsFromDraft(draft: TargetsDraft): RuleTargets | null {
    const path_globs = parseLines(draft.pathGlobs);
    const fqns = parseLines(draft.fqns);
    const node_ids = parseLines(draft.nodeIds);
    const out: RuleTargets = {};
    if (path_globs.length)
        out.path_globs = path_globs;
    if (fqns.length)
        out.fqns = fqns;
    if (node_ids.length)
        out.node_ids = node_ids;
    return Object.keys(out).length ? out : null;
}
function isoOrNull(value: string): string | null {
    if (!value.trim())
        return null;
    const t = Date.parse(value);
    if (Number.isNaN(t))
        return null;
    return new Date(t).toISOString();
}
function intOrNull(value: string): number | null {
    if (!value.trim())
        return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 ? n : null;
}
export type DraftErrors = Record<string, MessageKey>;
export type DraftResult = {
    ok: true;
    payload: Omit<Rule, "id">;
} | {
    ok: false;
    errors: DraftErrors;
};
export function buildRulePayload(draft: RuleDraft): DraftResult {
    const errors: DraftErrors = {};
    const name = draft.name.trim();
    if (!name)
        errors.name = "editor.err.nameRequired";
    if (name.length > 200)
        errors.name = "editor.err.nameTooLong";
    const targets = targetsFromDraft(draft.targets);
    const from = targetsFromDraft(draft.from);
    const to = targetsFromDraft(draft.to);
    if (draft.kind === "forbidden_dependency" || draft.kind === "layer_boundary") {
        if (!from)
            errors.from = "editor.err.fromRequired";
        if (!to)
            errors.to = "editor.err.toRequired";
    }
    else if (draft.kind === "impact_budget") {
        const maxRadius = intOrNull(draft.maxRadius);
        const maxNodes = intOrNull(draft.maxImpactedNodes);
        if (draft.maxRadius.trim() && maxRadius == null)
            errors.maxRadius = "editor.err.radiusInt";
        if (draft.maxImpactedNodes.trim() && (maxNodes == null || maxNodes < 1))
            errors.maxImpactedNodes = "editor.err.nodesInt";
        if (maxRadius == null && maxNodes == null)
            errors.maxRadius = "editor.err.budgetRequired";
    }
    else if (!targets) {
        errors.targets = "editor.err.targetsRequired";
    }
    if (draft.kind === "regulatory") {
        const tag = draft.tag.trim();
        if (!tag)
            errors.tag = "editor.err.tagRequired";
        if (tag.length > 64)
            errors.tag = "editor.err.tagTooLong";
    }
    if (draft.kind === "layer_boundary") {
        const labelFrom = draft.layerLabelFrom.trim();
        const labelTo = draft.layerLabelTo.trim();
        if ((labelFrom === "") !== (labelTo === ""))
            errors.layerLabels = "editor.err.layerLabelsPair";
        if (labelFrom.length > 64 || labelTo.length > 64)
            errors.layerLabels = "editor.err.layerLabelTooLong";
    }
    const maxDistance = intOrNull(draft.maxDistance);
    if (draft.maxDistance.trim() && maxDistance == null)
        errors.maxDistance = "editor.err.distanceInt";
    const activeFrom = isoOrNull(draft.activeFrom);
    const activeUntil = isoOrNull(draft.activeUntil);
    if (draft.activeFrom.trim() && !activeFrom)
        errors.activeFrom = "editor.err.dateInvalid";
    if (draft.activeUntil.trim() && !activeUntil)
        errors.activeUntil = "editor.err.dateInvalid";
    if (activeFrom && activeUntil && Date.parse(activeFrom) >= Date.parse(activeUntil))
        errors.activeUntil = "editor.err.windowOrder";
    if (Object.keys(errors).length)
        return { ok: false, errors };
    const payload: Omit<Rule, "id"> = {
        kind: draft.kind,
        name,
        severity: draft.severity,
    };
    const description = draft.description.trim();
    if (description)
        payload.description = description;
    if (draft.kind === "forbidden_dependency" || draft.kind === "layer_boundary") {
        payload.from = from ?? undefined;
        payload.to = to ?? undefined;
    }
    else if (targets) {
        payload.targets = targets;
    }
    if (draft.kind === "layer_boundary") {
        payload.boundary_mode = draft.boundaryMode;
        const labelFrom = draft.layerLabelFrom.trim();
        const labelTo = draft.layerLabelTo.trim();
        if (labelFrom && labelTo)
            payload.layer_labels = [labelFrom, labelTo];
    }
    if (draft.kind === "regulatory") {
        payload.tag = draft.tag.trim();
        const reference = draft.reference.trim();
        if (reference)
            payload.reference = reference;
    }
    if (draft.kind === "impact_budget") {
        const maxRadius = intOrNull(draft.maxRadius);
        const maxNodes = intOrNull(draft.maxImpactedNodes);
        if (maxRadius != null)
            payload.max_radius = maxRadius;
        if (maxNodes != null)
            payload.max_impacted_nodes = maxNodes;
    }
    if (maxDistance != null && draft.kind !== "layer_boundary")
        payload.max_distance = maxDistance;
    if (activeFrom)
        payload.active_from = activeFrom;
    if (activeUntil)
        payload.active_until = activeUntil;
    return { ok: true, payload };
}
export function draftFromRule(rule: Rule): RuleDraft {
    const toDraft = (targets?: RuleTargets): TargetsDraft => ({
        pathGlobs: (targets?.path_globs ?? []).join("\n"),
        fqns: (targets?.fqns ?? []).join("\n"),
        nodeIds: (targets?.node_ids ?? []).join("\n"),
    });
    const toLocal = (value?: string | null): string => {
        if (!value)
            return "";
        const t = Date.parse(value);
        if (Number.isNaN(t))
            return "";
        const d = new Date(t);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    return {
        kind: rule.kind,
        name: rule.name,
        description: rule.description ?? "",
        severity: rule.severity,
        targets: toDraft(rule.targets),
        from: toDraft(rule.from),
        to: toDraft(rule.to),
        maxDistance: rule.max_distance != null ? String(rule.max_distance) : "",
        tag: rule.tag ?? "",
        reference: rule.reference ?? "",
        maxRadius: rule.max_radius != null ? String(rule.max_radius) : "",
        maxImpactedNodes: rule.max_impacted_nodes != null ? String(rule.max_impacted_nodes) : "",
        activeFrom: toLocal(rule.active_from),
        activeUntil: toLocal(rule.active_until),
        boundaryMode: rule.boundary_mode ?? "no_direct",
        layerLabelFrom: rule.layer_labels?.[0] ?? "",
        layerLabelTo: rule.layer_labels?.[1] ?? "",
    };
}
export function previewQueryFor(expression: string): string {
    const stripped = expression.split(/[*?[]/, 1)[0] ?? "";
    return stripped.replace(/\/+$/, "").trim();
}
