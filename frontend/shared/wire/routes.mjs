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

export const LocalRoutes = Object.freeze({
    SESSION: "/api/session",
    SESSION_EVENTS: "/api/session/events",
    PROJECT_PICK: "/api/project/pick",
    PROJECT_SYNC: "/api/project/sync",
    DEBUG_VIEWER: "/api/debug/viewer",
    WS_GRAPH: "/ws/graph",
    VIEWER_MOUNT: "/viewer/",
    AUTH_CALLBACK: "/auth/callback",
    AGENTS_SETUP: "/api/agents/setup",
    AGENTS_MINT_TOKEN: "/api/agents/mint-token",
    AGENTS_REGENERATE_TOKEN: "/api/agents/regenerate-token",
    AGENTS_SKILL_INSTALL: "/api/agents/skill/install",
});
export const ViewerProxyRoutes = Object.freeze({
    SNAPSHOT_META: "/nebula/snapshot/meta",
    NODE_DETAIL: "/nebula/nodes/{node_id}/detail",
    ARCH_GLOBAL: "/nebula/arch/global",
    ARCH_SCORES: "/nebula/arch/scores",
    ARCH_ACTIONS: "/nebula/arch/actions",
    RESOLVED_METHODS: "/nebula/resolved/methods",
    RESOLVED_HAPPENS_BEFORE: "/nebula/resolved/happens-before",
});
export const StorageKeys = Object.freeze({
    NEBULA_OPEN: "dont-break/nebula-open",
});
export const SessionKeyFallback = Object.freeze({
    WORKSPACE: "ws",
    PROJECT: "none",
});
export const SnapshotLayers = Object.freeze({
    DEFAULT: "arch,cfg,resolved",
});
