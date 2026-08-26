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

import { edgeWaveDistances } from './GraphData.mjs';
let failures = 0;
function check(label, ok, extra = '') {
    const mark = ok ? 'ok' : 'FAIL';
    if (!ok)
        failures += 1;
    console.log(`${mark} ${label}${extra ? ` ${extra}` : ''}`);
}
const JITTER_TOL = (max) => max * 0.03 + 1e-6;
{
    const positions = new Float32Array([0, 0, 0, 10, 0, 0, 30, 0, 0]);
    const edgeFrom = new Int32Array([0, 1]);
    const edgeTo = new Int32Array([1, 2]);
    const { distances, maxDistance } = edgeWaveDistances(positions, edgeFrom, edgeTo, 0);
    check('edge distance is the farthest endpoint (within jitter)', Math.abs(distances[0] - 10) <= JITTER_TOL(30) && Math.abs(distances[1] - 30) <= JITTER_TOL(30));
    check('near edges ignite before far edges', distances[0] < distances[1]);
    check('maxDistance covers the farthest edge', maxDistance >= distances[1] - 1e-6);
}
{
    const positions = new Float32Array([0, 0, 0, 5, 0, 0, 100, 0, 0, 105, 0, 0]);
    const edgeFrom = new Int32Array([0, 2]);
    const edgeTo = new Int32Array([1, 3]);
    const { distances } = edgeWaveDistances(positions, edgeFrom, edgeTo, 0);
    check('disconnected edges still get a finite ignition distance', Number.isFinite(distances[1]));
    check('the far island ignites after the core', distances[1] > distances[0]);
}
{
    const positions = new Float32Array([0, 0, 0, 3, 4, 0, -6, 8, 0]);
    const edgeFrom = new Int32Array([0, 0]);
    const edgeTo = new Int32Array([1, 2]);
    const a = edgeWaveDistances(positions, edgeFrom, edgeTo, 0);
    const b = edgeWaveDistances(positions, edgeFrom, edgeTo, 0);
    check('jitter is deterministic across runs', a.distances.every((v, i) => v === b.distances[i]) && a.maxDistance === b.maxDistance);
}
{
    const positions = new Float32Array([0, 0, 0, 0.001, 0, 0]);
    const edgeFrom = new Int32Array([0]);
    const edgeTo = new Int32Array([1]);
    const { distances } = edgeWaveDistances(positions, edgeFrom, edgeTo, 0);
    check('jittered distances are clamped at zero', distances[0] >= 0);
}
{
    const positions = new Float32Array([0, 0, 0]);
    const { distances, maxDistance } = edgeWaveDistances(positions, new Int32Array(0), new Int32Array(0), 0);
    check('empty edge set yields an empty wave', distances.length === 0 && maxDistance === 0);
}
if (failures > 0) {
    console.error(`${failures} wave test(s) failed`);
    process.exit(1);
}
console.log('wave tests passed');
