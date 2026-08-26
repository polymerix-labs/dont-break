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

export const VIEWER_PROTOCOL_VERSION = 4;
export const HOST_SOURCE = "dont-break-host";
export const VIEWER_SOURCE = "dont-break-viewer";
export const HostMessageType = {
    SEARCH_INPUT: "search-input",
    SEARCH_PICK: "search-pick",
    TOOLBAR_CLICK: "toolbar-click",
    GRAPH_RELOAD: "graph-reload",
    SESSION_UPDATE: "session-update",
    OVERLAY_ZONE: "overlay-zone",
    OVERLAY_PATH: "overlay-path",
    OVERLAY_CLEAR: "overlay-clear",
    FOCUS_NODE: "focus-node",
    OVERLAY_CANDIDATES: "overlay-candidates",
    OVERLAY_REJECTED: "overlay-rejected",
    SIMULATION_PROBE: "simulation-probe",
    SIMULATION_IMPACT: "simulation-impact",
    SIMULATION_SHIELD: "simulation-shield",
    SIMULATION_CELEBRATE: "simulation-celebrate",
} as const;
export const ViewerMessageType = {
    VIEWER_READY: "viewer-ready",
    TOOLBAR_SYNC: "toolbar-sync",
    SEARCH_RESULTS: "search-results",
    NODE_SELECTED: "node-selected",
} as const;
export const ViewerEmbedParams = {
    EMBED: "embed",
    STANDALONE: "standalone",
    VERSION: "v",
} as const;
export const ViewerEmbedValues = {
    ENABLED: "1",
} as const;
