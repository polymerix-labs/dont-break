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

import type { AssistProbe, AssistProbeResult } from "../../../api/assistProxy";
export type ProbeOutcome = "intercepted" | "breach" | "allowed" | "over_block" | "info";
export function deriveProbeOutcome(result: AssistProbeResult): ProbeOutcome {
    const { expected, verdict } = result;
    if (!expected || verdict === "invalid")
        return "info";
    const wantsBlock = expected === "block" || expected === "warn";
    const gotBlock = verdict === "block" || verdict === "warn";
    if (wantsBlock)
        return gotBlock ? "intercepted" : "breach";
    return gotBlock ? "over_block" : "allowed";
}
type WitnessLike = {
    nodes?: unknown;
};
function witnessNodes(violation: unknown): string[] | null {
    if (typeof violation !== "object" || violation === null)
        return null;
    const witness = (violation as {
        witness_path?: WitnessLike | null;
    }).witness_path;
    if (!witness || typeof witness !== "object")
        return null;
    const nodes = witness.nodes;
    if (!Array.isArray(nodes) || nodes.length < 2)
        return null;
    if (!nodes.every((n) => typeof n === "string"))
        return null;
    return nodes as string[];
}
export function witnessPathsOf(result: AssistProbeResult): string[][] {
    const paths: string[][] = [];
    for (const violation of result.violations ?? []) {
        const nodes = witnessNodes(violation);
        if (nodes)
            paths.push(nodes);
    }
    return paths;
}
export function resolveAttackPath(probe: AssistProbe | undefined, result: AssistProbeResult): string[] | null {
    let best: string[] | null = null;
    for (const violation of result.violations ?? []) {
        const nodes = witnessNodes(violation);
        if (nodes && (!best || nodes.length > best.length))
            best = nodes;
    }
    if (best)
        return best;
    const planned = probe?.path_nodes ?? [];
    return planned.length >= 2 ? planned : null;
}
