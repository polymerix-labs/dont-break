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

import { compactCfg, cfgNodeLabel, COMPACT_LABEL_CAP } from './cfgCompact.mjs';
let failures = 0;
function check(label, ok, extra = '') {
    const mark = ok ? 'ok' : 'FAIL';
    if (!ok)
        failures += 1;
    console.log(`${mark} ${label}${extra ? ` ${extra}` : ''}`);
}
function stmt(name) {
    return { kind: 'Stmt', stmt: { kind: 'Call', name } };
}
{
    const graph = {
        entry: 0,
        exit: 5,
        nodes: [
            { kind: 'Entry' },
            stmt('a'),
            stmt('b'),
            stmt('c'),
            stmt('d'),
            { kind: 'Exit' },
        ],
        edges: [
            { from: 0, to: 1, kind: 'Sequential' },
            { from: 1, to: 2, kind: 'Sequential' },
            { from: 2, to: 3, kind: 'Sequential' },
            { from: 3, to: 4, kind: 'Sequential' },
            { from: 4, to: 5, kind: 'Sequential' },
        ],
    };
    const out = compactCfg(graph);
    check('linear: fewer nodes', out.nodes.length < graph.nodes.length);
    check('linear: entry/exit kept', out.nodes.some((n) => n.kind === 'Entry') && out.nodes.some((n) => n.kind === 'Exit'));
    const block = out.nodes.find((n) => n.compacted);
    check('linear: compacted block exists', !!block);
    check('linear: labels capped', block.labels.length <= COMPACT_LABEL_CAP);
    check('linear: extra count', block.extra === Math.max(0, 4 - COMPACT_LABEL_CAP));
    check('linear: edges span block', out.edges.length === 2);
}
{
    const graph = {
        entry: 0,
        exit: 5,
        nodes: [
            { kind: 'Entry' },
            { kind: 'Condition' },
            stmt('t'),
            stmt('f'),
            { kind: 'Merge' },
            { kind: 'Exit' },
        ],
        edges: [
            { from: 0, to: 1, kind: 'Sequential' },
            { from: 1, to: 2, kind: 'TrueBranch' },
            { from: 1, to: 3, kind: 'FalseBranch' },
            { from: 2, to: 4, kind: 'Sequential' },
            { from: 3, to: 4, kind: 'Sequential' },
            { from: 4, to: 5, kind: 'Sequential' },
        ],
    };
    const out = compactCfg(graph);
    check('if: condition preserved', out.nodes.some((n) => n.kind === 'Condition'));
    check('if: both stmts remain (branch tips, no chain)', out.nodes.filter((n) => n.kind === 'Stmt').length === 2);
    check('if: true/false edges kept', out.edges.some((e) => e.kind === 'TrueBranch') && out.edges.some((e) => e.kind === 'FalseBranch'));
}
{
    const graph = {
        entry: 0,
        exit: 4,
        nodes: [
            { kind: 'Entry' },
            { kind: 'LoopHead' },
            stmt('x'),
            stmt('y'),
            { kind: 'Exit' },
        ],
        edges: [
            { from: 0, to: 1, kind: 'Sequential' },
            { from: 1, to: 2, kind: 'TrueBranch' },
            { from: 2, to: 3, kind: 'Sequential' },
            { from: 3, to: 1, kind: 'LoopBack' },
            { from: 1, to: 4, kind: 'LoopExit' },
        ],
    };
    const out = compactCfg(graph);
    check('loop: LoopHead kept', out.nodes.some((n) => n.kind === 'LoopHead'));
    check('loop: body compacted', out.nodes.some((n) => n.compacted && n.members?.length === 2));
    check('loop: LoopBack preserved', out.edges.some((e) => e.kind === 'LoopBack'));
}
{
    const graph = {
        entry: 0,
        exit: 4,
        nodes: [
            { kind: 'Entry' },
            stmt('a'),
            stmt('b'),
            { kind: 'CatchHead' },
            { kind: 'Exit' },
        ],
        edges: [
            { from: 0, to: 1, kind: 'Sequential' },
            { from: 1, to: 2, kind: 'Sequential' },
            { from: 1, to: 3, kind: 'Exception' },
            { from: 2, to: 4, kind: 'Sequential' },
            { from: 3, to: 4, kind: 'Sequential' },
        ],
    };
    const out = compactCfg(graph);
    check('exception: CatchHead kept', out.nodes.some((n) => n.kind === 'CatchHead'));
    check('exception: Exception edge kept', out.edges.some((e) => e.kind === 'Exception'));
    check('exception: no false merge of branched stmt', !out.nodes.some((n) => n.compacted));
}
{
    check('cfgNodeLabel Call', cfgNodeLabel(stmt('foo')) === 'foo()');
    check('cfgNodeLabel Entry', cfgNodeLabel({ kind: 'Entry' }) === 'entry');
    const empty = compactCfg({ nodes: [], edges: [], entry: 0 });
    check('empty graph', empty.nodes.length === 0);
}
if (failures) {
    console.error(`\n${failures} failure(s)`);
    process.exit(1);
}
console.log('\nall cfgCompact tests passed');
