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

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionContext } from "../shell/SessionContext";
import { ackIncident, approveRule, createRule, deleteRule, fetchArchStatus, fetchDoNotTouch, fetchRuleActivity, fetchRuleEvents, fetchRuleNodes, fetchRules, rejectRule, updateRule, type ListRuleEventsQuery, type Rule, } from "../api/dashboard";
import { journalInvalidatesOnReady, ruleEventsSearchParams } from "../api/ruleEventsQuery";
export const queryKeys = {
    archStatus: ["arch-status"] as const,
    doNotTouch: ["do-not-touch"] as const,
    rules: ["rules"] as const,
    ruleNodes: (ruleId: string) => ["rule-nodes", ruleId] as const,
    ruleActivity: ["rule-activity"] as const,
    ruleEvents: (query: ListRuleEventsQuery) => ["rule-events", ruleEventsSearchParams(query).toString()] as const,
};
export function useArchStatus() {
    return useQuery({ queryKey: queryKeys.archStatus, queryFn: fetchArchStatus });
}
export function useDoNotTouch() {
    return useQuery({ queryKey: queryKeys.doNotTouch, queryFn: fetchDoNotTouch });
}
export function useRules() {
    return useQuery({ queryKey: queryKeys.rules, queryFn: fetchRules });
}
export function useRuleNodes(ruleId: string | null) {
    return useQuery({
        queryKey: queryKeys.ruleNodes(ruleId ?? ""),
        queryFn: () => fetchRuleNodes(ruleId as string),
        enabled: Boolean(ruleId),
    });
}
export function useRuleActivity() {
    const { session } = useSessionContext();
    const client = useQueryClient();
    const phase = String(session?.sync_phase ?? "");
    useEffect(() => {
        if (journalInvalidatesOnReady(phase)) {
            void client.invalidateQueries({ queryKey: queryKeys.ruleActivity });
            void client.invalidateQueries({ queryKey: ["rule-events"] });
        }
    }, [phase, client]);
    return useQuery({
        queryKey: queryKeys.ruleActivity,
        queryFn: fetchRuleActivity,
        refetchInterval: 30000,
    });
}
export function useRuleEvents(query: ListRuleEventsQuery) {
    const { session } = useSessionContext();
    const client = useQueryClient();
    const phase = String(session?.sync_phase ?? "");
    useEffect(() => {
        if (journalInvalidatesOnReady(phase)) {
            void client.invalidateQueries({ queryKey: ["rule-events"] });
        }
    }, [phase, client]);
    return useQuery({
        queryKey: queryKeys.ruleEvents(query),
        queryFn: () => fetchRuleEvents(query),
        refetchInterval: 30000,
    });
}
export function useAckIncident() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (incidentId: string) => ackIncident(incidentId),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: queryKeys.ruleActivity });
            void client.invalidateQueries({ queryKey: ["rule-events"] });
        },
    });
}
function useInvalidateRules() {
    const client = useQueryClient();
    return () => {
        void client.invalidateQueries({ queryKey: queryKeys.rules });
        void client.invalidateQueries({ queryKey: ["rule-nodes"] });
        void client.invalidateQueries({ queryKey: queryKeys.doNotTouch });
    };
}
export function useCreateRule() {
    const invalidate = useInvalidateRules();
    return useMutation({
        mutationFn: (input: Omit<Rule, "id">) => createRule(input),
        onSuccess: invalidate,
    });
}
export function useUpdateRule() {
    const invalidate = useInvalidateRules();
    return useMutation({
        mutationFn: ({ ruleId, input }: {
            ruleId: string;
            input: Partial<Rule>;
        }) => updateRule(ruleId, input),
        onSuccess: invalidate,
    });
}
export function useDeleteRule() {
    const invalidate = useInvalidateRules();
    return useMutation({
        mutationFn: (ruleId: string) => deleteRule(ruleId),
        onSuccess: invalidate,
    });
}
export function useApproveRule() {
    const invalidate = useInvalidateRules();
    return useMutation({
        mutationFn: (ruleId: string) => approveRule(ruleId),
        onSuccess: invalidate,
    });
}
export function useRejectRule() {
    const invalidate = useInvalidateRules();
    return useMutation({
        mutationFn: (ruleId: string) => rejectRule(ruleId),
        onSuccess: invalidate,
    });
}
