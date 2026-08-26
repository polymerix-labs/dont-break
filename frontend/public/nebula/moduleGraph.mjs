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

import { ballAnchors, communityKey, EDGE_KINDS } from './GraphData.mjs';
export const MODULE_ID_PREFIX = '__mod__:';
export const EXTERNAL_ORBIT = 1.6;
function layoutSpread(n) {
    const k = 8.5 * Math.cbrt(n / 400 + 1);
    return k * 9;
}
export function shortModuleLabel(key) {
    const s = String(key || 'misc');
    if (s.includes('/') || s.includes('\\')) {
        const parts = s.split(/[/\\]/).filter(Boolean);
        return parts.slice(-2).join('/') || s;
    }
    const parts = s.split('.').filter(Boolean);
    if (parts.length <= 3)
        return s;
    return parts.slice(-3).join('.');
}
export function isExternalModule(model, memberIndices) {
    if (!memberIndices.length)
        return false;
    let ext = 0;
    for (const i of memberIndices) {
        if (model.types[i] === 'External')
            ext++;
    }
    return ext * 2 >= memberIndices.length;
}
export function moduleNodeId(label) {
    return MODULE_ID_PREFIX + label;
}
export function isModuleNodeId(id) {
    return typeof id === 'string' && id.startsWith(MODULE_ID_PREFIX);
}
export function moduleLabelFromId(id) {
    if (!isModuleNodeId(id))
        return null;
    return id.slice(MODULE_ID_PREFIX.length);
}
export function buildModuleGraph(model) {
    const N = model.ids.length;
    const groupCount = model.groupCount || 0;
    const groupLabels = model.groupLabels || [];
    const members = Array.from({ length: groupCount }, () => []);
    for (let i = 0; i < N; i++) {
        const g = model.groupId?.[i] ?? 0;
        if (g >= 0 && g < groupCount)
            members[g].push(i);
    }
    const modules = [];
    const moduleIndexByLabel = new Map();
    const nodeToModule = new Int32Array(N).fill(-1);
    for (let g = 0; g < groupCount; g++) {
        const idxs = members[g];
        if (!idxs.length)
            continue;
        const label = groupLabels[g] || communityKey(model.nodes[idxs[0]]) || `group-${g}`;
        const info = {
            id: moduleNodeId(label),
            label,
            shortLabel: shortModuleLabel(label),
            groupId: g,
            memberIndices: idxs,
            memberIds: idxs.map((i) => model.ids[i]),
            isExternal: isExternalModule(model, idxs),
            size: idxs.length,
        };
        const mi = modules.length;
        modules.push(info);
        moduleIndexByLabel.set(label, mi);
        for (const i of idxs)
            nodeToModule[i] = mi;
    }
    const edgeMap = new Map();
    const E = model.edgeFrom.length;
    for (let e = 0; e < E; e++) {
        const a = model.edgeFrom[e];
        const b = model.edgeTo[e];
        const ma = nodeToModule[a];
        const mb = nodeToModule[b];
        if (ma < 0 || mb < 0 || ma === mb)
            continue;
        const lo = Math.min(ma, mb);
        const hi = Math.max(ma, mb);
        const key = `${lo}|${hi}`;
        let rec = edgeMap.get(key);
        if (!rec) {
            rec = { from: lo, to: hi, count: 0, kinds: new Array(EDGE_KINDS.length).fill(0) };
            edgeMap.set(key, rec);
        }
        rec.count++;
        const k = model.edgeKind?.[e] ?? 0;
        if (k >= 0 && k < rec.kinds.length)
            rec.kinds[k]++;
    }
    const edges = [...edgeMap.values()].map((rec) => {
        let bestKind = 0;
        let best = -1;
        for (let k = 0; k < rec.kinds.length; k++) {
            if (rec.kinds[k] > best) {
                best = rec.kinds[k];
                bestKind = k;
            }
        }
        return { from: rec.from, to: rec.to, count: rec.count, kind: bestKind };
    });
    return { modules, moduleIndexByLabel, nodeToModule, edges };
}
export function mapIdsToView(moduleGraph, fullModel, nodeIds, openModuleId) {
    const out = [];
    const seen = new Set();
    for (const id of nodeIds) {
        const fi = fullModel.index.get(id);
        if (fi === undefined) {
            if (isModuleNodeId(id) && !seen.has(id)) {
                seen.add(id);
                out.push(id);
            }
            continue;
        }
        const mi = moduleGraph.nodeToModule[fi];
        if (mi < 0)
            continue;
        const mod = moduleGraph.modules[mi];
        const viewId = openModuleId === mod.label ? id : mod.id;
        if (!seen.has(viewId)) {
            seen.add(viewId);
            out.push(viewId);
        }
    }
    return out;
}
export function dominantModuleForIds(moduleGraph, fullModel, nodeIds) {
    const counts = new Map();
    for (const id of nodeIds) {
        const fi = fullModel.index.get(id);
        if (fi === undefined)
            continue;
        const mi = moduleGraph.nodeToModule[fi];
        if (mi < 0)
            continue;
        const label = moduleGraph.modules[mi].label;
        counts.set(label, (counts.get(label) || 0) + 1);
    }
    let best = null;
    let bestN = 0;
    for (const [label, n] of counts) {
        if (n > bestN) {
            bestN = n;
            best = label;
        }
    }
    return best;
}
export function deriveViewModel(fullModel, moduleGraph, opts = {}) {
    const openModuleId = opts.openModuleId ?? null;
    const showExternals = opts.showExternals !== false;
    const forceInclude = new Set(opts.forceIncludeIds || []);
    const visibleMods = moduleGraph.modules.filter((m) => {
        if (!showExternals && m.isExternal && m.label !== openModuleId)
            return false;
        return true;
    });
    const ids = [];
    const names = [];
    const types = [];
    const nodes = [];
    const isMeta = [];
    const moduleLabelArr = [];
    const groupIdArr = [];
    const degreeArr = [];
    let seedPositions;
    const index = new Map();
    const spread = layoutSpread(Math.max(fullModel.ids.length, 400));
    const unitAnchors = ballAnchors(Math.max(moduleGraph.modules.length, 1));
    const modPos = new Map();
    for (const m of moduleGraph.modules) {
        const ai = Math.min(m.groupId, unitAnchors.length / 3 - 1);
        const radius = m.isExternal ? EXTERNAL_ORBIT : 1.0;
        modPos.set(m.label, [
            unitAnchors[ai * 3] * radius * spread,
            unitAnchors[ai * 3 + 1] * radius * spread,
            unitAnchors[ai * 3 + 2] * radius * spread,
        ]);
    }
    const pushMeta = (m) => {
        const i = ids.length;
        ids.push(m.id);
        names.push(m.shortLabel);
        types.push('Module');
        nodes.push({
            id: m.id,
            name: m.shortLabel,
            node_type: 'Module',
            fqn: m.label,
            package: m.label,
            _module: true,
            _size: m.size,
            _external: m.isExternal,
        });
        isMeta.push(true);
        moduleLabelArr.push(m.label);
        groupIdArr.push(m.groupId);
        let deg = m.size;
        for (const e of moduleGraph.edges) {
            const a = moduleGraph.modules[e.from];
            const b = moduleGraph.modules[e.to];
            if (a.label === m.label || b.label === m.label)
                deg += e.count;
        }
        degreeArr.push(deg);
        index.set(m.id, i);
        return i;
    };
    const pushReal = (fi, around) => {
        const i = ids.length;
        const id = fullModel.ids[fi];
        ids.push(id);
        names.push(fullModel.names[fi]);
        types.push(fullModel.types[fi]);
        nodes.push(fullModel.nodes[fi]);
        isMeta.push(false);
        const mi = moduleGraph.nodeToModule[fi];
        moduleLabelArr.push(mi >= 0 ? moduleGraph.modules[mi].label : openModuleId);
        groupIdArr.push(fullModel.groupId[fi]);
        degreeArr.push(fullModel.degree[fi]);
        index.set(id, i);
        return { viewI: i, fullI: fi, around };
    };
    const pushForceInclude = (id, fallbackPos) => {
        if (index.has(id))
            return;
        const fi = fullModel.index.get(id);
        if (fi === undefined)
            return;
        const mi = moduleGraph.nodeToModule[fi];
        if (mi >= 0) {
            const mod = moduleGraph.modules[mi];
            if (!showExternals && mod.isExternal && mod.label !== openModuleId)
                return;
            const around = modPos.get(mod.label) || fallbackPos;
            realSeeds.push(pushReal(fi, around));
            return;
        }
        realSeeds.push(pushReal(fi, fallbackPos));
    };
    const realSeeds = [];
    if (openModuleId) {
        const open = moduleGraph.modules.find((m) => m.label === openModuleId);
        const openPos = modPos.get(openModuleId) || [0, 0, 0];
        if (open) {
            for (const fi of open.memberIndices) {
                realSeeds.push(pushReal(fi, openPos));
            }
        }
        for (const m of visibleMods) {
            if (m.label === openModuleId)
                continue;
            pushMeta(m);
        }
        for (const id of forceInclude)
            pushForceInclude(id, openPos);
    }
    else {
        for (const m of visibleMods)
            pushMeta(m);
        for (const id of forceInclude)
            pushForceInclude(id, [0, 0, 0]);
    }
    const V = ids.length;
    seedPositions = new Float32Array(V * 3);
    const anchors = new Float32Array(V * 3);
    const lobeR = spread * 0.12;
    for (let i = 0; i < V; i++) {
        if (!isMeta[i])
            continue;
        const label = moduleLabelArr[i];
        const p = modPos.get(label) || [0, 0, 0];
        seedPositions[i * 3] = p[0];
        seedPositions[i * 3 + 1] = p[1];
        seedPositions[i * 3 + 2] = p[2];
        anchors[i * 3] = p[0] / spread;
        anchors[i * 3 + 1] = p[1] / spread;
        anchors[i * 3 + 2] = p[2] / spread;
    }
    let rng = 0x851f ^ V;
    const next = () => {
        rng = (Math.imul(rng ^ (rng >>> 15), 1 | rng) + Math.imul(rng ^ (rng >>> 7), 61)) >>> 0;
        return rng / 4294967296;
    };
    for (const { viewI, around } of realSeeds) {
        const jx = (next() + next() + next() - 1.5) * lobeR;
        const jy = (next() + next() + next() - 1.5) * lobeR;
        const jz = (next() + next() + next() - 1.5) * lobeR;
        seedPositions[viewI * 3] = around[0] + jx;
        seedPositions[viewI * 3 + 1] = around[1] + jy;
        seedPositions[viewI * 3 + 2] = around[2] + jz;
        anchors[viewI * 3] = around[0] / spread;
        anchors[viewI * 3 + 1] = around[1] / spread;
        anchors[viewI * 3 + 2] = around[2] / spread;
    }
    const fromArr = [];
    const toArr = [];
    const kindArr = [];
    const weightArr = [];
    const adjacency = Array.from({ length: V }, () => []);
    const addEdge = (a, b, kind, w = 1) => {
        if (a === b || a < 0 || b < 0)
            return;
        fromArr.push(a);
        toArr.push(b);
        kindArr.push(kind);
        weightArr.push(w);
        adjacency[a].push(b);
        adjacency[b].push(a);
    };
    if (openModuleId) {
        const open = moduleGraph.modules.find((m) => m.label === openModuleId);
        if (open) {
            const memberSet = new Set(open.memberIndices);
            for (let e = 0; e < fullModel.edgeFrom.length; e++) {
                const a = fullModel.edgeFrom[e];
                const b = fullModel.edgeTo[e];
                if (!memberSet.has(a) && !forceInclude.has(fullModel.ids[a]))
                    continue;
                if (!memberSet.has(b) && !forceInclude.has(fullModel.ids[b]))
                    continue;
                const va = index.get(fullModel.ids[a]);
                const vb = index.get(fullModel.ids[b]);
                if (va === undefined || vb === undefined)
                    continue;
                addEdge(va, vb, fullModel.edgeKind[e] ?? 0, 1);
            }
            for (const e of moduleGraph.edges) {
                const aMod = moduleGraph.modules[e.from];
                const bMod = moduleGraph.modules[e.to];
                let other = null;
                if (aMod.label === openModuleId)
                    other = bMod;
                else if (bMod.label === openModuleId)
                    other = aMod;
                else
                    continue;
                if (!showExternals && other.isExternal)
                    continue;
                const metaI = index.get(other.id);
                if (metaI === undefined)
                    continue;
                let best = open.memberIndices[0];
                for (const fi of open.memberIndices) {
                    if (fullModel.degree[fi] > fullModel.degree[best])
                        best = fi;
                }
                const fromI = index.get(fullModel.ids[best]);
                if (fromI === undefined)
                    continue;
                addEdge(fromI, metaI, e.kind, Math.min(e.count, 8));
            }
        }
    }
    else {
        for (const e of moduleGraph.edges) {
            const aMod = moduleGraph.modules[e.from];
            const bMod = moduleGraph.modules[e.to];
            if (!showExternals && (aMod.isExternal || bMod.isExternal))
                continue;
            const ai = index.get(aMod.id);
            const bi = index.get(bMod.id);
            if (ai === undefined || bi === undefined)
                continue;
            addEdge(ai, bi, e.kind, Math.min(e.count, 12));
        }
        if (forceInclude.size) {
            for (const id of forceInclude) {
                const va = index.get(id);
                if (va === undefined || isMeta[va])
                    continue;
                const fi = fullModel.index.get(id);
                if (fi === undefined)
                    continue;
                const mi = moduleGraph.nodeToModule[fi];
                if (mi < 0)
                    continue;
                const metaI = index.get(moduleGraph.modules[mi].id);
                if (metaI !== undefined)
                    addEdge(va, metaI, 0, 2);
            }
            for (let e = 0; e < fullModel.edgeFrom.length; e++) {
                const aId = fullModel.ids[fullModel.edgeFrom[e]];
                const bId = fullModel.ids[fullModel.edgeTo[e]];
                if (!forceInclude.has(aId) || !forceInclude.has(bId))
                    continue;
                const va = index.get(aId);
                const vb = index.get(bId);
                if (va === undefined || vb === undefined)
                    continue;
                addEdge(va, vb, fullModel.edgeKind[e] ?? 0, 1);
            }
        }
    }
    const edgeFrom = Int32Array.from(fromArr);
    const edgeTo = Int32Array.from(toArr);
    const edgeKind = Uint8Array.from(kindArr);
    const layoutEdgeW = Float32Array.from(weightArr);
    const degree = Float32Array.from(degreeArr);
    const groupId = Int32Array.from(groupIdArr);
    let entry = 0;
    for (let i = 1; i < V; i++)
        if (degree[i] > degree[entry])
            entry = i;
    const waveOrder = new Int32Array(V);
    const waveDepth = new Int32Array(V);
    for (let i = 0; i < V; i++) {
        waveOrder[i] = i;
        waveDepth[i] = i === entry ? 0 : 1;
    }
    return {
        ids,
        index,
        names,
        types,
        nodes,
        edgeFrom,
        edgeTo,
        edgeKind,
        layoutEdgeFrom: edgeFrom,
        layoutEdgeTo: edgeTo,
        layoutEdgeW,
        degree,
        adjacency,
        entry,
        waveOrder,
        waveDepth,
        groupId,
        groupCount: fullModel.groupCount,
        groupLabels: fullModel.groupLabels,
        anchors,
        seedPositions,
        isMeta,
        moduleLabel: moduleLabelArr,
        viewKind: openModuleId ? 'expanded' : 'overview',
        openModuleId,
        fullSymbolCount: fullModel.ids.length,
        visibleModuleCount: visibleMods.length,
    };
}
export function viewStatusLabel(view) {
    if (view.viewKind === 'expanded' && view.openModuleId) {
        const short = shortModuleLabel(view.openModuleId);
        const members = view.isMeta.filter((m) => !m).length;
        return `${short} open (${members}) · ${view.visibleModuleCount} modules`;
    }
    return `${view.visibleModuleCount} modules · ${view.fullSymbolCount.toLocaleString()} symbols`;
}
export function expandModule(state, moduleLabel) {
    return { ...state, openModuleId: moduleLabel };
}
export function collapseToOverview(state) {
    return { ...state, openModuleId: null };
}
