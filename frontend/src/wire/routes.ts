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

export const LocalRoutes = {
    SESSION: "/api/session",
    SESSION_EVENTS: "/api/session/events",
    PROJECT_PICK: "/api/project/pick",
    PROJECTS: "/api/projects",
    PROJECT_LINK: "/api/project/link",
    PROJECT_CREATE: "/api/project/create",
    PROJECT_SYNC: "/api/project/sync",
    PROJECT_WATCH: "/api/project/watch",
    DEBUG_VIEWER: "/api/debug/viewer",
    WS_GRAPH: "/ws/graph",
    VIEWER_MOUNT: "/viewer/",
    AUTH_CALLBACK: "/auth/callback",
    AGENTS_SETUP: "/api/agents/setup",
    AGENTS_MINT_TOKEN: "/api/agents/mint-token",
    AGENTS_REGENERATE_TOKEN: "/api/agents/regenerate-token",
    AGENTS_SKILL_INSTALL: "/api/agents/skill/install",
    AGENTS_HOOK_STATUS: "/api/agents/hook/status",
    AGENTS_HOOK_INSTALL: "/api/agents/hook/install",
    LOCKDOWN: "/api/lockdown",
    LOCKDOWN_RELEASE: "/api/lockdown/release",
    LOCKDOWN_POLICY: "/api/lockdown/policy",
    TOOLS_FACTS_EXTRACT: "/api/tools/facts-extract",
    TOOLS_FACTS_EXTRACT_UPDATE: "/api/tools/facts-extract/update",
} as const;
export const StorageKeys = {
    NEBULA_OPEN: "dont-break/nebula-open",
} as const;
