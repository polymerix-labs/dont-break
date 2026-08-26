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

import type { SessionSnapshot } from "../api/session";
import { HOST_SOURCE, HostMessageType, VIEWER_PROTOCOL_VERSION, VIEWER_SOURCE, ViewerMessageType, } from "../wire/hostProtocol";
export type { SessionSnapshot };
export { HOST_SOURCE, HostMessageType, VIEWER_PROTOCOL_VERSION, VIEWER_SOURCE, ViewerMessageType, };
export type ToolbarButton = {
    id: string;
    label: string;
    active: boolean;
    title: string;
};
export type ArchHud = {
    stability: string;
    navigability: string;
    stabilitySev: string;
    navigabilitySev: string;
};
export type ToolbarTools = {
    hb: boolean;
    edges: ToolbarButton | null;
    externals: ToolbarButton | null;
    heat: ToolbarButton | null;
    actions: ToolbarButton | null;
    arch: ArchHud | null;
};
export type SearchHit = {
    index: number;
    name: string;
    type: string;
};
export type ZoneHaloNode = {
    id: string;
    distance: number;
};
export type ProbeOutcome = "intercepted" | "breach" | "allowed" | "over_block" | "info";
export type HostToViewerMessage = {
    source: typeof HOST_SOURCE;
    type: "search-input";
    query: string;
} | {
    source: typeof HOST_SOURCE;
    type: "search-pick";
    index: number;
} | {
    source: typeof HOST_SOURCE;
    type: "toolbar-click";
    id: string;
} | {
    source: typeof HOST_SOURCE;
    type: "graph-reload";
} | {
    source: typeof HOST_SOURCE;
    type: "session-update";
    session: SessionSnapshot;
} | {
    source: typeof HOST_SOURCE;
    type: "overlay-zone";
    overlayId: string;
    core: string[];
    halo: ZoneHaloNode[];
} | {
    source: typeof HOST_SOURCE;
    type: "overlay-path";
    overlayId: string;
    nodes: string[];
} | {
    source: typeof HOST_SOURCE;
    type: "overlay-clear";
} | {
    source: typeof HOST_SOURCE;
    type: "focus-node";
    nodeId: string;
} | {
    source: typeof HOST_SOURCE;
    type: "overlay-candidates";
    overlayId: string;
    nodes: string[];
    rejected?: string[];
} | {
    source: typeof HOST_SOURCE;
    type: "overlay-rejected";
    overlayId: string;
    nodes: string[];
} | {
    source: typeof HOST_SOURCE;
    type: "simulation-probe";
    probeId: string;
    nodes: string[];
    verdict?: "block" | "ok";
    outcome?: ProbeOutcome;
    freeze?: boolean;
} | {
    source: typeof HOST_SOURCE;
    type: "simulation-impact";
    nodeId: string;
    verdict: "block" | "ok";
    outcome?: ProbeOutcome;
    freeze?: boolean;
} | {
    source: typeof HOST_SOURCE;
    type: "simulation-shield";
    overlayId: string;
    core: string[];
    halo: ZoneHaloNode[];
} | {
    source: typeof HOST_SOURCE;
    type: "simulation-celebrate";
};
export type ViewerToHostMessage = {
    source: typeof VIEWER_SOURCE;
    type: "viewer-ready";
    protocolVersion: number;
} | {
    source: typeof VIEWER_SOURCE;
    type: "toolbar-sync";
    tools: ToolbarTools;
} | {
    source: typeof VIEWER_SOURCE;
    type: "search-results";
    items: SearchHit[];
} | {
    source: typeof VIEWER_SOURCE;
    type: "node-selected";
    nodeId: string;
    name: string;
    nodeType: string;
};
export function isViewerMessage(data: unknown): data is ViewerToHostMessage {
    if (!data || typeof data !== "object")
        return false;
    const msg = data as Record<string, unknown>;
    return msg.source === VIEWER_SOURCE && typeof msg.type === "string";
}
export function postToViewer(iframe: HTMLIFrameElement | null, message: HostToViewerMessage): void {
    if (!iframe?.contentWindow)
        return;
    iframe.contentWindow.postMessage(message, window.location.origin);
}
