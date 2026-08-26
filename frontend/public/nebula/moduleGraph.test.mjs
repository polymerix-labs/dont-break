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

import { buildModel } from './GraphData.mjs';
import { MODULE_ID_PREFIX, buildModuleGraph, deriveViewModel, mapIdsToView, dominantModuleForIds, shortModuleLabel, isModuleNodeId, expandModule, collapseToOverview, viewStatusLabel, moduleNodeId, } from './moduleGraph.mjs';
let failures = 0;
function check(label, ok, extra = '') {
    const mark = ok ? 'ok' : 'FAIL';
    if (!ok)
        failures += 1;
    console.log(`${mark} ${label}${extra ? ` ${extra}` : ''}`);
}
function makeGraph() {
    const nodes = {
        a1: { id: 'a1', name: 'A1', node_type: 'Class', fqn: 'com.app.core.A1' },
        a2: { id: 'a2', name: 'A2', node_type: 'Function', fqn: 'com.app.core.A2' },
        b1: { id: 'b1', name: 'B1', node_type: 'Class', fqn: 'com.app.ui.B1' },
        e1: { id: 'e1', name: 'Lifecycle', node_type: 'External', fqn: 'androidx.lifecycle.Lifecycle' },
        e2: { id: 'e2', name: 'ViewModel', node_type: 'External', fqn: 'androidx.lifecycle.ViewModel' },
    };
    const out_edges = {
        a1: [
            { from: 'a1', to: 'a2', edge_type: 'Contains' },
            { from: 'a1', to: 'b1', edge_type: 'Call' },
            { from: 'a1', to: 'e1', edge_type: 'UsesType' },
        ],
        b1: [{ from: 'b1', to: 'e2', edge_type: 'UsesType' }],
    };
    return buildModel({ nodes, out_edges });
}
{
    check('shortModuleLabel keeps short keys', shortModuleLabel('com.app.core') === 'com.app.core');
    check('shortModuleLabel trims long packages', shortModuleLabel('com.skydoves.pokedex.core.network.service') === 'core.network.service');
    check('isModuleNodeId', isModuleNodeId(moduleNodeId('com.app.core')) === true);
    check('isModuleNodeId rejects real', isModuleNodeId('a1') === false);
}
{
    const model = makeGraph();
    const mg = buildModuleGraph(model);
    check('buildModuleGraph has ≥ 2 modules', mg.modules.length >= 2);
    const labels = mg.modules.map((m) => m.label);
    check('buildModuleGraph separates core/ui', labels.some((l) => l.includes('core')) && labels.some((l) => l.includes('ui')));
    const ext = mg.modules.filter((m) => m.isExternal);
    check('buildModuleGraph marks androidx external', ext.some((m) => m.label.includes('androidx')));
    check('nodeToModule covers all nodes', [...mg.nodeToModule].every((v) => v >= 0));
    check('aggregated edges exist', mg.edges.length >= 1);
}
{
    const model = makeGraph();
    const mg = buildModuleGraph(model);
    const overview = deriveViewModel(model, mg, { openModuleId: null, showExternals: true });
    check('overview is meta-only', overview.isMeta.every(Boolean));
    check('overview viewKind', overview.viewKind === 'overview');
    check('overview node count = modules', overview.ids.length === mg.modules.length);
    check('overview ids are meta', overview.ids.every(isModuleNodeId));
    check('overview has edges', overview.edgeFrom.length >= 1);
    const hidden = deriveViewModel(model, mg, { openModuleId: null, showExternals: false });
    check('hide externals shrinks overview', hidden.ids.length < overview.ids.length ||
        !mg.modules.some((m) => m.isExternal));
}
{
    const model = makeGraph();
    const mg = buildModuleGraph(model);
    const core = mg.modules.find((m) => m.label.includes('core'));
    check('found core module', Boolean(core));
    const expanded = deriveViewModel(model, mg, {
        openModuleId: core.label,
        showExternals: true,
    });
    check('expanded viewKind', expanded.viewKind === 'expanded');
    check('expanded shows real members', expanded.isMeta.filter((m) => !m).length === core.size);
    check('expanded keeps other metas', expanded.isMeta.filter(Boolean).length === mg.modules.length - 1);
    check('expanded status mentions open', viewStatusLabel(expanded).includes('open'));
}
{
    const model = makeGraph();
    const mg = buildModuleGraph(model);
    const mapped = mapIdsToView(mg, model, ['a1', 'b1'], null);
    check('mapIdsToView overview → metas', mapped.every(isModuleNodeId));
    check('mapIdsToView dedupes', mapped.length === 2);
    const core = mg.modules.find((m) => m.label.includes('core'));
    const mappedOpen = mapIdsToView(mg, model, ['a1', 'b1'], core.label);
    check('mapIdsToView keeps open real id', mappedOpen.includes('a1'));
    check('mapIdsToView maps closed to meta', mappedOpen.some(isModuleNodeId));
    const dom = dominantModuleForIds(mg, model, ['a1', 'a2', 'b1']);
    check('dominantModuleForIds prefers core', dom.includes('core'));
}
{
    const s0 = { openModuleId: null, showExternals: true };
    const s1 = expandModule(s0, 'com.app.core');
    check('expandModule sets open', s1.openModuleId === 'com.app.core');
    const s2 = collapseToOverview(s1);
    check('collapseToOverview clears', s2.openModuleId === null);
    check('expand preserves externals flag', s1.showExternals === true);
}
{
    const model = makeGraph();
    const mg = buildModuleGraph(model);
    const overview = deriveViewModel(model, mg, {
        openModuleId: null,
        showExternals: true,
        forceIncludeIds: ['a1', 'b1'],
    });
    check('overview forceInclude injects reals', overview.index.has('a1') && overview.index.has('b1'));
    check('overview forceInclude keeps metas', overview.isMeta.filter(Boolean).length === mg.modules.filter((m) => true).length);
    const a1i = overview.index.get('a1');
    check('overview forceInclude a1 is real', a1i !== undefined && overview.isMeta[a1i] === false);
    const core = mg.modules.find((m) => m.label.includes('core'));
    const metaI = overview.index.get(core.id);
    const ax = overview.seedPositions[a1i * 3];
    const ay = overview.seedPositions[a1i * 3 + 1];
    const az = overview.seedPositions[a1i * 3 + 2];
    const mx = overview.seedPositions[metaI * 3];
    const my = overview.seedPositions[metaI * 3 + 1];
    const mz = overview.seedPositions[metaI * 3 + 2];
    const dist = Math.hypot(ax - mx, ay - my, az - mz);
    check('overview forceInclude seeded near meta', dist < 80);
}
{
    check('MODULE_ID_PREFIX stable', MODULE_ID_PREFIX === '__mod__:');
}
if (failures > 0) {
    console.error(`${failures} moduleGraph test(s) failed`);
    process.exit(1);
}
console.log('moduleGraph tests passed');
