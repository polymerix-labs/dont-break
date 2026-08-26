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

import { GraphDeltaOp } from './wire/graphStream.mjs';
import { shouldAutoFrameCamera } from './graphSessionPolicy.mjs';
export const PATH_STEP_MS = 160;
export const SHIELD_RISE_MS = 2600;
export const SHIELD_RISE_STEP_MS = 80;
export const CANDIDATES_PULSE_MS = 2000;
export const CANDIDATES_PULSE_STEP_MS = 80;
export const CANDIDATES_PULSE_BEATS = 3;
export const LIVE_HALO_DECAY_MS = 5000;
export const LIVE_CONFIRM_FLASH_MS = 800;
export const LIVE_PULSE_STEP_MS = 80;
export const LIVE_CAMERA_DEBOUNCE_MS = 400;
export const LIVE_CAMERA_RETURN_MS = 6000;
export function zoneOverlayState(payload) {
    const core = new Set(Array.isArray(payload.core) ? payload.core : []);
    const halo = new Map();
    let maxDistance = 1;
    if (Array.isArray(payload.halo)) {
        for (const entry of payload.halo) {
            if (!entry || typeof entry.id !== 'string')
                continue;
            if (core.has(entry.id))
                continue;
            const d = Number(entry.distance);
            const distance = Number.isFinite(d) && d > 0 ? d : 1;
            halo.set(entry.id, distance);
            if (distance > maxDistance)
                maxDistance = distance;
        }
    }
    return { kind: 'zone', core, halo, maxDistance };
}
export function pathOverlayState(payload, litCount) {
    const ids = Array.isArray(payload.nodes) ? payload.nodes : [];
    const order = new Map();
    for (let i = 0; i < ids.length; i++) {
        if (typeof ids[i] === 'string' && !order.has(ids[i]))
            order.set(ids[i], i);
    }
    const clamped = Math.max(0, Math.min(litCount, order.size));
    return { kind: 'path', order, litCount: clamped };
}
export function candidatesOverlayState(payload, previous, pulse = 1) {
    const rejected = new Set(previous && previous.kind === 'candidates' && previous.rejected ? previous.rejected : []);
    if (Array.isArray(payload.rejected)) {
        for (const id of payload.rejected) {
            if (typeof id === 'string')
                rejected.add(id);
        }
    }
    const candidates = new Set();
    if (Array.isArray(payload.nodes)) {
        for (const id of payload.nodes) {
            if (typeof id === 'string' && !rejected.has(id))
                candidates.add(id);
        }
    }
    return {
        kind: 'candidates',
        candidates,
        rejected,
        pulse: Math.max(0, Math.min(1, pulse)),
    };
}
export function rejectedOverlayState(previous, payload) {
    const isCand = previous && previous.kind === 'candidates';
    const candidates = new Set(isCand && previous.candidates ? previous.candidates : []);
    const rejected = new Set(isCand && previous.rejected ? previous.rejected : []);
    if (Array.isArray(payload.nodes)) {
        for (const id of payload.nodes) {
            if (typeof id !== 'string')
                continue;
            candidates.delete(id);
            rejected.add(id);
        }
    }
    return { kind: 'candidates', candidates, rejected, pulse: 0 };
}
export const PROBE_OUTCOMES = Object.freeze([
    'intercepted',
    'breach',
    'allowed',
    'over_block',
    'info',
]);
export function probeState(payload) {
    const nodes = [];
    if (Array.isArray(payload.nodes)) {
        for (const id of payload.nodes) {
            if (typeof id === 'string')
                nodes.push(id);
        }
    }
    const verdict = payload.verdict === 'block' || payload.verdict === 'ok' ? payload.verdict : null;
    const outcome = PROBE_OUTCOMES.includes(payload.outcome) ? payload.outcome : null;
    return { nodes, verdict, outcome, freeze: payload.freeze === true };
}
export const MAX_TRAILS = 24;
export function shieldOverlayState(payload, rise = 0) {
    const zone = zoneOverlayState(payload);
    return {
        kind: 'shield',
        core: zone.core,
        halo: zone.halo,
        maxDistance: zone.maxDistance,
        rise: Math.max(0, Math.min(1, rise)),
        trails: [],
        trailEdges: new Map(),
        trailNodes: new Map(),
    };
}
export const SHIELD_MORPH_RISE = 0.55;
export function morphShieldOverlayState(previous, payload) {
    if (!previous || previous.kind !== 'shield') {
        return shieldOverlayState(payload, 0);
    }
    return {
        ...shieldOverlayState(payload, Math.max(previous.rise, SHIELD_MORPH_RISE)),
        trails: previous.trails,
        trailEdges: previous.trailEdges,
        trailNodes: previous.trailNodes,
    };
}
export function trailEdgeKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
}
export function addTrail(overlay, nodes, outcome) {
    if (!overlay || overlay.kind !== 'shield' || !Array.isArray(nodes) || nodes.length < 2) {
        return overlay;
    }
    return rebuildTrails(overlay, [...overlay.trails, { nodes: [...nodes], outcome }]);
}
export function addImpactMark(overlay, nodeId, outcome) {
    if (!overlay || overlay.kind !== 'shield' || typeof nodeId !== 'string' || !nodeId) {
        return overlay;
    }
    return rebuildTrails(overlay, [...overlay.trails, { nodes: [nodeId], outcome }]);
}
function rebuildTrails(overlay, nextTrails) {
    const trails = nextTrails.slice(-MAX_TRAILS);
    const trailEdges = new Map();
    const trailNodes = new Map();
    for (const trail of trails) {
        for (let i = 0; i < trail.nodes.length; i++) {
            trailNodes.set(trail.nodes[i], trail.outcome);
            if (i > 0) {
                trailEdges.set(trailEdgeKey(trail.nodes[i - 1], trail.nodes[i]), trail.outcome);
            }
        }
    }
    return { ...overlay, trails, trailEdges, trailNodes };
}
export function candidatePulse(elapsedMs) {
    if (elapsedMs <= 0)
        return 1;
    if (elapsedMs >= CANDIDATES_PULSE_MS)
        return 0;
    const t = elapsedMs / CANDIDATES_PULSE_MS;
    const beat = 0.5 + 0.5 * Math.cos(t * CANDIDATES_PULSE_BEATS * 2 * Math.PI);
    return beat * (1 - t);
}
export function resolveIndices(model, ids) {
    const out = [];
    for (const id of ids) {
        const i = model.index.get(id);
        if (i !== undefined)
            out.push(i);
    }
    return out;
}
export function touchedNodeIdsFromOps(ops, partial = null) {
    const ids = new Set();
    for (const op of ops || []) {
        if (!op || typeof op !== 'object')
            continue;
        if (op.op === GraphDeltaOp.ADD_NODE && op.node?.id) {
            ids.add(String(op.node.id));
        }
        else if (op.op === GraphDeltaOp.ADD_EDGE && op.edge) {
            if (op.edge.from)
                ids.add(String(op.edge.from));
            if (op.edge.to)
                ids.add(String(op.edge.to));
        }
        else if (op.op === GraphDeltaOp.UPGRADE_EDGE) {
            if (op.from)
                ids.add(String(op.from));
            if (op.to)
                ids.add(String(op.to));
        }
        else if (op.op === GraphDeltaOp.ATTACH_LAYER && op.node_id) {
            ids.add(String(op.node_id));
        }
        else if (op.op === GraphDeltaOp.REMOVE_SUBGRAPH && Number.isFinite(op.file_index)) {
            const fileIndex = Number(op.file_index);
            for (const [id, node] of Object.entries(partial?.nodes || {})) {
                if (Number(node?.file_index) === fileIndex)
                    ids.add(id);
            }
        }
    }
    return ids;
}
export function mergeLiveTouched(previous, newIds, nowMs = Date.now()) {
    const out = previous ? new Map(previous) : new Map();
    for (const id of newIds || []) {
        if (id)
            out.set(String(id), nowMs);
    }
    return out;
}
export function liveOverlayState(touched, nowMs = Date.now(), opts = {}) {
    const active = new Map();
    for (const [id, ts] of touched || []) {
        if (nowMs - ts <= LIVE_HALO_DECAY_MS)
            active.set(id, ts);
    }
    const confirmed = Boolean(opts.confirmed);
    if (confirmed && opts.confirmAt != null) {
        if (nowMs - opts.confirmAt > LIVE_CONFIRM_FLASH_MS && active.size === 0) {
            return null;
        }
    }
    else if (active.size === 0) {
        return null;
    }
    let pulse = 0;
    for (const ts of active.values()) {
        const age = nowMs - ts;
        const t = 1 - age / LIVE_HALO_DECAY_MS;
        pulse = Math.max(pulse, Math.max(0, Math.min(1, t)));
    }
    if (confirmed)
        pulse = 1;
    return { kind: 'live', touched: active, pulse, confirmed };
}
export function shouldFrameLiveCamera(lastUserInteractionMs, nowMs, cooldownMs) {
    return shouldAutoFrameCamera(lastUserInteractionMs, nowMs, cooldownMs);
}
let pathTimer = null;
function cancelPathAnimation() {
    if (pathTimer) {
        clearInterval(pathTimer);
        pathTimer = null;
    }
}
let pulseTimer = null;
function cancelPulseAnimation() {
    if (pulseTimer) {
        clearInterval(pulseTimer);
        pulseTimer = null;
    }
}
let shieldTimer = null;
function cancelShieldAnimation() {
    if (shieldTimer) {
        clearInterval(shieldTimer);
        shieldTimer = null;
    }
}
let liveTimer = null;
let liveCameraTimer = null;
let liveReturnTimer = null;
let liveTouched = new Map();
let liveConfirmAt = null;
let liveClearedHandler = null;
export function setLiveClearedHandler(fn) {
    liveClearedHandler = typeof fn === 'function' ? fn : null;
}
function notifyLiveCleared() {
    try {
        liveClearedHandler?.();
    }
    catch {
    }
}
function cancelLiveAnimation() {
    if (liveTimer) {
        clearInterval(liveTimer);
        liveTimer = null;
    }
}
function cancelLiveCameraTimers() {
    if (liveCameraTimer) {
        clearTimeout(liveCameraTimer);
        liveCameraTimer = null;
    }
    if (liveReturnTimer) {
        clearTimeout(liveReturnTimer);
        liveReturnTimer = null;
    }
}
export function applyLiveOverlay(renderer, model, nodeIds, opts = {}) {
    const current = renderer.overlay;
    if (current &&
        current.kind !== 'live' &&
        (current.kind === 'zone' ||
            current.kind === 'path' ||
            current.kind === 'shield' ||
            current.kind === 'candidates')) {
        liveTouched = mergeLiveTouched(liveTouched, nodeIds);
        return;
    }
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    const now = Date.now();
    liveTouched = mergeLiveTouched(liveTouched, nodeIds, now);
    liveConfirmAt = null;
    const state = liveOverlayState(liveTouched, now, { confirmed: false });
    if (!state) {
        cancelLiveAnimation();
        if (renderer.overlay?.kind === 'live')
            renderer.setOverlay(null);
        return;
    }
    renderer.setOverlay(state);
    cancelLiveAnimation();
    liveTimer = setInterval(() => {
        const cur = renderer.overlay;
        if (!cur || cur.kind !== 'live') {
            cancelLiveAnimation();
            return;
        }
        const next = liveOverlayState(liveTouched, Date.now(), {
            confirmed: Boolean(liveConfirmAt),
            confirmAt: liveConfirmAt ?? undefined,
        });
        if (!next) {
            cancelLiveAnimation();
            renderer.setOverlay(null);
            liveTouched = new Map();
            liveConfirmAt = null;
            notifyLiveCleared();
            return;
        }
        liveTouched = next.touched;
        renderer.setOverlay(next);
    }, LIVE_PULSE_STEP_MS);
    if (opts.frameCamera === false || !model)
        return;
    const lastInteract = opts.lastUserInteractionMs;
    cancelLiveCameraTimers();
    liveCameraTimer = setTimeout(() => {
        liveCameraTimer = null;
        if (!shouldFrameLiveCamera(lastInteract, Date.now()))
            return;
        const ids = [...(renderer.overlay?.touched?.keys?.() || liveTouched.keys())];
        const indices = resolveIndices(model, ids);
        if (indices.length)
            renderer.focusIndices(indices);
        liveReturnTimer = setTimeout(() => {
            liveReturnTimer = null;
            if (!shouldFrameLiveCamera(opts.lastUserInteractionMs, Date.now()))
                return;
            renderer.frameToFitSmooth?.(0.9);
        }, LIVE_CAMERA_RETURN_MS);
    }, LIVE_CAMERA_DEBOUNCE_MS);
}
export function confirmLiveOverlay(renderer, nodeIds = []) {
    const now = Date.now();
    liveTouched = mergeLiveTouched(liveTouched, nodeIds, now);
    liveConfirmAt = now;
    const state = liveOverlayState(liveTouched, now, { confirmed: true, confirmAt: now });
    if (!state)
        return;
    const current = renderer.overlay;
    if (current &&
        current.kind !== 'live' &&
        (current.kind === 'zone' ||
            current.kind === 'path' ||
            current.kind === 'shield' ||
            current.kind === 'candidates')) {
        return;
    }
    renderer.setOverlay(state);
}
export function applyZoneOverlay(renderer, model, payload) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    const state = zoneOverlayState(payload);
    renderer.setOverlay(state);
    if (model) {
        const zoneIds = [...state.core, ...state.halo.keys()];
        const indices = resolveIndices(model, zoneIds);
        if (indices.length)
            renderer.focusIndices(indices);
    }
}
export function impactOverlayState(payload) {
    const source = payload && typeof payload.sourceId === 'string' && payload.sourceId
        ? payload.sourceId
        : null;
    const impacted = new Map();
    let maxDistance = 1;
    if (Array.isArray(payload?.impacted)) {
        for (const entry of payload.impacted) {
            if (!entry || typeof entry.id !== 'string')
                continue;
            if (source && entry.id === source)
                continue;
            const d = Number(entry.depth);
            const depth = Number.isFinite(d) && d > 0 ? d : 1;
            impacted.set(entry.id, depth);
            if (depth > maxDistance)
                maxDistance = depth;
        }
    }
    return { kind: 'impact', source, impacted, maxDistance };
}
export function applyImpactOverlay(renderer, model, payload) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    cancelLiveAnimation();
    const state = impactOverlayState(payload);
    renderer.setOverlay(state);
    if (model) {
        const ids = [];
        if (state.source)
            ids.push(state.source);
        for (const id of state.impacted.keys())
            ids.push(id);
        const indices = resolveIndices(model, ids);
        if (indices.length)
            renderer.focusIndices(indices);
    }
}
export function applyPathOverlay(renderer, model, payload, onStep) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    const full = pathOverlayState(payload, Number.MAX_SAFE_INTEGER);
    const total = full.order.size;
    if (total === 0) {
        renderer.setOverlay(null);
        return;
    }
    renderer.setEdgesVisible(true);
    if (!model) {
        renderer.setOverlay(full);
        return;
    }
    const indices = resolveIndices(model, full.order.keys());
    if (indices.length)
        renderer.focusIndices(indices);
    let lit = 1;
    renderer.setOverlay(pathOverlayState(payload, lit));
    pathTimer = setInterval(() => {
        lit += 1;
        renderer.setOverlay(pathOverlayState(payload, lit));
        onStep?.();
        if (lit >= total)
            cancelPathAnimation();
    }, PATH_STEP_MS);
}
export function applyCandidatesOverlay(renderer, model, payload) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    const state = candidatesOverlayState(payload, renderer.overlay, 1);
    renderer.setOverlay(state);
    if (model && state.candidates.size) {
        const indices = resolveIndices(model, state.candidates);
        if (indices.length)
            renderer.focusIndices(indices);
    }
    const startedAt = Date.now();
    pulseTimer = setInterval(() => {
        const pulse = candidatePulse(Date.now() - startedAt);
        const current = renderer.overlay;
        if (!current || current.kind !== 'candidates') {
            cancelPulseAnimation();
            return;
        }
        renderer.setOverlay({ ...current, pulse });
        if (pulse === 0)
            cancelPulseAnimation();
    }, CANDIDATES_PULSE_STEP_MS);
}
export function applyRejectedOverlay(renderer, payload) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    renderer.setOverlay(rejectedOverlayState(renderer.overlay, payload));
}
export function applyShieldOverlay(renderer, model, payload) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    const state = morphShieldOverlayState(renderer.overlay, payload);
    const startRise = state.rise;
    renderer.setOverlay(state);
    if (model) {
        const zoneIds = [...state.core, ...state.halo.keys()];
        const indices = resolveIndices(model, zoneIds);
        if (indices.length) {
            renderer.focusIndices(indices);
            renderer.showShieldDome?.(indices, { rise: startRise });
        }
    }
    if (startRise >= 1)
        return;
    const startedAt = Date.now();
    const climbMs = SHIELD_RISE_MS * (1 - startRise);
    shieldTimer = setInterval(() => {
        const current = renderer.overlay;
        if (!current || current.kind !== 'shield') {
            cancelShieldAnimation();
            return;
        }
        const t = Math.min(1, (Date.now() - startedAt) / Math.max(climbMs, 1));
        const rise = startRise + (1 - startRise) * (1 - (1 - t) * (1 - t));
        renderer.setOverlay({ ...current, rise });
        renderer.setShieldDomeRise?.(rise);
        if (t >= 1)
            cancelShieldAnimation();
    }, SHIELD_RISE_STEP_MS);
}
export function applySimulationProbe(renderer, model, payload, onDone) {
    const state = probeState(payload);
    if (!model || state.nodes.length === 0)
        return false;
    const indices = resolveIndices(model, state.nodes);
    if (indices.length >= 2) {
        return renderer.playSimulationProbe(indices, {
            verdict: state.verdict ?? undefined,
            outcome: state.outcome ?? undefined,
            onDone: () => {
                const current = renderer.overlay;
                if (state.freeze && current && current.kind === 'shield') {
                    renderer.setOverlay(addTrail(current, state.nodes, state.outcome ?? 'info'));
                }
                onDone?.();
            },
        });
    }
    if (indices.length === 1 && (state.verdict || state.outcome)) {
        renderer.flashImpact(indices[0], state.verdict ?? undefined, state.outcome ?? undefined);
        onDone?.();
        return true;
    }
    return false;
}
export function applySimulationImpact(renderer, model, payload) {
    if (!model || typeof payload.nodeId !== 'string')
        return;
    const verdict = payload.verdict === 'block' || payload.verdict === 'ok' ? payload.verdict : null;
    const outcome = PROBE_OUTCOMES.includes(payload.outcome) ? payload.outcome : null;
    if (!verdict && !outcome)
        return;
    const i = model.index.get(payload.nodeId);
    if (i !== undefined)
        renderer.flashImpact(i, verdict ?? undefined, outcome ?? undefined);
    const current = renderer.overlay;
    if (payload.freeze === true && current && current.kind === 'shield') {
        renderer.setOverlay(addImpactMark(current, payload.nodeId, outcome ?? 'info'));
    }
}
export function clearOverlay(renderer) {
    cancelPathAnimation();
    cancelPulseAnimation();
    cancelShieldAnimation();
    cancelLiveAnimation();
    cancelLiveCameraTimers();
    const hadLive = liveTouched.size > 0 || renderer.overlay?.kind === 'live';
    liveTouched = new Map();
    liveConfirmAt = null;
    renderer.setOverlay(null);
    if (hadLive)
        notifyLiveCleared();
}
