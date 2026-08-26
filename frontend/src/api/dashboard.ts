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

import { ruleEventsSearchParams, type ListRuleEventsQuery, type ListRuleEventsResponse, } from "./ruleEventsQuery";
const QUERY_BASE = "/nebula/query";
const RULES_BASE = "/nebula/rules";
export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
        const message = typeof body.error === "string" ? body.error : `request failed (${res.status})`;
        throw new ApiError(res.status, message);
    }
    return body as T;
}
export interface ArchScore {
    score: number | null;
}
export interface ArchAction {
    kind: string;
    subject: string;
    stability_gain: number;
    ai_gain: number;
    estimated_tokens: number;
    rationale: string;
}
export interface ArchStatus {
    global: {
        stability: ArchScore | null;
        navigability: ArchScore | null;
    } | null;
    top_actions: ArchAction[];
    practicability: {
        verdict: "healthy" | "caution" | "critical" | "unknown";
        summary: string;
    };
}
export interface DoNotTouchEntry {
    node_id: string;
    name?: string | null;
    fqn?: string | null;
    node_type?: string | null;
    fan_in?: number;
    stability?: number;
    reason: {
        kind: string;
        detail: string;
    };
}
export interface FindMatch {
    id: string;
    name: string;
    fqn: string;
    node_type: string;
    relative_path?: string | null;
}
export function fetchArchStatus(): Promise<ArchStatus> {
    return request<ArchStatus>(`${QUERY_BASE}/arch/status`);
}
export async function fetchDoNotTouch(): Promise<DoNotTouchEntry[]> {
    const res = await fetch(`${QUERY_BASE}/do-not-touch`);
    const body = (await res.json().catch(() => [])) as unknown;
    if (!res.ok) {
        const message = body && typeof body === "object" && "error" in body
            ? String((body as {
                error: unknown;
            }).error)
            : `request failed (${res.status})`;
        throw new ApiError(res.status, message);
    }
    return Array.isArray(body) ? (body as DoNotTouchEntry[]) : [];
}
export interface CheckNodeRef {
    id: string;
    name?: string | null;
    fqn?: string | null;
    relative_path?: string | null;
}
export interface CheckWitnessSegment {
    from: string;
    to: string;
    edge_type: string;
}
export interface CheckWitnessPath {
    nodes: string[];
    segments: CheckWitnessSegment[];
}
export interface CheckViolation {
    rule_id: string;
    rule_name: string;
    kind: string;
    severity: "block" | "warn";
    distance: number;
    protected_node: CheckNodeRef;
    reached_from: CheckNodeRef;
    witness_path?: CheckWitnessPath | null;
    detail?: string;
}
export interface CheckResponse {
    verdict: "ok" | "warn" | "block";
    checked_rules: number;
    violations: CheckViolation[];
    verdict_basis?: "rules" | "structural" | "no_rules";
}
export function checkResponseBasis(response: Pick<CheckResponse, "checked_rules" | "verdict_basis">): "rules" | "structural" | "no_rules" {
    if (response.verdict_basis === "structural")
        return "structural";
    return response.checked_rules > 0 ? "rules" : "no_rules";
}
export function checkChange(seeds: {
    files?: string[];
    nodes?: string[];
}): Promise<CheckResponse> {
    const params = new URLSearchParams();
    if (seeds.files?.length)
        params.set("files", seeds.files.join(","));
    if (seeds.nodes?.length)
        params.set("nodes", seeds.nodes.join(","));
    return request<CheckResponse>(`${QUERY_BASE}/check?${params}`);
}
export async function findSymbols(name: string, limit = 20): Promise<FindMatch[]> {
    const params = new URLSearchParams({ name, limit: String(limit) });
    const res = await fetch(`${QUERY_BASE}/find?${params}`);
    const body = (await res.json().catch(() => [])) as unknown;
    if (!res.ok)
        throw new ApiError(res.status, `find failed (${res.status})`);
    return Array.isArray(body) ? (body as FindMatch[]) : [];
}
export interface SemanticFindMatch extends FindMatch {
    score: number;
    match_reason: string;
    fan_in: number;
    community?: string | null;
}
export async function semanticFindSymbols(q: string, limit = 20): Promise<SemanticFindMatch[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const res = await fetch(`${QUERY_BASE}/semantic-find?${params}`);
    const body = (await res.json().catch(() => [])) as unknown;
    if (!res.ok) {
        const message = body && typeof body === "object" && "error" in body
            ? String((body as {
                error: unknown;
            }).error)
            : `semantic-find failed (${res.status})`;
        throw new ApiError(res.status, message);
    }
    return Array.isArray(body) ? (body as SemanticFindMatch[]) : [];
}
export interface SymbolSearchResult {
    matches: FindMatch[];
    semantic: boolean;
}
export async function searchSymbols(query: string, limit = 20): Promise<SymbolSearchResult> {
    try {
        const matches = await semanticFindSymbols(query, limit);
        return { matches, semantic: true };
    }
    catch {
        const matches = await findSymbols(query, limit);
        return { matches, semantic: false };
    }
}
export interface RuleTargets {
    node_ids?: string[];
    path_globs?: string[];
    fqns?: string[];
}
export interface Rule {
    id: string;
    kind: "pinned_do_not_touch" | "protected_path" | "regulatory" | "forbidden_dependency" | "impact_budget" | "layer_boundary";
    name: string;
    severity: "block" | "warn";
    description?: string;
    targets?: RuleTargets;
    from?: RuleTargets;
    to?: RuleTargets;
    max_distance?: number;
    max_radius?: number;
    max_impacted_nodes?: number;
    tag?: string;
    reference?: string;
    boundary_mode?: "no_path" | "no_direct";
    layer_labels?: string[];
    active_from?: string | null;
    active_until?: string | null;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    status?: "active" | "pending" | "paused";
    author?: {
        type: "human" | "agent";
        user_id: string;
        at: string;
        agent?: {
            token_id: string;
            label: string;
        };
    };
    reasons?: Array<{
        at: string;
        text: string;
        author: {
            type: "human" | "agent";
            user_id: string;
            at: string;
            agent?: {
                token_id: string;
                label: string;
            };
        };
    }>;
}
export interface RulesDocument {
    schema_version: number;
    rules: Rule[];
}
export interface RuleZoneNode {
    id: string;
    name?: string | null;
    fqn?: string | null;
    node_type?: string | null;
    distance?: number;
}
export interface RuleNodesResponse {
    rule_id: string;
    kind: string;
    active: boolean;
    core: RuleZoneNode[];
    halo: RuleZoneNode[];
    truncated: boolean;
}
export function fetchRules(): Promise<RulesDocument> {
    return request<RulesDocument>(RULES_BASE);
}
export function createRule(input: Omit<Rule, "id">): Promise<Rule> {
    return request<Rule>(RULES_BASE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
}
export function updateRule(ruleId: string, input: Partial<Rule>): Promise<Rule> {
    return request<Rule>(`${RULES_BASE}/${encodeURIComponent(ruleId)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
}
export function deleteRule(ruleId: string): Promise<{
    deleted: boolean;
}> {
    return request<{
        deleted: boolean;
    }>(`${RULES_BASE}/${encodeURIComponent(ruleId)}`, {
        method: "DELETE",
    });
}
export function approveRulePath(ruleId: string): string {
    return `${RULES_BASE}/${encodeURIComponent(ruleId)}/approve`;
}
export function rejectRulePath(ruleId: string): string {
    return `${RULES_BASE}/${encodeURIComponent(ruleId)}/reject`;
}
export function approveRule(ruleId: string): Promise<Rule> {
    return request<Rule>(approveRulePath(ruleId), { method: "POST" });
}
export function rejectRule(ruleId: string): Promise<{
    deleted?: boolean;
} | Rule> {
    return request(rejectRulePath(ruleId), { method: "POST" });
}
export function fetchRuleNodes(ruleId: string): Promise<RuleNodesResponse> {
    return request<RuleNodesResponse>(`${RULES_BASE}/${encodeURIComponent(ruleId)}/nodes`);
}
export interface CheckEventViolationRef {
    rule_id: string;
    rule_name: string;
    kind: string;
    severity: "block" | "warn";
}
export interface CheckEvent {
    id: string;
    at: string;
    user_id: string;
    files: string[];
    nodes: string[];
    verdict: "ok" | "warn" | "block";
    checked_rules: number;
    violations: CheckEventViolationRef[];
}
export interface RuleStats {
    rule_id: string;
    hits: number;
    blocked: number;
    warned: number;
    bypasses: number;
    last_hit_at: string | null;
}
export interface RuleActivityTotals {
    checks: number;
    blocked: number;
    warned: number;
    incidents: number;
}
export interface BypassIncident {
    id: string;
    at: string;
    session_id: string;
    kind: "bypassed" | "unchecked";
    rule_id: string;
    rule_name: string;
    severity: "block" | "warn";
    files: string[];
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: string;
}
export interface RuleActivity {
    schema_version: number;
    totals: RuleActivityTotals;
    stats: RuleStats[];
    events: CheckEvent[];
    incidents: BypassIncident[];
}
export function fetchRuleActivity(): Promise<RuleActivity> {
    return request<RuleActivity>(`${RULES_BASE}/activity`);
}
export function ackIncident(incidentId: string): Promise<{
    acknowledged: true;
}> {
    return request<{
        acknowledged: true;
    }>(`${RULES_BASE}/activity/incidents/${encodeURIComponent(incidentId)}/ack`, { method: "POST" });
}
export type { ListRuleEventsQuery, ListRuleEventsResponse, RuleDailyRollup, RuleEvent, RuleEventKind, } from "./ruleEventsQuery";
export function fetchRuleEvents(query: ListRuleEventsQuery): Promise<ListRuleEventsResponse> {
    return request<ListRuleEventsResponse>(`${RULES_BASE}/events?${ruleEventsSearchParams(query)}`);
}
