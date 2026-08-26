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

import { escapeHtml } from './ui.mjs';
import { compactCfg, cfgNodeLabel } from './cfgCompact.mjs';
const NODE_W = 156;
const NODE_H = 34;
const GAP_X = 26;
const GAP_Y = 44;
const PAD = 16;
const EDGE_FAMILY = {
    Sequential: 'neutral',
    Unconditional: 'neutral',
    TrueBranch: 'true',
    SwitchCase: 'true',
    DefaultCase: 'true',
    FalseBranch: 'false',
    LoopBack: 'loop',
    LoopExit: 'neutral',
    Exception: 'exception',
    Finally: 'exception',
    Return: 'return',
};
const FAMILY_STYLE = {
    neutral: { color: '#6f6f77', dash: '' },
    true: { color: '#57b189', dash: '' },
    false: { color: '#dc6b6b', dash: '' },
    loop: { color: '#6f82e4', dash: '4 3' },
    exception: { color: '#cd8a55', dash: '4 3' },
    return: { color: '#8393ea', dash: '' },
};
const FAMILY_LEGEND = {
    neutral: 'flow',
    true: 'true',
    false: 'false',
    loop: 'loop',
    exception: 'exception',
    return: 'return',
};
const NODE_FILL = {
    Entry: '#2c5a46',
    Exit: '#39456f',
    Stmt: '#1f1f23',
    Condition: '#5a4630',
    SwitchHead: '#31505a',
    LoopHead: '#3b3f6b',
    Merge: '#2a2a30',
    CatchHead: '#5a3336',
    Finally: '#4f3c28',
    Unreachable: '#232327',
};
function edgeFamily(kind) {
    return EDGE_FAMILY[kind] || 'neutral';
}
function rankNodes(graph) {
    const n = graph.nodes.length;
    const succ = Array.from({ length: n }, () => []);
    for (const e of graph.edges)
        succ[e.from].push(e.to);
    const rank = new Array(n).fill(-1);
    const queue = [graph.entry];
    rank[graph.entry] = 0;
    for (let head = 0; head < queue.length; head++) {
        const u = queue[head];
        for (const v of succ[u]) {
            if (rank[v] === -1) {
                rank[v] = rank[u] + 1;
                queue.push(v);
            }
        }
    }
    let maxRank = 0;
    for (const r of rank)
        if (r > maxRank)
            maxRank = r;
    for (let i = 0; i < n; i++)
        if (rank[i] === -1)
            rank[i] = maxRank + 1;
    return rank;
}
function layout(graph, rank) {
    const byRank = new Map();
    for (let i = 0; i < graph.nodes.length; i++) {
        if (!byRank.has(rank[i]))
            byRank.set(rank[i], []);
        byRank.get(rank[i]).push(i);
    }
    let maxCols = 1;
    for (const ids of byRank.values())
        maxCols = Math.max(maxCols, ids.length);
    const totalW = maxCols * NODE_W + (maxCols - 1) * GAP_X;
    const pos = new Array(graph.nodes.length);
    for (const [r, ids] of byRank) {
        const rowW = ids.length * NODE_W + (ids.length - 1) * GAP_X;
        const x0 = PAD + (totalW - rowW) / 2;
        ids.forEach((id, col) => {
            pos[id] = {
                x: x0 + col * (NODE_W + GAP_X),
                y: PAD + r * (NODE_H + GAP_Y),
            };
        });
    }
    const maxR = Math.max(...rank);
    return {
        pos,
        width: totalW + PAD * 2,
        height: PAD * 2 + (maxR + 1) * NODE_H + maxR * GAP_Y,
    };
}
function edgePath(a, b) {
    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + NODE_H;
    const x2 = b.x + NODE_W / 2;
    const y2 = b.y;
    if (y2 > y1) {
        const my = (y1 + y2) / 2;
        return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
    }
    const bow = Math.max(40, Math.abs(y1 - y2) * 0.6);
    const xr = Math.max(x1, x2) + bow;
    return `M ${x1} ${a.y + NODE_H / 2} C ${xr} ${a.y + NODE_H / 2}, ${xr} ${b.y + NODE_H / 2}, ${x2} ${b.y + NODE_H / 2}`;
}
function displayLabel(node) {
    if (node.compacted && Array.isArray(node.labels)) {
        const base = node.labels.join(' · ');
        return node.extra > 0 ? `${base} +${node.extra}` : base;
    }
    return cfgNodeLabel(node);
}
function fullTooltip(node) {
    if (node.compacted && Array.isArray(node.labels)) {
        const all = node.labels.slice();
        if (node.extra > 0)
            all.push(`(+${node.extra} more)`);
        return all.join('\n');
    }
    return cfgNodeLabel(node);
}
function callFqn(node) {
    const s = node?.stmt;
    if (!s || s.kind !== 'Call')
        return null;
    const q = s.qualifier ? `${s.qualifier}.` : '';
    return `${q}${s.name}`;
}
function drawCfg(container, payload, opts = {}) {
    const raw = payload.graph;
    if (!raw || !Array.isArray(raw.nodes) || raw.nodes.length === 0) {
        container.innerHTML = '<p class="muted">Empty control-flow graph.</p>';
        return;
    }
    const graph = compactCfg(raw);
    const rank = rankNodes(graph);
    const { pos, width, height } = layout(graph, rank);
    const usedFamilies = new Set();
    for (const e of graph.edges)
        usedFamilies.add(edgeFamily(e.kind));
    const parts = [];
    parts.push(`<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" ` +
        `xmlns="http://www.w3.org/2000/svg" class="cfg-svg" ` +
        `style="width:100%;height:auto;max-height:420px;font:11px ui-monospace,monospace">`);
    parts.push('<defs>');
    for (const [fam, style] of Object.entries(FAMILY_STYLE)) {
        parts.push(`<marker id="ah-${fam}" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">` +
            `<path d="M0,0 L6,3 L0,6 Z" fill="${style.color}"/></marker>`);
    }
    parts.push('</defs>');
    parts.push('<style>' +
        '.cfg-pulse { stroke-dasharray: 5 13; animation: cfg-flow 1.1s linear infinite; }' +
        '@keyframes cfg-flow { to { stroke-dashoffset: -18; } }' +
        '@media (prefers-reduced-motion: reduce) { .cfg-pulse { display: none; } }' +
        '</style>');
    for (const e of graph.edges) {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b)
            continue;
        const fam = edgeFamily(e.kind);
        const style = FAMILY_STYLE[fam];
        const dash = style.dash ? ` stroke-dasharray="${style.dash}"` : '';
        const d = edgePath(a, b);
        parts.push(`<path d="${d}" fill="none" stroke="${style.color}" stroke-width="1.5" ` +
            `marker-end="url(#ah-${fam})" opacity="0.5"${dash}/>`);
        parts.push(`<path d="${d}" fill="none" stroke="${style.color}" stroke-width="2" ` +
            `class="cfg-pulse" opacity="0.9"/>`);
    }
    for (let i = 0; i < graph.nodes.length; i++) {
        const node = graph.nodes[i];
        const p = pos[i];
        if (!p)
            continue;
        const fill = NODE_FILL[node.kind] || '#1f2937';
        const dim = node.kind === 'Unreachable' ? ' opacity="0.55"' : '';
        const label = displayLabel(node);
        const tip = fullTooltip(node);
        const fqn = callFqn(node);
        const clickable = fqn ? ` data-cfg-call="${escapeHtml(fqn)}" class="cfg-call"` : '';
        const cursor = fqn ? ' cursor:pointer;' : '';
        parts.push(`<g${dim}${clickable} style="${cursor}">` +
            `<title>${escapeHtml(tip)}</title>` +
            `<rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="8" ry="8" ` +
            `fill="${fill}" stroke="rgba(120,120,135,0.35)" stroke-width="1"/>` +
            `<text x="${p.x + NODE_W / 2}" y="${p.y + NODE_H / 2 + 4}" text-anchor="middle" ` +
            `fill="#ececee">${escapeHtml(label).slice(0, 28)}</text>` +
            `</g>`);
    }
    parts.push('</svg>');
    if (usedFamilies.size) {
        parts.push('<div class="cfg-legend">');
        for (const fam of Object.keys(FAMILY_STYLE)) {
            if (!usedFamilies.has(fam))
                continue;
            const style = FAMILY_STYLE[fam];
            parts.push(`<span class="cfg-legend-item"><span class="cfg-legend-swatch" style="background:${style.color}"></span>${FAMILY_LEGEND[fam]}</span>`);
        }
        parts.push('</div>');
    }
    container.innerHTML = parts.join('');
    container.style.overflow = 'auto';
    if (typeof opts.onCallJump === 'function') {
        container.querySelectorAll('[data-cfg-call]').forEach((el) => {
            el.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const fqn = el.getAttribute('data-cfg-call');
                if (!fqn)
                    return;
                const resolved = Array.isArray(opts.resolvedOut) ? opts.resolvedOut : [];
                const hit = resolved.find((e) => e?.to_fqn === fqn || (e?.to_fqn && e.to_fqn.endsWith('.' + fqn)) || e?.to_fqn?.endsWith(fqn));
                opts.onCallJump(hit?.to_fqn || fqn);
            });
        });
    }
}
export function renderCfgPayload(container, payload, opts = {}) {
    if (!container)
        return;
    container.style.overflow = 'auto';
    if (!payload?.graph) {
        container.innerHTML = '<p class="muted">No control-flow graph.</p>';
        return;
    }
    drawCfg(container, payload, opts);
}
