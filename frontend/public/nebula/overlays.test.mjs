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

import { CANDIDATES_PULSE_MS, LIVE_HALO_DECAY_MS, MAX_TRAILS, SHIELD_MORPH_RISE, addImpactMark, addTrail, morphShieldOverlayState, candidatePulse, candidatesOverlayState, liveOverlayState, mergeLiveTouched, pathOverlayState, probeState, rejectedOverlayState, resolveIndices, shieldOverlayState, shouldFrameLiveCamera, touchedNodeIdsFromOps, trailEdgeKey, zoneOverlayState, impactOverlayState, setLiveClearedHandler, } from './overlays.mjs';
let failures = 0;
function check(name, cond) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
{
    const state = zoneOverlayState({
        core: ['a', 'b'],
        halo: [
            { id: 'b', distance: 1 },
            { id: 'c', distance: 2 },
            { id: 'd', distance: 0 },
            { id: 'e', distance: 3 },
        ],
    });
    check('zone kind', state.kind === 'zone');
    check('zone core size', state.core.size === 2);
    check('zone core wins over halo', !state.halo.has('b'));
    check('zone halo distance kept', state.halo.get('c') === 2);
    check('zone invalid distance clamps to 1', state.halo.get('d') === 1);
    check('zone max distance', state.maxDistance === 3);
}
{
    const state = zoneOverlayState({});
    check('zone empty payload', state.core.size === 0 && state.halo.size === 0);
    const bad = zoneOverlayState({ core: null, halo: [{ nope: true }, null] });
    check('zone malformed halo skipped', bad.halo.size === 0);
}
{
    const state = pathOverlayState({ nodes: ['x', 'y', 'z', 'y'] }, 2);
    check('path kind', state.kind === 'path');
    check('path order size', state.order.size === 3);
    check('path order positions', state.order.get('x') === 0 && state.order.get('z') === 2);
    check('path lit count', state.litCount === 2);
    const full = pathOverlayState({ nodes: ['x', 'y'] }, 99);
    check('path lit clamps to length', full.litCount === 2);
    const none = pathOverlayState({}, 5);
    check('path empty payload', none.order.size === 0 && none.litCount === 0);
}
{
    const state = candidatesOverlayState({
        nodes: ['a', 'b', 'c', 42],
        rejected: ['c', 'd', null],
    });
    check('candidates kind', state.kind === 'candidates');
    check('candidates size', state.candidates.size === 2);
    check('candidates rejected wins', !state.candidates.has('c') && state.rejected.has('c'));
    check('candidates rejected size', state.rejected.size === 2);
    check('candidates arrival pulse', state.pulse === 1);
    const empty = candidatesOverlayState({});
    check('candidates empty payload', empty.candidates.size === 0 && empty.rejected.size === 0);
}
{
    const first = candidatesOverlayState({ nodes: ['a', 'b'], rejected: ['x'] });
    const second = candidatesOverlayState({ nodes: ['b', 'c'] }, first);
    check('candidates carry rejected', second.rejected.has('x'));
    check('candidates replace set', !second.candidates.has('a') && second.candidates.has('c'));
    const fromZone = candidatesOverlayState({ nodes: ['a'] }, zoneOverlayState({ core: ['z'] }));
    check('candidates ignore non-candidates previous', fromZone.rejected.size === 0);
}
{
    const base = candidatesOverlayState({ nodes: ['a', 'b', 'c'] });
    const after = rejectedOverlayState(base, { nodes: ['b', 'nope'] });
    check('rejected removes candidate', !after.candidates.has('b'));
    check('rejected adds to grey set', after.rejected.has('b') && after.rejected.has('nope'));
    check('rejected keeps survivors', after.candidates.has('a') && after.candidates.has('c'));
    check('rejected no pulse replay', after.pulse === 0);
    const cold = rejectedOverlayState(null, { nodes: ['x'] });
    check('rejected without previous overlay', cold.rejected.has('x') && cold.candidates.size === 0);
}
{
    check('pulse starts full', candidatePulse(0) === 1);
    check('pulse expires', candidatePulse(CANDIDATES_PULSE_MS) === 0);
    check('pulse expired stays zero', candidatePulse(CANDIDATES_PULSE_MS * 2) === 0);
    let inRange = true;
    for (let ms = 0; ms <= CANDIDATES_PULSE_MS; ms += 50) {
        const v = candidatePulse(ms);
        if (!(v >= 0 && v <= 1))
            inRange = false;
    }
    check('pulse bounded 0..1', inRange);
    check('pulse decays overall', candidatePulse(CANDIDATES_PULSE_MS * 0.9) < 0.5);
}
{
    const state = probeState({ nodes: ['seed', 'mid', 42, 'target'], verdict: 'block' });
    check('probe nodes ordered', state.nodes.join(',') === 'seed,mid,target');
    check('probe verdict block', state.verdict === 'block');
    check('probe verdict ok', probeState({ nodes: [], verdict: 'ok' }).verdict === 'ok');
    check('probe verdict unknown -> null', probeState({ verdict: 'BOOM' }).verdict === null);
    check('probe empty payload', probeState({}).nodes.length === 0);
}
{
    const v4 = probeState({ nodes: ['a', 'b'], verdict: 'block', outcome: 'intercepted', freeze: true });
    check('probe outcome kept', v4.outcome === 'intercepted');
    check('probe freeze kept', v4.freeze === true);
    check('probe outcome unknown -> null', probeState({ outcome: 'BOOM' }).outcome === null);
    check('probe v3 payload defaults', probeState({ nodes: ['a'] }).outcome === null && probeState({}).freeze === false);
    check('probe freeze non-bool -> false', probeState({ freeze: 'yes' }).freeze === false);
}
{
    const shield = shieldOverlayState({ core: ['a'], halo: [{ id: 'b', distance: 2 }] }, 0.5);
    check('shield kind', shield.kind === 'shield');
    check('shield core', shield.core.has('a'));
    check('shield halo', shield.halo.get('b') === 2);
    check('shield rise kept', shield.rise === 0.5);
    check('shield rise clamps high', shieldOverlayState({}, 7).rise === 1);
    check('shield rise clamps low', shieldOverlayState({}, -1).rise === 0);
    check('shield rise defaults to 0', shieldOverlayState({}).rise === 0);
}
{
    const shield = shieldOverlayState({ core: ['t'] }, 1);
    const one = addTrail(shield, ['a', 'b', 't'], 'intercepted');
    check('trail kept', one.trails.length === 1);
    check('trail edge tinted', one.trailEdges.get(trailEdgeKey('a', 'b')) === 'intercepted');
    check('trail edge key symmetric', trailEdgeKey('b', 'a') === trailEdgeKey('a', 'b'));
    check('trail node tinted', one.trailNodes.get('a') === 'intercepted');
    check('original untouched', shield.trails.length === 0);
    const two = addTrail(one, ['a', 'b', 'x', 't'], 'breach');
    check('later trail wins', two.trailEdges.get(trailEdgeKey('a', 'b')) === 'breach');
    check('short trail ignored', addTrail(one, ['solo'], 'breach') === one);
    const zone = zoneOverlayState({ core: ['t'] });
    check('non-shield untouched', addTrail(zone, ['a', 'b'], 'breach') === zone);
    let capped = shieldOverlayState({ core: ['t'] }, 1);
    for (let i = 0; i <= MAX_TRAILS; i++) {
        capped = addTrail(capped, [`n${i}`, 't'], 'intercepted');
    }
    check('trail cap enforced', capped.trails.length === MAX_TRAILS);
    check('oldest trail dropped', !capped.trailNodes.has('n0'));
}
{
    const shield = shieldOverlayState({ core: ['t'] }, 1);
    const marked = addImpactMark(shield, 'c1', 'allowed');
    check('impact mark tints node', marked.trailNodes.get('c1') === 'allowed');
    check('impact mark adds no edge', marked.trailEdges.size === 0);
    check('impact mark original untouched', shield.trails.length === 0);
    const after = addTrail(marked, ['a', 'b', 't'], 'intercepted');
    check('impact mark survives addTrail', after.trailNodes.get('c1') === 'allowed');
    const zone2 = zoneOverlayState({ core: ['t'] });
    check('impact mark non-shield untouched', addImpactMark(zone2, 'c1', 'allowed') === zone2);
    check('impact mark empty id untouched', addImpactMark(shield, '', 'allowed') === shield);
}
{
    let shield = shieldOverlayState({ core: ['t'] }, 1);
    shield = addTrail(shield, ['a', 'b', 't'], 'breach');
    shield = addImpactMark(shield, 'c1', 'allowed');
    const morphed = morphShieldOverlayState(shield, {
        core: ['t', 'u'],
        halo: [{ id: 'v', distance: 1 }],
    });
    check('morph keeps kind', morphed.kind === 'shield');
    check('morph swaps core', morphed.core.has('u') && morphed.core.has('t'));
    check('morph swaps halo', morphed.halo.get('v') === 1);
    check('morph keeps trails', morphed.trails.length === 2);
    check('morph keeps trail edges', morphed.trailEdges.get(trailEdgeKey('a', 'b')) === 'breach');
    check('morph keeps impact marks', morphed.trailNodes.get('c1') === 'allowed');
    check('morph keeps full rise', morphed.rise === 1);
    const midClimb = { ...shield, rise: 0.2 };
    check('morph floors low rise', morphShieldOverlayState(midClimb, { core: ['t'] }).rise === SHIELD_MORPH_RISE);
    const aboveFloor = { ...shield, rise: 0.8 };
    check('morph keeps higher rise', morphShieldOverlayState(aboveFloor, { core: ['t'] }).rise === 0.8);
    const fresh = morphShieldOverlayState(null, { core: ['t'] });
    check('morph from nothing starts at 0', fresh.rise === 0 && fresh.trails.length === 0);
    const zone3 = zoneOverlayState({ core: ['t'] });
    const overZone = morphShieldOverlayState(zone3, { core: ['t'] });
    check('morph over non-shield starts fresh', overZone.rise === 0 && overZone.trails.length === 0);
}
{
    const model = { index: new Map([['a', 0], ['b', 1]]) };
    const indices = resolveIndices(model, ['a', 'missing', 'b']);
    check('resolve skips unknown ids', indices.length === 2);
    check('resolve maps to buffer indices', indices[0] === 0 && indices[1] === 1);
}
{
    const touched = touchedNodeIdsFromOps([
        { op: 'add_node', node: { id: 'n1' } },
        { op: 'add_edge', edge: { from: 'n1', to: 'n2' } },
        { op: 'upgrade_edge', from: 'n2', to: 'n3', kind: 'Call' },
        { op: 'attach_layer', node_id: 'n4', layer: 'cfg' },
        { op: 'remove_subgraph', file_index: 7 },
    ], { nodes: { gone: { file_index: 7 }, keep: { file_index: 1 } } });
    check('touched includes add_node', touched.has('n1'));
    check('touched includes edge endpoints', touched.has('n2') && touched.has('n3'));
    check('touched includes attach_layer', touched.has('n4'));
    check('touched includes remove_subgraph by file_index', touched.has('gone') && !touched.has('keep'));
    const now = 1000000;
    const map = mergeLiveTouched(null, ['a', 'b'], now);
    check('mergeLiveTouched seeds timestamps', map.get('a') === now && map.get('b') === now);
    const later = mergeLiveTouched(map, ['b', 'c'], now + 100);
    check('mergeLiveTouched refreshes existing', later.get('b') === now + 100);
    check('mergeLiveTouched keeps untouched', later.get('a') === now);
    const active = liveOverlayState(later, now + 100, { confirmed: false });
    check('liveOverlayState kind', active?.kind === 'live');
    check('liveOverlayState pulse > 0', (active?.pulse ?? 0) > 0);
    const expired = liveOverlayState(later, now + LIVE_HALO_DECAY_MS + 200);
    check('liveOverlayState expires', expired === null);
    const confirmed = liveOverlayState(later, now + 100, { confirmed: true, confirmAt: now + 100 });
    check('liveOverlayState confirmed', confirmed?.confirmed === true);
    check('shouldFrameLiveCamera when no prior interaction', shouldFrameLiveCamera(null, now));
    check('shouldFrameLiveCamera blocks during cooldown', shouldFrameLiveCamera(now - 1000, now) === false);
    check('shouldFrameLiveCamera allows after cooldown', shouldFrameLiveCamera(now - 6000, now) === true);
}
{
    const state = impactOverlayState({
        sourceId: 'a',
        impacted: [
            { id: 'b', depth: 1 },
            { id: 'c', depth: 2 },
            { id: 'a', depth: 1 },
            { id: 'd', depth: 0 },
            { nope: true },
            null,
        ],
    });
    check('impact kind', state.kind === 'impact');
    check('impact source', state.source === 'a');
    check('impact excludes source from map', !state.impacted.has('a'));
    check('impact depth kept', state.impacted.get('b') === 1 && state.impacted.get('c') === 2);
    check('impact zero depth clamps to 1', state.impacted.get('d') === 1);
    check('impact max distance', state.maxDistance === 2);
    const empty = impactOverlayState({});
    check('impact empty', empty.source === null && empty.impacted.size === 0);
}
{
    let calls = 0;
    setLiveClearedHandler(() => {
        calls += 1;
    });
    setLiveClearedHandler(null);
    check('setLiveClearedHandler accepts null', calls === 0);
}
if (failures > 0) {
    console.error(`${failures} overlay test(s) failed`);
    process.exit(1);
}
console.log('overlay tests passed');
