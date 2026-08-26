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

import { buildRulePayload, draftFromRule, emptyDraft, parseLines, previewQueryFor, } from "./ruleForm";
import type { Rule } from "../../api/dashboard";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
check("parseLines trims and drops empties", parseLines(" a \n\n b\r\nc ").join(",") === "a,b,c");
{
    const draft = emptyDraft("protected_path");
    draft.name = "Auth is frozen";
    draft.targets.pathGlobs = "src/auth/**";
    draft.maxDistance = "2";
    const res = buildRulePayload(draft);
    check("protected_path builds", res.ok);
    if (res.ok) {
        check("protected_path globs", res.payload.targets?.path_globs?.[0] === "src/auth/**");
        check("protected_path distance", res.payload.max_distance === 2);
        check("protected_path no empty fields", !("description" in res.payload));
    }
}
{
    const draft = emptyDraft("protected_path");
    const res = buildRulePayload(draft);
    check("missing name rejected", !res.ok && "name" in res.errors);
    check("missing targets rejected", !res.ok && "targets" in res.errors);
}
{
    const draft = emptyDraft("regulatory");
    draft.name = "GDPR zone";
    draft.targets.pathGlobs = "src/privacy/**";
    const bad = buildRulePayload(draft);
    check("regulatory without tag rejected", !bad.ok && "tag" in bad.errors);
    draft.tag = "GDPR";
    const good = buildRulePayload(draft);
    check("regulatory with tag builds", good.ok && good.ok === true);
    if (good.ok)
        check("regulatory tag in payload", good.payload.tag === "GDPR");
}
{
    const draft = emptyDraft("forbidden_dependency");
    draft.name = "UI never touches DB";
    draft.from.pathGlobs = "src/ui/**";
    const bad = buildRulePayload(draft);
    check("forbidden without to rejected", !bad.ok && "to" in bad.errors);
    draft.to.pathGlobs = "src/db/**";
    const good = buildRulePayload(draft);
    check("forbidden with both zones builds", good.ok);
    if (good.ok) {
        check("forbidden from zone", good.payload.from?.path_globs?.[0] === "src/ui/**");
        check("forbidden no targets field", !("targets" in good.payload));
    }
}
{
    const draft = emptyDraft("impact_budget");
    draft.name = "Stay local";
    const bad = buildRulePayload(draft);
    check("budget without limits rejected", !bad.ok && "maxRadius" in bad.errors);
    draft.maxImpactedNodes = "25";
    const good = buildRulePayload(draft);
    check("budget with node cap builds", good.ok);
    if (good.ok)
        check("budget cap value", good.payload.max_impacted_nodes === 25);
}
{
    const draft = emptyDraft("protected_path");
    draft.name = "Freeze week";
    draft.targets.pathGlobs = "src/**";
    draft.activeFrom = "2026-07-10T09:00";
    draft.activeUntil = "2026-07-01T09:00";
    const bad = buildRulePayload(draft);
    check("inverted window rejected", !bad.ok && "activeUntil" in bad.errors);
    draft.activeUntil = "2026-07-20T09:00";
    const good = buildRulePayload(draft);
    check("valid window builds", good.ok);
    if (good.ok) {
        check("window serialized as ISO", typeof good.payload.active_from === "string" &&
            good.payload.active_from.endsWith("Z"));
    }
}
{
    const draft = emptyDraft("layer_boundary");
    draft.name = "UI stays above the domain";
    draft.from.pathGlobs = "src/ui/**";
    const bad = buildRulePayload(draft);
    check("boundary without to rejected", !bad.ok && "to" in bad.errors);
    draft.to.pathGlobs = "src/domain/**";
    draft.layerLabelFrom = "UI";
    const half = buildRulePayload(draft);
    check("boundary half label pair rejected", !half.ok && "layerLabels" in half.errors);
    draft.layerLabelTo = "Domain";
    draft.boundaryMode = "no_path";
    draft.maxDistance = "3";
    const good = buildRulePayload(draft);
    check("boundary with both zones builds", good.ok);
    if (good.ok) {
        check("boundary mode in payload", good.payload.boundary_mode === "no_path");
        check("boundary labels as pair", good.payload.layer_labels?.[0] === "UI" && good.payload.layer_labels?.[1] === "Domain");
        check("boundary drops max_distance", !("max_distance" in good.payload));
        check("boundary no targets field", !("targets" in good.payload));
    }
    draft.layerLabelTo = "x".repeat(65);
    const tooLong = buildRulePayload(draft);
    check("boundary label too long rejected", !tooLong.ok && "layerLabels" in tooLong.errors);
}
{
    const rule: Rule = {
        id: "r2",
        kind: "layer_boundary",
        name: "Front never reaches persistence",
        severity: "block",
        from: { path_globs: ["src/front/**"] },
        to: { path_globs: ["src/persistence/**"] },
        boundary_mode: "no_path",
        layer_labels: ["Front", "Persistence"],
    };
    const draft = draftFromRule(rule);
    check("boundary draft mode restored", draft.boundaryMode === "no_path");
    check("boundary draft labels restored", draft.layerLabelFrom === "Front" && draft.layerLabelTo === "Persistence");
    const res = buildRulePayload(draft);
    check("boundary round trip builds", res.ok);
    if (res.ok) {
        check("boundary round trip zones", res.payload.from?.path_globs?.[0] === "src/front/**" &&
            res.payload.to?.path_globs?.[0] === "src/persistence/**");
    }
}
{
    const rule: Rule = {
        id: "r1",
        kind: "pinned_do_not_touch",
        name: "Ledger is untouchable",
        severity: "block",
        targets: { node_ids: ["deadbeef"], fqns: ["com.acme.pay.Ledger"] },
        max_distance: 0,
    };
    const draft = draftFromRule(rule);
    const res = buildRulePayload(draft);
    check("round trip builds", res.ok);
    if (res.ok) {
        check("round trip node ids", res.payload.targets?.node_ids?.[0] === "deadbeef");
        check("round trip distance zero kept", res.payload.max_distance === 0);
    }
}
check("preview strips glob suffix", previewQueryFor("src/auth/**") === "src/auth");
check("preview keeps plain fqn", previewQueryFor("com.acme.Ledger") === "com.acme.Ledger");
check("preview empty for pure wildcard", previewQueryFor("**") === "");
if (failures > 0) {
    console.error(`${failures} ruleForm test(s) failed`);
    process.exit(1);
}
console.log("ruleForm tests passed");
