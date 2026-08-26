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

import { syncToolbar } from './hostBridge.mjs';
let viewerMeta = null;
let heatScores = new Map();
function esc(v) {
    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
export async function initViewerMeta() {
    if (viewerMeta)
        return viewerMeta;
    try {
        const res = await fetch('/nebula/snapshot/meta', { cache: 'no-store' });
        if (!res.ok)
            return null;
        viewerMeta = await res.json();
        return viewerMeta;
    }
    catch {
        return null;
    }
}
export function resetViewerMeta() {
    viewerMeta = null;
}
export function hasArch() {
    return !!viewerMeta?.layers?.arch;
}
export async function initArchGlobal() {
    if (!hasArch())
        return null;
    try {
        const res = await fetch('/nebula/arch/global', { cache: 'no-store' });
        if (!res.ok)
            return null;
        return res.json();
    }
    catch {
        return null;
    }
}
export async function fetchArchScores() {
    const out = new Map();
    if (!hasArch())
        return out;
    let cursor = null;
    for (;;) {
        const q = new URLSearchParams({ limit: '5000' });
        if (cursor)
            q.set('cursor', cursor);
        const res = await fetch(`/nebula/arch/scores?${q}`, { cache: 'no-store' });
        if (!res.ok)
            break;
        const page = await res.json();
        for (const item of page.items || []) {
            if (item?.id != null && Number.isFinite(item.heat)) {
                out.set(item.id, item.heat);
            }
        }
        cursor = page.next_cursor;
        if (!cursor)
            break;
    }
    heatScores = out;
    return out;
}
export function archScores01() {
    return heatScores;
}
function fmtScore(dim) {
    const s = dim && Number.isFinite(dim.score) ? dim.score : null;
    return s == null ? '–' : s.toFixed(0);
}
function sev(score) {
    if (score == null)
        return '';
    if (score >= 80)
        return 'good';
    if (score >= 50)
        return 'mid';
    return 'bad';
}
function scoreBar(label, dim) {
    const score = dim && Number.isFinite(dim.score) ? dim.score : null;
    const pct = score == null ? 0 : Math.max(0, Math.min(100, score));
    return (`<div class="arch-row">` +
        `<span class="arch-row-label">${esc(label)}</span>` +
        `<span class="arch-bar"><span class="arch-bar-fill ${sev(score)}" style="width:${pct}%"></span></span>` +
        `<span class="arch-row-val">${fmtScore(dim)}</span>` +
        `</div>`);
}
export function renderArchFromDto(host, arch) {
    if (!host)
        return;
    if (!arch) {
        host.innerHTML = '<p class="muted">No architectural score for this node.</p>';
        return;
    }
    let html = '';
    html += scoreBar('Stability', arch.stability);
    html += scoreBar('AI navigability', arch.navigability);
    const contrib = arch.contributions || {};
    const rows = Object.entries(contrib).filter(([, e]) => (e.stability || 0) + (e.ai || 0) > 0);
    if (rows.length) {
        html += '<div class="arch-rules"><div class="arch-rules-h">Penalties by rule</div><ul class="list">';
        for (const [rule, e] of rows) {
            const parts = [];
            if (e.stability)
                parts.push(`stability +${e.stability.toFixed(2)}`);
            if (e.ai)
                parts.push(`navigability +${e.ai.toFixed(2)}`);
            html += `<li><code>${esc(rule)}</code> <span class="muted">${esc(parts.join(' · '))}</span></li>`;
        }
        html += '</ul></div>';
    }
    else {
        html += '<p class="muted">No rule penalized this node.</p>';
    }
    host.innerHTML = html;
}
export function mountGlobalHud(global, opts = {}) {
    if (!global)
        return;
    const hud = document.getElementById('arch-hud');
    const sEl = document.getElementById('arch-stability');
    const nEl = document.getElementById('arch-navigability');
    if (!hud || !sEl || !nEl)
        return;
    const sScore = global.stability && global.stability.score;
    const nScore = global.navigability && global.navigability.score;
    sEl.textContent = `S ${fmtScore(global.stability)}`;
    nEl.textContent = `N ${fmtScore(global.navigability)}`;
    sEl.className = `arch-badge ${sev(sScore)}`;
    nEl.className = `arch-badge ${sev(nScore)}`;
    if (opts.provisional) {
        hud.setAttribute('title', 'Provisional scores — final after seal');
    }
    else {
        hud.removeAttribute('title');
    }
    hud.classList.remove('hidden');
    syncToolbar();
}
function actionLabel(kind) {
    const raw = String(kind || '').trim();
    if (!raw)
        return 'Action';
    const words = raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
}
function renderActionItems(items) {
    if (!items.length) {
        return '<p class="muted">No remediation actions suggested.</p>';
    }
    return ('<ul class="list arch-actions-list">' +
        items
            .map((a) => {
            const gain = (a.stability_gain || 0) + (a.ai_gain || 0);
            return (`<li><div class="arch-action-top"><span class="arch-kind">${esc(actionLabel(a.kind))}</span>` +
                `<code>${esc(a.subject)}</code></div>` +
                `<div class="muted">gain ${gain.toFixed(2)} · ~${esc(a.estimated_tokens)} tokens</div>` +
                (a.rationale ? `<div class="arch-rationale">${esc(a.rationale)}</div>` : '') +
                `</li>`);
        })
            .join('') +
        '</ul>');
}
export async function mountActionsPanel() {
    if (!hasArch())
        return;
    const toggle = document.getElementById('arch-actions-toggle');
    const panel = document.getElementById('arch-panel');
    const host = document.getElementById('arch-actions');
    if (!toggle || !panel || !host)
        return;
    let offset = 0;
    const limit = 25;
    let loaded = [];
    let total = 0;
    let hasMore = false;
    const renderFooter = () => {
        const footerId = 'arch-actions-footer';
        let footer = document.getElementById(footerId);
        if (!footer) {
            footer = document.createElement('div');
            footer.id = footerId;
            footer.className = 'arch-actions-footer';
            host.parentElement?.appendChild(footer);
        }
        if (hasMore) {
            footer.innerHTML = `<button type="button" class="btn subtle" id="arch-actions-more">Load more (${loaded.length} / ${total})</button>`;
            document.getElementById('arch-actions-more')?.addEventListener('click', () => {
                void loadPage(false);
            });
        }
        else if (total > 0) {
            footer.innerHTML = `<p class="muted">${total} action${total === 1 ? '' : 's'} total</p>`;
        }
        else {
            footer.innerHTML = '';
        }
    };
    const loadPage = async (reset) => {
        if (reset) {
            offset = 0;
            loaded = [];
        }
        host.innerHTML = '<p class="muted">Loading actions…</p>';
        try {
            const q = new URLSearchParams({ offset: String(offset), limit: String(limit) });
            const res = await fetch(`/nebula/arch/actions?${q}`, { cache: 'no-store' });
            if (!res.ok) {
                host.innerHTML = '<p class="muted">Could not load actions.</p>';
                return;
            }
            const page = await res.json();
            total = page.total ?? 0;
            hasMore = !!page.has_more;
            loaded = reset ? page.items || [] : loaded.concat(page.items || []);
            offset = page.offset + (page.items?.length || 0);
            host.innerHTML = renderActionItems(loaded);
            renderFooter();
        }
        catch {
            host.innerHTML = '<p class="muted">Could not load actions.</p>';
        }
    };
    await loadPage(true);
    toggle.classList.remove('hidden');
    toggle.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    syncToolbar();
}
