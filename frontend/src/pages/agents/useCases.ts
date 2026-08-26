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

import type { AgentSetup } from "../../api/client";
import type { MessageKey, Voice } from "../../i18n";
import type { AgentTarget } from "./agentTargets";
export type UseCaseId = "protect" | "impact" | "map" | "ci" | "danger" | "health" | "fixes" | "precommit" | "path" | "review" | "onboard";
export type UseCase = {
    id: UseCaseId;
    titleKey: MessageKey;
    painKey: MessageKey;
    configKind: "mcp" | "cli";
    buildPrompt: (setup: AgentSetup, target: AgentTarget) => string;
    buildTranscript: (setup: AgentSetup) => string;
    showsSkillInstall?: boolean;
};
const protect: UseCase = {
    id: "protect",
    titleKey: "useCase.protect.title",
    painKey: "useCase.protect.pain",
    configKind: "mcp",
    showsSkillInstall: true,
    buildPrompt: (setup) => [
        `Refactor the billing flow of ${setup.project_slug}.`,
        `Before touching any file, call check_change with the files you plan to edit.`,
        `If the verdict is "block", stop and show me the witness path instead.`,
    ].join("\n"),
    buildTranscript: () => [
        `> check_change files=["src/payments/gateway.py"]`,
        `verdict: block`,
        `rule: payments core is protected`,
        `witness: gateway.py -> charge() -> Invoice.total()`,
        ``,
        `The edit was stopped before any file changed.`,
    ].join("\n"),
};
const impact: UseCase = {
    id: "impact",
    titleKey: "useCase.impact.title",
    painKey: "useCase.impact.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `I want to change the signature of a function in ${setup.project_slug}.`,
        `Call get_impact on it first and summarize: how many dependents,`,
        `across how many files, and which callers are the riskiest.`,
    ].join("\n"),
    buildTranscript: () => [
        `> get_impact node="charge"`,
        `14 dependents across 6 files (max depth 3)`,
        `hot: api/handlers.py, billing/invoice.py`,
        ``,
        `Safe order: update invoice.py first, handlers.py last.`,
    ].join("\n"),
};
const map: UseCase = {
    id: "map",
    titleKey: "useCase.map.title",
    painKey: "useCase.map.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `Without reading files, use the code graph of ${setup.project_slug}`,
        `to tell me where authentication is implemented and what depends on it.`,
    ].join("\n"),
    buildTranscript: () => [
        `> find kind=function name~"auth"`,
        `3 matches, 1 query`,
        ``,
        `No directory crawl: the graph answered in one tool call`,
        `instead of dozens of file reads.`,
    ].join("\n"),
};
const ci: UseCase = {
    id: "ci",
    titleKey: "useCase.ci.title",
    painKey: "useCase.ci.pain",
    configKind: "cli",
    buildPrompt: (setup) => [
        `npx ${setup.cli_package} check --files $(git diff --name-only origin/main)`,
        `# exit code 1 when the verdict is "block": wire it as a required step`,
    ].join("\n"),
    buildTranscript: () => [
        `verdict: block -> exit code 1`,
        `job failed: protected zone reached`,
        `witness: gateway.py -> charge() -> Invoice.total()`,
    ].join("\n"),
};
const danger: UseCase = {
    id: "danger",
    titleKey: "useCase.danger.title",
    painKey: "useCase.danger.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `Before starting work on ${setup.project_slug}, list the do-not-touch`,
        `zones and the most fragile nodes. Treat anything on that list as`,
        `read-only unless I explicitly say otherwise.`,
    ].join("\n"),
    buildTranscript: () => [
        `> get_danger_zones`,
        `7 nodes: high fan-in, low stability`,
        `core-model (fan-in 41) · PokeApi (fan-in 27) · ...`,
        ``,
        `Plan adjusted: schema untouched, adapters extended instead.`,
    ].join("\n"),
};
const health: UseCase = {
    id: "health",
    titleKey: "useCase.health.title",
    painKey: "useCase.health.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `Give me the architecture verdict of ${setup.project_slug}: stability,`,
        `AI navigability, and what the practicability verdict means for agent`,
        `work on this repo.`,
    ].join("\n"),
    buildTranscript: () => [
        `> arch_status`,
        `stability 89.0 · navigability 99.0`,
        `verdict: healthy`,
        ``,
        `Safe for agent-assisted work; two fragile spots to watch.`,
    ].join("\n"),
};
const fixes: UseCase = {
    id: "fixes",
    titleKey: "useCase.fixes.title",
    painKey: "useCase.fixes.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `List the top architecture actions for ${setup.project_slug}, ranked`,
        `by stability gain. Pick the first one and propose a step-by-step`,
        `plan before touching anything.`,
    ].join("\n"),
    buildTranscript: () => [
        `> top_actions`,
        `1. SplitNode core-model   +0.3 stab · +0.2 nav`,
        `2. CutEdge ui -> room     +0.2 stab`,
        ``,
        `Plan drafted for action 1 — no files touched yet.`,
    ].join("\n"),
};
const precommit: UseCase = {
    id: "precommit",
    titleKey: "useCase.precommit.title",
    painKey: "useCase.precommit.pain",
    configKind: "cli",
    buildPrompt: (setup) => [
        `# .git/hooks/pre-commit`,
        `npx ${setup.cli_package} check --files $(git diff --cached --name-only)`,
        `# exit code 1 refuses the commit before it exists`,
    ].join("\n"),
    buildTranscript: () => [
        `$ git commit -m "quick fix"`,
        `verdict: block -> exit code 1`,
        `witness: gateway.py -> charge() -> Invoice.total()`,
        ``,
        `Commit aborted — nothing entered history, nothing to undo.`,
    ].join("\n"),
};
const path: UseCase = {
    id: "path",
    titleKey: "useCase.path.title",
    painKey: "useCase.path.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `Someone claims the UI of ${setup.project_slug} never touches the`,
        `database. Call get_path between the UI layer and the schema and`,
        `show me every hop, or confirm no path exists.`,
    ].join("\n"),
    buildTranscript: () => [
        `> get_path from="ui/ProfileView" to="db/schema"`,
        `3 hops: ProfileView -> useProfile -> api/client -> db/schema`,
        ``,
        `The middle hop is the one to cut.`,
    ].join("\n"),
};
const review: UseCase = {
    id: "review",
    titleKey: "useCase.review.title",
    painKey: "useCase.review.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `Review this PR of ${setup.project_slug}: for each changed file,`,
        `call get_impact and flag anything that reaches a protected or`,
        `fragile zone. Summarize the risk file by file.`,
    ].join("\n"),
    buildTranscript: () => [
        `> check_change files=[12 changed]`,
        `2 files reach payments (protected)`,
        `> get_impact node="charge"`,
        `14 dependents across 6 files`,
        ``,
        `Review gateway.py and invoice.py closely; the rest is low risk.`,
    ].join("\n"),
};
const onboard: UseCase = {
    id: "onboard",
    titleKey: "useCase.onboard.title",
    painKey: "useCase.onboard.pain",
    configKind: "mcp",
    buildPrompt: (setup) => [
        `I am new to ${setup.project_slug}. Using only the code graph,`,
        `explain the architecture: main modules, the hubs everything`,
        `depends on, and the zones I should not touch yet.`,
    ].join("\n"),
    buildTranscript: () => [
        `> arch_status · find · get_danger_zones`,
        `4 modules · 2 hubs · 7 do-not-touch nodes`,
        ``,
        `Start in ui/; leave core-model alone until you know it.`,
    ].join("\n"),
};
const SIMPLE_ORDER: UseCase[] = [
    protect,
    danger,
    impact,
    map,
    onboard,
    review,
    health,
    fixes,
    path,
    precommit,
    ci,
];
const TECHNICAL_ORDER: UseCase[] = [
    protect,
    ci,
    precommit,
    review,
    impact,
    path,
    danger,
    fixes,
    health,
    map,
    onboard,
];
export function orderedUseCases(voice: Voice): UseCase[] {
    return voice === "technical" ? TECHNICAL_ORDER : SIMPLE_ORDER;
}
