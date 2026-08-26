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

import { renderCfgPayload } from './CfgPanel.mjs';
import { renderResolvedFromDto } from './ResolvedPanel.mjs';
import { hasArch, renderArchFromDto } from './ArchPanel.mjs';
import { fetchNodeDetail } from './NodeDetailClient.mjs';
import { bindSearchPick, isEmbed, notifyHost } from './hostBridge.mjs';
import { splitNeighbors, impactSet, ruleCoverageForNode } from './panelData.mjs';
export function escapeHtml(v) {
    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
let rulesCache = null;
const RULES_TTL_MS = 30000;
export function setSyncProgress({ pct = null, label = '', indeterminate = false } = {}) {
    const el = document.getElementById('status');
    if (!el)
        return;
    el.className = 'hud warn sync-progress';
    const pctText = pct != null ? `${Math.round(pct)}%` : '…';
    const fillClass = indeterminate || pct == null ? 'sync-fill indeterminate' : 'sync-fill';
    const fillStyle = pct != null && !indeterminate ? ` style="width:${Math.max(0, Math.min(100, pct))}%"` : '';
    el.innerHTML = `
    <div class="sync-label-row">
      <span class="sync-label">${escapeHtml(label)}</span>
      <span class="sync-pct">${escapeHtml(pctText)}</span>
    </div>
    <div class="sync-bar"><div class="${fillClass}"${fillStyle}></div></div>
  `;
}
export function clearSyncProgress() {
    const el = document.getElementById('status');
    if (!el || !el.classList.contains('sync-progress'))
        return;
    el.className = 'hud';
    el.textContent = '';
}
export function setStatus(msg, cls = '') {
    const el = document.getElementById('status');
    if (!el)
        return;
    el.className = ('hud ' + cls).trim();
    el.textContent = msg;
}
function kv(label, value) {
    if (value == null || value === '')
        return '';
    return `<div class="kv"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}
async function fetchRulesCached() {
    const now = Date.now();
    if (rulesCache && now - rulesCache.at < RULES_TTL_MS)
        return rulesCache.rules;
    try {
        const res = await fetch('/nebula/rules', { cache: 'no-store' });
        if (!res.ok)
            throw new Error(`rules ${res.status}`);
        const body = await res.json();
        const rules = Array.isArray(body?.rules) ? body.rules : Array.isArray(body) ? body : [];
        rulesCache = { at: now, rules };
        return rules;
    }
    catch {
        return rulesCache?.rules || [];
    }
}
function neighborListHtml(model, links, emptyLabel) {
    if (!links.length)
        return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
    const shown = links.slice(0, 40);
    let html = '<ul class="list">';
    for (const { j, kind } of shown) {
        html += `<li data-jump="${j}">${escapeHtml(model.names[j])} <span class="muted">· ${escapeHtml(kind)}</span></li>`;
    }
    html += '</ul>';
    if (links.length > shown.length)
        html += `<p class="muted">… ${links.length - shown.length} more</p>`;
    return html;
}
export async function openNodePanel(model, i, opts = {}) {
    const node = model.nodes[i] || {};
    const panel = document.getElementById('panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');
    if (!panel || !title || !body)
        return;
    const nodeId = model.ids[i];
    title.textContent = node.name || nodeId;
    const rp = node.metadata && node.metadata.relative_path;
    const lines = node.start_line != null
        ? `${node.start_line}–${node.end_line || node.start_line}`
        : '';
    const pathLine = rp ? (lines ? `${rp}:${lines}` : rp) : lines || '';
    const { usedBy, dependsOn } = splitNeighbors(model, i);
    const impact = impactSet(model, i, 2);
    let html = '';
    html += '<section class="section panel-header-meta">';
    html += `<div class="panel-type-row"><span class="panel-type-badge">${escapeHtml(node.node_type || 'node')}</span>`;
    if (pathLine)
        html += `<span class="muted panel-path">${escapeHtml(pathLine)}</span>`;
    html += '</div></section>';
    html +=
        '<section class="section" data-protection-sec><h2>Protection</h2><p class="muted">Loading…</p></section>';
    html += '<section class="section">';
    html += '<h2>If this changes</h2>';
    html += '<div class="impact-stats">';
    html += `<span class="impact-stat"><span class="impact-num">${impact.direct}</span><span class="impact-cap">break${impact.direct === 1 ? 's' : ''} directly</span></span>`;
    html += `<span class="impact-stat"><span class="impact-num">${impact.radius}</span><span class="impact-cap">within 2 hops</span></span>`;
    html += '</div>';
    html += `<button type="button" class="panel-impact-btn" data-show-impact="${i}">Light it up on the graph</button>`;
    html += `<details class="panel-fold"><summary>Used by <span class="fold-count">${usedBy.length}</span></summary>`;
    html += neighborListHtml(model, usedBy, 'Nobody calls this');
    html += '</details>';
    html += `<details class="panel-fold"><summary>Depends on <span class="fold-count">${dependsOn.length}</span></summary>`;
    html += neighborListHtml(model, dependsOn, 'No outgoing deps');
    html += '</details>';
    html += '</section>';
    html += '<details class="section panel-details"><summary>Details</summary><dl class="dl">';
    html += kv('type', node.node_type);
    if (node.fqn && node.fqn !== node.name)
        html += kv('fqn', node.fqn);
    html += kv('package', node.package);
    html += kv('language', node.language);
    html += kv('visibility', node.visibility);
    if (Array.isArray(node.modifiers) && node.modifiers.length)
        html += kv('modifiers', node.modifiers.join(' '));
    if (Array.isArray(node.params) && node.params.length)
        html += kv('parameters', node.params.map((p) => `${p.name}: ${p.type_text || '?'}`).join(', '));
    html += kv('return', node.return_type);
    if (node.signature)
        html += kv('signature', node.signature);
    if (rp)
        html += kv('path', rp);
    if (node.start_line)
        html += kv('lines', `${node.start_line}–${node.end_line || node.start_line}`);
    html += '</dl></details>';
    const refs = Array.isArray(node.references) ? node.references : [];
    html += `<details class="section panel-details"><summary>Unresolved references (${refs.length})</summary>`;
    if (refs.length) {
        html += '<ul class="list">';
        for (const r of refs.slice(0, 40)) {
            const q = r.qualifier ? `${r.qualifier}.` : '';
            const ar = r.arity != null ? `(${r.arity})` : '';
            html += `<li><span class="muted">[${escapeHtml(r.kind)}]</span> ${escapeHtml(q + r.name + ar)}</li>`;
        }
        html += '</ul>';
    }
    else {
        html += '<p class="muted">None</p>';
    }
    html += '</details>';
    html += '<section class="section" data-layers-sec><h2>Snapshot layers</h2><p class="muted">Loading…</p></section>';
    body.innerHTML = html;
    body.querySelector('[data-show-impact]')?.addEventListener('click', () => {
        if (typeof opts.onShowImpact !== 'function')
            return;
        opts.onShowImpact({ sourceId: nodeId, impacted: impact.nodes });
    });
    const protSec = body.querySelector('[data-protection-sec]');
    const layersSec = body.querySelector('[data-layers-sec]');
    const isCallable = /^(method|constructor|function)$/i.test(node.node_type || '');
    const rulesPromise = fetchRulesCached();
    const detailPromise = fetchNodeDetail(nodeId).catch((err) => ({ __err: err }));
    const rules = await rulesPromise;
    if (protSec) {
        const covered = ruleCoverageForNode(rules, nodeId, node.fqn);
        if (covered.length) {
            protSec.innerHTML =
                '<h2>Protection</h2>' +
                    '<div class="protection-card ok">' +
                    '<p class="protection-line"><span class="protection-dot"></span>Under guard</p>' +
                    '<p class="protection-sub">Every agent edit that reaches this node is checked first.</p>' +
                    '<div class="protection-chips">' +
                    covered
                        .map((r) => `<span class="protection-chip" title="${escapeHtml(r.kind)}">${escapeHtml(r.name)}</span>`)
                        .join('') +
                    '</div></div>';
        }
        else {
            protSec.innerHTML =
                '<h2>Protection</h2>' +
                    '<div class="protection-card warn">' +
                    '<p class="protection-line"><span class="protection-dot"></span>Not protected</p>' +
                    '<p class="protection-sub">An agent can edit this node without any rule standing in the way. Guard it from the Rules tab.</p>' +
                    '</div>';
        }
    }
    const detail = await detailPromise;
    if (!layersSec) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        return body;
    }
    if (detail?.__err) {
        layersSec.innerHTML = `<h2>Snapshot layers</h2><p class="muted">${escapeHtml(detail.__err?.message || 'Could not load node detail')}</p>`;
    }
    else {
        layersSec.innerHTML = '<h2>Snapshot layers</h2>';
        if (hasArch()) {
            const h3 = document.createElement('h3');
            h3.textContent = 'Architecture';
            layersSec.appendChild(h3);
            const arch = document.createElement('div');
            arch.className = 'arch-host';
            layersSec.appendChild(arch);
            renderArchFromDto(arch, detail.arch);
        }
        if (isCallable) {
            const cfgWrap = document.createElement('div');
            cfgWrap.innerHTML = '<h3>Control flow</h3><div class="cfg-host"></div>';
            layersSec.appendChild(cfgWrap);
            const cfgHost = cfgWrap.querySelector('.cfg-host');
            if (detail.cfg) {
                renderCfgPayload(cfgHost, detail.cfg, {
                    resolvedOut: detail.resolved_out,
                    onCallJump: opts.onCallJump,
                });
            }
            else {
                cfgHost.innerHTML = '<p class="muted">No control-flow graph.</p>';
            }
            const callsWrap = document.createElement('div');
            callsWrap.innerHTML = '<h3>Resolved calls</h3><div class="resolved-host"></div>';
            layersSec.appendChild(callsWrap);
            renderResolvedFromDto(callsWrap.querySelector('.resolved-host'), detail.resolved_out);
        }
    }
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    return body;
}
export function closePanel() {
    const panel = document.getElementById('panel');
    if (!panel)
        return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
}
export function setupSearch(model, onPick) {
    const input = document.getElementById('search');
    const list = document.getElementById('search-results');
    if (!input || !list)
        return;
    bindSearchPick((i) => {
        list.classList.remove('open');
        input.value = model.names[i];
        onPick(i);
    });
    const publishHostResults = (out) => {
        if (!isEmbed())
            return;
        notifyHost('search-results', {
            items: out.map((i) => ({
                index: i,
                name: model.names[i],
                type: model.types[i],
            })),
        });
    };
    const render = () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) {
            list.innerHTML = '';
            list.classList.remove('open');
            publishHostResults([]);
            return;
        }
        const out = [];
        for (let i = 0; i < model.names.length && out.length < 25; i++) {
            if (model.names[i].toLowerCase().includes(q))
                out.push(i);
        }
        publishHostResults(out);
        if (!out.length) {
            list.innerHTML = '<li class="muted">No results</li>';
            list.classList.add('open');
            return;
        }
        list.innerHTML = out
            .map((i) => `<li data-i="${i}">${escapeHtml(model.names[i])} <span class="muted">· ${escapeHtml(model.types[i])}</span></li>`)
            .join('');
        list.classList.add('open');
    };
    input.addEventListener('input', render);
    list.addEventListener('click', (ev) => {
        const li = ev.target.closest('li[data-i]');
        if (!li)
            return;
        const i = Number(li.dataset.i);
        list.classList.remove('open');
        input.value = model.names[i];
        onPick(i);
    });
}
