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

class FakeElement {
    constructor() {
        this.className = '';
        this._text = '';
        this._html = '';
    }
    get classList() {
        const names = this.className.split(/\s+/).filter(Boolean);
        return { contains: (name) => names.includes(name) };
    }
    set textContent(value) {
        this._text = String(value);
        this._html = String(value);
    }
    get textContent() {
        return this._text;
    }
    set innerHTML(value) {
        this._html = String(value);
        this._text = '';
    }
    get innerHTML() {
        return this._html;
    }
}
const status = new FakeElement();
status.className = 'hud';
globalThis.document = {
    getElementById: (id) => (id === 'status' ? status : null),
};
globalThis.fetch = async () => ({ ok: false });
const { setStatus, setSyncProgress, clearSyncProgress } = await import('./ui.mjs');
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
