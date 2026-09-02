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

class FakeButton {
    constructor() {
        this.disabled = false;
        this.textContent = 'Sync now';
        this._onClick = null;
    }
    addEventListener(type, fn) {
        if (type === 'click')
            this._onClick = fn;
    }
    click() {
        this._onClick?.({ currentTarget: this });
    }
}
class FakeElement {
    constructor() {
        this.className = '';
        this._text = '';
        this._html = '';
        this._button = null;
    }
    get classList() {
        const names = this.className.split(/\s+/).filter(Boolean);
        return { contains: (name) => names.includes(name) };
    }
    set textContent(value) {
        this._text = String(value);
        this._html = String(value);
        this._button = null;
    }
    get textContent() {
        return this._text;
    }
    set innerHTML(value) {
        this._html = String(value);
        this._text = '';
        this._button = null;
    }
    get innerHTML() {
        return this._html;
    }
    querySelector(sel) {
        if (sel.includes('status-sync') && this._html.includes('data-status-sync')) {
            if (!this._button)
                this._button = new FakeButton();
            return this._button;
        }
        return null;
    }
}
const status = new FakeElement();
status.className = 'hud';
globalThis.document = {
    getElementById: (id) => (id === 'status' ? status : null),
};
globalThis.fetch = async () => ({ ok: false });
const { setStatus, setSyncProgress, clearSyncProgress, STATUS_SYNC_LABEL } = await import('./ui.mjs');
let failures = 0;
function check(name, cond) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
setSyncProgress({ pct: 97, label: 'Sealing snapshot…' });
check('the bar says what the sync is doing', status.innerHTML.includes('Sealing snapshot…'));
check('and how far along it is', status.innerHTML.includes('97%'));
check('the line declares itself a progress bar', status.classList.contains('sync-progress'));
clearSyncProgress();
check('a finished sync takes its bar down', !status.classList.contains('sync-progress'));
check('leaving no trace of the number', status.innerHTML === '' && status.textContent === '');
check('and the line still a hud, which is what pins it to the corner', status.className === 'hud');
const INCOMPLETE = 'Incomplete graph — part of your project is missing from this view. Retry the sync.';
setStatus(INCOMPLETE, 'err');
clearSyncProgress();
check('a sentence that is not a bar survives a clear', status.textContent === INCOMPLETE);
check('and keeps the colour it was given', status.className === 'hud err');
setSyncProgress({ pct: 40, label: 'Uploading files…' });
const GAVE_UP = 'Lost the connection to the Polymerix service and stopped retrying. Reload the page to try again.';
setStatus(GAVE_UP, 'err');
check('an error speaks over a running sync', status.textContent === GAVE_UP);
check('and the line stops being a bar', !status.classList.contains('sync-progress'));
setSyncProgress({ label: 'Sealing snapshot…', indeterminate: true });
check('a step with no number says so', status.innerHTML.includes('…</span>'));
check('and animates instead of filling', status.innerHTML.includes('sync-fill indeterminate'));
setStatus('No snapshot to show yet — run a sync.', 'warn', { action: 'sync' });
check('a sync prompt keeps the sentence in the chip', status.innerHTML.includes('No snapshot to show yet'));
check('and puts Sync now next to it', status.innerHTML.includes('data-status-sync') && status.innerHTML.includes(STATUS_SYNC_LABEL));
check('a plain sentence still has no button', (() => {
    setStatus(INCOMPLETE, 'err');
    return !status.innerHTML.includes('data-status-sync') && status.textContent === INCOMPLETE;
})());
const previousFetch = globalThis.fetch;
const syncCalls = [];
globalThis.fetch = async (url, init) => {
    syncCalls.push({ url: String(url), method: init?.method });
    return { ok: true, json: async () => ({ saved: true }) };
};
setStatus('No snapshot to show yet — run a sync.', 'warn', { action: 'sync' });
status.querySelector('[data-status-sync]').click();
await Promise.resolve();
await Promise.resolve();
check('the chip posts a sync without leaving the graph', syncCalls[0]?.url === '/api/project/sync' && syncCalls[0]?.method === 'POST');
check('the button disables while that runs', status.querySelector('[data-status-sync]').disabled === true);
globalThis.fetch = previousFetch;
globalThis.document.getElementById = () => null;
let threw = false;
try {
    setSyncProgress({ pct: 10, label: 'Uploading files…' });
    clearSyncProgress();
    setStatus('anything');
}
catch {
    threw = true;
}
check('the status line is optional, and every writer accepts that', !threw);
if (failures) {
    console.error(`${failures} check(s) failed`);
    process.exit(1);
}
console.log('all status-line checks passed');
