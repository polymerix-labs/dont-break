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

export function computeLayout(input, onProgress) {
    const worker = new Worker(new URL('./workers/layout.worker.mjs', import.meta.url), {
        type: 'module',
    });
    let settle;
    let reject;
    const promise = new Promise((res, rej) => {
        settle = res;
        reject = rej;
    });
    worker.onmessage = (ev) => {
        const msg = ev.data;
        if (msg.type === 'progress') {
            onProgress?.(new Float32Array(msg.positions), msg.iter, msg.iterations);
        }
        else if (msg.type === 'done') {
            settle(new Float32Array(msg.positions));
            worker.terminate();
        }
    };
    worker.onerror = (err) => {
        reject(err);
        worker.terminate();
    };
    const ef = input.edgeFrom.slice();
    const et = input.edgeTo.slice();
    const transfer = [ef.buffer, et.buffer];
    const payload = {
        type: 'run',
        N: input.N,
        edgeFrom: ef.buffer,
        edgeTo: et.buffer,
        iterations: input.iterations,
    };
    if (input.edgeWeight) {
        const ew = input.edgeWeight.slice();
        payload.edgeWeight = ew.buffer;
        transfer.push(ew.buffer);
    }
    if (input.seedPositions) {
        const sp = input.seedPositions.slice();
        payload.seedPositions = sp.buffer;
        transfer.push(sp.buffer);
    }
    if (input.anchors) {
        const an = input.anchors.slice();
        payload.anchors = an.buffer;
        transfer.push(an.buffer);
    }
    if (input.groupId) {
        const gid = input.groupId.slice();
        payload.groupId = gid.buffer;
        transfer.push(gid.buffer);
    }
    worker.postMessage(payload, transfer);
    return { promise, cancel: () => worker.terminate() };
}
