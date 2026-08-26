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

export const GraphStreamInboundType = Object.freeze({
    READY: "ready",
    NODES: "nodes",
    EDGES: "edges",
    VIEW_DELTA: "view_delta",
    GRAPH_DELTA: "graph_delta",
    GRAPH_UPGRADED: "graph_upgraded",
    COMPLETE: "complete",
    ERROR: "error",
});
export const GraphStreamOutboundType = Object.freeze({
    HELLO: "hello",
    VIEW: "view",
    PING: "ping",
    WINDOW: "window",
});
export const GraphStreamPhase = Object.freeze({
    BOOTSTRAP: "bootstrap",
});
export const GraphReadyMode = Object.freeze({
    LIVE: "live",
    COLD_WAIT: "cold_wait",
});
export const GraphDeltaOp = Object.freeze({
    ADD_NODE: "add_node",
    ADD_EDGE: "add_edge",
    UPGRADE_EDGE: "upgrade_edge",
    REMOVE_SUBGRAPH: "remove_subgraph",
    ATTACH_LAYER: "attach_layer",
});
export const GraphStreamErrorCode = Object.freeze({
    GRAPH_UNAVAILABLE: "graph_unavailable",
    PROXY_FAILED: "proxy_failed",
    SOCKET_ERROR: "socket_error",
    BAD_JSON: "bad_json",
    HANDLER_FAILED: "handler_failed",
});
export const GraphStreamDefaults = Object.freeze({
    PROTOCOL_VERSION: 1,
    DEFAULT_MAX_NODES: 8000,
    DEFAULT_MAX_EDGES: 32000,
    VIEW_DEBOUNCE_MS: 200,
    RESUME_FROM_VERSION: 0,
});
export const CanonicalReloadReason = Object.freeze({
    GRAPH_RELOAD: "graph-reload",
    POLL_READY: "poll-ready",
    GRAPH_UPGRADED: "graph-upgraded",
    SESSION_READY: "session-ready",
});
export const ReadyStatusKind = Object.freeze({
    COLD_WAIT: "cold_wait",
    LIVE: "live",
    WAITING: "waiting",
    READY: "ready",
});
