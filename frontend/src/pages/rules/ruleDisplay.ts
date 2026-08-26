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

import type { Rule } from "../../api/dashboard";
import { getLocale, type MessageKey } from "../../i18n";
export const RULE_KIND_LABEL_KEY: Record<Rule["kind"], MessageKey> = {
    pinned_do_not_touch: "kind.pinned_do_not_touch",
    protected_path: "kind.protected_path",
    regulatory: "kind.regulatory",
    forbidden_dependency: "kind.forbidden_dependency",
    impact_budget: "kind.impact_budget",
    layer_boundary: "kind.layer_boundary",
};
export const RULE_KIND_HINT_KEY: Record<Rule["kind"], MessageKey> = {
    pinned_do_not_touch: "kindHint.pinned_do_not_touch",
    protected_path: "kindHint.protected_path",
    regulatory: "kindHint.regulatory",
    forbidden_dependency: "kindHint.forbidden_dependency",
    impact_budget: "kindHint.impact_budget",
    layer_boundary: "kindHint.layer_boundary",
};
export type RuleActivation = {
    labelKey: "status.active" | "status.scheduled" | "status.expired" | "status.pending" | "status.paused";
    tone: "ok" | "neutral" | "warn";
};
export function ruleActivation(rule: Rule, now = Date.now()): RuleActivation {
    if (rule.status === "pending")
        return { labelKey: "status.pending", tone: "warn" };
    if (rule.status === "paused")
        return { labelKey: "status.paused", tone: "neutral" };
    const from = rule.active_from ? Date.parse(rule.active_from) : null;
    const until = rule.active_until ? Date.parse(rule.active_until) : null;
    if (from != null && !Number.isNaN(from) && now < from)
        return { labelKey: "status.scheduled", tone: "neutral" };
    if (until != null && !Number.isNaN(until) && now > until)
        return { labelKey: "status.expired", tone: "neutral" };
    return { labelKey: "status.active", tone: "ok" };
}
export function pendingRules(rules: Rule[]): Rule[] {
    const out: Rule[] = [];
    for (const rule of rules) {
        if (rule.status === "pending")
            out.push(rule);
    }
    return out;
}
export function authorKind(rule: Rule): "human" | "agent" {
    return rule.author?.type === "agent" ? "agent" : "human";
}
export function authorAgentLabel(rule: Rule): string {
    return rule.author?.agent?.label || rule.author?.agent?.token_id || "agent";
}
export function formatInstant(value?: string | null): string {
    if (!value)
        return "--";
    const t = Date.parse(value);
    if (Number.isNaN(t))
        return value;
    return new Date(t).toLocaleString(getLocale(), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function formatRelative(value?: string | null, now = Date.now()): string {
    if (!value)
        return "--";
    const then = Date.parse(value);
    if (Number.isNaN(then))
        return value;
    const diff = then - now;
    const abs = Math.abs(diff);
    const minute = 60000;
    const hour = 3600000;
    const day = 86400000;
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
    if (abs < hour)
        return rtf.format(Math.round(diff / minute), "minute");
    if (abs < day)
        return rtf.format(Math.round(diff / hour), "hour");
    if (abs < day * 30)
        return rtf.format(Math.round(diff / day), "day");
    return formatInstant(value);
}
export function ruleTargetSummary(rule: Rule): string[] {
    const out: string[] = [];
    const collect = (targets?: {
        path_globs?: string[];
        node_ids?: string[];
        fqns?: string[];
    }) => {
        if (!targets)
            return;
        for (const glob of targets.path_globs ?? [])
            out.push(glob);
        for (const fqn of targets.fqns ?? [])
            out.push(fqn);
        for (const id of targets.node_ids ?? [])
            out.push(id);
    };
    collect(rule.targets);
    collect(rule.from);
    collect(rule.to);
    return out;
}
