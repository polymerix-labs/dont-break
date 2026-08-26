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

import assert from "node:assert/strict";
import type { AssistEvent, AssistProbeResult } from "../../../api/assistProxy";
import { buildAdjustContextSeed, deriveAdjustSeed, deriveContract, deriveDecisionTone, deriveSeverityPrefill, applySeverityChoice, canPersistAfterSeverityConfirm, proposedSeverity, sameRulePayload, toggleTargetNode, } from "./ContractPanel";
import { deriveCoverage } from "./CoveragePanel";
import { deriveProbeOutcome, resolveAttackPath } from "./attackPath";
import { deriveGatedMissionStep, deriveMissionStep } from "./mission";
import { deriveRetrieval } from "./RetrievalCard";
import { deriveHud, deriveSimulation, deriveWitnessPaths, groupProbes, probeReveal, roundBannerMode, } from "./SimulationPanel";
import { traceLineVisible } from "./TraceTimeline";
import { COMPRESS_QUEUE_LEN, planProbePlayback, stepHoldMs, } from "./useSimulationPlayback";
import { useStudioStore, type StudioEvent } from "./studioStore";
let at = 0;
const wrap = (ev: AssistEvent): StudioEvent => ({ at: ++at, ev });
const probe = (id: string, expect: "block" | "ok") => ({
    id,
    nodes: [id],
    expect,
    label: `probe ${id}`,
});
const result = (round: number, id: string, verdict: "block" | "ok", expected: "block" | "ok"): AssistEvent => ({
    event: "probe_result",
    data: {
        round,
        id,
        verdict,
        expected,
        matches_expectation: verdict === expected,
    },
});
assert.equal(deriveSimulation([]), null);
assert.equal(deriveSimulation([wrap({ event: "run_started", data: { run_id: "r", provider: "s" } })]), null);
console.log("ok returns null before the first round");
const round1: StudioEvent[] = [
    wrap({
        event: "simulation_started",
        data: { round: 1, probes: [probe("p1", "block"), probe("p2", "ok")] },
    }),
    wrap(result(1, "p1", "block", "block")),
];
{
    const sim = deriveSimulation(round1);
    assert.ok(sim);
    assert.equal(sim.round, 1);
    assert.equal(sim.probes.length, 2);
    assert.equal(sim.results.size, 1);
    assert.equal(sim.results.get("p1")?.matches_expectation, true);
    assert.equal(sim.assessment, null);
}
console.log("ok tracks a round in flight");
{
    const sim = deriveSimulation([
        ...round1,
        wrap(result(1, "p2", "ok", "ok")),
        wrap({
            event: "simulation_result",
            data: {
                round: 1,
                assessment: {
                    status: "protected",
                    expected_total: 2,
                    matched: 2,
                    gaps: [],
                    over_blocks: [],
                    invalid: [],
                },
            },
        }),
    ]);
    assert.ok(sim);
    assert.equal(sim.assessment?.status, "protected");
}
console.log("ok attaches the round verdict");
{
    const sim = deriveSimulation([
        ...round1,
        wrap({
            event: "simulation_started",
            data: { round: 2, probes: [probe("p3", "block")] },
        }),
        wrap(result(1, "p2", "ok", "ok")),
        wrap(result(2, "p3", "ok", "block")),
        wrap({
            event: "simulation_result",
            data: {
                round: 2,
                assessment: {
                    status: "gap",
                    expected_total: 1,
                    matched: 0,
                    gaps: ["p3"],
                    over_blocks: [],
                    invalid: [],
                },
            },
        }),
    ]);
    assert.ok(sim);
    assert.equal(sim.round, 2);
    assert.equal(sim.results.size, 1);
    assert.equal(sim.results.get("p3")?.matches_expectation, false);
    assert.equal(sim.assessment?.status, "gap");
}
console.log("ok a new round supersedes the previous one");
{
    const sim = deriveSimulation([
        ...round1,
        wrap({
            event: "final",
            data: {
                status: "draft_ready",
                assessment: {
                    status: "protected",
                    expected_total: 3,
                    matched: 3,
                    gaps: [],
                    over_blocks: [],
                    invalid: [],
                },
            },
        }),
    ]);
    assert.ok(sim);
    assert.equal(sim.finalStatus, "draft_ready");
    assert.equal(sim.assessment?.status, "protected");
}
console.log("ok the final event closes the view");
{
    const res: AssistProbeResult = {
        round: 1,
        id: "p1",
        verdict: "block",
        expected: "block",
        matches_expectation: true,
    };
    const traversal = planProbePlayback({ ...probe("p1", "block"), path_nodes: ["seed", "mid", "target"] }, res);
    assert.equal(traversal?.kind, "path");
    assert.ok(traversal?.kind === "path" && traversal.nodes.length === 3);
    assert.equal(traversal?.verdict, "block");
    assert.ok((traversal?.holdMs ?? 0) > 0);
    const seedOnly = planProbePlayback(probe("p1", "block"), res);
    assert.equal(seedOnly?.kind, "impact");
    assert.ok(seedOnly?.kind === "impact" && seedOnly.nodeId === "p1");
    assert.equal(planProbePlayback({ ...probe("p1", "block"), nodes: [] }, res), null);
    assert.equal(planProbePlayback(undefined, res), null);
    const long = planProbePlayback({
        ...probe("p1", "block"),
        path_nodes: Array.from({ length: 40 }, (_, i) => `n${i}`),
    }, res);
    const short = planProbePlayback({ ...probe("p1", "block"), path_nodes: ["a", "b"] }, res);
    assert.ok((long?.holdMs ?? 0) <= 2600 + 900 + 400);
    assert.ok((short?.holdMs ?? 0) >= 700);
    assert.ok(seedOnly?.kind === "impact" && seedOnly.probeId === "p1");
    const step = traversal!;
    assert.equal(stepHoldMs(step, 0), step.holdMs);
    assert.equal(stepHoldMs(step, COMPRESS_QUEUE_LEN), step.holdMs);
    assert.equal(stepHoldMs(step, COMPRESS_QUEUE_LEN + 1), Math.round(step.holdMs * 0.5));
}
console.log("ok playback planning covers path, impact and skip cases");
{
    const res: AssistProbeResult = {
        round: 1,
        id: "p1",
        verdict: "block",
        expected: "block",
        matches_expectation: true,
    };
    const base = {
        round: 1,
        playingProbeId: null,
        revealedProbeIds: [] as string[],
        roundComplete: false,
        skipped: false,
    };
    assert.equal(probeReveal(res, "p1", 1, { ...base, phase: "idle" }).result, res);
    assert.equal(probeReveal(res, "p1", 1, { ...base, phase: "assault", round: 2 }).result, res);
    const inFlight = probeReveal(res, "p1", 1, {
        ...base,
        phase: "assault",
        playingProbeId: "p1",
    });
    assert.equal(inFlight.result, undefined);
    assert.equal(inFlight.playing, true);
    const landed = probeReveal(res, "p1", 1, {
        ...base,
        phase: "assault",
        revealedProbeIds: ["p1"],
    });
    assert.equal(landed.result, res);
    assert.equal(landed.playing, false);
}
console.log("ok reveal pacing follows the playback cursor");
{
    const probeEv: AssistEvent = {
        event: "probe_result",
        data: {
            round: 1,
            id: "p1",
            verdict: "block",
            expected: "block",
            matches_expectation: true,
        },
    };
    const roundEv: AssistEvent = {
        event: "simulation_result",
        data: {
            round: 1,
            assessment: {
                status: "protected",
                expected_total: 1,
                matched: 1,
                gaps: [],
                over_blocks: [],
                invalid: [],
            },
        },
    };
    const stageEv: AssistEvent = { event: "stage", data: { stage: "simulation" } };
    const base = {
        round: 1,
        playingProbeId: null,
        revealedProbeIds: [] as string[],
        roundComplete: false,
        skipped: false,
    };
    const assault = { ...base, phase: "assault" as const };
    assert.equal(traceLineVisible(probeEv, { ...base, phase: "idle" }), true);
    assert.equal(traceLineVisible(probeEv, assault), false);
    assert.equal(traceLineVisible(roundEv, assault), false);
    assert.equal(traceLineVisible(probeEv, { ...assault, revealedProbeIds: ["p1"] }), true);
    assert.equal(traceLineVisible(roundEv, {
        ...assault,
        phase: "verdict",
        roundComplete: true,
    }), true);
    assert.equal(traceLineVisible(probeEv, { ...assault, round: 2 }), true);
    assert.equal(traceLineVisible(stageEv, assault), true);
}
console.log("ok trace lines follow the playback cursor");
{
    const res = (expected: string | undefined, verdict: string): AssistProbeResult => ({
        round: 1,
        id: "p",
        verdict,
        expected,
        matches_expectation: expected ? expected === verdict : undefined,
    });
    assert.equal(deriveProbeOutcome(res("block", "block")), "intercepted");
    assert.equal(deriveProbeOutcome(res("warn", "warn")), "intercepted");
    assert.equal(deriveProbeOutcome(res("block", "ok")), "breach");
    assert.equal(deriveProbeOutcome(res("ok", "ok")), "allowed");
    assert.equal(deriveProbeOutcome(res("ok", "block")), "over_block");
    assert.equal(deriveProbeOutcome(res(undefined, "block")), "info");
    assert.equal(deriveProbeOutcome(res("block", "invalid")), "info");
}
console.log("ok outcomes derive from verdict against expectation");
{
    const base: AssistProbeResult = {
        round: 1,
        id: "p1",
        verdict: "block",
        expected: "block",
        matches_expectation: true,
    };
    const withPath = { ...probe("p1", "block"), path_nodes: ["a", "b"] };
    assert.deepEqual(resolveAttackPath(withPath, base), ["a", "b"]);
    assert.deepEqual(resolveAttackPath(withPath, {
        ...base,
        violations: [
            { witness_path: { nodes: ["x", "y"] } },
            { witness_path: { nodes: ["x", "y", "z"] } },
        ],
    }), ["x", "y", "z"]);
    assert.deepEqual(resolveAttackPath(withPath, {
        ...base,
        violations: [null, "junk", { witness_path: { nodes: ["solo"] } }],
    }), ["a", "b"]);
    assert.equal(resolveAttackPath(probe("p1", "block"), base), null);
    assert.equal(resolveAttackPath(undefined, base), null);
}
console.log("ok attack paths prefer the engine's witness path");
{
    const sim = deriveSimulation([
        wrap({
            event: "simulation_started",
            data: {
                round: 1,
                probes: [probe("p1", "block"), probe("p2", "ok"), probe("p3", "block")],
            },
        }),
        wrap(result(1, "p1", "block", "block")),
        wrap(result(1, "p2", "ok", "ok")),
        wrap(result(1, "p3", "ok", "block")),
    ]);
    assert.ok(sim);
    const base = {
        round: 1,
        playingProbeId: null,
        revealedProbeIds: [] as string[],
        roundComplete: false,
        skipped: false,
    };
    const cold = deriveHud(sim, { ...base, phase: "assault" });
    assert.deepEqual(cold, { current: 0, total: 3, intercepted: 0, breaches: 0 });
    const mid = deriveHud(sim, {
        ...base,
        phase: "assault",
        revealedProbeIds: ["p1"],
        playingProbeId: "p2",
    });
    assert.deepEqual(mid, { current: 2, total: 3, intercepted: 1, breaches: 0 });
    const done = deriveHud(sim, {
        ...base,
        phase: "verdict",
        revealedProbeIds: ["p1", "p2", "p3"],
        roundComplete: true,
    });
    assert.deepEqual(done, { current: 3, total: 3, intercepted: 1, breaches: 1 });
    const idle = deriveHud(sim, { ...base, phase: "idle" });
    assert.deepEqual(idle, { current: 3, total: 3, intercepted: 1, breaches: 1 });
}
console.log("ok hud counters follow the playback cursor");
{
    const rule = {
        kind: "protected_path",
        name: "Invoices stay safe",
        severity: "block",
        targets: { path_globs: ["src/billing/**"] },
    };
    assert.equal(deriveContract([]), null);
    assert.equal(deriveContract([wrap({ event: "draft", data: { rule } })]), null);
    assert.equal(deriveContract([
        wrap({ event: "final", data: { status: "failed", draft: rule } }),
    ]), null);
    const got = deriveContract([
        wrap({ event: "final", data: { status: "draft_ready", draft: rule } }),
    ]);
    assert.equal(got?.name, "Invoices stay safe");
    assert.equal(deriveContract([
        wrap({
            event: "final",
            data: { status: "draft_ready", draft: { ...rule, kind: "quantum_zone" } },
        }),
    ]), null);
}
console.log("ok contract derives from the final event only");
{
    const a = {
        kind: "protected_path",
        name: "n",
        severity: "block",
        targets: { path_globs: ["a", "b"] },
        description: undefined,
    };
    const b = {
        severity: "block",
        targets: { path_globs: ["a", "b"] },
        name: "n",
        kind: "protected_path",
        active_from: null,
    };
    assert.ok(sameRulePayload(a, b));
    assert.ok(!sameRulePayload(a, { ...b, severity: "warn" }));
    assert.ok(!sameRulePayload(a, { ...b, targets: { path_globs: ["a"] } }));
}
console.log("ok payload comparison is order and noise insensitive");
{
    const draft = {
        kind: "protected_path",
        name: "n",
        severity: "block",
        targets: { path_globs: ["src/billing/**"] },
    } as const;
    const added = toggleTargetNode(draft, "node-1");
    assert.deepEqual(added.targets?.node_ids, ["node-1"]);
    assert.deepEqual(added.targets?.path_globs, ["src/billing/**"]);
    const removed = toggleTargetNode(added, "node-1");
    assert.equal(removed.targets?.node_ids, undefined);
    const boundary = {
        kind: "layer_boundary",
        name: "n",
        severity: "block",
        from: { path_globs: ["src/ui/**"] },
        to: { path_globs: ["src/db/**"] },
        boundary_mode: "no_direct",
    } as const;
    assert.equal(toggleTargetNode(boundary, "node-1"), boundary);
}
console.log("ok node clicks toggle targets on single-zone kinds");
{
    assert.equal(deriveMissionStep([], "idle"), "describe");
    assert.equal(deriveMissionStep([wrap({ event: "run_started", data: { run_id: "r", provider: "s" } })], "running"), "understand");
    const withSim = [
        wrap({ event: "run_started", data: { run_id: "r", provider: "s" } }),
        wrap({
            event: "simulation_started",
            data: { round: 1, probes: [probe("p1", "block")] },
        }),
    ];
    assert.equal(deriveMissionStep(withSim, "running"), "test");
    assert.equal(deriveMissionStep([...withSim, wrap({ event: "final", data: { status: "draft_ready" } })], "running"), "decide");
    assert.equal(deriveMissionStep(withSim, "done"), "decide");
    assert.equal(deriveMissionStep(withSim, "failed"), "test");
    assert.equal(deriveMissionStep([], "failed"), "understand");
}
console.log("ok mission step derives from the trace");
{
    const withCandidates = [
        wrap({ event: "run_started", data: { run_id: "r", provider: "s" } }),
        wrap({
            event: "candidates",
            data: { selected: [], selected_to: [], rejected: [] },
        }),
    ];
    assert.equal(deriveGatedMissionStep(withCandidates, "done", false), "understand");
    assert.equal(deriveGatedMissionStep(withCandidates, "done", true), "decide");
    assert.equal(deriveGatedMissionStep(withCandidates, "failed", false), "understand");
    assert.equal(deriveGatedMissionStep([], "running", false), "understand");
    assert.equal(deriveGatedMissionStep([], "idle", false), "describe");
}
console.log("ok gated mission step waits on the protect CTA");
{
    const store = useStudioStore;
    store.getState().begin();
    const feed = (ev: AssistEvent) => store.getState().append(ev);
    feed({ event: "run_started", data: { run_id: "g1", provider: "s" } });
    feed({
        event: "candidates",
        data: { selected: [], selected_to: [], rejected: [] },
    } as unknown as AssistEvent);
    feed({ event: "stage", data: { stage: "draft" } } as unknown as AssistEvent);
    feed({
        event: "final",
        data: { status: "draft_ready" },
    } as unknown as AssistEvent);
    assert.equal(store.getState().events.length, 2, "later acts held back");
    assert.equal(store.getState().heldEvents.length, 2);
    store.getState().arm();
    assert.equal(store.getState().events.length, 4, "arming flushes the show");
    assert.equal(store.getState().heldEvents.length, 0);
    assert.equal(store.getState().armed, true);
    feed({ event: "stage", data: { stage: "simulation" } } as unknown as AssistEvent);
    assert.equal(store.getState().events.length, 5);
    store.getState().begin();
    feed({ event: "run_started", data: { run_id: "g2", provider: "s" } });
    feed({
        event: "candidates",
        data: { selected: [], selected_to: [], rejected: [] },
    } as unknown as AssistEvent);
    feed({
        event: "error",
        data: { message: "boom" },
    } as unknown as AssistEvent);
    assert.equal(store.getState().events.length, 2);
    store.getState().finish("failed", "boom");
    assert.equal(store.getState().events.length, 3, "failure flushes the gate");
    assert.equal(store.getState().armed, true);
    store.getState().reset();
}
console.log("ok act-two gate holds events until armed");
{
    const coverage = (frontier: string[], core = ["calc"]): AssistEvent => ({
        event: "coverage",
        data: {
            computed: true,
            core: core.map((id) => ({ id, name: id, fqn: `app.${id}`, node_type: "", path: null })),
            halo: [],
            frontier: frontier.map((id) => ({
                id,
                name: id,
                fqn: `app.${id}`,
                node_type: "",
                path: null,
                community: null,
                score: 0,
                sources: [],
                semantic: false,
            })),
            truncated: false,
        },
    }) as AssistEvent;
    assert.equal(deriveCoverage([]), null);
    const latest = deriveCoverage([
        wrap(coverage(["a"], ["calc"])),
        wrap(coverage([], ["calc", "fmt"])),
    ]);
    assert.deepEqual(latest?.core.map((n) => n.id), ["calc", "fmt"]);
    assert.deepEqual(latest?.frontier, []);
    const withFrontier = deriveCoverage([wrap(coverage(["a"]))]);
    assert.deepEqual(withFrontier?.frontier.map((c) => c.id), ["a"]);
}
console.log("ok coverage certificate derives the latest frontier");
{
    const trace: StudioEvent[] = [
        wrap({
            event: "simulation_started",
            data: {
                round: 1,
                probes: [
                    { ...probe("halo_dep", "block"), path_nodes: ["guessed", "route"] },
                    probe("clean", "ok"),
                ],
            },
        }),
        wrap({
            event: "probe_result",
            data: {
                round: 1,
                id: "halo_dep",
                verdict: "block",
                expected: "block",
                matches_expectation: true,
                violations: [
                    { witness_path: { nodes: ["halo_dep", "viewmodel", "activity"] } },
                    { witness_path: { nodes: ["halo_dep", "activity"] } },
                    { witness_path: null },
                ],
            } as never,
        }),
        wrap(result(1, "clean", "ok", "ok")),
    ];
    const sim = deriveSimulation(trace);
    assert.ok(sim);
    const witnesses = deriveWitnessPaths(sim);
    assert.equal(witnesses.length, 2);
    assert.deepEqual(witnesses[0].nodes, ["halo_dep", "viewmodel", "activity"]);
    assert.deepEqual(witnesses[1].nodes, ["halo_dep", "activity"]);
    assert.equal(witnesses[0].label, "probe halo_dep");
    assert.ok(witnesses.every((w) => w.probeId === "halo_dep"));
}
console.log("ok witness paths derive from violations only");
{
    const withOpacity = deriveCoverage([
        wrap({
            event: "coverage",
            data: {
                computed: true,
                core: [],
                halo: [],
                frontier: [],
                truncated: false,
                opacity: { unresolved_refs: 3, nodes_with_unresolved: 2 },
            },
        } as AssistEvent),
    ]);
    assert.equal(withOpacity?.opacity?.unresolved_refs, 3);
    const without = deriveCoverage([
        wrap({
            event: "coverage",
            data: { computed: true, core: [], halo: [], frontier: [], truncated: false },
        } as AssistEvent),
    ]);
    assert.equal(without?.opacity?.unresolved_refs ?? 0, 0);
}
console.log("ok opacity is read from the certificate when present");
{
    const probes = [
        probe("a1", "block"),
        { ...probe("a2", "block"), expect: "warn" as const },
        probe("c1", "ok"),
        { id: "i1", nodes: ["i1"], label: "info probe" },
    ];
    const { attacks, controls } = groupProbes(probes);
    assert.deepEqual(attacks.map((p) => p.id), ["a1", "a2"]);
    assert.deepEqual(controls.map((p) => p.id), ["c1", "i1"]);
}
console.log("ok probes group by expectation");
{
    assert.equal(roundBannerMode("protected", null, true), "banner");
    assert.equal(roundBannerMode("gap", null, true), "calm");
    assert.equal(roundBannerMode("gap", "needs_review_gap", true), "banner");
    assert.equal(roundBannerMode("gap", null, false), "banner");
    assert.equal(roundBannerMode("mixed", null, true), "calm");
}
console.log("ok imperfect mid-run rounds stay calm");
{
    const final = (status: string): StudioEvent => wrap({ event: "final", data: { status } });
    assert.equal(deriveDecisionTone([]), null);
    assert.equal(deriveDecisionTone([final("draft_ready")]), "ready");
    assert.equal(deriveDecisionTone([final("needs_review_gap")]), "partial");
    assert.equal(deriveDecisionTone([final("failed")]), null);
    assert.equal(deriveDecisionTone([final("needs_review_gap"), final("draft_ready")]), "ready");
}
console.log("ok decision tone follows the final status");
{
    const trace: StudioEvent[] = [
        wrap({
            event: "simulation_started",
            data: { round: 1, probes: [probe("g1", "block"), probe("b1", "ok")] },
        }),
        wrap({
            event: "simulation_result",
            data: {
                round: 1,
                assessment: {
                    status: "mixed",
                    expected_total: 2,
                    matched: 0,
                    gaps: ["g1"],
                    over_blocks: ["b1"],
                    invalid: [],
                },
            },
        }),
    ];
    const seed = deriveAdjustSeed(trace);
    assert.deepEqual(seed.gaps, ["probe g1"]);
    assert.deepEqual(seed.overBlocks, ["probe b1"]);
    const finalSeed = deriveAdjustSeed([
        ...trace,
        wrap({
            event: "final",
            data: {
                status: "needs_review_gap",
                assessment: {
                    status: "gap",
                    expected_total: 2,
                    matched: 1,
                    gaps: ["mystery"],
                    over_blocks: [],
                    invalid: [],
                },
            },
        }),
    ]);
    assert.deepEqual(finalSeed.gaps, ["mystery"]);
    assert.deepEqual(finalSeed.overBlocks, []);
    assert.deepEqual(deriveAdjustSeed([]), { gaps: [], overBlocks: [] });
}
console.log("ok adjust seed speaks in probe labels");
{
    const draft = {
        name: "Nobody breaks invoicing",
        kind: "protected_path",
        severity: "block",
        targets: { node_ids: ["calc"] },
    } as never;
    const seed = buildAdjustContextSeed("protège la facturation", draft, {
        gaps: ["Edit calc directly"],
        overBlocks: ["Edit readme"],
    });
    assert.ok(seed.includes("Original mission: protège la facturation"));
    assert.ok(seed.includes('"kind":"protected_path"'));
    assert.ok(seed.includes('"node_ids":["calc"]'));
    assert.ok(seed.includes("NOT blocked: Edit calc directly"));
    assert.ok(seed.includes("wrongly blocked: Edit readme"));
    const clean = buildAdjustContextSeed("protège la facturation", draft, {
        gaps: [],
        overBlocks: [],
    });
    assert.ok(!clean.includes("NOT blocked"));
    assert.ok(!clean.includes("wrongly blocked"));
    const boundary = {
        name: "UI never touches DB",
        kind: "forbidden_dependency",
        severity: "block",
        from: { path_globs: ["ui/**"] },
        to: { path_globs: ["db/**"] },
    } as never;
    const boundarySeed = buildAdjustContextSeed("ui jamais db", boundary, {
        gaps: [],
        overBlocks: [],
    });
    assert.ok(boundarySeed.includes('"from":{"path_globs":["ui/**"]}'));
    assert.ok(boundarySeed.includes('"to":{"path_globs":["db/**"]}'));
}
console.log("ok adjust context seed carries mission, draft and flaws");
{
    const cand = (names: string[], rejected: number): AssistEvent => ({
        event: "candidates",
        data: {
            semantic: true,
            selected: names.map((name) => ({ id: name, name })),
            selected_to: [],
            rejected: Array.from({ length: rejected }, (_, i) => ({
                id: `r${i}`,
                name: `r${i}`,
            })),
        } as never,
    });
    assert.equal(deriveRetrieval([]), null);
    const one = deriveRetrieval([wrap(cand(["a", "b"], 1))]);
    assert.equal(one?.found, 2);
    assert.equal(one?.rejected, 1);
    assert.deepEqual(one?.names, ["a", "b"]);
    const widened = deriveRetrieval([
        wrap(cand(["a", "b"], 1)),
        wrap(cand(["a", "b", "c", "d", "e", "f"], 0)),
    ]);
    assert.equal(widened?.found, 6);
    assert.equal(widened?.names.length, 4);
}
console.log("ok retrieval narration folds the latest candidates");
{
    const blockRule = {
        kind: "protected_path",
        name: "Invoices stay safe",
        severity: "block",
        targets: { path_globs: ["src/billing/**"] },
    };
    const warnRule = { ...blockRule, severity: "warn" };
    const blockEvents = [
        wrap({
            event: "intent",
            data: {
                kind: "protected_path",
                severity: "block",
                business_goal: "Nobody breaks invoicing",
            },
        }),
        wrap({ event: "final", data: { status: "draft_ready", draft: blockRule } }),
    ];
    const warnEvents = [
        wrap({
            event: "intent",
            data: {
                kind: "protected_path",
                severity: "warn",
                business_goal: "We would like to avoid touching auth",
            },
        }),
        wrap({ event: "final", data: { status: "draft_ready", draft: warnRule } }),
    ];
    const blockPrefill = deriveSeverityPrefill(blockEvents);
    assert.equal(proposedSeverity(deriveContract(blockEvents)), "block");
    assert.equal(blockPrefill?.severity, "block");
    assert.equal(blockPrefill?.goal, "Nobody breaks invoicing");
    const warnPrefill = deriveSeverityPrefill(warnEvents);
    assert.equal(proposedSeverity(deriveContract(warnEvents)), "warn");
    assert.equal(warnPrefill?.severity, "warn");
    assert.equal(warnPrefill?.goal, "We would like to avoid touching auth");
    const overridden = applySeverityChoice(deriveContract(blockEvents)!, "warn");
    assert.equal(overridden.severity, "warn");
    assert.equal(overridden.name, "Invoices stay safe");
    assert.equal(canPersistAfterSeverityConfirm(false), false);
    assert.equal(canPersistAfterSeverityConfirm(true), true);
}
console.log("ok severity prefill warn/block, override, and refuse save without confirm");
console.log("simulation panel tests passed");
