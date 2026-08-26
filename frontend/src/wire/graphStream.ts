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

export const GraphStreamInboundType = {
    READY: "ready",
    NODES: "nodes",
    EDGES: "edges",
    VIEW_DELTA: "view_delta",
    GRAPH_DELTA: "graph_delta",
    GRAPH_UPGRADED: "graph_upgraded",
    COMPLETE: "complete",
    ERROR: "error",
} as const;
export const GraphReadyMode = {
    LIVE: "live",
    COLD_WAIT: "cold_wait",
} as const;
export type GraphReadyMode = (typeof GraphReadyMode)[keyof typeof GraphReadyMode];
export const ReadyStatusKind = {
    COLD_WAIT: "cold_wait",
    LIVE: "live",
    WAITING: "waiting",
    READY: "ready",
} as const;
export const GraphStreamPhase = {
    BOOTSTRAP: "bootstrap",
} as const;
export const GraphDeltaOp = {
    ADD_NODE: "add_node",
    ADD_EDGE: "add_edge",
    UPGRADE_EDGE: "upgrade_edge",
    REMOVE_SUBGRAPH: "remove_subgraph",
    ATTACH_LAYER: "attach_layer",
} as const;
export const GraphStreamErrorCode = {
    GRAPH_UNAVAILABLE: "graph_unavailable",
    PROXY_FAILED: "proxy_failed",
    SOCKET_ERROR: "socket_error",
    BAD_JSON: "bad_json",
    HANDLER_FAILED: "handler_failed",
} as const;
export const CanonicalReloadReason = {
    GRAPH_RELOAD: "graph-reload",
    POLL_READY: "poll-ready",
    GRAPH_UPGRADED: "graph-upgraded",
    SESSION_READY: "session-ready",
} as const;
