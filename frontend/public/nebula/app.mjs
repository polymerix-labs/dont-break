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

import { buildModel, createPartialGraph, mergeEdgeBatch, mergeGraphDeltaOps, mergeNodeBatch, mergeViewDelta, reconcilePartialGraph, EDGE_KINDS } from './GraphData.mjs';
import { buildModuleGraph, deriveViewModel, mapIdsToView, dominantModuleForIds, expandModule, collapseToOverview, viewStatusLabel, isModuleNodeId, moduleLabelFromId, } from './moduleGraph.mjs';
import { GraphStreamClient } from './GraphStreamClient.mjs';
import { edgeLegendEntries } from './colors.mjs';
import { NebulaRenderer } from './NebulaRenderer.mjs';
import { openNodePanel, closePanel, setupSearch, setStatus, setStatusNotice, setSyncProgress, clearSyncProgress } from './ui.mjs';
import { progressFromSnapshot } from './syncProgress.mjs';
import { CONNECTION_GIVEN_UP, CONNECTION_LOST, GraphViewState, effectiveSyncSessionId, graphNotDrawnNotice, graphStreamErrorNotice, graphViewNotice, graphViewState, hasReadableSnapshot, isDeltaSyncInProgress, isSyncInProgress, lastSyncFailed, readyStatusFromMessage, readyStatusLabel, sessionUnreadableNotice, shouldConnectGraphStream, shouldFullRelayout, } from './graphSessionPolicy.mjs';
import { initHostBridge, syncToolbar, bindGraphReload, bindSessionUpdate, bindOverlayHandlers, notifyNodeSelected, isEmbed, } from './hostBridge.mjs';
import { applyZoneOverlay, applyImpactOverlay, applyPathOverlay, applyCandidatesOverlay, applyRejectedOverlay, applyShieldOverlay, applySimulationProbe, applySimulationImpact, applyLiveOverlay, confirmLiveOverlay, clearOverlay, setLiveClearedHandler, touchedNodeIdsFromOps, } from './overlays.mjs';
import { mountHbPanel, setViewerMeta } from './ResolvedPanel.mjs';
import { initArchGlobal, initViewerMeta, resetViewerMeta, mountActionsPanel, mountGlobalHud, fetchArchScores, } from './ArchPanel.mjs';
import { SyncPhase } from './wire/sync.mjs';
import { CanonicalReloadReason, GraphStreamErrorCode, GraphStreamPhase, ReadyStatusKind, } from './wire/graphStream.mjs';
import { LocalRoutes } from './wire/routes.mjs';
import { Timing } from './wire/timing.mjs';
const MAX_NODES = Infinity;
const MAX_EDGES = Infinity;
let renderer = null;
let fullModel = null;
let moduleGraph = null;
let viewState = { openModuleId: (null), showExternals: true };
let model = null;
let forceIncludeIds = new Set();
let liveForceIncludeIds = new Set();
let preserveCameraOnView = false;
function el(id) {
    return document.getElementById(id);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const HOVER_THROTTLE_MS = 30;
let hoverThrottleTimer = null;
let lastHoverIndex = null;
function clearHoverLabel() {
    const label = el('hover-label');
    if (!label)
        return;
    label.classList.remove('visible');
    label.innerHTML = '';
    label.setAttribute('aria-hidden', 'true');
}
function showHoverLabel(clientX, clientY, index) {
    const label = el('hover-label');
    if (!label || !model)
        return;
    const name = model.names[index] || model.ids[index];
    const type = model.types[index] || '';
    label.innerHTML = `${escapeHtml(name)}<span class="hover-type">${escapeHtml(type)}</span>`;
    label.style.left = `${clientX}px`;
    label.style.top = `${clientY}px`;
    label.classList.add('visible');
    label.setAttribute('aria-hidden', 'false');
}
function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function applyModuleView(opts = {}) {
    if (!fullModel || !moduleGraph)
        return;
    const autoFit = opts.autoFit !== false && !preserveCameraOnView;
    preserveCameraOnView = false;
    const prevPositions = renderer?._positions;
    const prevModel = model;
    const next = deriveViewModel(fullModel, moduleGraph, {
        openModuleId: viewState.openModuleId,
        showExternals: viewState.showExternals,
        forceIncludeIds: new Set([...forceIncludeIds, ...liveForceIncludeIds]),
    });
    const positions = next.seedPositions.slice();
    if (prevModel && prevPositions) {
        for (let i = 0; i < next.ids.length; i++) {
            const j = prevModel.index.get(next.ids[i]);
            if (j === undefined)
                continue;
            positions[i * 3] = prevPositions[j * 3];
            positions[i * 3 + 1] = prevPositions[j * 3 + 1];
            positions[i * 3 + 2] = prevPositions[j * 3 + 2];
        }
    }
    model = next;
    ensureRenderer();
    renderer.setAllRevealed();
    renderer.setData(model, positions, {
        autoFit: false,
        revealNewIds: opts.revealNewIds,
    });
    if (autoFit)
        renderer.frameToFit();
    wireEdgesToggle();
    wireExternalsToggle();
    wireSearchForLod();
    syncToolbar();
    const base = viewStatusLabel(model);
    setStatus(opts.statusDetail ? `${base} · ${opts.statusDetail}` : base);
    if (opts.playGenesis)
        void playGenesis();
}
function commitFullModel(nextFull, opts = {}) {
    fullModel = nextFull;
    moduleGraph = buildModuleGraph(fullModel);
    if (viewState.openModuleId &&
        !moduleGraph.moduleIndexByLabel.has(viewState.openModuleId)) {
        viewState = collapseToOverview(viewState);
    }
    applyModuleView(opts);
}
function openModule(labelOrId) {
    const label = isModuleNodeId(labelOrId)
        ? moduleLabelFromId(labelOrId)
        : labelOrId;
    if (!label || !moduleGraph?.moduleIndexByLabel.has(label))
        return;
    viewState = expandModule(viewState, label);
    forceIncludeIds = new Set();
    preserveCameraOnView = true;
    applyModuleView({ autoFit: true, statusDetail: 'double-click background or Esc to collapse' });
    if (model) {
        let best = -1;
        for (let i = 0; i < model.ids.length; i++) {
            if (model.isMeta[i])
                continue;
            if (best < 0 || model.degree[i] > model.degree[best])
                best = i;
        }
        if (best >= 0)
            renderer?.focusNode(best);
        else
            renderer?.frameToFitSmooth?.(0.9);
    }
}
function closeModuleView() {
    if (!viewState.openModuleId)
        return;
    viewState = collapseToOverview(viewState);
    forceIncludeIds = new Set();
    applyModuleView({ autoFit: true });
}
function ensureModulesForIds(nodeIds) {
    if (!fullModel || !moduleGraph)
        return;
    const ids = [...nodeIds];
    if (!ids.length)
        return;
    const dominant = dominantModuleForIds(moduleGraph, fullModel, ids);
    if (!dominant)
        return;
    forceIncludeIds = new Set(ids);
    if (viewState.openModuleId !== dominant) {
        viewState = expandModule(viewState, dominant);
        preserveCameraOnView = true;
        applyModuleView({ autoFit: false });
    }
    else if ([...forceIncludeIds].some((id) => !model?.index.has(id))) {
        preserveCameraOnView = true;
        applyModuleView({ autoFit: false });
    }
}
function revealLiveTouched(touched) {
    if (!fullModel || !moduleGraph || !renderer || !touched.size)
        return;
    const realTouched = new Set();
    for (const id of touched) {
        if (fullModel.index.has(id))
            realTouched.add(id);
    }
    if (!realTouched.size)
        return;
    let needsView = false;
    for (const id of realTouched) {
        if (!liveForceIncludeIds.has(id)) {
            liveForceIncludeIds.add(id);
            needsView = true;
        }
        if (!model?.index.has(id))
            needsView = true;
    }
    if (needsView) {
        preserveCameraOnView = true;
        applyModuleView({
            autoFit: false,
            revealNewIds: realTouched,
        });
    }
    const haloIds = new Set(realTouched);
    for (const id of mapIdsToView(moduleGraph, fullModel, realTouched, viewState.openModuleId)) {
        haloIds.add(id);
    }
    applyLiveOverlay(renderer, model, haloIds, {
        lastUserInteractionMs: lastUserCameraInteractionMs,
        frameCamera: true,
    });
}
function clearLiveForceInclude() {
    lastLiveSyncLabel = '';
    if (!liveForceIncludeIds.size)
        return;
    liveForceIncludeIds = new Set();
    if (!fullModel || !moduleGraph)
        return;
    preserveCameraOnView = true;
    applyModuleView({ autoFit: false });
}
setLiveClearedHandler(clearLiveForceInclude);
function panelOpts() {
    return {
        onShowImpact(payload) {
            if (!renderer)
                return;
            const ids = [payload.sourceId, ...(payload.impacted || []).map((n) => n.id)];
            withOverlayModules({ nodes: ids, sourceId: payload.sourceId, impacted: payload.impacted }, () => applyImpactOverlay(renderer, model, payload));
        },
        onCallJump(fqn) {
            if (!fullModel || !fqn)
                return;
            let hit = -1;
            for (let i = 0; i < fullModel.ids.length; i++) {
                const node = fullModel.nodes[i];
                if (node?.fqn === fqn || fullModel.names[i] === fqn) {
                    hit = i;
                    break;
                }
            }
            if (hit < 0) {
                for (let i = 0; i < fullModel.ids.length; i++) {
                    const f = fullModel.nodes[i]?.fqn;
                    if (f && (f.endsWith('.' + fqn) || f.endsWith(fqn))) {
                        hit = i;
                        break;
                    }
                }
            }
            if (hit < 0)
                return;
            focusFullIndex(hit);
            void openNodePanel(fullModel, hit, panelOpts()).then((body) => wirePanelJumps(body));
        },
    };
}
function focusFullIndex(fullIndex) {
    if (!fullModel)
        return;
    const id = fullModel.ids[fullIndex];
    ensureModulesForIds([id]);
    const viewI = model?.index.get(id);
    if (viewI !== undefined) {
        renderer?.focusNode(viewI);
        renderer?.setSelectedIndex(viewI);
        notifyNodeSelected(id, fullModel.names[fullIndex], fullModel.types[fullIndex]);
    }
}
function openPanelAt(fullIndex) {
    if (!fullModel)
        return;
    focusFullIndex(fullIndex);
    void openNodePanel(fullModel, fullIndex, panelOpts()).then((body) => wirePanelJumps(body));
}
function wireSearchForLod() {
    if (!fullModel)
        return;
    setupSearch(fullModel, (fullIndex) => {
        openPanelAt(fullIndex);
    });
}
function openModulePanel(viewIndex) {
    if (!model || !moduleGraph)
        return;
    const label = model.moduleLabel?.[viewIndex] || moduleLabelFromId(model.ids[viewIndex]);
    const mi = moduleGraph.moduleIndexByLabel.get(label);
    const mod = mi != null ? moduleGraph.modules[mi] : null;
    const panel = el('panel');
    const title = el('panel-title');
    const body = el('panel-body');
    if (!panel || !title || !body || !mod)
        return;
    title.textContent = mod.shortLabel;
    const samples = mod.memberIds.slice(0, 30)
        .map((id) => {
        const fi = fullModel.index.get(id);
        const name = fi != null ? fullModel.names[fi] : id;
        const type = fi != null ? fullModel.types[fi] : '';
        return `<li data-full-id="${escapeHtml(id)}">${escapeHtml(name)} <span class="muted">· ${escapeHtml(type)}</span></li>`;
    })
        .join('');
    body.innerHTML =
        `<section class="section"><h2>Module</h2><dl class="dl">` +
            `<div class="kv"><dt>package</dt><dd>${escapeHtml(mod.label)}</dd></div>` +
            `<div class="kv"><dt>symbols</dt><dd>${mod.size}</dd></div>` +
            `<div class="kv"><dt>external</dt><dd>${mod.isExternal ? 'yes' : 'no'}</dd></div>` +
            `</dl><p class="muted">Double-click the node to expand.</p></section>` +
            `<section class="section"><h2>Symbols (${mod.size})</h2><ul class="list">${samples}</ul></section>`;
    body.onclick = (ev) => {
        const li = ev.target.closest('li[data-full-id]');
        if (!li)
            return;
        const id = li.getAttribute('data-full-id');
        if (!id)
            return;
        ensureModulesForIds([id]);
        const viewI = model?.index.get(id);
        if (viewI !== undefined) {
            renderer?.focusNode(viewI);
            renderer?.setSelectedIndex(viewI);
        }
    };
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
}
function applyHoverAt(clientX, clientY) {
    if (!renderer || !model)
        return;
    if (genesisRun || renderer.overlay) {
        if (lastHoverIndex != null) {
            lastHoverIndex = null;
            renderer.setHoverFocus(null);
            clearHoverLabel();
        }
        return;
    }
    const i = renderer.pickAt(clientX, clientY);
    const next = i >= 0 ? i : null;
    if (next === lastHoverIndex) {
        if (next != null)
            showHoverLabel(clientX, clientY, next);
        return;
    }
    lastHoverIndex = next;
    renderer.setHoverFocus(next);
    if (next == null)
        clearHoverLabel();
    else
        showHoverLabel(clientX, clientY, next);
}
function ensureRenderer() {
    if (renderer)
        return renderer;
    renderer = new NebulaRenderer(el('canvas-wrap'));
    renderer.start();
    const canvas = renderer.renderer.domElement;
    canvas.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0)
            return;
        const i = renderer.pickAt(ev.clientX, ev.clientY);
        if (i >= 0 && model) {
            renderer.focusNode(i);
            renderer.setSelectedIndex(i);
            notifyNodeSelected(model.ids[i], model.names[i], model.types[i]);
            if (model.isMeta?.[i]) {
                openModulePanel(i);
            }
            else {
                const fullI = fullModel?.index.get(model.ids[i]);
                if (fullI !== undefined) {
                    void openNodePanel(fullModel, fullI, panelOpts()).then((body) => wirePanelJumps(body));
                }
                else {
                    void openNodePanel(model, i, panelOpts()).then((body) => wirePanelJumps(body));
                }
            }
        }
        else {
            renderer.setSelectedIndex(null);
        }
    });
    canvas.addEventListener('dblclick', (ev) => {
        if (!model || !moduleGraph)
            return;
        const i = renderer.pickAt(ev.clientX, ev.clientY);
        if (i < 0) {
            closeModuleView();
            return;
        }
        if (model.isMeta?.[i]) {
            openModule(model.ids[i]);
        }
    });
    canvas.addEventListener('pointermove', (ev) => {
        if (hoverThrottleTimer != null)
            return;
        const { clientX, clientY } = ev;
        hoverThrottleTimer = setTimeout(() => {
            hoverThrottleTimer = null;
            applyHoverAt(clientX, clientY);
        }, HOVER_THROTTLE_MS);
    });
    canvas.addEventListener('pointerleave', () => {
        if (hoverThrottleTimer) {
            clearTimeout(hoverThrottleTimer);
            hoverThrottleTimer = null;
        }
        if (lastHoverIndex != null) {
            lastHoverIndex = null;
            renderer.setHoverFocus(null);
        }
        clearHoverLabel();
    });
    return renderer;
}
function wirePanelJumps(body) {
    if (!body)
        return;
    body.addEventListener('click', (ev) => {
        const li = ev.target.closest('li[data-jump]');
        if (!li || !fullModel)
            return;
        const j = Number(li.dataset.jump);
        openPanelAt(j);
    }, { once: true });
}
function closePanelAndOverlay() {
    closePanel();
    if (renderer?.overlay?.kind === 'impact')
        clearOverlay(renderer);
}
const GENESIS_BEAT_MS = 500;
const GENESIS_FRAME_MS = 800;
const GENESIS_WAVE_FALLBACK_MS = 15000;
const HERO_ORBIT_DEG_PER_SEC = 18;
const HERO_ORBIT_SEC = 10;
let genesisRun = null;
let genesisPlayed = false;
let viewDeltaDeferred = false;
async function playGenesis() {
    if (!renderer)
        return;
    let releaseGenesis = () => { };
    const run = new Promise((resolve) => {
        releaseGenesis = resolve;
    });
    genesisRun = run;
    const finishGenesis = () => {
        releaseGenesis();
        if (genesisRun === run)
            genesisRun = null;
    };
    renderer.stopAutoFrame();
    renderer.frameToFitSmooth();
    renderer.stopIdleOrbit();
    renderer.primeEdgeWave();
    wireEdgesToggle();
    syncToolbar();
    await sleep(GENESIS_FRAME_MS + GENESIS_BEAT_MS);
    if (!renderer) {
        finishGenesis();
        return;
    }
    const fallback = setTimeout(finishGenesis, GENESIS_WAVE_FALLBACK_MS);
    const launched = renderer.playEdgeWave({
        onDone: () => {
            clearTimeout(fallback);
            finishGenesis();
            renderer?.startIdleOrbit(HERO_ORBIT_DEG_PER_SEC, HERO_ORBIT_SEC);
        },
    });
    if (launched) {
        genesisPlayed = true;
    }
    else {
        clearTimeout(fallback);
        finishGenesis();
    }
    wireReplayButton();
}
function wireReplayButton() {
    const btn = el('nebula-replay');
    if (!btn || !renderer || !model)
        return;
    btn.classList.remove('hidden');
    btn.onclick = () => {
        if (!renderer)
            return;
        renderer.stopIdleOrbit();
        renderer.primeEdgeWave();
        renderer.playEdgeWave({
            onDone: () => renderer?.startIdleOrbit(HERO_ORBIT_DEG_PER_SEC, HERO_ORBIT_SEC),
        });
    };
}
function wireEdgesToggle() {
    const btn = el('nebula-edges');
    if (!btn || !renderer || !model)
        return;
    if (model.edgeFrom.length === 0) {
        btn.classList.add('hidden');
        return;
    }
    btn.classList.remove('hidden');
    mountEdgeLegend();
    let on = btn.classList.contains('active') || !btn.dataset.wired;
    if (!btn.dataset.wired)
        on = true;
    const apply = () => {
        const count = renderer.setEdgesVisible(on);
        const total = renderer.edgeTotal;
        const label = count < total
            ? `Edges (${count.toLocaleString()} / ${total.toLocaleString()})`
            : `Edges (${count.toLocaleString()})`;
        btn.classList.toggle('active', on);
        btn.textContent = on ? label : 'Edges';
        const legend = el('edge-legend');
        if (legend)
            legend.classList.toggle('hidden', !on);
    };
    apply();
    btn.dataset.wired = '1';
    btn.onclick = () => {
        on = !on;
        apply();
        syncToolbar();
    };
}
function wireExternalsToggle() {
    const btn = el('nebula-externals');
    if (!btn || !moduleGraph)
        return;
    const hasExt = moduleGraph.modules.some((m) => m.isExternal);
    if (!hasExt) {
        btn.classList.add('hidden');
        return;
    }
    btn.classList.remove('hidden');
    const apply = () => {
        btn.classList.toggle('active', viewState.showExternals);
        btn.textContent = viewState.showExternals ? 'Externals' : 'Externals (hidden)';
        btn.title = viewState.showExternals
            ? 'Hide external libraries (outer orbit)'
            : 'Show external libraries on the outer orbit';
    };
    apply();
    btn.onclick = () => {
        viewState = { ...viewState, showExternals: !viewState.showExternals };
        preserveCameraOnView = true;
        applyModuleView({ autoFit: false });
        apply();
        syncToolbar();
    };
}
function mountEdgeLegend() {
    const host = el('edge-legend');
    if (!host || host.dataset.ready)
        return;
    const rows = edgeLegendEntries(EDGE_KINDS)
        .filter(([kind]) => kind !== 'Unknown')
        .map(([kind, c]) => {
        const rgb = `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
        return `<div class="leg-row"><span class="leg-swatch" style="background:${rgb}"></span>${kind}</div>`;
    })
        .join('');
    host.innerHTML = `<div class="leg-title">Edges</div>${rows}`;
    host.dataset.ready = '1';
}
let streamClient = null;
let viewPollTimer = null;
let viewChangeHandler = null;
let sessionEventSource = null;
let sessionEventsReconnectAttempt = 0;
let sessionEventsReconnectTimer = null;
let liveSyncActive = false;
let connectedSyncSessionId = '';
let activeLayout = null;
let previewTimer = null;
let streamTotalNodes = null;
let previewNodeIds = new Set();
let streamNodesReceived = false;
let bootstrapWatchdogTimer = null;
let canonicalReloadTimer = null;
let currentSession = null;
let streamPartial = null;
const PREVIEW_DEBOUNCE_MS = 120;
const CANONICAL_RELOAD_DEBOUNCE_MS = 300;
const BOOTSTRAP_WATCHDOG_MS = 30000;
const CANONICAL_FETCH_TIMEOUT_MS = 120000;
const SESSION_EVENTS_RECONNECT_BASE_MS = 500;
const SESSION_EVENTS_RECONNECT_MAX_MS = 4000;
const SESSION_EVENTS_MAX_RECONNECT_ATTEMPTS = 5;
function cancelPreviewTimer() {
    if (previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
    }
}
function closeSessionEvents() {
    if (sessionEventsReconnectTimer) {
        clearTimeout(sessionEventsReconnectTimer);
        sessionEventsReconnectTimer = null;
    }
    sessionEventsReconnectAttempt = 0;
    sessionEventSource?.close();
    sessionEventSource = null;
}
function cancelBootstrapWatchdog() {
    if (bootstrapWatchdogTimer) {
        clearTimeout(bootstrapWatchdogTimer);
        bootstrapWatchdogTimer = null;
    }
}
function startBootstrapWatchdog() {
    cancelBootstrapWatchdog();
    bootstrapWatchdogTimer = setTimeout(() => {
        bootstrapWatchdogTimer = null;
        if (streamNodesReceived || streamClient?.bootstrapComplete)
            return;
        setStatus('Your graph stopped arriving — reconnecting…', 'warn');
        streamClient?.forceReconnect();
    }, BOOTSTRAP_WATCHDOG_MS);
}
function reportGraphView(okText) {
    const nodesShown = streamPartial ? Object.keys(streamPartial.nodes).length : 0;
    const state = graphViewState(currentSession, {
        streamComplete: Boolean(streamClient?.bootstrapComplete),
        nodesShown,
    });
    const notice = graphViewNotice(state, { nodesShown, totalNodes: streamTotalNodes });
    if (notice) {
        setStatusNotice(notice);
    }
    else if (okText) {
        setStatus(okText);
    }
    return state;
}
function isBootstrapInProgress() {
    return Boolean(streamClient &&
        !streamClient.bootstrapComplete &&
        (streamNodesReceived || streamTotalNodes != null));
}
function scheduleCanonicalReload(reason) {
    if (isBootstrapInProgress() &&
        reason !== CanonicalReloadReason.GRAPH_UPGRADED &&
        reason !== CanonicalReloadReason.GRAPH_RELOAD) {
        return;
    }
    if (canonicalReloadTimer)
        clearTimeout(canonicalReloadTimer);
    canonicalReloadTimer = setTimeout(() => {
        canonicalReloadTimer = null;
        reloadGraphFromSession();
    }, CANONICAL_RELOAD_DEBOUNCE_MS);
}
let lastUserCameraInteractionMs = null;
let lastLiveSyncLabel = '';
function noteUserCameraInteraction() {
    lastUserCameraInteractionMs = Date.now();
}
function setLiveSyncStatus(nodeCount, detail = '') {
    const extra = detail ? ` · ${detail}` : lastLiveSyncLabel ? ` · ${lastLiveSyncLabel}` : '';
    setStatus(`Live sync · ${nodeCount.toLocaleString()} nodes${extra}`);
}
function schedulePreview(partial) {
    cancelPreviewTimer();
    previewTimer = setTimeout(() => {
        previewTimer = null;
        void applyPreview(partial);
    }, PREVIEW_DEBOUNCE_MS);
}
async function applyPreview(partial) {
    const nodeCount = Object.keys(partial.nodes).length;
    if (nodeCount === 0)
        return;
    const firstPreview = previewNodeIds.size === 0;
    const nextFull = buildModel(partial, { maxNodes: MAX_NODES, maxEdges: MAX_EDGES });
    const revealNewIds = new Set();
    for (const id of nextFull.ids) {
        if (!previewNodeIds.has(id))
            revealNewIds.add(id);
    }
    previewNodeIds = new Set(nextFull.ids);
    ensureRenderer();
    fullModel = nextFull;
    moduleGraph = buildModuleGraph(fullModel);
    const viewReveal = new Set(mapIdsToView(moduleGraph, fullModel, revealNewIds, viewState.openModuleId));
    applyModuleView({
        autoFit: firstPreview,
        revealNewIds: viewReveal,
        statusDetail: liveSyncActive
            ? undefined
            : `Loading… ${nodeCount.toLocaleString()} / ${(streamTotalNodes ?? nodeCount).toLocaleString()}`,
    });
    if (firstPreview) {
        renderer.startIdleOrbit();
    }
    if (liveSyncActive) {
        setLiveSyncStatus(nodeCount);
    }
}
async function runFinalLayout(partial) {
    activeLayout?.cancel();
    cancelPreviewTimer();
    const nodeCount = Object.keys(partial.nodes).length;
    if (nodeCount === 0)
        return;
    const nextFull = buildModel(partial, { maxNodes: MAX_NODES, maxEdges: MAX_EDGES });
    ensureRenderer();
    commitFullModel(nextFull, {
        autoFit: true,
        playGenesis: true,
        statusDetail: `${nodeCount.toLocaleString()} symbols ready`,
    });
}
function appendViewDelta(partial) {
    if (!renderer?._positions)
        return;
    const newFull = buildModel(partial, { maxNodes: MAX_NODES, maxEdges: MAX_EDGES });
    const prevIds = new Set(fullModel?.ids || []);
    let added = 0;
    for (const id of newFull.ids) {
        if (!prevIds.has(id))
            added++;
    }
    previewNodeIds = new Set(newFull.ids);
    preserveCameraOnView = true;
    commitFullModel(newFull, {
        autoFit: false,
        statusDetail: added > 0 ? `+${added.toLocaleString()} symbols` : undefined,
    });
    if (genesisPlayed)
        renderer.armPulse();
}
function applyReconciledModel(partial) {
    const newFull = buildModel(partial, { maxNodes: MAX_NODES, maxEdges: MAX_EDGES });
    const prevIds = new Set(fullModel?.ids || []);
    let added = 0;
    for (const id of newFull.ids) {
        if (!prevIds.has(id))
            added++;
    }
    previewNodeIds = new Set(newFull.ids);
    preserveCameraOnView = true;
    commitFullModel(newFull, {
        autoFit: false,
        statusDetail: added > 0 ? `+${added.toLocaleString()} symbols` : 'snapshot ready',
    });
    if (genesisPlayed)
        renderer.armPulse();
    return { nodeCount: newFull.ids.length, added };
}
function fetchCanonicalPartial(session) {
    return new Promise((resolve, reject) => {
        const partial = createPartialGraph();
        const url = graphStreamWsUrl();
        let settled = false;
        const finish = (fn) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timeoutId);
            client.close();
            fn();
        };
        const client = new GraphStreamClient(url, {
            onNodes(msg) {
                mergeNodeBatch(partial, msg.batch || {});
            },
            onEdges(msg) {
                mergeEdgeBatch(partial, msg.batch || {});
            },
            onComplete(msg) {
                if (msg.phase === GraphStreamPhase.BOOTSTRAP) {
                    finish(() => resolve(partial));
                }
            },
            onError(msg) {
                finish(() => reject(new Error(msg?.message || 'canonical fetch failed')));
            },
        });
        const timeoutId = setTimeout(() => {
            finish(() => reject(new Error('canonical fetch timed out')));
        }, CANONICAL_FETCH_TIMEOUT_MS);
        client.connect({
            workspace: session.workspace_id || session.org_slug,
            project_slug: session.project_slug,
        });
    });
}
async function reconcileWithCanonical() {
    if (!currentSession?.project_slug)
        return;
    setStatus('Reconciling snapshot…');
    try {
        const canonical = await fetchCanonicalPartial(currentSession);
        if (genesisRun)
            await genesisRun;
        streamPartial = reconcilePartialGraph(streamPartial, canonical);
        const { nodeCount } = applyReconciledModel(streamPartial);
        liveSyncActive = false;
        lastLiveSyncLabel = '';
        connectedSyncSessionId = '';
        clearSyncProgress();
        if (streamClient) {
            streamClient.bootstrapComplete = true;
        }
        startViewSubscription();
        setStatus(`${nodeCount.toLocaleString()} nodes · snapshot ready`);
        void initViewerLayers();
    }
    catch (err) {
        console.error('reconcile failed:', err);
        scheduleCanonicalReload(CanonicalReloadReason.GRAPH_UPGRADED);
    }
}
function streamHandlers() {
    const partial = streamPartial;
    return {
        onConnection(connected) {
            if (!connected) {
                if (reportGraphView() === GraphViewState.PARTIAL)
                    return;
                setStatus(CONNECTION_LOST, 'warn');
            }
            else if (!liveSyncActive) {
                setStatus('Connected. Loading your graph…');
            }
        },
        onReconnecting(attempt, maxAttempts) {
            setStatus(`Connection lost — reconnecting (${attempt} of ${maxAttempts})…`, 'warn');
        },
        onReconnectGaveUp() {
            setStatus(CONNECTION_GIVEN_UP, 'err');
        },
        onReady(msg) {
            const status = readyStatusFromMessage(msg);
            if (status.kind === ReadyStatusKind.LIVE) {
                liveSyncActive = true;
                updateSyncProgressUI(currentSession);
                const nodeCount = Object.keys(partial.nodes).length;
                if (nodeCount > 0) {
                    setLiveSyncStatus(nodeCount);
                }
                else {
                    setStatus(readyStatusLabel(status));
                }
                return;
            }
            liveSyncActive = false;
            if (status.kind === ReadyStatusKind.WAITING) {
                streamTotalNodes = null;
                setStatus(readyStatusLabel(status), 'warn');
                return;
            }
            streamTotalNodes = status.totalNodes;
            setStatus(readyStatusLabel(status));
            if (status.totalNodes > 0)
                startBootstrapWatchdog();
        },
        onNodes(msg) {
            streamNodesReceived = true;
            cancelBootstrapWatchdog();
            mergeNodeBatch(partial, msg.batch || {});
            schedulePreview(partial);
        },
        onEdges(msg) {
            mergeEdgeBatch(partial, msg.batch || {});
            schedulePreview(partial);
        },
        onViewDelta(msg) {
            mergeViewDelta(partial, msg);
            if (genesisRun) {
                if (viewDeltaDeferred)
                    return;
                viewDeltaDeferred = true;
                void genesisRun.then(() => {
                    viewDeltaDeferred = false;
                    appendViewDelta(partial);
                });
                return;
            }
            appendViewDelta(partial);
        },
        onGraphDelta(msg) {
            streamNodesReceived = true;
            cancelBootstrapWatchdog();
            mergeGraphDeltaOps(partial, msg);
            const touched = touchedNodeIdsFromOps(msg.ops || [], partial);
            cancelPreviewTimer();
            void applyPreview(partial).then(() => {
                if (touched.size && renderer) {
                    lastLiveSyncLabel = `${touched.size.toLocaleString()} node${touched.size === 1 ? '' : 's'} updating`;
                    revealLiveTouched(touched);
                    const nodeCount = Object.keys(partial.nodes).length;
                    setLiveSyncStatus(nodeCount, lastLiveSyncLabel);
                }
            });
        },
        onGraphUpgraded(_msg) {
            if (renderer) {
                confirmLiveOverlay(renderer, []);
                lastLiveSyncLabel = 'seal confirmed';
            }
            void reconcileWithCanonical();
        },
        onComplete(msg) {
            if (msg.phase === GraphStreamPhase.BOOTSTRAP) {
                void (async () => {
                    cancelPreviewTimer();
                    cancelBootstrapWatchdog();
                    await applyPreview(partial);
                    const nodeCount = Object.keys(partial.nodes).length;
                    if (nodeCount === 0) {
                        setStatus('No graph data arrived — retrying…', 'warn');
                        streamClient?.forceReconnect();
                        return;
                    }
                    const nextIds = Object.keys(partial.nodes);
                    const prevIds = model?.ids ?? [];
                    if (model && !shouldFullRelayout(prevIds, nextIds)) {
                        if (genesisRun)
                            await genesisRun;
                        const { nodeCount: n } = applyReconciledModel(partial);
                        startViewSubscription();
                        reportGraphView(`${n.toLocaleString()} nodes · snapshot ready`);
                        return;
                    }
                    try {
                        await runFinalLayout(partial);
                    }
                    catch (err) {
                        console.error('layout failed:', err);
                        const notice = graphNotDrawnNotice(err);
                        setStatus(notice.text, notice.kind);
                        return;
                    }
                    startViewSubscription();
                    reportGraphView(`${nodeCount.toLocaleString()} nodes · snapshot ready`);
                })();
            }
        },
        onError(msg) {
            if (msg?.code === GraphStreamErrorCode.GRAPH_UNAVAILABLE && isSyncInProgress(currentSession)) {
                updateSyncProgressUI(currentSession);
                return;
            }
            console.error('stream error:', msg);
            const notice = graphStreamErrorNotice(msg);
            setStatusNotice(notice);
        },
    };
}
function updateSyncProgressUI(snap) {
    const view = progressFromSnapshot(snap);
    if (!view.active) {
        clearSyncProgress();
        return;
    }
    setSyncProgress({
        pct: view.pct,
        label: view.label,
        indeterminate: view.pct == null,
    });
}
function isStreamConnected() {
    return streamClient?.ws?.readyState === WebSocket.OPEN;
}
function graphStreamWsUrl() {
    const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${location.host}${LocalRoutes.WS_GRAPH}`;
}
function connectStream(snap) {
    currentSession = snap;
    const syncId = effectiveSyncSessionId(snap);
    if (syncId === connectedSyncSessionId && isStreamConnected())
        return;
    connectedSyncSessionId = syncId;
    streamNodesReceived = false;
    streamTotalNodes = null;
    lastLiveSyncLabel = '';
    cancelBootstrapWatchdog();
    if (!streamPartial) {
        streamPartial = createPartialGraph();
        previewNodeIds = new Set();
    }
    if (streamClient) {
        streamClient.close();
        streamClient = null;
    }
    streamClient = new GraphStreamClient(graphStreamWsUrl(), streamHandlers());
    streamClient.connect({
        workspace: snap.workspace_id || snap.org_slug,
        project_slug: snap.project_slug,
        sync_session_id: syncId || undefined,
    });
}
function handleSessionSnapshot(next) {
    if (!next)
        return;
    currentSession = next;
    updateSyncProgressUI(next);
    if (lastSyncFailed(next) && !isSyncInProgress(next)) {
        reportGraphView();
    }
    const effectiveSyncId = effectiveSyncSessionId(next);
    if (shouldConnectGraphStream(next)) {
        const keepSocketForDelta = isDeltaSyncInProgress(next) && isStreamConnected();
        if (!keepSocketForDelta && effectiveSyncId !== connectedSyncSessionId) {
            connectStream(next);
        }
    }
    if (next.sync_phase === SyncPhase.READY || next.snapshot_saved) {
        if (!liveSyncActive) {
            clearSyncProgress();
        }
    }
}
async function fetchSessionSnapshot() {
    const res = await fetch(LocalRoutes.SESSION, { cache: 'no-store' });
    return res.json();
}
function connectSessionEvents() {
    closeSessionEvents();
    if (!currentSession?.project_slug)
        return;
    _openSessionEvents();
}
function _openSessionEvents() {
    sessionEventSource = new EventSource(LocalRoutes.SESSION_EVENTS);
    sessionEventSource.onopen = () => {
        sessionEventsReconnectAttempt = 0;
    };
    sessionEventSource.onmessage = (ev) => {
        let next;
        try {
            next = JSON.parse(ev.data);
        }
        catch {
            return;
        }
        handleSessionSnapshot(next);
    };
    sessionEventSource.onerror = () => {
        sessionEventSource?.close();
        sessionEventSource = null;
        _scheduleSessionEventsReconnect();
    };
}
function _scheduleSessionEventsReconnect() {
    if (sessionEventsReconnectTimer)
        return;
    if (!currentSession?.project_slug)
        return;
    if (sessionEventsReconnectAttempt >= SESSION_EVENTS_MAX_RECONNECT_ATTEMPTS)
        return;
    sessionEventsReconnectAttempt += 1;
    const delay = Math.min(SESSION_EVENTS_RECONNECT_BASE_MS * 2 ** (sessionEventsReconnectAttempt - 1), SESSION_EVENTS_RECONNECT_MAX_MS);
    sessionEventsReconnectTimer = setTimeout(() => {
        sessionEventsReconnectTimer = null;
        _openSessionEvents();
    }, delay);
}
async function loadFromStream() {
    console.group('[nebula] load graph (WebSocket stream)');
    let session;
    try {
        session = await fetchSessionSnapshot();
    }
    catch (err) {
        console.error('session fetch failed:', err);
        const notice = sessionUnreadableNotice(err);
        setStatus(notice.text, notice.kind);
        console.groupEnd();
        return;
    }
    currentSession = session;
    if (!session?.project_slug || !(session?.workspace_id || session?.org_slug)) {
        setStatus('Pick a project folder in dont-break first.', 'warn');
        console.groupEnd();
        return;
    }
    if (session?.graph_error && !hasReadableSnapshot(session)) {
        setStatus(String(session.graph_error), 'err', { action: 'sync' });
        console.groupEnd();
        return;
    }
    if (progressFromSnapshot(session).active) {
        updateSyncProgressUI(session);
    }
    else if (!shouldConnectGraphStream(session)) {
        const notice = graphViewNotice(GraphViewState.UNAVAILABLE);
        setStatusNotice(notice);
    }
    else if (lastSyncFailed(session)) {
        const notice = graphViewNotice(GraphViewState.STALE);
        setStatusNotice(notice);
    }
    else {
        setStatus('Connecting to your graph…');
    }
    if (!shouldConnectGraphStream(session)) {
        if (isEmbed()) {
            closeSessionEvents();
        }
        else {
            connectSessionEvents();
        }
        console.groupEnd();
        return;
    }
    streamPartial = createPartialGraph();
    previewNodeIds = new Set();
    streamTotalNodes = null;
    streamNodesReceived = false;
    liveSyncActive = false;
    cancelBootstrapWatchdog();
    connectStream(session);
    if (isEmbed()) {
        closeSessionEvents();
    }
    else {
        connectSessionEvents();
    }
    console.groupEnd();
}
let userCameraHandler = null;
function startViewSubscription() {
    if (!streamClient || viewChangeHandler)
        return;
    const sendView = () => {
        if (!renderer || !model || !fullModel || !moduleGraph || !streamClient?.bootstrapComplete)
            return;
        const viewVisible = renderer.getVisibleNodeIds(model);
        const real = [];
        for (const id of viewVisible) {
            if (isModuleNodeId(id)) {
                const label = moduleLabelFromId(id);
                const mi = label != null ? moduleGraph.moduleIndexByLabel.get(label) : undefined;
                if (mi == null)
                    continue;
                const members = moduleGraph.modules[mi].memberIds;
                for (let k = 0; k < Math.min(members.length, 48); k++)
                    real.push(members[k]);
            }
            else {
                real.push(id);
            }
        }
        if (real.length)
            streamClient.sendView(real);
    };
    viewChangeHandler = () => {
        if (viewPollTimer)
            clearTimeout(viewPollTimer);
        viewPollTimer = setTimeout(() => {
            viewPollTimer = null;
            sendView();
        }, Timing.VIEW_POLL_MS);
    };
    userCameraHandler = () => noteUserCameraInteraction();
    renderer?.controls?.addEventListener('change', viewChangeHandler);
    renderer?.controls?.addEventListener('start', userCameraHandler);
    sendView();
}
function stopViewSubscription() {
    if (viewChangeHandler && renderer?.controls) {
        renderer.controls.removeEventListener('change', viewChangeHandler);
        viewChangeHandler = null;
    }
    if (userCameraHandler && renderer?.controls) {
        renderer.controls.removeEventListener('start', userCameraHandler);
        userCameraHandler = null;
    }
    if (viewPollTimer) {
        clearTimeout(viewPollTimer);
        viewPollTimer = null;
    }
}
function reloadGraphFromSession() {
    if (canonicalReloadTimer) {
        clearTimeout(canonicalReloadTimer);
        canonicalReloadTimer = null;
    }
    cancelBootstrapWatchdog();
    stopViewSubscription();
    liveSyncActive = false;
    if (isEmbed()) {
        closeSessionEvents();
    }
    streamClient?.close();
    streamClient = null;
    resetViewerMeta();
    void fetchSessionSnapshot()
        .then((session) => {
        currentSession = session;
        connectedSyncSessionId = '';
        return loadFromStream().then(() => initViewerLayers());
    });
}
bindGraphReload(() => scheduleCanonicalReload(CanonicalReloadReason.GRAPH_RELOAD));
bindSessionUpdate(handleSessionSnapshot);
function overlayNodeIds(payload) {
    const ids = [];
    const push = (v) => {
        if (typeof v === 'string' && v)
            ids.push(v);
    };
    if (!payload)
        return ids;
    if (Array.isArray(payload.core))
        payload.core.forEach(push);
    if (Array.isArray(payload.halo)) {
        for (const h of payload.halo) {
            if (typeof h === 'string')
                push(h);
            else if (h && typeof h.id === 'string')
                push(h.id);
        }
    }
    if (Array.isArray(payload.path))
        payload.path.forEach(push);
    if (Array.isArray(payload.nodes))
        payload.nodes.forEach(push);
    if (Array.isArray(payload.candidates))
        payload.candidates.forEach(push);
    if (Array.isArray(payload.rejected))
        payload.rejected.forEach(push);
    push(payload.from);
    push(payload.to);
    push(payload.nodeId);
    push(payload.sourceId);
    if (Array.isArray(payload.impacted)) {
        for (const h of payload.impacted) {
            if (typeof h === 'string')
                push(h);
            else if (h && typeof h.id === 'string')
                push(h.id);
        }
    }
    return ids;
}
function withOverlayModules(payload, fn) {
    if (!renderer)
        return;
    const ids = overlayNodeIds(payload);
    if (ids.length)
        ensureModulesForIds(ids);
    fn();
}
bindOverlayHandlers({
    onZone(msg) {
        withOverlayModules(msg, () => applyZoneOverlay(renderer, model, msg));
    },
    onPath(msg) {
        withOverlayModules(msg, () => applyPathOverlay(renderer, model, msg, () => { }));
    },
    onCandidates(msg) {
        withOverlayModules(msg, () => applyCandidatesOverlay(renderer, model, msg));
    },
    onRejected(msg) {
        if (!renderer)
            return;
        applyRejectedOverlay(renderer, msg);
    },
    onProbe(msg) {
        withOverlayModules(msg, () => applySimulationProbe(renderer, model, msg));
    },
    onImpact(msg) {
        withOverlayModules(msg, () => applySimulationImpact(renderer, model, msg));
    },
    onShield(msg) {
        withOverlayModules(msg, () => applyShieldOverlay(renderer, model, msg));
    },
    onCelebrate() {
        renderer?.celebrateShieldDome?.();
    },
    onClear() {
        if (!renderer)
            return;
        forceIncludeIds = new Set();
        liveForceIncludeIds = new Set();
        clearOverlay(renderer);
        if (fullModel && moduleGraph) {
            preserveCameraOnView = true;
            applyModuleView({ autoFit: false });
        }
    },
    onFocusNode(msg) {
        if (!renderer || !fullModel || typeof msg.nodeId !== 'string')
            return;
        ensureModulesForIds([msg.nodeId]);
        const i = model?.index.get(msg.nodeId);
        if (i !== undefined) {
            renderer.focusNode(i);
            renderer.setSelectedIndex(i);
        }
    },
});
initHostBridge();
el('panel-close')?.addEventListener('click', closePanelAndOverlay);
window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
        if (renderer?.overlay?.kind === 'impact') {
            clearOverlay(renderer);
            return;
        }
        if (viewState.openModuleId) {
            closeModuleView();
            closePanelAndOverlay();
            return;
        }
        closePanelAndOverlay();
    }
});
loadFromStream();
async function initViewerLayers() {
    const meta = await initViewerMeta();
    if (meta?.layers) {
        setViewerMeta(meta);
    }
    const provisional = meta?.sync?.phase && meta.sync.phase !== SyncPhase.READY;
    if (meta?.layers?.resolved) {
        mountHbPanel();
    }
    if (meta?.layers?.arch) {
        const global = await initArchGlobal();
        mountGlobalHud(global, { provisional: !!provisional });
        await mountActionsPanel();
        wireHeatmapToggle();
    }
    syncToolbar();
}
function wireHeatmapToggle() {
    const btn = el('arch-heat');
    if (!btn)
        return;
    btn.classList.remove('hidden');
    let on = false;
    let scores = null;
    btn.addEventListener('click', async () => {
        on = !on;
        btn.classList.toggle('active', on);
        if (on && !scores) {
            btn.textContent = 'Heatmap…';
            scores = await fetchArchScores();
            btn.textContent = 'Heatmap';
        }
        renderer?.setHeatmap(on ? scores : null);
        syncToolbar();
    });
}
void initViewerLayers();
