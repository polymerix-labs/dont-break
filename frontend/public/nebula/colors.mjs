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

export const TYPE_COLORS = {
    File: [0.35, 0.62, 1.0],
    Class: [0.62, 0.55, 1.0],
    Interface: [0.45, 0.78, 1.0],
    Enum: [1.0, 0.66, 0.32],
    Object: [0.78, 0.5, 1.0],
    Function: [0.28, 0.95, 0.78],
    Method: [1.0, 0.86, 0.45],
    Constructor: [1.0, 0.7, 0.5],
    Field: [0.5, 0.88, 0.66],
    Property: [0.45, 0.86, 0.82],
    External: [0.42, 0.45, 0.55],
    Module: [0.95, 0.55, 0.7],
    Type: [0.2, 0.82, 0.85],
    Unparseable: [0.95, 0.25, 0.3],
    Unknown: [0.6, 0.64, 0.72],
};
const DEFAULT_COLOR = [0.6, 0.64, 0.72];
export const NODE_COLOR_MODE = 'group';
export const EDGE_ENDPOINT_SCALE = 0.55;
export const INTER_GROUP_EDGE_SCALE = 0.4;
export const HOVER_NODE_DIM = 0.15;
export const HOVER_EDGE_DIM = 0.05;
export function colorForType(nodeType) {
    const c = TYPE_COLORS[nodeType] || DEFAULT_COLOR;
    return [c[0], c[1], c[2]];
}
export function legendEntries() {
    return Object.entries(TYPE_COLORS);
}
function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function hslToRgb(h, s, l) {
    const hue = ((h % 1) + 1) % 1;
    if (s <= 0)
        return [l, l, l];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hk = (t) => {
        let x = t;
        if (x < 0)
            x += 1;
        if (x > 1)
            x -= 1;
        if (x < 1 / 6)
            return p + (q - p) * 6 * x;
        if (x < 1 / 2)
            return q;
        if (x < 2 / 3)
            return p + (q - p) * (2 / 3 - x) * 6;
        return p;
    };
    return [hk(hue + 1 / 3), hk(hue), hk(hue - 1 / 3)];
}
const GOLDEN_ANGLE = 0.618033988749895;
export function groupColor(groupId) {
    const id = Math.abs(Math.floor(Number(groupId) || 0));
    const h = (id * GOLDEN_ANGLE) % 1;
    const l = 0.52 + ((id * 7) % 5) * 0.02;
    return hslToRgb(h, 0.62, l);
}
export function adaptiveEdgeOpacity(edgeCount) {
    const E = Math.max(0, Number(edgeCount) || 0);
    if (E <= 0)
        return 0.35;
    const v = 40 / Math.sqrt(E);
    return Math.min(0.35, Math.max(0.06, v));
}
export function isHoverFocusNode(hoverIndex, adjacency, i) {
    if (hoverIndex == null || hoverIndex < 0)
        return true;
    if (i === hoverIndex)
        return true;
    const neigh = adjacency?.[hoverIndex];
    if (!neigh)
        return false;
    for (let k = 0; k < neigh.length; k++) {
        if (neigh[k] === i)
            return true;
    }
    return false;
}
export function isHoverFocusEdge(hoverIndex, a, b) {
    if (hoverIndex == null || hoverIndex < 0)
        return true;
    return a === hoverIndex || b === hoverIndex;
}
const HEAT_BAD = [1.0, 0.16, 0.18];
const HEAT_WARN = [1.0, 0.45, 0.18];
const HEAT_MID = [1.0, 0.82, 0.22];
const HEAT_GOOD = [0.16, 0.7, 0.45];
export function heatColor(t) {
    const x = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
    if (x < 0.25)
        return mix(HEAT_BAD, HEAT_WARN, x / 0.25);
    if (x < 0.5)
        return mix(HEAT_WARN, HEAT_MID, (x - 0.25) / 0.25);
    return mix(HEAT_MID, HEAT_GOOD, (x - 0.5) / 0.5);
}
const EDGE_COLORS = [
    [0.45, 0.48, 0.55],
    [0.32, 0.42, 0.62],
    [0.28, 0.66, 0.7],
    [1.0, 0.66, 0.28],
    [0.66, 0.5, 1.0],
    [0.4, 0.74, 1.0],
    [0.45, 0.86, 0.62],
];
export function edgeColorForKind(code) {
    const c = EDGE_COLORS[code] || EDGE_COLORS[0];
    return [c[0], c[1], c[2]];
}
export function edgeLegendEntries(kinds) {
    return kinds.map((k, i) => [k, edgeColorForKind(i)]);
}
