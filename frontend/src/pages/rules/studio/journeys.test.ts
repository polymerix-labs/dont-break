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
import { parseSseChunk, type AssistEvent } from "../../../api/assistProxy";
import { deriveContract, toggleTargetNode } from "./ContractPanel";
import { deriveCoverage } from "./CoveragePanel";
import { deriveSimulation } from "./SimulationPanel";
import { planProbePlayback } from "./useSimulationPlayback";
import type { StudioEvent } from "./studioStore";
function replay(raw: {
    event: string;
    data: unknown;
}[]): StudioEvent[] {
    const text = raw
        .map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`)
        .join("");
    const out: StudioEvent[] = [];
    let at = 0;
    const rest = parseSseChunk(text, (ev: AssistEvent) => {
        out.push({ at: ++at, ev });
    });
    assert.equal(rest, "", "every frame must be consumed");
    assert.equal(out.length, raw.length, "no frame may be dropped");
    return out;
}
const stage = (s: string) => ({ event: "stage", data: { stage: s } });
const policyOk = (s: string) => ({
    event: "policy_report",
    data: { stage: s, passed: true, violations: [] },
});
{
    const draft = {
        kind: "protected_path",
        name: "Nobody breaks invoicing",
        description: "Nobody breaks invoicing",
        severity: "block",
        targets: { node_ids: ["calc", "store"] },
    };
    const assessment = {
        status: "protected",
        expected_total: 4,
        matched: 4,
        gaps: [],
        over_blocks: [],
        invalid: [],
    };
    const events = replay([
        { event: "run_started", data: { run_id: "run_ref", provider: "scripted" } },
        stage("planning"),
        {
            event: "intent",
            data: {
                kind: "protected_path",
                severity: "block",
                business_goal: "Nobody breaks invoicing",
                boundary_mode: null,
                layer_labels: null,
            },
        },
        stage("retrieval"),
        {
            event: "candidates",
            data: { semantic: true, selected: [], selected_to: [], rejected: [] },
        },
        policyOk("zone"),
        stage("draft"),
        { event: "draft", data: { rule: draft } },
        policyOk("draft"),
        {
            event: "coverage",
            data: {
                computed: true,
                core: [
                    { id: "calc", name: "calc", fqn: "app.calc", node_type: "fn", path: "src/calc.py" },
                    { id: "store", name: "store", fqn: "app.store", node_type: "fn", path: null },
                ],
                halo: [
                    { id: "helper", name: "helper", fqn: "app.helper", node_type: "fn", path: null, distance: 1 },
                ],
                frontier: [
                    { id: "readme", name: "readme", fqn: "docs.readme", node_type: "doc", path: null, community: null, score: 0.01, sources: ["invoice computation"], semantic: true },
                ],
                truncated: false,
            },
        },
        stage("simulation"),
        policyOk("probes"),
        {
            event: "simulation_started",
            data: {
                round: 1,
                probes: [
                    { id: "attack_direct_calc", label: "Edit calc directly", nodes: ["calc"], expect: "block" },
                    { id: "attack_direct_store", label: "Edit store directly", nodes: ["store"], expect: "block" },
                    { id: "attack_halo_helper", label: "Edit helper, which the zone depends on", nodes: ["helper"], expect: "block" },
                    { id: "control_readme", label: "Edit readme, outside the protected zone", nodes: ["readme"], expect: "ok" },
                ],
            },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "attack_halo_helper", verdict: "block", expected: "block", matches_expectation: true },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "attack_direct_calc", verdict: "block", expected: "block", matches_expectation: true },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "attack_direct_store", verdict: "block", expected: "block", matches_expectation: true },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "control_readme", verdict: "ok", expected: "ok", matches_expectation: true },
        },
        { event: "simulation_result", data: { round: 1, assessment } },
        {
            event: "final",
            data: { status: "draft_ready", certified: true, draft, assessment },
        },
    ]);
    const sim = deriveSimulation(events);
    assert.ok(sim);
    assert.equal(sim.round, 1);
    assert.equal(sim.results.size, 4);
    assert.ok([...sim.results.values()].every((r) => r.matches_expectation === true));
    assert.equal(sim.assessment?.status, "protected");
    assert.equal(sim.finalStatus, "draft_ready");
    const contract = deriveContract(events);
    assert.equal(contract?.kind, "protected_path");
    assert.deepEqual(contract?.targets?.node_ids, ["calc", "store"]);
    const coverage = deriveCoverage(events);
    assert.ok(coverage);
    assert.equal(coverage.computed, true);
    assert.deepEqual(coverage.core.map((n) => n.id), ["calc", "store"]);
    assert.deepEqual(coverage.halo.map((n) => [n.id, n.distance]), [["helper", 1]]);
    assert.deepEqual(coverage.frontier.map((c) => c.id), ["readme"]);
    const steps = sim.probes.map((p) => planProbePlayback(p, sim.results.get(p.id)!));
    assert.ok(steps.every((s) => s?.kind === "impact"));
    assert.deepEqual(steps.map((s) => s?.verdict), ["block", "block", "block", "ok"]);
}
console.log("ok reference journey replays to a protected contract");
{
    const widened = {
        kind: "protected_path",
        name: "Nobody breaks invoicing",
        description: "Nobody breaks invoicing",
        severity: "block",
        targets: { node_ids: ["calc", "fmt", "store"] },
    };
    const events = replay([
        { event: "run_started", data: { run_id: "run_gap", provider: "scripted" } },
        stage("simulation"),
        {
            event: "simulation_started",
            data: {
                round: 1,
                probes: [
                    { id: "attack_direct_calc", label: "Edit calc directly", nodes: ["calc"], expect: "block" },
                ],
            },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "attack_direct_calc", nodes: ["fmt"], verdict: "ok", expected: "block", matches_expectation: false },
        },
        {
            event: "simulation_result",
            data: {
                round: 1,
                assessment: { status: "gap", expected_total: 1, matched: 0, gaps: ["attack_direct_calc"], over_blocks: [], invalid: [] },
            },
        },
        {
            event: "iteration",
            data: { round: 1, status: "gap", changes: ["widened targets with fmt"], rule: widened },
        },
        {
            event: "simulation_started",
            data: {
                round: 2,
                probes: [
                    { id: "attack_direct_calc", label: "Edit calc directly", nodes: ["calc"], expect: "block" },
                ],
            },
        },
        {
            event: "probe_result",
            data: { round: 2, id: "attack_direct_calc", verdict: "block", expected: "block", matches_expectation: true },
        },
        {
            event: "simulation_result",
            data: {
                round: 2,
                assessment: { status: "protected", expected_total: 1, matched: 1, gaps: [], over_blocks: [], invalid: [] },
            },
        },
        {
            event: "final",
            data: {
                status: "draft_ready",
                draft: widened,
                assessment: { status: "protected", expected_total: 1, matched: 1, gaps: [], over_blocks: [], invalid: [] },
            },
        },
    ]);
    const sim = deriveSimulation(events);
    assert.ok(sim);
    assert.equal(sim.round, 2);
    assert.equal(sim.results.get("attack_direct_calc")?.matches_expectation, true);
    assert.equal(sim.assessment?.status, "protected");
    const contract = deriveContract(events);
    assert.deepEqual(contract?.targets?.node_ids, ["calc", "fmt", "store"]);
}
console.log("ok gap journey replays to the widened contract");
{
    const draft = {
        kind: "layer_boundary",
        name: "UI never talks to the database directly",
        description: "UI never talks to the database directly",
        severity: "block",
        from: { node_ids: ["screen", "widget"] },
        to: { node_ids: ["repo"] },
        boundary_mode: "no_direct",
        layer_labels: ["UI", "Data"],
    };
    const assessment = {
        status: "protected",
        expected_total: 3,
        matched: 3,
        gaps: [],
        over_blocks: [],
        invalid: [],
    };
    const events = replay([
        { event: "run_started", data: { run_id: "run_lb", provider: "scripted" } },
        stage("simulation"),
        {
            event: "simulation_started",
            data: {
                round: 1,
                probes: [
                    {
                        id: "attack_direct_screen",
                        label: "Edit screen, which crosses the boundary directly",
                        nodes: ["screen"],
                        expect: "block",
                        path_nodes: ["screen", "repo"],
                    },
                    {
                        id: "allowed_indirect_widget",
                        label: "Edit widget, which goes through the service layer",
                        nodes: ["widget"],
                        expect: "ok",
                        path_nodes: ["widget", "service", "repo"],
                    },
                    { id: "control_logger", label: "Edit logger, outside both layers", nodes: ["logger"], expect: "ok" },
                ],
            },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "attack_direct_screen", verdict: "block", expected: "block", matches_expectation: true },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "allowed_indirect_widget", verdict: "ok", expected: "ok", matches_expectation: true },
        },
        {
            event: "probe_result",
            data: { round: 1, id: "control_logger", verdict: "ok", expected: "ok", matches_expectation: true },
        },
        { event: "simulation_result", data: { round: 1, assessment } },
        { event: "final", data: { status: "draft_ready", draft, assessment } },
    ]);
    const contract = deriveContract(events);
    assert.equal(contract?.kind, "layer_boundary");
    assert.equal(contract?.boundary_mode, "no_direct");
    assert.deepEqual(contract?.layer_labels, ["UI", "Data"]);
    assert.deepEqual(contract?.from?.node_ids, ["screen", "widget"]);
    assert.deepEqual(contract?.to?.node_ids, ["repo"]);
    assert.equal(contract && "max_distance" in contract && contract.max_distance != null, false);
    assert.equal(contract && toggleTargetNode(contract, "n1"), contract);
    const sim = deriveSimulation(events);
    assert.ok(sim);
    const steps = sim.probes.map((p) => planProbePlayback(p, sim.results.get(p.id)!));
    assert.equal(steps[0]?.kind, "path");
    assert.ok(steps[0]?.kind === "path" && steps[0].nodes.join(">") === "screen>repo");
    assert.equal(steps[0]?.verdict, "block");
    assert.equal(steps[1]?.kind, "path");
    assert.equal(steps[1]?.verdict, "ok");
    assert.equal(steps[2]?.kind, "impact");
    assert.ok(steps[2]?.kind === "impact" && steps[2].nodeId === "logger");
}
console.log("ok layer_boundary journey replays as a two-zone contract");
console.log("journey replay tests passed");
