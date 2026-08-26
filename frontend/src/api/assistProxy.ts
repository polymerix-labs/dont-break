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

const ASSIST_BASE = "/nebula/assist";
export const AssistEventName = {
    RUN_STARTED: "run_started",
    STAGE: "stage",
    INTENT: "intent",
    INTENT_REJECTED: "intent_rejected",
    CANDIDATES: "candidates",
    POLICY_REPORT: "policy_report",
    DRAFT: "draft",
    COVERAGE: "coverage",
    SIMULATION_STARTED: "simulation_started",
    PROBE_RESULT: "probe_result",
    SIMULATION_RESULT: "simulation_result",
    ITERATION: "iteration",
    FINAL: "final",
    ERROR: "error",
} as const;
export type AssistEventNameValue = (typeof AssistEventName)[keyof typeof AssistEventName];
export type AssistStage = "planning" | "retrieval" | "draft" | "simulation";
export interface AssistCandidate {
    id: string;
    name: string;
    fqn: string;
    node_type: string;
    path: string | null;
    community: string | null;
    score: number;
    sources: string[];
    semantic: boolean;
}
export interface AssistPolicyViolation {
    policy: string;
    level: string;
    message: string;
    subjects: string[];
}
export interface AssistProbe {
    id: string;
    label: string;
    nodes: string[];
    expect?: "block" | "warn" | "ok";
    path_nodes?: string[];
}
export interface AssistProbeResult {
    round: number;
    id: string;
    label?: string;
    verdict: string;
    expected?: string;
    matches_expectation?: boolean;
    seed_count?: number;
    violations?: unknown[];
}
export interface AssistZone {
    core: string[];
    halo: {
        id: string;
        distance: number;
    }[];
    truncated: boolean;
}
export interface AssistCoverageNode {
    id: string;
    name: string;
    fqn: string;
    node_type: string;
    path: string | null;
    distance?: number;
}
export interface AssistCoverage {
    computed: boolean;
    core: AssistCoverageNode[];
    halo: AssistCoverageNode[];
    frontier: AssistCandidate[];
    truncated: boolean;
    opacity?: {
        unresolved_refs: number;
        nodes_with_unresolved: number;
    };
}
export interface AssistAssessment {
    status: "protected" | "gap" | "too_broad" | "mixed" | "inconclusive" | "untested";
    expected_total: number;
    matched: number;
    gaps: string[];
    over_blocks: string[];
    invalid: string[];
}
export type AssistEvent = {
    event: "run_started";
    data: {
        run_id: string;
        provider: string;
    };
} | {
    event: "stage";
    data: {
        stage: AssistStage;
    };
} | {
    event: "intent";
    data: {
        kind: string;
        severity: string;
        business_goal: string;
        boundary_mode?: string | null;
        layer_labels?: string[] | null;
    };
} | {
    event: "intent_rejected";
    data: {
        errors: string[];
    };
} | {
    event: "candidates";
    data: {
        semantic: boolean;
        selected: AssistCandidate[];
        selected_to: AssistCandidate[];
        rejected: AssistCandidate[];
    };
} | {
    event: "policy_report";
    data: {
        stage: "zone" | "draft" | "probes";
        passed: boolean;
        violations: AssistPolicyViolation[];
    };
} | {
    event: "draft";
    data: {
        rule: Record<string, unknown>;
    };
} | {
    event: "coverage";
    data: AssistCoverage;
} | {
    event: "simulation_started";
    data: {
        round: number;
        probes: AssistProbe[];
        zone?: AssistZone | null;
    };
} | {
    event: "probe_result";
    data: AssistProbeResult;
} | {
    event: "simulation_result";
    data: {
        round: number;
        assessment: AssistAssessment;
    };
} | {
    event: "iteration";
    data: {
        round: number;
        status: string;
        changes: string[];
        rule: Record<string, unknown>;
    };
} | {
    event: "final";
    data: {
        status: string;
        certified?: boolean;
        reason?: string;
        feedback?: string[];
        draft?: Record<string, unknown>;
        assessment?: AssistAssessment;
    };
} | {
    event: "error";
    data: {
        message: string;
    };
};
export interface AssistRunBody {
    prompt: string;
    context_seed?: string;
    existing_rules?: unknown[];
}
export class AssistError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
export function parseSseChunk(buffer: string, onEvent: (event: AssistEvent) => void): string {
    let rest = buffer;
    for (;;) {
        const cut = rest.indexOf("\n\n");
        if (cut === -1)
            return rest;
        const frame = rest.slice(0, cut);
        rest = rest.slice(cut + 2);
        let name = "";
        const dataLines: string[] = [];
        for (const line of frame.split("\n")) {
            if (line.startsWith("event:"))
                name = line.slice(6).trim();
            else if (line.startsWith("data:"))
                dataLines.push(line.slice(5).trim());
        }
        if (!name || dataLines.length === 0)
            continue;
        try {
            const data = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
            onEvent({ event: name, data } as AssistEvent);
        }
        catch {
        }
    }
}
export async function streamAssistRules(body: AssistRunBody, onEvent: (event: AssistEvent) => void, signal?: AbortSignal): Promise<void> {
    const res = await fetch(`${ASSIST_BASE}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
    });
    if (!res.ok || !res.body) {
        const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const message = typeof payload.error === "string"
            ? payload.error
            : `assist run failed (${res.status})`;
        throw new AssistError(res.status, message);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, onEvent);
    }
}
export interface AssistRunEvents {
    run_id: string;
    status: "running" | "done" | "failed";
    events: AssistEvent[];
}
export async function fetchAssistRunEvents(runId: string): Promise<AssistRunEvents> {
    const res = await fetch(`${ASSIST_BASE}/rules/${encodeURIComponent(runId)}/events`);
    const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
        const message = typeof payload.error === "string"
            ? payload.error
            : `assist events failed (${res.status})`;
        throw new AssistError(res.status, message);
    }
    return payload as unknown as AssistRunEvents;
}
