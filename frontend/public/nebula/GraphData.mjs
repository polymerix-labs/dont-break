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
export const EDGE_KINDS = [
    'Unknown',
    'Contains',
    'Imports',
    'Call',
    'Extends',
    'Implements',
    'UsesType',
];
const EDGE_KIND_INDEX = new Map(EDGE_KINDS.map((k, i) => [k, i]));
function edgeKindCode(edgeType) {
    return EDGE_KIND_INDEX.get(edgeType) ?? 0;
}
export function buildModel(graph, caps = {}) {
    const maxNodes = caps.maxNodes ?? 60000;
    const maxEdges = caps.maxEdges ?? 200000;
    const nodesMap = graph.nodes || {};
    const outEdges = graph.out_edges || {};
    const degreeById = new Map();
    const bump = (id) => degreeById.set(id, (degreeById.get(id) || 0) + 1);
    for (const id of Object.keys(nodesMap))
        degreeById.set(id, 0);
    for (const from of Object.keys(outEdges)) {
        const list = outEdges[from] || [];
        for (const e of list) {
            bump(e.from);
            bump(e.to);
        }
    }
    let keptIds = Object.keys(nodesMap);
    if (keptIds.length > maxNodes) {
        keptIds = keptIds
            .slice()
            .sort((a, b) => (degreeById.get(b) || 0) - (degreeById.get(a) || 0))
            .slice(0, maxNodes);
    }
    keptIds.sort();
    const index = new Map();
    keptIds.forEach((id, i) => index.set(id, i));
    const N = keptIds.length;
    const ids = keptIds;
    const names = new Array(N);
    const types = new Array(N);
    const nodes = new Array(N);
    const degree = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        const node = nodesMap[ids[i]];
        nodes[i] = node;
        names[i] = node?.name ?? ids[i];
        types[i] = node?.node_type ?? 'Unknown';
        degree[i] = degreeById.get(ids[i]) || 0;
    }
    const fromArr = [];
    const toArr = [];
    const kindArr = [];
    const adjacency = Array.from({ length: N }, () => []);
    outer: for (const from of Object.keys(outEdges)) {
        const fi = index.get(from);
        if (fi === undefined)
            continue;
        for (const e of outEdges[from] || []) {
            const ti = index.get(e.to);
            if (ti === undefined)
                continue;
            fromArr.push(fi);
            toArr.push(ti);
            kindArr.push(edgeKindCode(e.edge_type));
            adjacency[fi].push(ti);
            adjacency[ti].push(fi);
            if (fromArr.length >= maxEdges)
                break outer;
        }
    }
    const edgeFrom = Int32Array.from(fromArr);
    const edgeTo = Int32Array.from(toArr);
    const edgeKind = Uint8Array.from(kindArr);
    let entry = 0;
    for (let i = 1; i < N; i++)
        if (degree[i] > degree[entry])
            entry = i;
    const { waveOrder, waveDepth } = bfs(entry, adjacency, N);
    const { groupId, groupCount, groupLabels } = assignGroups(nodes);
    const groupAnchor = ballAnchors(groupCount);
    const anchors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const g = groupId[i] * 3;
        anchors[i * 3] = groupAnchor[g];
        anchors[i * 3 + 1] = groupAnchor[g + 1];
        anchors[i * 3 + 2] = groupAnchor[g + 2];
    }
    const seedPositions = groupCloudSeed(anchors, groupId, N);
    const { layoutEdgeFrom, layoutEdgeTo, layoutEdgeW } = buildLayoutEdges(edgeFrom, edgeTo, edgeKind, groupId);
    return {
        ids,
        index,
        names,
        types,
        nodes,
        edgeFrom,
        edgeTo,
        edgeKind,
        layoutEdgeFrom,
        layoutEdgeTo,
        layoutEdgeW,
        degree,
        adjacency,
        entry,
        waveOrder,
        waveDepth,
        groupId,
        groupCount,
        groupLabels,
        anchors,
        seedPositions,
    };
}
export function communityKey(node) {
    const rp = node?.metadata?.relative_path;
    if (typeof rp === 'string' && rp.length) {
        const dir = rp.replace(/[/\\][^/\\]+$/, '');
        return dir || 'root';
    }
    const pkg = node?.package;
    if (typeof pkg === 'string' && pkg.length) {
        const parts = pkg.split('.');
        return parts.slice(0, Math.min(4, parts.length)).join('.');
    }
    const fqn = node?.fqn;
    if (typeof fqn === 'string' && fqn.length) {
        if (fqn.includes('/') || fqn.includes('\\')) {
            let dir = fqn.replace(/[/\\][^/\\]+$/, '');
            const m = dir.match(/(?:^|[/\\])(?:kotlin|java)[/\\](.+)$/);
            if (m) {
                const parts = m[1].split(/[/\\]/);
                return parts.slice(0, Math.min(5, parts.length)).join('.');
            }
            return dir || 'root';
        }
        const parts = fqn.split('.');
        if (parts.length > 1)
            parts.pop();
        return parts.slice(0, Math.min(5, parts.length)).join('.');
    }
    return 'misc';
}
export function assignGroups(nodes) {
    const GROUPS = 512;
    const labels = nodes.map(communityKey);
    const unique = [...new Set(labels)];
    const labelToGroup = new Map();
    if (unique.length <= GROUPS) {
        unique.forEach((l, i) => labelToGroup.set(l, i));
    }
    else {
        for (const l of unique)
            labelToGroup.set(l, hashLabel(l) % GROUPS);
    }
    const groupId = new Int32Array(nodes.length);
    for (let i = 0; i < nodes.length; i++)
        groupId[i] = labelToGroup.get(labels[i]);
    const groupCount = Math.min(unique.length, GROUPS);
    const groupLabels = new Array(groupCount).fill('');
    for (const [label, gid] of labelToGroup) {
        if (gid >= 0 && gid < groupCount && !groupLabels[gid])
            groupLabels[gid] = label;
    }
    return { groupId, groupCount, groupLabels };
}
export { ballAnchors };
function hashLabel(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function groupCloudSeed(anchors, groupId, n) {
    const rng = mulberry32(0x851f ^ n);
    const k = 8.5 * Math.cbrt(n / 400 + 1);
    const spread = k * 9;
    const lobeR = k * 3;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
        const jx = (rng() + rng() + rng() - 1.5) * lobeR;
        const jy = (rng() + rng() + rng() - 1.5) * lobeR;
        const jz = (rng() + rng() + rng() - 1.5) * lobeR;
        pos[i * 3] = anchors[i * 3] * spread + jx;
        pos[i * 3 + 1] = anchors[i * 3 + 1] * spread + jy;
        pos[i * 3 + 2] = anchors[i * 3 + 2] * spread + jz;
    }
    return pos;
}
const EDGE_LAYOUT_WEIGHT = [
    1.0,
    1.4,
    1.0,
    0.85,
    1.55,
    1.5,
    1.15,
];
function buildLayoutEdges(edgeFrom, edgeTo, edgeKind, groupId, maxEdges = 90000) {
    const from = [];
    const to = [];
    const w = [];
    for (let e = 0; e < edgeFrom.length && from.length < maxEdges; e++) {
        const a = edgeFrom[e];
        const b = edgeTo[e];
        if (groupId[a] === groupId[b]) {
            from.push(a);
            to.push(b);
            w.push(EDGE_LAYOUT_WEIGHT[edgeKind[e]] ?? 1.0);
        }
    }
    return {
        layoutEdgeFrom: Int32Array.from(from),
        layoutEdgeTo: Int32Array.from(to),
        layoutEdgeW: Float32Array.from(w),
    };
}
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function ballAnchors(g) {
    const n = Math.max(g, 1);
    const out = new Float32Array(n * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n;
        const ring = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
        const radius = 1.0;
        out[i * 3] = Math.cos(theta) * ring * radius;
        out[i * 3 + 1] = y * radius;
        out[i * 3 + 2] = Math.sin(theta) * ring * radius;
    }
    return out;
}
function bfs(start, adjacency, n) {
    const depth = new Int32Array(n).fill(-1);
    const order = new Int32Array(n);
    let head = 0;
    let tail = 0;
    const queue = new Int32Array(n);
    depth[start] = 0;
    queue[tail++] = start;
    while (head < tail) {
        const u = queue[head++];
        order[head - 1] = u;
        for (const v of adjacency[u]) {
            if (depth[v] === -1) {
                depth[v] = depth[u] + 1;
                queue[tail++] = v;
            }
        }
    }
    let k = tail;
    for (let i = 0; i < n; i++) {
        if (depth[i] === -1)
            order[k++] = i;
    }
    return { waveOrder: order, waveDepth: depth };
}
export function edgeWaveDistances(positions, edgeFrom, edgeTo, entryIndex) {
    const E = edgeFrom.length;
    const distances = new Float32Array(E);
    if (E === 0)
        return { distances, maxDistance: 0 };
    const ex = positions[entryIndex * 3];
    const ey = positions[entryIndex * 3 + 1];
    const ez = positions[entryIndex * 3 + 2];
    const distOf = (i) => {
        const dx = positions[i * 3] - ex;
        const dy = positions[i * 3 + 1] - ey;
        const dz = positions[i * 3 + 2] - ez;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    let maxDistance = 0;
    for (let e = 0; e < E; e++) {
        const d = Math.max(distOf(edgeFrom[e]), distOf(edgeTo[e]));
        distances[e] = d;
        if (d > maxDistance)
            maxDistance = d;
    }
    for (let e = 0; e < E; e++) {
        const h = ((e + 1) * 2654435761 >>> 0) / 4294967296;
        distances[e] = Math.max(distances[e] + (h - 0.5) * maxDistance * 0.06, 0);
        if (distances[e] > maxDistance)
            maxDistance = distances[e];
    }
    return { distances, maxDistance };
}
export function createPartialGraph() {
    return { nodes: {}, out_edges: {} };
}
export function mergeNodeBatch(graph, batch) {
    const ids = batch.ids || [];
    const names = batch.names || [];
    const types = batch.types || [];
    const fqns = batch.fqns || [];
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        graph.nodes[id] = {
            id,
            name: names[i] ?? id,
            node_type: types[i] ?? 'Unknown',
            fqn: fqns[i] ?? id,
        };
    }
}
export function mergeEdgeBatch(graph, batch) {
    const from = batch.from || [];
    const to = batch.to || [];
    const kinds = batch.kinds || [];
    for (let i = 0; i < from.length; i++) {
        const f = from[i];
        const t = to[i];
        const k = kinds[i] ?? 'Unknown';
        if (!graph.out_edges[f])
            graph.out_edges[f] = [];
        graph.out_edges[f].push({ from: f, to: t, edge_type: k });
    }
}
export function mergeViewDelta(graph, delta) {
    if (delta.add_nodes)
        mergeNodeBatch(graph, delta.add_nodes);
    if (delta.add_edges)
        mergeEdgeBatch(graph, delta.add_edges);
}
export function mergeGraphDeltaOps(graph, delta) {
    for (const op of delta.ops || []) {
        if (op?.op === GraphDeltaOp.ADD_NODE && op.node) {
            const n = op.node;
            const id = n.id;
            if (!id)
                continue;
            const fqn = n.fqn || id;
            const name = fqn.includes('.') ? fqn.slice(fqn.lastIndexOf('.') + 1) : fqn;
            mergeNodeBatch(graph, {
                ids: [id],
                names: [name],
                types: [n.type || 'Unknown'],
                fqns: [fqn],
            });
        }
        else if (op?.op === GraphDeltaOp.ADD_EDGE && op.edge) {
            const e = op.edge;
            if (!e.from || !e.to)
                continue;
            mergeEdgeBatch(graph, {
                from: [e.from],
                to: [e.to],
                kinds: [e.kind || 'Unknown'],
            });
        }
        else if (op?.op === GraphDeltaOp.UPGRADE_EDGE && op.from && op.to) {
            const list = graph.out_edges[op.from];
            if (!list)
                continue;
            const kind = op.kind || 'Imports';
            let upgraded = false;
            for (let i = 0; i < list.length; i++) {
                const edge = list[i];
                if (edge.edge_type === kind || edge.edge_type === 'Imports') {
                    list[i] = { from: op.from, to: op.to, edge_type: kind };
                    upgraded = true;
                    break;
                }
            }
            if (!upgraded) {
                mergeEdgeBatch(graph, {
                    from: [op.from],
                    to: [op.to],
                    kinds: [kind],
                });
            }
        }
    }
}
export function reconcilePartialGraph(_existing, canonical) {
    const out = createPartialGraph();
    for (const [id, node] of Object.entries(canonical.nodes || {})) {
        out.nodes[id] = { ...node };
    }
    for (const [from, edges] of Object.entries(canonical.out_edges || {})) {
        out.out_edges[from] = (edges || []).map((e) => ({ ...e }));
    }
    return out;
}
export function buildModelFromPartial(graph, caps = {}) {
    return buildModel(graph, caps);
}
