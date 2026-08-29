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

import { LocalRoutes } from "../wire/routes";
import type { SessionSnapshot } from "./session";
async function parseJson<T>(res: Response): Promise<T> {
    return (await res.json()) as T;
}
export async function fetchSession(): Promise<SessionSnapshot | null> {
    const res = await fetch(LocalRoutes.SESSION);
    if (!res.ok)
        return null;
    return parseJson<SessionSnapshot>(res);
}
export async function pickProject(): Promise<{
    path: string;
    project_id: string;
    project_slug: string;
    workspace_id: string;
}> {
    const res = await fetch(LocalRoutes.PROJECT_PICK, { method: "POST" });
    const body = await parseJson<{
        path?: string;
        project_id?: string;
        project_slug?: string;
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Project pick failed.");
    return {
        path: body.path ?? "",
        project_id: body.project_id ?? "",
        project_slug: body.project_slug ?? "",
        workspace_id: (body as {
            workspace_id?: string;
        }).workspace_id ?? "",
    };
}
export async function syncProject(): Promise<{
    saved: boolean;
}> {
    const res = await fetch(LocalRoutes.PROJECT_SYNC, { method: "POST" });
    const body = await parseJson<{
        saved?: boolean;
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Sync failed.");
    return { saved: body.saved === true };
}
export type RegisteredProject = {
    id: string;
    project_id?: string;
    slug?: string;
    display_name?: string;
    displayName?: string;
    workspace_id?: string;
};
export async function listProjects(): Promise<RegisteredProject[]> {
    const res = await fetch(LocalRoutes.PROJECTS);
    const body = await parseJson<{
        projects?: RegisteredProject[];
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not load projects.");
    return body.projects ?? [];
}
export async function linkProject(project: RegisteredProject): Promise<void> {
    const res = await fetch(LocalRoutes.PROJECT_LINK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            project_id: project.id || project.project_id,
            slug: project.slug,
            display_name: project.display_name || project.displayName,
        }),
    });
    const body = await parseJson<{
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not link project.");
}
export async function createProject(displayName: string): Promise<void> {
    const res = await fetch(LocalRoutes.PROJECT_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
    });
    const body = await parseJson<{
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not create project.");
}
export interface AgentSetup {
    authenticated: boolean;
    token_valid: boolean;
    project_selected: boolean;
    ready: boolean;
    ready_to_mint: boolean;
    has_mcp_secret: boolean;
    existing_token_id?: string;
    existing_token_created_at?: string | null;
    api_url: string;
    workspace_id: string;
    project_id: string;
    project_slug: string;
    mcp_config: Record<string, unknown>;
    cli_snippet: string;
    cli_package: string;
    mcp_package: string;
    hook_installed?: boolean;
    hook_manual?: string;
    hook_command?: string;
}
export type MintedAgentToken = {
    token_id: string;
    secret: string;
    api_url: string;
    workspace_id: string;
    project_id: string;
    mcp_config: Record<string, unknown>;
    cli_snippet: string;
    cli_package: string;
    mcp_package: string;
};
export async function fetchAgentSetup(): Promise<AgentSetup | null> {
    const res = await fetch(LocalRoutes.AGENTS_SETUP);
    if (!res.ok)
        return null;
    return parseJson<AgentSetup>(res);
}
export async function mintAgentToken(target: string = "cursor"): Promise<MintedAgentToken> {
    const res = await fetch(LocalRoutes.AGENTS_MINT_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
    });
    const body = await parseJson<Partial<MintedAgentToken> & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not create agent token.");
    if (!body.token_id || !body.secret || !body.mcp_config) {
        throw new Error("Incomplete token response.");
    }
    return {
        token_id: body.token_id,
        secret: body.secret,
        api_url: body.api_url ?? "",
        workspace_id: body.workspace_id ?? "",
        project_id: body.project_id ?? "",
        mcp_config: body.mcp_config,
        cli_snippet: body.cli_snippet ?? "",
        cli_package: body.cli_package ?? "",
        mcp_package: body.mcp_package ?? "",
    };
}
export async function regenerateAgentToken(previousTokenId: string, target: string = "cursor"): Promise<MintedAgentToken> {
    const res = await fetch(LocalRoutes.AGENTS_REGENERATE_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previous_token_id: previousTokenId, target }),
    });
    const body = await parseJson<Partial<MintedAgentToken> & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not regenerate agent token.");
    if (!body.token_id || !body.secret || !body.mcp_config) {
        throw new Error("Incomplete token response.");
    }
    return {
        token_id: body.token_id,
        secret: body.secret,
        api_url: body.api_url ?? "",
        workspace_id: body.workspace_id ?? "",
        project_id: body.project_id ?? "",
        mcp_config: body.mcp_config,
        cli_snippet: body.cli_snippet ?? "",
        cli_package: body.cli_package ?? "",
        mcp_package: body.mcp_package ?? "",
    };
}
export async function installAgentSkill(): Promise<{
    path: string;
    outcome: string;
}> {
    const res = await fetch(LocalRoutes.AGENTS_SKILL_INSTALL, { method: "POST" });
    const body = await parseJson<{
        path?: string;
        outcome?: string;
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Skill install failed.");
    return { path: body.path ?? "", outcome: body.outcome ?? "" };
}
export async function installAgentHook(): Promise<{
    path: string;
    outcome: string;
    command: string;
    manual: string;
    installed: boolean;
}> {
    const res = await fetch(LocalRoutes.AGENTS_HOOK_INSTALL, { method: "POST" });
    const body = await parseJson<{
        path?: string;
        outcome?: string;
        command?: string;
        manual?: string;
        installed?: boolean;
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Hook install failed.");
    return {
        path: body.path ?? "",
        outcome: body.outcome ?? "",
        command: body.command ?? "",
        manual: body.manual ?? "",
        installed: body.installed !== false,
    };
}
export async function fetchLockdown(): Promise<LockdownStatus> {
    const res = await fetch(LocalRoutes.LOCKDOWN);
    if (!res.ok) {
        return {
            locked: false,
            scope: "session",
            remaining_sec: null,
            policy: { scope: "session", ttl_sec: 1800 },
        };
    }
    return parseJson<LockdownStatus>(res);
}
export async function releaseLockdown(): Promise<LockdownStatus> {
    const res = await fetch(LocalRoutes.LOCKDOWN_RELEASE, { method: "POST" });
    const body = await parseJson<LockdownStatus & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not release.");
    return body;
}
export async function saveLockdownPolicy(policy: {
    scope: "session" | "project";
    ttl_sec: number;
}): Promise<LockdownStatus> {
    const res = await fetch(LocalRoutes.LOCKDOWN_POLICY, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
    });
    const body = await parseJson<LockdownStatus & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not save lock policy.");
    return body;
}
export type LockdownStatus = {
    locked: boolean;
    scope: "session" | "project";
    remaining_sec: number | null;
    policy: {
        scope: "session" | "project";
        ttl_sec: number;
    };
};
export type FactsExtractStatus = {
    package: string;
    installed: string | null;
    latest: string | null;
    update_available: boolean;
    overridden: boolean;
    error?: string;
};
export async function fetchFactsExtractStatus(): Promise<FactsExtractStatus | null> {
    const res = await fetch(LocalRoutes.TOOLS_FACTS_EXTRACT);
    if (!res.ok)
        return null;
    return parseJson<FactsExtractStatus>(res);
}
export type SupportContext = {
    organization: string;
    project: string;
    app_version: string;
    facts_extract: string;
    npm: string;
};
export async function fetchSupportContext(): Promise<SupportContext | null> {
    const res = await fetch(LocalRoutes.SUPPORT);
    if (!res.ok)
        return null;
    return parseJson<SupportContext>(res);
}
export async function sendSupport(body: {
    kind: "bug" | "idea" | "question";
    email: string;
    message: string;
}): Promise<void> {
    const res = await fetch(LocalRoutes.SUPPORT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const payload = await parseJson<{
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(payload.error || "Could not send that.");
}
export async function updateFactsExtract(): Promise<FactsExtractStatus> {
    const res = await fetch(LocalRoutes.TOOLS_FACTS_EXTRACT_UPDATE, { method: "POST" });
    const body = await parseJson<FactsExtractStatus>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not update facts-extract.");
    return body;
}
export type WriteModeStatus = {
    mode: "watch" | "hard";
    folder: string;
    hard: boolean;
    covers_all_tools?: boolean;
};
export async function fetchWriteMode(): Promise<WriteModeStatus> {
    const res = await fetch(LocalRoutes.WRITE_MODE);
    if (!res.ok)
        return { mode: "watch", folder: "", hard: false };
    return parseJson<WriteModeStatus>(res);
}
export async function saveWriteMode(mode: "watch" | "hard"): Promise<WriteModeStatus> {
    const res = await fetch(LocalRoutes.WRITE_MODE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
    });
    const body = await parseJson<WriteModeStatus & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not save write mode.");
    return body;
}
export type IncidentDiff = {
    available: boolean;
    reason: string;
    diff: string;
};
export async function fetchIncidentDiff(files: string[]): Promise<IncidentDiff> {
    const params = new URLSearchParams();
    for (const file of files)
        params.append("file", file);
    const res = await fetch(`${LocalRoutes.INCIDENT_DIFF}?${params.toString()}`);
    if (!res.ok)
        return { available: false, reason: "failed", diff: "" };
    return parseJson<IncidentDiff>(res);
}
export type HookObservation = {
    at?: number;
    model?: string;
    tool_name?: string;
    relative_path?: string;
    permission?: string;
};
export async function fetchHookObservations(): Promise<HookObservation[]> {
    const res = await fetch(LocalRoutes.HOOK_OBSERVATIONS);
    if (!res.ok)
        return [];
    const body = await parseJson<{
        observations?: HookObservation[];
    }>(res);
    return body.observations ?? [];
}
export async function setLiveSync(enabled: boolean): Promise<SessionSnapshot> {
    const res = await fetch(LocalRoutes.PROJECT_WATCH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
    });
    const body = await parseJson<SessionSnapshot & {
        error?: string;
    }>(res);
    if (!res.ok)
        throw new Error(body.error || "Could not update live sync.");
    return body;
}
