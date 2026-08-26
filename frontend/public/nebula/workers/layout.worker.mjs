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
function expandFromCentroid(pos, factor) {
    const n = pos.length / 3;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < n; i++) {
        cx += pos[i * 3];
        cy += pos[i * 3 + 1];
        cz += pos[i * 3 + 2];
    }
    cx /= n;
    cy /= n;
    cz /= n;
    for (let i = 0; i < n; i++) {
        pos[i * 3] = cx + (pos[i * 3] - cx) * factor;
        pos[i * 3 + 1] = cy + (pos[i * 3 + 1] - cy) * factor;
        pos[i * 3 + 2] = cz + (pos[i * 3 + 2] - cz) * factor;
    }
}
self.onmessage = (ev) => {
    if (ev.data.type !== 'run')
        return;
    runLayout(ev.data);
};
function runLayout(msg) {
    const N = msg.N;
    const edgeFrom = new Int32Array(msg.edgeFrom);
    const edgeTo = new Int32Array(msg.edgeTo);
    const E = edgeFrom.length;
    const iterations = msg.iterations ?? 520;
    const seedPositions = msg.seedPositions ? new Float32Array(msg.seedPositions) : null;
    const anchors = msg.anchors ? new Float32Array(msg.anchors) : null;
    const groupId = msg.groupId ? new Int32Array(msg.groupId) : null;
    const edgeWeight = msg.edgeWeight ? new Float32Array(msg.edgeWeight) : null;
    const k = 8.5 * Math.cbrt(N / 400 + 1);
    const k2 = k * k;
    const kAttr = 0.028;
    const kGroup = 0.02;
    const spread = k * 9;
    const maxRepulsorsPerNode = 96;
    const pos = new Float32Array(N * 3);
    const disp = new Float32Array(N * 3);
    const degree = new Float32Array(N);
    for (let e = 0; e < E; e++) {
        degree[edgeFrom[e]]++;
        degree[edgeTo[e]]++;
    }
    const rng = mulberry32(0x9e3779b1 ^ N);
    if (seedPositions)
        pos.set(seedPositions);
    else if (anchors) {
        for (let i = 0; i < N; i++) {
            const j = k * 8;
            pos[i * 3] = anchors[i * 3] * spread + (rng() - 0.5) * j;
            pos[i * 3 + 1] = anchors[i * 3 + 1] * spread + (rng() - 0.5) * j;
            pos[i * 3 + 2] = anchors[i * 3 + 2] * spread + (rng() - 0.5) * j;
        }
    }
    const cell = k * 2.2;
    const invCell = 1 / cell;
    let temperature = k * 14;
    const cooling = Math.pow(0.01, 1 / iterations);
    for (let iter = 0; iter < iterations; iter++) {
        disp.fill(0);
        const grid = new Map();
        const key = (x, y, z) => `${Math.floor(x * invCell)},${Math.floor(y * invCell)},${Math.floor(z * invCell)}`;
        for (let i = 0; i < N; i++) {
            const kx = key(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
            let bucket = grid.get(kx);
            if (!bucket)
                grid.set(kx, (bucket = []));
            bucket.push(i);
        }
        for (let i = 0; i < N; i++) {
            const ix = pos[i * 3];
            const iy = pos[i * 3 + 1];
            const iz = pos[i * 3 + 2];
            const cx = Math.floor(ix * invCell);
            const cy = Math.floor(iy * invCell);
            const cz = Math.floor(iz * invCell);
            let counted = 0;
            for (let gx = -1; gx <= 1 && counted < maxRepulsorsPerNode; gx++) {
                for (let gy = -1; gy <= 1 && counted < maxRepulsorsPerNode; gy++) {
                    for (let gz = -1; gz <= 1 && counted < maxRepulsorsPerNode; gz++) {
                        const bucket = grid.get(`${cx + gx},${cy + gy},${cz + gz}`);
                        if (!bucket)
                            continue;
                        for (let b = 0; b < bucket.length; b++) {
                            const j = bucket[b];
                            if (j === i)
                                continue;
                            let dx = ix - pos[j * 3];
                            let dy = iy - pos[j * 3 + 1];
                            let dz = iz - pos[j * 3 + 2];
                            let d2 = dx * dx + dy * dy + dz * dz;
                            if (d2 < 1e-8) {
                                dx = (rng() - 0.5) * 0.05;
                                dy = (rng() - 0.5) * 0.05;
                                dz = (rng() - 0.5) * 0.05;
                                d2 = dx * dx + dy * dy + dz * dz + 1e-8;
                            }
                            const dist = Math.sqrt(d2);
                            let f = (k2 / Math.max(dist, 0.12)) * 1.6;
                            if (groupId) {
                                if (groupId[i] === groupId[j])
                                    f *= 1.15;
                                else
                                    f *= 2.6;
                            }
                            disp[i * 3] += (dx / dist) * f;
                            disp[i * 3 + 1] += (dy / dist) * f;
                            disp[i * 3 + 2] += (dz / dist) * f;
                            if (++counted >= maxRepulsorsPerNode)
                                break;
                        }
                    }
                }
            }
        }
        for (let e = 0; e < E; e++) {
            const a = edgeFrom[e];
            const b = edgeTo[e];
            const dx = pos[b * 3] - pos[a * 3];
            const dy = pos[b * 3 + 1] - pos[a * 3 + 1];
            const dz = pos[b * 3 + 2] - pos[a * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
            const w = edgeWeight ? edgeWeight[e] : 1.0;
            const rest = (k * (1.1 + 0.04 * Math.min(degree[a], degree[b]))) / w;
            const f = ((dist - rest) / k) * kAttr * k * w;
            const ux = (dx / dist) * f;
            const uy = (dy / dist) * f;
            const uz = (dz / dist) * f;
            const ha = 1 / (1 + degree[a] * 0.125);
            const hb = 1 / (1 + degree[b] * 0.125);
            disp[a * 3] += ux * ha;
            disp[a * 3 + 1] += uy * ha;
            disp[a * 3 + 2] += uz * ha;
            disp[b * 3] -= ux * hb;
            disp[b * 3 + 1] -= uy * hb;
            disp[b * 3 + 2] -= uz * hb;
        }
        for (let i = 0; i < N; i++) {
            if (anchors) {
                disp[i * 3] += (anchors[i * 3] * spread - pos[i * 3]) * kGroup;
                disp[i * 3 + 1] += (anchors[i * 3 + 1] * spread - pos[i * 3 + 1]) * kGroup;
                disp[i * 3 + 2] += (anchors[i * 3 + 2] * spread - pos[i * 3 + 2]) * kGroup;
            }
            const dlen = Math.sqrt(disp[i * 3] * disp[i * 3] +
                disp[i * 3 + 1] * disp[i * 3 + 1] +
                disp[i * 3 + 2] * disp[i * 3 + 2]) + 1e-9;
            const step = Math.min(dlen, temperature) / dlen;
            pos[i * 3] += disp[i * 3] * step;
            pos[i * 3 + 1] += disp[i * 3 + 1] * step;
            pos[i * 3 + 2] += disp[i * 3 + 2] * step;
        }
        temperature *= cooling;
        if (iter % 16 === 0 || iter === iterations - 1) {
            const copy = pos.slice();
            self.postMessage({ type: 'progress', iter, iterations, positions: copy.buffer }, [copy.buffer]);
        }
    }
    expandFromCentroid(pos, 1.0);
    self.postMessage({ type: 'done', positions: pos.buffer }, [pos.buffer]);
}
