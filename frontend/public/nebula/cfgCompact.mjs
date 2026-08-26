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

export const COMPACT_LABEL_CAP = 3;
export function cfgNodeLabel(node) {
    const s = node?.stmt;
    if (s) {
        switch (s.kind) {
            case 'Call': {
                const q = s.qualifier ? `${s.qualifier}.` : '';
                return `${q}${s.name}()`;
            }
            case 'Assign':
                return `${s.target || '?'} =`;
            case 'Return':
                return s.has_value ? 'return …' : 'return';
            case 'Throw':
                return 'throw';
            case 'Break':
                return s.label ? `break @${s.label}` : 'break';
            case 'Continue':
                return s.label ? `continue @${s.label}` : 'continue';
            case 'LocalDecl':
                return `${s.type_text ? s.type_text + ' ' : ''}${s.name}`;
            case 'NestedCallable':
                return 'λ';
            default:
                return 'expr';
        }
    }
    switch (node?.kind) {
        case 'Entry':
            return 'entry';
        case 'Exit':
            return 'exit';
        case 'Condition':
            return 'if';
        case 'LoopHead':
            return 'loop';
        case 'SwitchHead':
            return 'switch';
        case 'Merge':
            return 'merge';
        case 'CatchHead':
            return 'catch';
        case 'Finally':
            return 'finally';
        case 'Unreachable':
            return 'unreachable';
        default:
            return node?.kind || '?';
    }
}
export function compactCfg(graph) {
    if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
        return { nodes: [], edges: [], entry: 0, map: new Int32Array(0) };
    }
    const n = graph.nodes.length;
    const edges = Array.isArray(graph.edges) ? graph.edges : [];
    const succ = Array.from({ length: n }, () => []);
    const pred = Array.from({ length: n }, () => []);
    const edgeKind = new Map();
    for (const e of edges) {
        if (e == null || e.from == null || e.to == null)
            continue;
        succ[e.from].push(e.to);
        pred[e.to].push(e.from);
        edgeKind.set(`${e.from}->${e.to}`, e.kind || 'Sequential');
    }
    const isStmt = (i) => graph.nodes[i]?.kind === 'Stmt';
    const absorbed = new Array(n).fill(false);
    const chains = [];
    for (let i = 0; i < n; i++) {
        if (absorbed[i] || !isStmt(i))
            continue;
        if (succ[i].length !== 1)
            continue;
        const next = succ[i][0];
        if (edgeKind.get(`${i}->${next}`) !== 'Sequential')
            continue;
        if (!isStmt(next) || pred[next].length !== 1 || pred[next][0] !== i)
            continue;
        const chain = [i];
        let cur = next;
        while (true) {
            chain.push(cur);
            if (succ[cur].length !== 1)
                break;
            const nxt = succ[cur][0];
            if (edgeKind.get(`${cur}->${nxt}`) !== 'Sequential')
                break;
            if (!isStmt(nxt) || pred[nxt].length !== 1 || pred[nxt][0] !== cur)
                break;
            cur = nxt;
        }
        if (chain.length < 2)
            continue;
        for (const idx of chain)
            absorbed[idx] = true;
        chains.push(chain);
    }
    if (chains.length === 0) {
        return {
            nodes: graph.nodes.map((node) => ({ ...node })),
            edges: edges.map((e) => ({ ...e })),
            entry: graph.entry,
            exit: graph.exit,
            map: Int32Array.from({ length: n }, (_, i) => i),
        };
    }
    const newNodes = [];
    const map = new Int32Array(n);
    for (let i = 0; i < n; i++) {
        if (!absorbed[i]) {
            map[i] = newNodes.length;
            newNodes.push({ ...graph.nodes[i] });
        }
    }
    for (const chain of chains) {
        const labels = chain.map((idx) => cfgNodeLabel(graph.nodes[idx]));
        const shown = labels.slice(0, COMPACT_LABEL_CAP);
        const extra = Math.max(0, labels.length - COMPACT_LABEL_CAP);
        let callStmt = null;
        for (const idx of chain) {
            const st = graph.nodes[idx]?.stmt;
            if (st?.kind === 'Call') {
                callStmt = st;
                break;
            }
        }
        const newIdx = newNodes.length;
        for (const idx of chain)
            map[idx] = newIdx;
        newNodes.push({
            kind: 'Stmt',
            stmt: callStmt || graph.nodes[chain[0]].stmt,
            labels: shown,
            extra,
            members: chain.slice(),
            compacted: true,
        });
    }
    const newEdges = [];
    const seen = new Set();
    for (const e of edges) {
        const a = map[e.from];
        const b = map[e.to];
        if (a === b)
            continue;
        const kind = e.kind || 'Sequential';
        const key = `${a}->${b}:${kind}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        newEdges.push({ from: a, to: b, kind });
    }
    return {
        nodes: newNodes,
        edges: newEdges,
        entry: map[graph.entry] ?? 0,
        exit: graph.exit != null ? map[graph.exit] : undefined,
        map,
    };
}
