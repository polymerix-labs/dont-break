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

import { HOST_SOURCE, HostMessageType, VIEWER_PROTOCOL_VERSION, VIEWER_SOURCE, ViewerEmbedParams, ViewerEmbedValues, ViewerMessageType, } from './wire/hostProtocol.mjs';
import { ArchSeverity } from './wire/archSeverity.mjs';
import { NebulaElementId } from './wire/domIds.mjs';
function hostMode() {
    if (typeof window === 'undefined' || typeof location === 'undefined')
        return false;
    const qs = new URLSearchParams(location.search);
    if (qs.get(ViewerEmbedParams.STANDALONE) === ViewerEmbedValues.ENABLED)
        return false;
    if (qs.get(ViewerEmbedParams.EMBED) === ViewerEmbedValues.ENABLED)
        return true;
    return window.parent !== window;
}
let searchPickHandler = null;
let graphReloadHandler = null;
let sessionUpdateHandler = null;
let overlayHandlers = null;
export function isEmbed() {
    return hostMode();
}
export function bindSearchPick(fn) {
    searchPickHandler = fn;
}
export function bindGraphReload(fn) {
    graphReloadHandler = fn;
}
export function bindSessionUpdate(fn) {
    sessionUpdateHandler = fn;
}
export function bindOverlayHandlers(handlers) {
    overlayHandlers = handlers;
}
export function notifyNodeSelected(nodeId, name, nodeType) {
    notifyHost(ViewerMessageType.NODE_SELECTED, { nodeId, name, nodeType });
}
export function notifyHost(type, payload = {}) {
    if (!hostMode() || window.parent === window)
        return;
    window.parent.postMessage({ source: VIEWER_SOURCE, type, protocolVersion: VIEWER_PROTOCOL_VERSION, ...payload }, location.origin);
}
export function syncToolbar() {
    if (!hostMode())
        return;
    const btnState = (id) => {
        const el = document.getElementById(id);
        if (!el || el.classList.contains('hidden'))
            return null;
        return {
            id,
            label: el.textContent?.trim() || id,
            active: el.classList.contains('active'),
            title: el.title || '',
        };
    };
    const hud = document.getElementById(NebulaElementId.ARCH_HUD);
    const sEl = document.getElementById(NebulaElementId.ARCH_STABILITY);
    const nEl = document.getElementById(NebulaElementId.ARCH_NAVIGABILITY);
    const archVisible = Boolean(hud && !hud.classList.contains('hidden'));
    notifyHost(ViewerMessageType.TOOLBAR_SYNC, {
        tools: {
            hb: !document.getElementById(NebulaElementId.HB_TOGGLE)?.classList.contains('hidden'),
            edges: btnState(NebulaElementId.NEBULA_EDGES),
            externals: btnState(NebulaElementId.NEBULA_EXTERNALS),
            heat: btnState(NebulaElementId.ARCH_HEAT),
            actions: btnState(NebulaElementId.ARCH_ACTIONS_TOGGLE),
            arch: archVisible
                ? {
                    stability: sEl?.textContent?.trim() || '',
                    navigability: nEl?.textContent?.trim() || '',
                    stabilitySev: severityClass(sEl),
                    navigabilitySev: severityClass(nEl),
                }
                : null,
        },
    });
}
function severityClass(el) {
    if (!el)
        return '';
    if (el.classList.contains(ArchSeverity.GOOD))
        return ArchSeverity.GOOD;
    if (el.classList.contains(ArchSeverity.MID))
        return ArchSeverity.MID;
    if (el.classList.contains(ArchSeverity.BAD))
        return ArchSeverity.BAD;
    return '';
}
export function initHostBridge() {
    if (!hostMode())
        return;
    window.addEventListener('message', (ev) => {
        if (ev.origin !== location.origin)
            return;
        const msg = ev.data;
        if (!msg || msg.source !== HOST_SOURCE)
            return;
        if (msg.type === HostMessageType.SEARCH_INPUT) {
            const input = document.getElementById(NebulaElementId.SEARCH);
            if (input) {
                input.value = msg.query || '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return;
        }
        if (msg.type === HostMessageType.SEARCH_PICK) {
            if (typeof msg.index === 'number' && searchPickHandler) {
                searchPickHandler(msg.index);
                notifyHost(ViewerMessageType.SEARCH_RESULTS, { items: [] });
            }
            return;
        }
        if (msg.type === HostMessageType.TOOLBAR_CLICK && typeof msg.id === 'string') {
            document.getElementById(msg.id)?.click();
            window.setTimeout(syncToolbar, 0);
            return;
        }
        if (msg.type === HostMessageType.GRAPH_RELOAD) {
            graphReloadHandler?.();
            return;
        }
        if (msg.type === HostMessageType.SESSION_UPDATE && msg.session) {
            sessionUpdateHandler?.(msg.session);
            return;
        }
        if (msg.type === HostMessageType.OVERLAY_ZONE) {
            overlayHandlers?.onZone?.(msg);
            return;
        }
        if (msg.type === HostMessageType.OVERLAY_PATH) {
            overlayHandlers?.onPath?.(msg);
            return;
        }
        if (msg.type === HostMessageType.OVERLAY_CANDIDATES) {
            overlayHandlers?.onCandidates?.(msg);
            return;
        }
        if (msg.type === HostMessageType.OVERLAY_REJECTED) {
            overlayHandlers?.onRejected?.(msg);
            return;
        }
        if (msg.type === HostMessageType.SIMULATION_PROBE) {
            overlayHandlers?.onProbe?.(msg);
            return;
        }
        if (msg.type === HostMessageType.SIMULATION_IMPACT) {
            overlayHandlers?.onImpact?.(msg);
            return;
        }
        if (msg.type === HostMessageType.SIMULATION_SHIELD) {
            overlayHandlers?.onShield?.(msg);
            return;
        }
        if (msg.type === HostMessageType.SIMULATION_CELEBRATE) {
            overlayHandlers?.onCelebrate?.();
            return;
        }
        if (msg.type === HostMessageType.OVERLAY_CLEAR) {
            overlayHandlers?.onClear?.();
            return;
        }
        if (msg.type === HostMessageType.FOCUS_NODE && typeof msg.nodeId === 'string') {
            overlayHandlers?.onFocusNode?.(msg);
        }
    });
    notifyHost(ViewerMessageType.VIEWER_READY);
}
export { VIEWER_PROTOCOL_VERSION };
