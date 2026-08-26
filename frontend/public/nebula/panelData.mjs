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

import { EDGE_KINDS } from './GraphData.mjs';
export function splitNeighbors(model, i) {
    const usedBy = [];
    const dependsOn = [];
    if (!model || i == null || i < 0)
        return { usedBy, dependsOn };
    const from = model.edgeFrom;
    const to = model.edgeTo;
    const kinds = model.edgeKind;
    if (!from || !to)
        return { usedBy, dependsOn };
    const inMap = new Map();
    const outMap = new Map();
    for (let e = 0; e < from.length; e++) {
        const a = from[e];
        const b = to[e];
        const kind = EDGE_KINDS[kinds?.[e] ?? 0] || 'Unknown';
        if (b === i && a !== i && !inMap.has(a))
            inMap.set(a, kind);
        if (a === i && b !== i && !outMap.has(b))
            outMap.set(b, kind);
    }
    for (const [j, kind] of inMap)
        usedBy.push({ j, kind });
    for (const [j, kind] of outMap)
        dependsOn.push({ j, kind });
    usedBy.sort((a, b) => a.j - b.j);
    dependsOn.sort((a, b) => a.j - b.j);
    return { usedBy, dependsOn };
}
export function impactSet(model, i, maxDepth = 2) {
    const nodes = [];
    if (!model || i == null || i < 0)
        return { direct: 0, radius: 0, nodes };
    const depth = Math.max(0, Math.floor(maxDepth));
    const from = model.edgeFrom;
    const to = model.edgeTo;
    if (!from || !to || depth === 0) {
        return { direct: 0, radius: 0, nodes };
    }
    const rev = Array.from({ length: model.ids.length }, () => []);
    for (let e = 0; e < from.length; e++) {
        const a = from[e];
        const b = to[e];
        if (a !== b)
            rev[b].push(a);
    }
    const dist = new Map([[i, 0]]);
    const queue = [i];
    for (let head = 0; head < queue.length; head++) {
        const u = queue[head];
        const d = dist.get(u) ?? 0;
        if (d >= depth)
            continue;
        for (const v of rev[u]) {
            if (dist.has(v))
                continue;
            dist.set(v, d + 1);
            queue.push(v);
        }
    }
    let direct = 0;
    for (const [j, d] of dist) {
        if (j === i || d <= 0)
            continue;
        if (d === 1)
            direct += 1;
        nodes.push({ id: model.ids[j], depth: d });
    }
    nodes.sort((a, b) => a.depth - b.depth || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { direct, radius: nodes.length, nodes };
}
export function ruleCoverageForNode(rules, nodeId, fqn) {
    if (!Array.isArray(rules) || !nodeId)
        return [];
    const out = [];
    const fqnStr = fqn && typeof fqn === 'string' ? fqn : null;
    for (const rule of rules) {
        if (!rule || typeof rule !== 'object')
            continue;
        const targets = rule.targets;
        if (!targets)
            continue;
        const ids = Array.isArray(targets.node_ids) ? targets.node_ids : [];
        const fqns = Array.isArray(targets.fqns) ? targets.fqns : [];
        const hit = ids.includes(nodeId) || (fqnStr != null && fqns.includes(fqnStr));
        if (!hit)
            continue;
        out.push({
            id: String(rule.id ?? ''),
            name: String(rule.name || rule.id || 'rule'),
            kind: String(rule.kind || ''),
        });
    }
    return out;
}
