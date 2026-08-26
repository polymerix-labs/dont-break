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

import { useSyncExternalStore } from "react";
import type { AgentSetup } from "../../api/client";
import type { MessageKey } from "../../i18n";
export type AgentTargetId = "cursor" | "claude-code" | "claude-desktop" | "ci" | "other";
export type AgentTarget = {
    id: AgentTargetId;
    label?: string;
    labelKey?: MessageKey;
    mcpConfigPath: string | null;
    promptHintKey: MessageKey;
};
export const AGENT_TARGETS: AgentTarget[] = [
    {
        id: "cursor",
        label: "Cursor",
        mcpConfigPath: ".cursor/mcp.json",
        promptHintKey: "agents.promptHint.chat",
    },
    {
        id: "claude-code",
        label: "Claude Code",
        mcpConfigPath: ".mcp.json",
        promptHintKey: "agents.promptHint.chat",
    },
    {
        id: "claude-desktop",
        label: "Claude Desktop",
        mcpConfigPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
        promptHintKey: "agents.promptHint.chat",
    },
    {
        id: "ci",
        label: "CI",
        mcpConfigPath: null,
        promptHintKey: "agents.promptHint.ci",
    },
    {
        id: "other",
        labelKey: "agents.otherMcp",
        mcpConfigPath: "mcp.json",
        promptHintKey: "agents.promptHint.chat",
    },
];
export function agentTargetById(id: AgentTargetId): AgentTarget {
    return AGENT_TARGETS.find((t) => t.id === id) ?? AGENT_TARGETS[0];
}
export function buildMcpSnippet(setup: AgentSetup): string {
    return JSON.stringify(setup.mcp_config, null, 2);
}
const STORAGE_KEY = "dont-break.agent";
function isAgentTargetId(value: unknown): value is AgentTargetId {
    return AGENT_TARGETS.some((t) => t.id === value);
}
function detectAgentTarget(): AgentTargetId | null {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && isAgentTargetId(saved))
            return saved;
    }
    catch {
    }
    return null;
}
let current: AgentTargetId | null = null;
let initialized = false;
const listeners = new Set<() => void>();
export function getChosenAgentTarget(): AgentTargetId | null {
    if (!initialized) {
        current = detectAgentTarget();
        initialized = true;
    }
    return current;
}
export function getAgentTarget(): AgentTargetId {
    return getChosenAgentTarget() ?? "cursor";
}
export function setAgentTarget(id: AgentTargetId): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, id);
    }
    catch {
    }
    current = id;
    initialized = true;
    for (const listener of listeners)
        listener();
}
function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
export function useAgentTarget(): AgentTargetId {
    return useSyncExternalStore(subscribe, getAgentTarget);
}
export function useChosenAgentTarget(): AgentTargetId | null {
    return useSyncExternalStore(subscribe, getChosenAgentTarget);
}
