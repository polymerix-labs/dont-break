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
export function setViewerMeta(meta) {
    viewerMeta = meta;
}
export function hasResolved() {
    return !!viewerMeta?.layers?.resolved;
}
function esc(v) {
    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
export function renderResolvedFromDto(host, edges) {
    if (!host)
        return;
    const calls = Array.isArray(edges) ? edges : [];
    if (!calls.length) {
        host.innerHTML = '<p class="muted">No resolved calls.</p>';
        return;
    }
    const badge = (s) => `<span class="hb-badge hb-${esc(s).toLowerCase()}">${esc(s)}</span>`;
    host.innerHTML =
        '<ul class="list">' +
            calls.map((e) => `<li>${badge(e.status)} ${esc(e.to_fqn)}</li>`).join('') +
            '</ul>';
}
export function renderResolvedCallsInto(host, nodeId) {
    if (!host)
        return;
    host.innerHTML = '<p class="muted">Load node detail to view resolved calls.</p>';
}
export async function initResolved() {
    return null;
}
async function searchMethods(role, q, limit = 20) {
    const params = new URLSearchParams({ role, q, limit: String(limit) });
    const res = await fetch(`/nebula/resolved/methods?${params}`, { cache: 'no-store' });
    if (!res.ok)
        return [];
    const body = await res.json();
    return Array.isArray(body.items) ? body.items : [];
}
function wireSearchInput(input, role, listId) {
    if (!input)
        return;
    let timer = null;
    input.addEventListener('input', () => {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(async () => {
            const q = input.value.trim();
            const list = document.getElementById(listId);
            if (!list)
                return;
            if (q.length < 1) {
                list.innerHTML = '';
                return;
            }
            const items = await searchMethods(role, q);
            list.innerHTML = items.map((v) => `<option value="${esc(v)}"></option>`).join('');
        }, 200);
    });
}
export function mountHbPanel() {
    if (!hasResolved())
        return;
    const toggle = document.getElementById('hb-toggle');
    const panel = document.getElementById('hb-panel');
    const result = document.getElementById('hb-result');
    if (!toggle || !panel || !result)
        return;
    wireSearchInput(document.getElementById('hb-root'), 'roots', 'hb-roots');
    wireSearchInput(document.getElementById('hb-x'), 'targets', 'hb-targets');
    wireSearchInput(document.getElementById('hb-y'), 'targets', 'hb-targets');
    toggle.classList.remove('hidden');
    toggle.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    syncToolbar();
    const root = document.getElementById('hb-root');
    const x = document.getElementById('hb-x');
    const y = document.getElementById('hb-y');
    document.getElementById('hb-check')?.addEventListener('click', async () => {
        const r = (root?.value || '').trim();
        const xv = (x?.value || '').trim();
        const yv = (y?.value || '').trim();
        if (!r || !xv || !yv) {
            result.innerHTML = '<span class="muted">Fill in root, X and Y.</span>';
            return;
        }
        result.innerHTML = '<span class="muted">Checking…</span>';
        try {
            const params = new URLSearchParams({ root: r, x: xv, y: yv });
            const res = await fetch(`/nebula/resolved/happens-before?${params}`, { cache: 'no-store' });
            if (!res.ok) {
                result.innerHTML = '<span class="no">Query failed</span>';
                return;
            }
            const data = await res.json();
            if (data.result === 'Always') {
                result.innerHTML = `<span class="ok">Yes</span> — <code>${esc(xv)}</code> always runs before <code>${esc(yv)}</code> from this root.`;
            }
            else {
                result.innerHTML = `<span class="no">Not guaranteed</span> — ordering of <code>${esc(xv)}</code> and <code>${esc(yv)}</code> cannot be proven from this root.`;
            }
        }
        catch (err) {
            result.innerHTML = `<span class="no">Query failed</span> <span class="muted">(${esc(err?.message || err)})</span>`;
        }
    });
}
