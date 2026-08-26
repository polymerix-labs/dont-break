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
import { splitNeighbors, impactSet, ruleCoverageForNode } from './panelData.mjs';
let failures = 0;
function check(label, ok, extra = '') {
    const mark = ok ? 'ok' : 'FAIL';
    if (!ok)
        failures += 1;
    console.log(`${mark} ${label}${extra ? ` ${extra}` : ''}`);
}
function makeGraph() {
    const nodes = {
        a: { id: 'a', name: 'A', node_type: 'Function', fqn: 'pkg.A' },
        b: { id: 'b', name: 'B', node_type: 'Function', fqn: 'pkg.B' },
        c: { id: 'c', name: 'C', node_type: 'Function', fqn: 'pkg.C' },
        d: { id: 'd', name: 'D', node_type: 'Class', fqn: 'pkg.D' },
    };
    const out_edges = {
        b: [{ from: 'b', to: 'a', edge_type: 'Call' }],
        c: [{ from: 'c', to: 'b', edge_type: 'Call' }],
        a: [{ from: 'a', to: 'd', edge_type: 'UsesType' }],
    };
    return buildModel({ nodes, out_edges });
}
{
    const model = makeGraph();
    const ia = model.index.get('a');
    const split = splitNeighbors(model, ia);
    check('usedBy includes b', split.usedBy.some((x) => model.ids[x.j] === 'b'));
    check('usedBy excludes d', !split.usedBy.some((x) => model.ids[x.j] === 'd'));
    check('dependsOn includes d', split.dependsOn.some((x) => model.ids[x.j] === 'd'));
    check('dependsOn Call kind on usedBy', split.usedBy.find((x) => model.ids[x.j] === 'b')?.kind === 'Call');
    check('dependsOn UsesType', split.dependsOn.find((x) => model.ids[x.j] === 'd')?.kind === 'UsesType');
    check('usedBy count for a', split.usedBy.length === 1);
    check('dependsOn count for a', split.dependsOn.length === 1);
}
{
    const model = makeGraph();
    const ia = model.index.get('a');
    const impact = impactSet(model, ia, 2);
    check('impact direct = 1 (b)', impact.direct === 1);
    check('impact radius includes b and c', impact.radius === 2);
    check('impact has b depth 1', impact.nodes.some((n) => n.id === 'b' && n.depth === 1));
    check('impact has c depth 2', impact.nodes.some((n) => n.id === 'c' && n.depth === 2));
    check('impact excludes d (dependency, not dependent)', !impact.nodes.some((n) => n.id === 'd'));
    check('impact depth 1 only b', impactSet(model, ia, 1).radius === 1);
    check('impact empty for unused leaf c', impactSet(model, model.index.get('c'), 2).radius === 0);
    check('impact of d includes a', impactSet(model, model.index.get('d'), 1).nodes.some((n) => n.id === 'a'));
}
{
    const rules = [
        {
            id: 'r1',
            name: 'Protect A',
            kind: 'pinned_do_not_touch',
            targets: { node_ids: ['a'] },
        },
        {
            id: 'r2',
            name: 'FQN B',
            kind: 'protected_path',
            targets: { fqns: ['pkg.B'] },
        },
        {
            id: 'r3',
            name: 'Boundary',
            kind: 'layer_boundary',
            from: { node_ids: ['a'] },
            to: { node_ids: ['d'] },
        },
        { id: 'r4', name: 'Empty', kind: 'pinned_do_not_touch' },
    ];
    const hitA = ruleCoverageForNode(rules, 'a', 'pkg.A');
    check('ruleCoverage hits node_ids', hitA.length === 1 && hitA[0].id === 'r1');
    const hitB = ruleCoverageForNode(rules, 'b', 'pkg.B');
    check('ruleCoverage hits fqns', hitB.length === 1 && hitB[0].name === 'FQN B');
    const hitC = ruleCoverageForNode(rules, 'c', 'pkg.C');
    check('ruleCoverage miss', hitC.length === 0);
    check('ruleCoverage ignores from/to-only rules', !hitA.some((r) => r.id === 'r3'));
    check('ruleCoverage empty rules', ruleCoverageForNode([], 'a', 'pkg.A').length === 0);
    check('ruleCoverage null-safe', ruleCoverageForNode(null, 'a', 'pkg.A').length === 0);
}
if (failures) {
    console.error(`\n${failures} failure(s)`);
    process.exit(1);
}
console.log('\nall panelData tests passed');
