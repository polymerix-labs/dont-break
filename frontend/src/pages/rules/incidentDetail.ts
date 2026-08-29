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

import type { BypassIncident, Rule, RuleNodesResponse, RuleTargets } from "../../api/dashboard";
export type TouchedFile = {
    path: string;
    inZone: boolean;
};
export function formatTargetAxes(targets: RuleTargets | undefined): string[] {
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
export function protectedZoneLines(rule: Rule | undefined, nodes: RuleNodesResponse | undefined): string[] {
    const lines: string[] = [];
    if (rule) {
        lines.push(...formatTargetAxes(rule.targets));
        lines.push(...formatTargetAxes(rule.from).map((l) => `from.${l}`));
        lines.push(...formatTargetAxes(rule.to).map((l) => `to.${l}`));
    }
    for (const node of [...(nodes?.core ?? []), ...(nodes?.halo ?? [])]) {
        const label = node.fqn || node.name;
        if (label && !lines.includes(label))
            lines.push(label);
    }
    return lines;
}
function globToRegExp(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const body = escaped.replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*");
    return new RegExp(`^${body}$`);
}
export function pathInZone(path: string, rule: Rule | undefined): boolean {
    if (!rule)
        return false;
    const globs = [
        ...(rule.targets?.path_globs ?? []),
        ...(rule.from?.path_globs ?? []),
        ...(rule.to?.path_globs ?? []),
    ];
    return globs.some((glob) => {
        try {
            return globToRegExp(glob).test(path);
        }
        catch {
            return glob === path;
        }
    });
}
export function classifyTouched(files: string[], rule: Rule | undefined): TouchedFile[] {
    return files.map((path) => ({ path, inZone: pathInZone(path, rule) }));
}
export function repairPrompt(incident: BypassIncident): string {
    const files = incident.files.length > 0 ? incident.files.join(", ") : "(no file recorded)";
    const stop = incident.kind === "unchecked"
        ? `You changed ${files} in the zone protected by "${incident.rule_name}" without asking dont-break first.`
        : `You changed ${files} after dont-break said stop on "${incident.rule_name}".`;
    return [
        stop,
        "Put those files back the way they were. Undo only this change. Do not touch the rest of the protected zone.",
        "Before any later write, call check_change with those paths. If the verdict is block, do not write.",
    ].join("\n\n");
}
