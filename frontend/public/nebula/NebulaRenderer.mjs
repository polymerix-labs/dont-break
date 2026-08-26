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

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { colorForType, heatColor, groupColor, adaptiveEdgeOpacity, NODE_COLOR_MODE, EDGE_ENDPOINT_SCALE, INTER_GROUP_EDGE_SCALE, HOVER_NODE_DIM, HOVER_EDGE_DIM, isHoverFocusNode, isHoverFocusEdge, } from './colors.mjs';
import { edgeWaveDistances } from './GraphData.mjs';
const HEAT_MISSING = [0.16, 0.18, 0.24];
const OVERLAY_RECEDE = [0.09, 0.1, 0.14];
const OVERLAY_EDGE_RECEDE = [0.04, 0.045, 0.065];
const ZONE_CORE_COLOR = [1.0, 0.54, 0.24];
const ZONE_HALO_NEAR = [0.85, 0.57, 0.31];
const ZONE_HALO_FAR = [0.34, 0.27, 0.2];
const ZONE_EDGE_COLOR = [0.55, 0.34, 0.18];
const IMPACT_SOURCE_COLOR = [1.0, 0.7, 0.22];
const IMPACT_NEAR_COLOR = [1.0, 0.32, 0.28];
const IMPACT_FAR_COLOR = [0.42, 0.16, 0.16];
const IMPACT_EDGE_COLOR = [0.72, 0.28, 0.22];
const PATH_LIT_COLOR = [1.0, 0.4, 0.28];
const PATH_DIM_COLOR = [0.4, 0.22, 0.16];
const PATH_EDGE_COLOR = [1.0, 0.46, 0.3];
const CAND_STEADY_COLOR = [0.24, 0.78, 0.92];
const CAND_FLASH_COLOR = [0.8, 1.0, 1.0];
const CAND_REJECTED_COLOR = [0.3, 0.33, 0.4];
const CAND_EDGE_COLOR = [0.14, 0.42, 0.52];
const SHIELD_CORE_COLOR = [1.0, 0.78, 0.28];
const SHIELD_HALO_NEAR = [0.85, 0.66, 0.3];
const SHIELD_HALO_FAR = [0.4, 0.33, 0.18];
const SHIELD_EDGE_COLOR = [0.62, 0.47, 0.16];
const SHIELD_RING_FADE = 0.3;
const SHIELD_RING_STAGGER = 0.7;
const SHIELD_DOME_COLOR = [1.0, 0.72, 0.25];
const SHIELD_DOME_OPACITY = 0.5;
const SHIELD_DOME_PADDING = 1.18;
const SHIELD_DOME_MIN_RADIUS = 30;
const SHIELD_DOME_BREATH_AMP = 0.02;
const SHIELD_DOME_BREATH_SPEED = 1.3;
const SHIELD_CELEBRATE_MS = 2200;
const SHIELD_CELEBRATE_SCALE = 0.08;
const SHIELD_CELEBRATE_GLOW = 1.6;
const TRAIL_EDGE_COLORS = {
    intercepted: [0.72, 0.55, 0.18],
    breach: [0.85, 0.16, 0.13],
    allowed: [0.22, 0.42, 0.68],
    over_block: [0.72, 0.4, 0.12],
    info: [0.42, 0.45, 0.52],
};
const LIVE_AMBER_COLOR = [1.0, 0.62, 0.22];
const LIVE_AMBER_FLASH = [1.0, 0.85, 0.45];
const LIVE_CONFIRM_COLOR = [0.35, 0.92, 0.48];
const TRAIL_NODE_COLORS = {
    intercepted: [0.8, 0.62, 0.22],
    breach: [0.9, 0.2, 0.16],
    allowed: [0.28, 0.5, 0.78],
    over_block: [0.8, 0.46, 0.15],
    info: [0.5, 0.53, 0.6],
};
function lerp3(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const EDGE_RENDER_CAP = 160000;
const HOVER_FOCUS_SIZE = 1.35;
const WAVE_STAR_SOLO_S = 0.4;
const WAVE_TRAVEL_S = 2.5;
const WAVE_BLOOM_DECAY_S = 1.0;
const WAVE_BURN_FRACTION = 0.22;
const FLARE_SIZE_BOOST = 0.9;
const FLARE_DECAY = 1.1;
const FLARE_AMP_NODE = 1.0;
const FLARE_AMP_ENTRY = 3.2;
const BLOOM_BASE_STRENGTH = 0.08;
const BLOOM_WAVE_PEAK = 0.4;
const WAVE_FRONT_DONE = 1e9;
const SHELL_COLOR = [0.55, 0.75, 1.0];
const PROBE_COLOR = 0xcfe8ff;
const PROBE_SIZE = 5.0;
const PROBE_TAIL_COLOR = 0x9cc8ff;
const PROBE_TAIL_OPACITY = 0.85;
const PROBE_SEGMENT_S = 0.35;
const PROBE_TOTAL_MIN_S = 0.7;
const PROBE_TOTAL_MAX_S = 2.6;
const IMPACT_DURATION_S = 0.9;
const IMPACT_RADIUS = 26;
const IMPACT_BLOCK_COLOR = [1.0, 0.22, 0.18];
const IMPACT_OK_COLOR = [0.35, 0.65, 1.0];
const IMPACT_OUTCOME_COLORS = {
    intercepted: [1.0, 0.8, 0.3],
    breach: [1.0, 0.15, 0.12],
    allowed: [0.35, 0.65, 1.0],
    over_block: [1.0, 0.55, 0.15],
    info: [0.7, 0.75, 0.85],
};
const EDGE_VERTEX = `
  attribute float aWaveDepth;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vColor = color;
    vDepth = aWaveDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const EDGE_FRAGMENT = `
  precision highp float;
  uniform float uWaveFront;
  uniform float uBaseOpacity;
  uniform float uBurnWidth;
  uniform float uPulseFront;
  uniform float uPulseWidth;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    float t = uWaveFront - vDepth;
    if (t <= 0.0) discard;
    // The wavefront burns white-hot as it crosses an edge, leaves a long
    // incandescent trail, then the edge settles to its steady colour.
    float settle = smoothstep(0.0, uBurnWidth, t);
    float burn = exp(-t / max(uBurnWidth * 0.6, 1e-3));
    vec3 col = vColor + vec3(1.0, 0.85, 0.6) * burn * 0.85;
    float alpha = uBaseOpacity * settle + burn * 0.45;
    // Heartbeat: a faint luminous band periodically replays the genesis
    // front across the wiring, at a fraction of the ignition intensity.
    if (uPulseFront > 0.0) {
      float band = exp(-abs(vDepth - uPulseFront) / max(uPulseWidth, 1e-3));
      col += (vColor + vec3(0.4)) * band * 0.3;
      alpha += band * 0.12;
    }
    gl_FragColor = vec4(col, alpha);
  }
`;
const SHELL_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const SHELL_FRAGMENT = `
  precision highp float;
  uniform vec3 uShellColor;
  uniform float uShellOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Fresnel rim: the shell reads as a translucent expanding membrane, bright
    // on the silhouette and nearly invisible face-on.
    float f = pow(1.0 - abs(dot(normalize(vNormal), -normalize(vView))), 2.4);
    gl_FragColor = vec4(uShellColor, f * uShellOpacity);
  }
`;
export const REVEAL_FADE_DURATION = 0.35;
export const REVEAL_STAGGER_STEP = 0.012;
export const REVEAL_STAGGER_WINDOW = 0.45;
const BREATH_BASE_AMP = 0.035;
const BREATH_HUB_AMP = 0.06;
const BREATH_SPEED = 0.9;
const PULSE_PERIOD_S = 11;
const PULSE_TRAVEL_S = 2.5;
const PULSE_WIDTH_FRACTION = 0.08;
const DRIFT_FADE_MULT = 1.8;
const DRIFT_RADIUS_FRACTION = 0.15;
const IDLE_ORBIT_DEG_PER_SEC = 2.5;
const _ORBIT_AXIS = new THREE.Vector3(0, 1, 0);
const NODE_VERTEX = `
  attribute float aSize;
  attribute float aBirthTime;
  attribute float aFlareTime;
  attribute float aFlareAmp;
  uniform float uSizeScale;
  uniform float uPixelRatio;
  uniform float uNear;
  uniform float uFar;
  uniform float uTime;
  uniform float uFadeDuration;
  uniform float uBreathBaseAmp;
  uniform float uBreathHubAmp;
  uniform float uBreathSpeed;
  uniform float uDriftDist;
  varying vec3 vColor;
  varying float vLod;
  varying float vBirth;
  varying float vFlare;
  void main() {
    vColor = color;
    vBirth = aBirthTime;
    // Birth scale-in: a node grows from nothing over the fade window.
    float grow = aBirthTime <= 0.0
      ? 1.0
      : smoothstep(0.0, uFadeDuration, uTime - aBirthTime);
    // Birth drift: the node spawns offset in a hashed direction and glides to
    // its rest position over a slightly longer window than the fade, so
    // streamed nodes read as dust pulled in by gravity, not popped in place.
    vec3 pos = position;
    if (aBirthTime > 0.0) {
      vec3 h = fract(sin(vec3(
        dot(position, vec3(12.9898, 78.233, 37.719)),
        dot(position, vec3(39.346, 11.135, 83.155)),
        dot(position, vec3(73.156, 52.235, 9.151))
      )) * 43758.5453) - 0.5;
      float settleT = smoothstep(0.0, uFadeDuration * ${DRIFT_FADE_MULT.toFixed(1)}, uTime - aBirthTime);
      pos += normalize(h + 1e-4) * uDriftDist * (1.0 - settleT);
    }
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mv.z;
    float lod = dist < uNear ? 1.0 : (dist < uFar ? 0.85 : 0.6);
    vLod = lod;
    // Genesis flare: the node blazes when the wavefront reaches it, then the
    // glow decays exponentially. The entry star gets a far stronger amplitude.
    float flareAge = uTime - aFlareTime;
    float flare = (aFlareTime > 0.0 && flareAge > 0.0)
      ? exp(-flareAge * ${FLARE_DECAY.toFixed(2)}) * aFlareAmp
      : 0.0;
    vFlare = flare;
    // Idle breathing: a slow desynchronized size pulse. The phase derives from
    // the node's rest position (free hash), so neighbours never blink in sync;
    // hubs (large aSize) get a slightly deeper breath than dust.
    float phase = dot(position, vec3(0.171, 0.113, 0.089));
    float hubT = smoothstep(4.0, 20.0, aSize);
    float amp = mix(uBreathBaseAmp, uBreathHubAmp, hubT);
    float breath = 1.0 + amp * sin(uTime * uBreathSpeed + phase);
    float size = aSize * uSizeScale * lod * grow * breath
      * (1.0 + ${FLARE_SIZE_BOOST.toFixed(2)} * min(flare, 2.5));
    gl_Position = projectionMatrix * mv;
    if (gl_Position.w <= 0.0) {
      size = 0.0;
    } else {
      vec3 ndc = gl_Position.xyz / gl_Position.w;
      if (abs(ndc.x) > 1.08 || abs(ndc.y) > 1.08 || ndc.z > 1.0) size = 0.0;
    }
    gl_PointSize = min(size * uPixelRatio * (280.0 / max(dist, 1.0)), 46.0 * uPixelRatio);
  }
`;
const NODE_FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform float uFadeDuration;
  varying vec3 vColor;
  varying float vLod;
  varying float vBirth;
  varying float vFlare;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;
    float core = smoothstep(1.0, 0.0, r2);
    float age = uTime - vBirth;
    float fade = vBirth <= 0.0 ? 1.0 : smoothstep(0.0, uFadeDuration, age);
    // Birth flash: a white-hot spark that decays right after the node lights up,
    // so streamed nodes read as stars igniting one by one.
    float flash = vBirth <= 0.0 ? 0.0 : exp(-max(age, 0.0) * 5.0);
    vec3 col = vColor * (0.85 + 0.15 * core) * fade;
    col += vec3(1.0, 0.98, 0.92) * flash * fade * core * 0.9;
    // Genesis flare: the wavefront ignites the node white-hot as it passes.
    col += vec3(1.0, 0.95, 0.85) * vFlare * core;
    gl_FragColor = vec4(col, 1.0);
  }
`;
export class NebulaRenderer {
    constructor(container) {
        this.container = container;
        this.clock = new THREE.Clock();
        this._raf = 0;
        this._model = null;
        this._positions = null;
        this._focusTween = null;
        this._probe = null;
        this._impact = null;
        this._birthById = new Map();
        this._forceFullReveal = false;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x05060a);
        this.scene.fog = new THREE.FogExp2(0x05060a, 0.0006);
        this._hoverIndex = null;
        this._selectedIndex = null;
        this._labelGroup = null;
        this._edgesVisible = false;
        const { clientWidth: w, clientHeight: h } = container;
        this.camera = new THREE.PerspectiveCamera(60, w / Math.max(h, 1), 0.5, 20000);
        this.camera.position.set(0, 0, 600);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(w, h);
        this.renderer.setClearColor(0x05060a, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.55;
        container.appendChild(this.renderer.domElement);
        this.backend = 'webgl';
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.6;
        this.controls.zoomSpeed = 0.9;
        this._buildComposer(w, h);
        this._onResize = () => this.resize();
        window.addEventListener('resize', this._onResize);
        this._resizeObserver = new ResizeObserver(() => this.resize());
        this._resizeObserver.observe(container);
        requestAnimationFrame(() => this.resize());
    }
    _buildComposer(w, h) {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), BLOOM_BASE_STRENGTH, 0.6, 0.94);
        this.composer.addPass(this.bloom);
        this.composer.addPass(new OutputPass());
    }
    setData(model, positions, opts = {}) {
        const autoFit = opts.autoFit !== false;
        this.clearObjects();
        this._hoverIndex = null;
        this._selectedIndex = null;
        this._model = model;
        this._positions = positions.slice();
        this._targetPositions = this._positions.slice();
        this._needsInterp = false;
        const N = model.ids.length;
        const birthTimes = this._buildBirthTimes(model, opts);
        const size = new Float32Array(N);
        const color = new Float32Array(N * 3);
        this._fillNodeSizes(size, model, this._heat ?? null);
        this._fillNodeColors(color, model, this._heat ?? null);
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(this._positions, 3));
        g.setAttribute('color', new THREE.BufferAttribute(color, 3));
        g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
        g.setAttribute('aBirthTime', new THREE.BufferAttribute(birthTimes, 1));
        g.setAttribute('aFlareTime', new THREE.BufferAttribute(new Float32Array(N), 1));
        g.setAttribute('aFlareAmp', new THREE.BufferAttribute(new Float32Array(N), 1));
        g.computeBoundingSphere();
        this.nodeUniforms = {
            uSizeScale: { value: 1.25 },
            uPixelRatio: { value: this.renderer.getPixelRatio() },
            uNear: { value: 400 },
            uFar: { value: 1400 },
            uTime: { value: this.clock.getElapsedTime() },
            uFadeDuration: { value: REVEAL_FADE_DURATION },
            uBreathBaseAmp: { value: BREATH_BASE_AMP },
            uBreathHubAmp: { value: BREATH_HUB_AMP },
            uBreathSpeed: { value: BREATH_SPEED },
            uDriftDist: {
                value: Math.max((g.boundingSphere?.radius ?? 100) * DRIFT_RADIUS_FRACTION, 12),
            },
        };
        const nodeMat = new THREE.ShaderMaterial({
            uniforms: this.nodeUniforms,
            vertexShader: NODE_VERTEX,
            fragmentShader: NODE_FRAGMENT,
            vertexColors: true,
            transparent: false,
            depthWrite: true,
            depthTest: true,
            blending: THREE.NormalBlending,
        });
        this.nodePoints = new THREE.Points(g, nodeMat);
        this.nodePoints.frustumCulled = false;
        this.scene.add(this.nodePoints);
        this._buildEdges(model);
        this._buildLabels(model);
        this._rebuildShieldDome();
        if (autoFit)
            this._frameToFit();
    }
    setAllRevealed() {
        this._forceFullReveal = true;
        this._birthById.clear();
    }
    _buildBirthTimes(model, opts) {
        const N = model.ids.length;
        const out = new Float32Array(N);
        if (this._forceFullReveal || opts.birthTimes) {
            this._forceFullReveal = false;
            if (opts.birthTimes && opts.birthTimes.length === N) {
                out.set(opts.birthTimes);
            }
            this._birthById.clear();
            for (let i = 0; i < N; i++)
                this._birthById.set(model.ids[i], 0);
            return out;
        }
        const now = this.clock.getElapsedTime();
        const reveal = opts.revealNewIds;
        const step = reveal && reveal.size > 1
            ? Math.min(REVEAL_STAGGER_STEP, REVEAL_STAGGER_WINDOW / reveal.size)
            : 0;
        let born = 0;
        for (let i = 0; i < N; i++) {
            const id = model.ids[i];
            let t = 0;
            if (reveal?.has(id)) {
                t = now + born * step;
                born++;
            }
            else if (this._birthById.has(id)) {
                t = this._birthById.get(id);
            }
            out[i] = t;
            this._birthById.set(id, t);
        }
        return out;
    }
    _buildEdges(model) {
        const total = model.edgeFrom ? model.edgeFrom.length : 0;
        if (total === 0) {
            this.edgeLines = null;
            this._edgeCount = 0;
            return;
        }
        const sel = this._selectEdges(model, total);
        this._eFrom = sel.from;
        this._eTo = sel.to;
        this._eKind = sel.kind;
        const E = sel.count;
        this._edgeCount = E;
        this._edgeTotal = total;
        if (E === 0) {
            this.edgeLines = null;
            return;
        }
        const positions = new Float32Array(E * 6);
        const colors = new Float32Array(E * 6);
        const waveAttr = new Float32Array(E * 2);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aWaveDepth', new THREE.BufferAttribute(waveAttr, 1));
        this.edgeUniforms = {
            uWaveFront: { value: WAVE_FRONT_DONE },
            uBaseOpacity: { value: adaptiveEdgeOpacity(E) },
            uBurnWidth: { value: 0.7 },
            uPulseFront: { value: 0 },
            uPulseWidth: { value: 1 },
        };
        const mat = new THREE.ShaderMaterial({
            uniforms: this.edgeUniforms,
            vertexShader: EDGE_VERTEX,
            fragmentShader: EDGE_FRAGMENT,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        this.edgeLines = new THREE.LineSegments(geo, mat);
        this.edgeLines.frustumCulled = false;
        this.scene.add(this.edgeLines);
        this._fillEdgeColors(this._heat ?? null);
        this._syncEdgePositions();
        this._applyEdgeVisibility();
    }
    _buildLabels(model) {
        this._disposeLabels();
        if (!model?.isMeta || !this._positions)
            return;
        const group = new THREE.Group();
        group.name = 'module-labels';
        let count = 0;
        for (let i = 0; i < model.ids.length; i++) {
            if (!model.isMeta[i])
                continue;
            const text = model.names[i] || '';
            if (!text)
                continue;
            const sprite = this._makeLabelSprite(text);
            sprite.position.set(this._positions[i * 3], this._positions[i * 3 + 1] + 6, this._positions[i * 3 + 2]);
            sprite.userData.nodeIndex = i;
            group.add(sprite);
            count++;
        }
        if (!count)
            return;
        this._labelGroup = group;
        this.scene.add(group);
    }
    _makeLabelSprite(text) {
        const pad = 10;
        const fontSize = 28;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        const metrics = ctx.measureText(text);
        const w = Math.ceil(metrics.width + pad * 2);
        const h = Math.ceil(fontSize + pad * 1.6);
        canvas.width = w;
        canvas.height = h;
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(8, 10, 16, 0.72)';
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(r, 0);
        ctx.arcTo(w, 0, w, h, r);
        ctx.arcTo(w, h, 0, h, r);
        ctx.arcTo(0, h, 0, 0, r);
        ctx.arcTo(0, 0, w, 0, r);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(230, 236, 255, 0.95)';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, pad, h / 2);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            sizeAttenuation: true,
        });
        const sprite = new THREE.Sprite(mat);
        const scale = Math.max(14, Math.min(42, w * 0.085));
        sprite.scale.set(scale, scale * (h / w), 1);
        return sprite;
    }
    _disposeLabels() {
        if (!this._labelGroup)
            return;
        this.scene.remove(this._labelGroup);
        this._labelGroup.traverse((obj) => {
            if (obj.isSprite) {
                obj.material?.map?.dispose?.();
                obj.material?.dispose?.();
            }
        });
        this._labelGroup = null;
    }
    _syncLabelPositions() {
        if (!this._labelGroup || !this._positions)
            return;
        for (const sprite of this._labelGroup.children) {
            const i = sprite.userData.nodeIndex;
            if (i == null)
                continue;
            sprite.position.set(this._positions[i * 3], this._positions[i * 3 + 1] + 6, this._positions[i * 3 + 2]);
        }
    }
    _selectEdges(model, total) {
        const ef = model.edgeFrom;
        const et = model.edgeTo;
        const ek = model.edgeKind;
        if (total <= EDGE_RENDER_CAP) {
            return { from: ef, to: et, kind: ek, count: total };
        }
        const deg = model.degree;
        const prio = (e) => deg[ef[e]] + deg[et[e]];
        let hi = 0;
        for (let i = 0; i < deg.length; i++)
            if (deg[i] > hi)
                hi = deg[i];
        hi *= 2;
        let lo = 0;
        for (let it = 0; it < 40 && hi - lo > 0.5; it++) {
            const mid = (lo + hi) / 2;
            let cnt = 0;
            for (let e = 0; e < total; e++) {
                if (prio(e) >= mid && ++cnt > EDGE_RENDER_CAP)
                    break;
            }
            if (cnt > EDGE_RENDER_CAP)
                lo = mid;
            else
                hi = mid;
        }
        const thr = lo;
        const from = new Int32Array(EDGE_RENDER_CAP);
        const to = new Int32Array(EDGE_RENDER_CAP);
        const kind = new Uint8Array(EDGE_RENDER_CAP);
        let k = 0;
        for (let e = 0; e < total && k < EDGE_RENDER_CAP; e++) {
            if (prio(e) >= thr) {
                from[k] = ef[e];
                to[k] = et[e];
                kind[k] = ek ? ek[e] : 0;
                k++;
            }
        }
        return {
            from: from.subarray(0, k),
            to: to.subarray(0, k),
            kind: kind.subarray(0, k),
            count: k,
        };
    }
    _fillEdgeColors(heat) {
        if (!this.edgeLines || !this._model)
            return;
        const m = this._model;
        const E = this._edgeCount;
        const eFrom = this._eFrom;
        const eTo = this._eTo;
        const colors = this.edgeLines.geometry.getAttribute('color');
        const arr = colors.array;
        const overlay = this._overlay ?? null;
        const hover = this._hoverActive() ? this._hoverIndex : null;
        const groups = m.groupId;
        for (let e = 0; e < E; e++) {
            const a = eFrom[e];
            const b = eTo[e];
            let ca = null;
            let cb = null;
            if (overlay) {
                const c = this._overlayEdgeColor(m.ids[a], m.ids[b], overlay);
                if (c) {
                    ca = c;
                    cb = c;
                }
            }
            if (!ca) {
                if (heat) {
                    const ta = heat.get(m.ids[a]);
                    const tb = heat.get(m.ids[b]);
                    const t = Math.min(ta == null ? 1 : ta, tb == null ? 1 : tb);
                    const c = heatColor(t);
                    ca = c;
                    cb = c;
                }
                else {
                    ca = this._nodeBaseColor(a, m);
                    cb = this._nodeBaseColor(b, m);
                    let scale = EDGE_ENDPOINT_SCALE;
                    if (groups && groups[a] !== groups[b])
                        scale *= INTER_GROUP_EDGE_SCALE;
                    ca = [ca[0] * scale, ca[1] * scale, ca[2] * scale];
                    cb = [cb[0] * scale, cb[1] * scale, cb[2] * scale];
                }
            }
            if (hover != null && !isHoverFocusEdge(hover, a, b)) {
                ca = [ca[0] * HOVER_EDGE_DIM, ca[1] * HOVER_EDGE_DIM, ca[2] * HOVER_EDGE_DIM];
                cb = [cb[0] * HOVER_EDGE_DIM, cb[1] * HOVER_EDGE_DIM, cb[2] * HOVER_EDGE_DIM];
            }
            if (!this._edgesVisible && this._selectedIndex != null) {
                if (a !== this._selectedIndex && b !== this._selectedIndex) {
                    ca = [0, 0, 0];
                    cb = [0, 0, 0];
                }
            }
            const o = e * 6;
            arr[o] = ca[0];
            arr[o + 1] = ca[1];
            arr[o + 2] = ca[2];
            arr[o + 3] = cb[0];
            arr[o + 4] = cb[1];
            arr[o + 5] = cb[2];
        }
        colors.needsUpdate = true;
    }
    _nodeBaseColor(i, model) {
        if (NODE_COLOR_MODE === 'type')
            return colorForType(model.types[i]);
        const gid = model.groupId ? model.groupId[i] : 0;
        return groupColor(gid);
    }
    _hoverActive() {
        if (this._hoverIndex == null || this._hoverIndex < 0)
            return false;
        if (this._overlay)
            return false;
        if (this._wave)
            return false;
        return true;
    }
    setHoverFocus(index) {
        const next = index == null || index < 0 || !this._model || index >= this._model.ids.length
            ? null
            : index;
        if (next === this._hoverIndex)
            return;
        this._hoverIndex = next;
        this._refreshAppearance();
    }
    _refreshAppearance() {
        if (!this._model || !this.nodePoints)
            return;
        const color = this.nodePoints.geometry.getAttribute('color');
        this._fillNodeColors(color.array, this._model, this._heat ?? null);
        color.needsUpdate = true;
        const sizeAttr = this.nodePoints.geometry.getAttribute('aSize');
        this._fillNodeSizes(sizeAttr.array, this._model, this._heat ?? null);
        sizeAttr.needsUpdate = true;
        this._fillEdgeColors(this._heat ?? null);
    }
    _overlayEdgeColor(aId, bId, overlay) {
        if (overlay.kind === 'zone') {
            const inZone = (id) => overlay.core.has(id) || overlay.halo.has(id);
            return inZone(aId) && inZone(bId) ? ZONE_EDGE_COLOR : OVERLAY_EDGE_RECEDE;
        }
        if (overlay.kind === 'impact') {
            const inImpact = (id) => id === overlay.source || overlay.impacted?.has(id);
            return inImpact(aId) && inImpact(bId) ? IMPACT_EDGE_COLOR : OVERLAY_EDGE_RECEDE;
        }
        if (overlay.kind === 'shield') {
            const trail = overlay.trailEdges?.get(aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`);
            if (trail)
                return TRAIL_EDGE_COLORS[trail] ?? OVERLAY_EDGE_RECEDE;
            const inZone = (id) => overlay.core.has(id) || overlay.halo.has(id);
            if (inZone(aId) && inZone(bId)) {
                const max = Math.max(overlay.maxDistance, 1);
                const depthOf = (id) => (overlay.core.has(id) ? 0 : (overlay.halo.get(id) ?? max) / (max + 1));
                const local = this._shieldLocalRise(overlay, Math.max(depthOf(aId), depthOf(bId)));
                return lerp3(OVERLAY_EDGE_RECEDE, SHIELD_EDGE_COLOR, local);
            }
            return OVERLAY_EDGE_RECEDE;
        }
        if (overlay.kind === 'candidates') {
            return overlay.candidates.has(aId) && overlay.candidates.has(bId)
                ? CAND_EDGE_COLOR
                : OVERLAY_EDGE_RECEDE;
        }
        if (overlay.kind === 'live') {
            if (overlay.touched?.has(aId) && overlay.touched?.has(bId)) {
                return overlay.confirmed
                    ? LIVE_CONFIRM_COLOR
                    : lerp3(LIVE_AMBER_COLOR, LIVE_AMBER_FLASH, overlay.pulse || 0);
            }
            return null;
        }
        const pa = overlay.order?.get?.(aId);
        const pb = overlay.order?.get?.(bId);
        if (pa != null && pb != null && Math.abs(pa - pb) === 1) {
            const litEnd = Math.max(pa, pb);
            return litEnd < overlay.litCount ? PATH_EDGE_COLOR : OVERLAY_EDGE_RECEDE;
        }
        return OVERLAY_EDGE_RECEDE;
    }
    setOverlay(overlay) {
        this._overlay = overlay || null;
        if (this._overlay?.kind !== 'shield')
            this._disposeShieldDome();
        if (this._overlay)
            this._hoverIndex = null;
        this._refreshAppearance();
    }
    get overlay() {
        return this._overlay ?? null;
    }
    focusIndices(indices) {
        if (!this._positions || indices.length === 0)
            return;
        this.stopIdleOrbit();
        if (indices.length === 1) {
            this.focusNode(indices[0]);
            return;
        }
        const p = this._positions;
        const center = new THREE.Vector3();
        for (const i of indices) {
            center.x += p[i * 3];
            center.y += p[i * 3 + 1];
            center.z += p[i * 3 + 2];
        }
        center.divideScalar(indices.length);
        let radius = 0;
        const v = new THREE.Vector3();
        for (const i of indices) {
            v.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
            radius = Math.max(radius, v.distanceTo(center));
        }
        radius = Math.max(radius, 20);
        const dist = (radius * 1.4) / Math.sin((this.camera.fov * Math.PI) / 360);
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        if (dir.lengthSq() < 1e-6)
            dir.set(0, 0, 1);
        dir.normalize().multiplyScalar(dist);
        this._focusTween = {
            fromPos: this.camera.position.clone(),
            toPos: center.clone().add(dir),
            fromTarget: this.controls.target.clone(),
            toTarget: center.clone(),
            start: this.clock.getElapsedTime(),
            dur: 0.65,
        };
    }
    _syncEdgePositions() {
        if (!this.edgeLines || !this._positions)
            return;
        const E = this._edgeCount;
        const eFrom = this._eFrom;
        const eTo = this._eTo;
        const pos = this._positions;
        const arr = this.edgeLines.geometry.getAttribute('position').array;
        for (let e = 0; e < E; e++) {
            const a = eFrom[e] * 3;
            const b = eTo[e] * 3;
            const o = e * 6;
            arr[o] = pos[a];
            arr[o + 1] = pos[a + 1];
            arr[o + 2] = pos[a + 2];
            arr[o + 3] = pos[b];
            arr[o + 4] = pos[b + 1];
            arr[o + 5] = pos[b + 2];
        }
        this.edgeLines.geometry.getAttribute('position').needsUpdate = true;
    }
    setEdgesVisible(on) {
        this._edgesVisible = !!on;
        this._applyEdgeVisibility();
        if (this._edgesVisible && this.edgeLines)
            this._syncEdgePositions();
        if (!this._edgesVisible && this._selectedIndex == null)
            this._cancelEdgeWave();
        this._fillEdgeColors(this._heat ?? null);
        return this._edgeCount || 0;
    }
    setSelectedIndex(index) {
        const next = index == null || index < 0 || !this._model || index >= this._model.ids.length
            ? null
            : index;
        if (next === this._selectedIndex)
            return;
        this._selectedIndex = next;
        this._applyEdgeVisibility();
        this._fillEdgeColors(this._heat ?? null);
    }
    _applyEdgeVisibility() {
        if (!this.edgeLines)
            return;
        const show = !!this._edgesVisible || this._selectedIndex != null;
        this.edgeLines.visible = show;
        if (show)
            this._syncEdgePositions();
    }
    primeEdgeWave() {
        if (!this.edgeUniforms || this._overlay || this._heat)
            return;
        if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        this.edgeUniforms.uWaveFront.value = 0;
    }
    playEdgeWave(opts = {}) {
        if (!this.edgeLines || !this.edgeUniforms || !this._model || !this._positions)
            return false;
        const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this._overlay || this._heat || reducedMotion) {
            this.edgeUniforms.uWaveFront.value = WAVE_FRONT_DONE;
            return false;
        }
        this._cancelEdgeWave();
        this._syncEdgePositions();
        const entry = this._model.entry ?? 0;
        const pos = this._positions;
        const { distances, maxDistance } = edgeWaveDistances(pos, this._eFrom, this._eTo, entry);
        const waveAttr = this.edgeLines.geometry.getAttribute('aWaveDepth');
        for (let e = 0; e < distances.length; e++) {
            waveAttr.array[e * 2] = distances[e];
            waveAttr.array[e * 2 + 1] = distances[e];
        }
        waveAttr.needsUpdate = true;
        const sorted = Float32Array.from(distances).sort();
        const timeAtDistance = (d) => {
            let lo = 0;
            let hi = sorted.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (sorted[mid] < d)
                    lo = mid + 1;
                else
                    hi = mid;
            }
            const k = sorted.length > 1 ? Math.min(lo, sorted.length - 1) / (sorted.length - 1) : 1;
            return k * WAVE_TRAVEL_S;
        };
        const now = this.clock.getElapsedTime();
        const launch = now + WAVE_STAR_SOLO_S;
        const geo = this.nodePoints.geometry;
        const flareTime = geo.getAttribute('aFlareTime');
        const flareAmp = geo.getAttribute('aFlareAmp');
        const ex = pos[entry * 3];
        const ey = pos[entry * 3 + 1];
        const ez = pos[entry * 3 + 2];
        for (let i = 0; i < flareTime.array.length; i++) {
            const dx = pos[i * 3] - ex;
            const dy = pos[i * 3 + 1] - ey;
            const dz = pos[i * 3 + 2] - ez;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            flareTime.array[i] = launch + timeAtDistance(d);
            flareAmp.array[i] = FLARE_AMP_NODE;
        }
        flareTime.array[entry] = now;
        flareAmp.array[entry] = FLARE_AMP_ENTRY;
        flareTime.needsUpdate = true;
        flareAmp.needsUpdate = true;
        this.edgeUniforms.uWaveFront.value = 0;
        this.edgeUniforms.uBurnWidth.value = Math.max(maxDistance * WAVE_BURN_FRACTION, 0.5);
        this._wave = {
            start: launch,
            sorted,
            maxDistance: Math.max(maxDistance, 1),
            onDone: opts.onDone ?? null,
        };
        return true;
    }
    armPulse() {
        if (!this.edgeLines || !this.edgeUniforms || !this._model || !this._positions)
            return;
        const entry = this._model.entry ?? 0;
        const { distances, maxDistance } = edgeWaveDistances(this._positions, this._eFrom, this._eTo, entry);
        const waveAttr = this.edgeLines.geometry.getAttribute('aWaveDepth');
        for (let e = 0; e < distances.length; e++) {
            waveAttr.array[e * 2] = distances[e];
            waveAttr.array[e * 2 + 1] = distances[e];
        }
        waveAttr.needsUpdate = true;
        this.edgeUniforms.uBurnWidth.value = Math.max(maxDistance * WAVE_BURN_FRACTION, 0.5);
        this._startPulse(Math.max(maxDistance, 1));
    }
    playSimulationProbe(indices, opts = {}) {
        if (!this._positions || !Array.isArray(indices) || indices.length < 2)
            return false;
        this.cancelSimulationProbe();
        const pos = this._positions;
        const points = indices.map((i) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]));
        const segments = points.length - 1;
        const duration = Math.min(Math.max(segments * PROBE_SEGMENT_S, PROBE_TOTAL_MIN_S), PROBE_TOTAL_MAX_S);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
        const mat = new THREE.PointsMaterial({
            color: PROBE_COLOR,
            size: PROBE_SIZE,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const mote = new THREE.Points(geo, mat);
        mote.frustumCulled = false;
        this.scene.add(mote);
        const tailGeo = new THREE.BufferGeometry();
        const tailArr = new Float32Array(points.length * 3);
        for (let i = 0; i < points.length; i++) {
            tailArr[i * 3] = points[i].x;
            tailArr[i * 3 + 1] = points[i].y;
            tailArr[i * 3 + 2] = points[i].z;
        }
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailArr, 3));
        tailGeo.setDrawRange(0, 0);
        const tailMat = new THREE.LineBasicMaterial({
            color: PROBE_TAIL_COLOR,
            transparent: true,
            opacity: PROBE_TAIL_OPACITY,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const tail = new THREE.Line(tailGeo, tailMat);
        tail.frustumCulled = false;
        this.scene.add(tail);
        this._probe = {
            mote,
            tail,
            points,
            start: this.clock.getElapsedTime(),
            duration,
            targetIndex: indices[indices.length - 1],
            verdict: opts.verdict ?? null,
            outcome: opts.outcome ?? null,
            onDone: opts.onDone ?? null,
        };
        return true;
    }
    cancelSimulationProbe() {
        const p = this._probe;
        if (!p)
            return;
        this._probe = null;
        this.scene.remove(p.mote);
        p.mote.geometry.dispose();
        p.mote.material.dispose();
        if (p.tail) {
            this.scene.remove(p.tail);
            p.tail.geometry.dispose();
            p.tail.material.dispose();
        }
    }
    _advanceProbe(t) {
        const p = this._probe;
        if (!p)
            return;
        const k = (t - p.start) / p.duration;
        if (k >= 1) {
            const { targetIndex, verdict, outcome, onDone } = p;
            this.cancelSimulationProbe();
            if (verdict || outcome)
                this.flashImpact(targetIndex, verdict, outcome);
            onDone?.();
            return;
        }
        const x = Math.max(k, 0) * (p.points.length - 1);
        const i = Math.floor(x);
        const j = Math.min(i + 1, p.points.length - 1);
        const a = p.points[i];
        const b = p.points[j];
        const f = x - i;
        const mx = a.x + (b.x - a.x) * f;
        const my = a.y + (b.y - a.y) * f;
        const mz = a.z + (b.z - a.z) * f;
        const arr = p.mote.geometry.getAttribute('position').array;
        arr[0] = mx;
        arr[1] = my;
        arr[2] = mz;
        p.mote.geometry.getAttribute('position').needsUpdate = true;
        if (p.tail) {
            const tailAttr = p.tail.geometry.getAttribute('position');
            const t = tailAttr.array;
            for (let v = 0; v <= i; v++) {
                t[v * 3] = p.points[v].x;
                t[v * 3 + 1] = p.points[v].y;
                t[v * 3 + 2] = p.points[v].z;
            }
            t[j * 3] = mx;
            t[j * 3 + 1] = my;
            t[j * 3 + 2] = mz;
            p.tail.geometry.setDrawRange(0, j + 1);
            tailAttr.needsUpdate = true;
        }
    }
    flashImpact(index, verdict, outcome) {
        if (!this._positions || index == null || index < 0)
            return;
        this._disposeImpact();
        const pos = this._positions;
        const color = (outcome && IMPACT_OUTCOME_COLORS[outcome]) ||
            (verdict === 'block' ? IMPACT_BLOCK_COLOR : IMPACT_OK_COLOR);
        const geo = new THREE.SphereGeometry(1, 32, 24);
        const uniforms = {
            uShellColor: { value: new THREE.Vector3(...color) },
            uShellOpacity: { value: 0 },
        };
        const mat = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: SHELL_VERTEX,
            fragmentShader: SHELL_FRAGMENT,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });
        const bubble = new THREE.Mesh(geo, mat);
        bubble.position.set(pos[index * 3], pos[index * 3 + 1], pos[index * 3 + 2]);
        bubble.scale.setScalar(0.001);
        bubble.frustumCulled = false;
        this.scene.add(bubble);
        this._impact = { bubble, uniforms, start: this.clock.getElapsedTime() };
        const flareTime = this.nodePoints?.geometry.getAttribute('aFlareTime');
        const flareAmp = this.nodePoints?.geometry.getAttribute('aFlareAmp');
        if (flareTime && flareAmp && index < flareTime.array.length) {
            flareTime.array[index] = this.clock.getElapsedTime();
            flareAmp.array[index] = FLARE_AMP_ENTRY;
            flareTime.needsUpdate = true;
            flareAmp.needsUpdate = true;
        }
    }
    _disposeImpact() {
        const im = this._impact;
        if (!im)
            return;
        this._impact = null;
        this.scene.remove(im.bubble);
        im.bubble.geometry.dispose();
        im.bubble.material.dispose();
    }
    _advanceImpact(t) {
        const im = this._impact;
        if (!im)
            return;
        const k = (t - im.start) / IMPACT_DURATION_S;
        if (k >= 1) {
            this._disposeImpact();
            return;
        }
        const grow = 1 - (1 - k) * (1 - k);
        im.bubble.scale.setScalar(Math.max(IMPACT_RADIUS * grow, 0.001));
        im.uniforms.uShellOpacity.value = 0.85 * (1 - k);
    }
    _buildShell(x, y, z) {
        this._disposeShell();
        const geo = new THREE.SphereGeometry(1, 48, 32);
        this._shellUniforms = {
            uShellColor: { value: new THREE.Vector3(...SHELL_COLOR) },
            uShellOpacity: { value: 0 },
        };
        const mat = new THREE.ShaderMaterial({
            uniforms: this._shellUniforms,
            vertexShader: SHELL_VERTEX,
            fragmentShader: SHELL_FRAGMENT,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });
        this._shell = new THREE.Mesh(geo, mat);
        this._shell.position.set(x, y, z);
        this._shell.scale.setScalar(0.001);
        this._shell.frustumCulled = false;
        this.scene.add(this._shell);
    }
    showShieldDome(indices, opts = {}) {
        this._disposeShieldDome();
        if (!this._positions || !indices || indices.length === 0)
            return;
        const p = this._positions;
        const center = new THREE.Vector3();
        for (const i of indices) {
            center.x += p[i * 3];
            center.y += p[i * 3 + 1];
            center.z += p[i * 3 + 2];
        }
        center.divideScalar(indices.length);
        let radius = 0;
        const v = new THREE.Vector3();
        for (const i of indices) {
            v.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
            radius = Math.max(radius, v.distanceTo(center));
        }
        radius = Math.max(radius * SHIELD_DOME_PADDING, SHIELD_DOME_MIN_RADIUS);
        const geo = new THREE.SphereGeometry(1, 48, 32);
        const uniforms = {
            uShellColor: { value: new THREE.Vector3(...SHIELD_DOME_COLOR) },
            uShellOpacity: { value: 0 },
        };
        const mat = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: SHELL_VERTEX,
            fragmentShader: SHELL_FRAGMENT,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });
        const dome = new THREE.Mesh(geo, mat);
        dome.position.copy(center);
        dome.scale.setScalar(0.001);
        dome.frustumCulled = false;
        this.scene.add(dome);
        const rise = Math.max(0, Math.min(1, opts.rise ?? 0));
        this._shieldDome = { mesh: dome, uniforms, radius, rise };
    }
    _rebuildShieldDome() {
        const overlay = this._overlay;
        if (!overlay || overlay.kind !== 'shield' || !this._model?.index)
            return;
        const prevRise = this._shieldDome?.rise ?? overlay.rise ?? 1;
        const indices = [];
        for (const id of [...overlay.core, ...overlay.halo.keys()]) {
            const i = this._model.index.get(id);
            if (i !== undefined)
                indices.push(i);
        }
        if (indices.length)
            this.showShieldDome(indices, { rise: prevRise });
    }
    setShieldDomeRise(rise) {
        if (this._shieldDome) {
            this._shieldDome.rise = Math.max(0, Math.min(1, rise));
        }
    }
    celebrateShieldDome() {
        if (!this._shieldDome)
            return;
        this._shieldCelebrateAt = Date.now();
    }
    _disposeShieldDome() {
        const d = this._shieldDome;
        if (!d)
            return;
        this._shieldDome = null;
        this._shieldCelebrateAt = null;
        this.scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
    }
    _advanceShieldDome(t) {
        const d = this._shieldDome;
        if (!d)
            return;
        let swell = 0;
        if (this._shieldCelebrateAt != null) {
            const p = (Date.now() - this._shieldCelebrateAt) / SHIELD_CELEBRATE_MS;
            if (p >= 1)
                this._shieldCelebrateAt = null;
            else
                swell = Math.sin(p * Math.PI);
        }
        const breath = 1 + SHIELD_DOME_BREATH_AMP * Math.sin(t * SHIELD_DOME_BREATH_SPEED) * d.rise;
        const scale = d.radius * d.rise * breath * (1 + SHIELD_CELEBRATE_SCALE * swell);
        d.mesh.scale.setScalar(Math.max(scale, 0.001));
        d.uniforms.uShellOpacity.value =
            SHIELD_DOME_OPACITY * d.rise * (1 + SHIELD_CELEBRATE_GLOW * swell);
    }
    _disposeShell() {
        if (!this._shell)
            return;
        this.scene.remove(this._shell);
        this._shell.geometry.dispose();
        this._shell.material.dispose();
        this._shell = null;
        this._shellUniforms = null;
    }
    _cancelEdgeWave() {
        if (!this._wave)
            return;
        this._wave = null;
        if (this.edgeUniforms)
            this.edgeUniforms.uWaveFront.value = WAVE_FRONT_DONE;
        this.bloom.strength = BLOOM_BASE_STRENGTH;
        this._disposeShell();
        const flareTime = this.nodePoints?.geometry.getAttribute('aFlareTime');
        if (flareTime) {
            flareTime.array.fill(0);
            flareTime.needsUpdate = true;
        }
    }
    _advanceWave(t) {
        const w = this._wave;
        if (!w)
            return;
        const k = (t - w.start) / WAVE_TRAVEL_S;
        if (k < 0)
            return;
        if (k < 1) {
            const front = this._quantileFront(w, k);
            if (this.edgeUniforms)
                this.edgeUniforms.uWaveFront.value = front;
            if (this._shell && this._shellUniforms) {
                this._shell.scale.setScalar(Math.max(front, 0.001));
                this._shellUniforms.uShellOpacity.value = 0.5 * Math.min(k * 6, 1) * (1 - k * k);
            }
            this.bloom.strength =
                BLOOM_BASE_STRENGTH + (BLOOM_WAVE_PEAK - BLOOM_BASE_STRENGTH) * k * k;
            return;
        }
        this._disposeShell();
        const overS = t - w.start - WAVE_TRAVEL_S;
        if (this.edgeUniforms) {
            this.edgeUniforms.uWaveFront.value = w.maxDistance * (1 + overS / WAVE_TRAVEL_S);
        }
        const decayK = overS / WAVE_BLOOM_DECAY_S;
        if (decayK >= 1) {
            const onDone = w.onDone;
            const maxDistance = w.maxDistance;
            this._cancelEdgeWave();
            this._startPulse(maxDistance);
            onDone?.();
            return;
        }
        this.bloom.strength =
            BLOOM_BASE_STRENGTH + (BLOOM_WAVE_PEAK - BLOOM_BASE_STRENGTH) * (1 - decayK);
    }
    _quantileFront(w, k) {
        const s = w.sorted;
        if (!s || s.length === 0)
            return k * w.maxDistance;
        const x = k * (s.length - 1);
        const i = Math.floor(x);
        const j = Math.min(i + 1, s.length - 1);
        return s[i] + (s[j] - s[i]) * (x - i);
    }
    _startPulse(maxDistance) {
        if (!this.edgeUniforms)
            return;
        this.edgeUniforms.uPulseWidth.value = Math.max(maxDistance * PULSE_WIDTH_FRACTION, 0.5);
        this._pulseMeta = {
            maxDistance,
            nextAt: this.clock.getElapsedTime() + PULSE_PERIOD_S,
            startedAt: null,
        };
    }
    _advancePulse(t) {
        const p = this._pulseMeta;
        if (!p || !this.edgeUniforms)
            return;
        if (this._overlay || this._heat || !this._edgesVisible) {
            this.edgeUniforms.uPulseFront.value = 0;
            p.startedAt = null;
            p.nextAt = Math.max(p.nextAt, t + 2);
            return;
        }
        if (p.startedAt == null) {
            if (t < p.nextAt)
                return;
            p.startedAt = t;
        }
        const k = (t - p.startedAt) / PULSE_TRAVEL_S;
        if (k >= 1) {
            p.startedAt = null;
            p.nextAt = t + PULSE_PERIOD_S;
            this.edgeUniforms.uPulseFront.value = 0;
            return;
        }
        this.edgeUniforms.uPulseFront.value = k * p.maxDistance;
    }
    get edgeCount() {
        return this._edgeCount || 0;
    }
    get edgeTotal() {
        return this._edgeTotal || this._edgeCount || 0;
    }
    _fillNodeColors(color, model, heat) {
        const N = model.ids.length;
        const overlay = this._overlay ?? null;
        const hover = this._hoverActive() ? this._hoverIndex : null;
        for (let i = 0; i < N; i++) {
            let c = null;
            if (overlay) {
                c = this._overlayNodeColor(model.ids[i], overlay);
            }
            if (!c) {
                if (heat) {
                    const t = heat.get(model.ids[i]);
                    if (t == null) {
                        c = HEAT_MISSING;
                    }
                    else {
                        c = heatColor(t);
                        const k = 0.55 + 0.85 * (1 - Math.max(0, Math.min(1, t)));
                        c = [c[0] * k, c[1] * k, c[2] * k];
                    }
                }
                else {
                    c = this._nodeBaseColor(i, model);
                }
            }
            if (hover != null && !isHoverFocusNode(hover, model.adjacency, i)) {
                c = [c[0] * HOVER_NODE_DIM, c[1] * HOVER_NODE_DIM, c[2] * HOVER_NODE_DIM];
            }
            color[i * 3] = c[0];
            color[i * 3 + 1] = c[1];
            color[i * 3 + 2] = c[2];
        }
    }
    _shieldLocalRise(overlay, depth) {
        const rise = overlay.rise ?? 1;
        return Math.max(0, Math.min(1, (rise - depth * SHIELD_RING_STAGGER) / SHIELD_RING_FADE));
    }
    _overlayNodeColor(id, overlay) {
        if (overlay.kind === 'zone') {
            if (overlay.core.has(id))
                return ZONE_CORE_COLOR;
            const d = overlay.halo.get(id);
            if (d != null) {
                const max = Math.max(overlay.maxDistance, 1);
                const t = Math.max(0, Math.min(1, (d - 1) / Math.max(max - 1, 1)));
                return lerp3(ZONE_HALO_NEAR, ZONE_HALO_FAR, t);
            }
            return OVERLAY_RECEDE;
        }
        if (overlay.kind === 'impact') {
            if (id === overlay.source)
                return IMPACT_SOURCE_COLOR;
            const d = overlay.impacted?.get(id);
            if (d != null) {
                const max = Math.max(overlay.maxDistance, 1);
                const t = Math.max(0, Math.min(1, (d - 1) / Math.max(max - 1, 1)));
                return lerp3(IMPACT_NEAR_COLOR, IMPACT_FAR_COLOR, t);
            }
            return OVERLAY_RECEDE;
        }
        if (overlay.kind === 'shield') {
            if (overlay.core.has(id)) {
                return lerp3(OVERLAY_RECEDE, SHIELD_CORE_COLOR, this._shieldLocalRise(overlay, 0));
            }
            const d = overlay.halo.get(id);
            if (d != null) {
                const max = Math.max(overlay.maxDistance, 1);
                const t = Math.max(0, Math.min(1, (d - 1) / Math.max(max - 1, 1)));
                const local = this._shieldLocalRise(overlay, d / (max + 1));
                return lerp3(OVERLAY_RECEDE, lerp3(SHIELD_HALO_NEAR, SHIELD_HALO_FAR, t), local);
            }
            const trail = overlay.trailNodes?.get(id);
            if (trail)
                return TRAIL_NODE_COLORS[trail] ?? OVERLAY_RECEDE;
            return OVERLAY_RECEDE;
        }
        if (overlay.kind === 'candidates') {
            if (overlay.candidates.has(id))
                return lerp3(CAND_STEADY_COLOR, CAND_FLASH_COLOR, overlay.pulse || 0);
            if (overlay.rejected.has(id))
                return CAND_REJECTED_COLOR;
            return OVERLAY_RECEDE;
        }
        if (overlay.kind === 'live') {
            if (overlay.touched?.has(id)) {
                if (overlay.confirmed)
                    return LIVE_CONFIRM_COLOR;
                return lerp3(LIVE_AMBER_COLOR, LIVE_AMBER_FLASH, overlay.pulse || 0);
            }
            return null;
        }
        const pos = overlay.order?.get?.(id);
        if (pos != null) {
            return pos < overlay.litCount ? PATH_LIT_COLOR : PATH_DIM_COLOR;
        }
        return OVERLAY_RECEDE;
    }
    _fillNodeSizes(size, model, heat) {
        const N = model.ids.length;
        const overlay = this._overlay ?? null;
        const hover = this._hoverActive() ? this._hoverIndex : null;
        for (let i = 0; i < N; i++) {
            let s = 3.4 + Math.min(Math.sqrt(model.degree[i]), 16) * 1.35;
            if (model.isMeta?.[i]) {
                const members = model.nodes[i]?._size || model.degree[i] || 1;
                s = 8 + Math.min(Math.sqrt(members), 24) * 2.2;
            }
            if (overlay) {
                const id = model.ids[i];
                if (overlay.kind === 'zone') {
                    if (overlay.core.has(id))
                        s *= 1.6;
                    else if (overlay.halo.has(id))
                        s *= 1.15;
                }
                else if (overlay.kind === 'impact') {
                    if (id === overlay.source)
                        s *= 1.65;
                    else if (overlay.impacted?.has(id))
                        s *= 1.25;
                }
                else if (overlay.kind === 'shield') {
                    if (overlay.core.has(id)) {
                        s *= 1 + 0.7 * this._shieldLocalRise(overlay, 0);
                    }
                    else {
                        const d = overlay.halo.get(id);
                        if (d != null) {
                            const max = Math.max(overlay.maxDistance, 1);
                            s *= 1 + 0.18 * this._shieldLocalRise(overlay, d / (max + 1));
                        }
                    }
                }
                else if (overlay.kind === 'candidates') {
                    if (overlay.candidates.has(id))
                        s *= 1.35 + 0.45 * (overlay.pulse || 0);
                    else if (overlay.rejected.has(id))
                        s *= 0.9;
                }
                else if (overlay.kind === 'live') {
                    if (overlay.touched?.has(id))
                        s *= 1.45 + 0.35 * (overlay.pulse || 0);
                }
                else if (overlay.order?.has?.(id)) {
                    const pos = overlay.order.get(id);
                    s *= pos < overlay.litCount ? 1.7 : 1.2;
                }
            }
            else if (heat) {
                const t = heat.get(model.ids[i]);
                if (t != null)
                    s *= 1 + 0.8 * (1 - Math.max(0, Math.min(1, t)));
            }
            if (hover != null && i === hover)
                s *= HOVER_FOCUS_SIZE;
            size[i] = s;
        }
    }
    setHeatmap(scoreById) {
        this._heat = scoreById || null;
        this._refreshAppearance();
    }
    updatePositions(positions) {
        if (!this.nodePoints || !this._targetPositions)
            return;
        this._targetPositions.set(positions);
        this._needsInterp = true;
    }
    _advancePositions() {
        if (!this._needsInterp || !this.nodePoints)
            return;
        const cur = this._positions;
        const tgt = this._targetPositions;
        const n = cur.length;
        const a = 0.16;
        let maxDelta = 0;
        for (let i = 0; i < n; i++) {
            const d = tgt[i] - cur[i];
            cur[i] += d * a;
            const ad = d < 0 ? -d : d;
            if (ad > maxDelta)
                maxDelta = ad;
        }
        this.nodePoints.geometry.attributes.position.needsUpdate = true;
        if (this.edgeLines && this.edgeLines.visible)
            this._syncEdgePositions();
        this._syncLabelPositions();
        if (maxDelta < 0.05) {
            cur.set(tgt);
            this._needsInterp = false;
            this.nodePoints.geometry.computeBoundingSphere();
            if (this.edgeLines && this.edgeLines.visible)
                this._syncEdgePositions();
            this._syncLabelPositions();
        }
    }
    frameToFit() {
        this._frameToFit();
    }
    startAutoFrame() {
        this._autoFrame = true;
        this._autoFrameLastBounds = 0;
        if (!this._autoFrameCancelHook) {
            this._autoFrameCancelHook = () => {
                this._autoFrame = false;
            };
            this.controls.addEventListener('start', this._autoFrameCancelHook);
        }
    }
    stopAutoFrame() {
        this._autoFrame = false;
    }
    _advanceAutoFrame(t) {
        if (!this._autoFrame || !this.nodePoints || this._focusTween)
            return;
        if (t - (this._autoFrameLastBounds ?? 0) > 0.35) {
            this._autoFrameLastBounds = t;
            this.nodePoints.geometry.computeBoundingSphere();
        }
        const s = this.nodePoints.geometry.boundingSphere;
        if (!s)
            return;
        const r = Math.max(s.radius, 1);
        const desired = (r / Math.sin((this.camera.fov * Math.PI) / 360)) * 1.15;
        const a = 0.045;
        this.controls.target.lerp(s.center, a);
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        if (dir.lengthSq() < 1e-6)
            dir.set(0, 0, 1);
        const cur = dir.length();
        const next = cur + (desired - cur) * a;
        dir.normalize().multiplyScalar(next);
        this.camera.position.copy(this.controls.target).add(dir);
        if (desired * 4 > this.camera.far) {
            this.camera.far = desired * 8;
            this.camera.updateProjectionMatrix();
        }
    }
    frameToFitSmooth(dur = 0.8) {
        if (!this.nodePoints)
            return;
        this._autoFrame = false;
        this.nodePoints.geometry.computeBoundingSphere();
        const s = this.nodePoints.geometry.boundingSphere;
        if (!s)
            return;
        const r = Math.max(s.radius, 1);
        const dist = r / Math.sin((this.camera.fov * Math.PI) / 360);
        this.camera.near = Math.max(r / 1000, 0.1);
        this.camera.far = dist * 6;
        this.camera.updateProjectionMatrix();
        this.nodeUniforms.uNear.value = r * 0.6;
        this.nodeUniforms.uFar.value = r * 1.8;
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        if (dir.lengthSq() < 1e-6)
            dir.set(0, 0, 1);
        dir.normalize().multiplyScalar(dist * 1.15);
        this._focusTween = {
            fromPos: this.camera.position.clone(),
            toPos: s.center.clone().add(dir),
            fromTarget: this.controls.target.clone(),
            toTarget: s.center.clone(),
            start: this.clock.getElapsedTime(),
            dur,
        };
    }
    _frameToFit() {
        this.nodePoints.geometry.computeBoundingSphere();
        const s = this.nodePoints.geometry.boundingSphere;
        if (!s)
            return;
        const r = Math.max(s.radius, 1);
        const dist = r / Math.sin((this.camera.fov * Math.PI) / 360);
        this.controls.target.copy(s.center);
        this.camera.position.copy(s.center).add(new THREE.Vector3(0, 0, dist * 1.35));
        this.camera.near = Math.max(r / 1000, 0.1);
        this.camera.far = dist * 6;
        this.camera.updateProjectionMatrix();
        this.nodeUniforms.uNear.value = r * 0.6;
        this.nodeUniforms.uFar.value = r * 1.8;
    }
    focusNode(i) {
        if (!this._positions)
            return;
        this.stopIdleOrbit();
        const p = this._positions;
        const node = new THREE.Vector3(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
        const curDist = this.camera.position.distanceTo(this.controls.target);
        const r = (this.nodePoints && this.nodePoints.geometry.boundingSphere)
            ? this.nodePoints.geometry.boundingSphere.radius
            : curDist;
        const desired = Math.max(r * 0.1, 30);
        const newDist = Math.min(curDist, desired);
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        if (dir.lengthSq() < 1e-6)
            dir.set(0, 0, 1);
        dir.normalize().multiplyScalar(newDist);
        this._focusTween = {
            fromPos: this.camera.position.clone(),
            toPos: node.clone().add(dir),
            fromTarget: this.controls.target.clone(),
            toTarget: node.clone(),
            start: this.clock.getElapsedTime(),
            dur: 0.55,
        };
    }
    _advanceFocus(t) {
        const tw = this._focusTween;
        if (!tw)
            return;
        let k = (t - tw.start) / tw.dur;
        if (k >= 1) {
            k = 1;
            this._focusTween = null;
        }
        const e = k * k * (3 - 2 * k);
        this.camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
        this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
    }
    startIdleOrbit(degPerSec = IDLE_ORBIT_DEG_PER_SEC, durationSec = Infinity) {
        this._idleOrbit = {
            radPerSec: (degPerSec * Math.PI) / 180,
            until: Number.isFinite(durationSec)
                ? this.clock.getElapsedTime() + durationSec
                : Infinity,
            lastT: this.clock.getElapsedTime(),
        };
        if (!this._idleOrbitCancelHook) {
            this._idleOrbitCancelHook = () => {
                this._idleOrbit = null;
            };
            this.controls.addEventListener('start', this._idleOrbitCancelHook);
        }
    }
    stopIdleOrbit() {
        this._idleOrbit = null;
    }
    _advanceIdleOrbit(t) {
        const o = this._idleOrbit;
        if (!o)
            return;
        if (t >= o.until) {
            this._idleOrbit = null;
            return;
        }
        const dt = Math.min(t - o.lastT, 0.1);
        o.lastT = t;
        if (this._focusTween)
            return;
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        offset.applyAxisAngle(_ORBIT_AXIS, o.radPerSec * dt);
        this.camera.position.copy(this.controls.target).add(offset);
    }
    pickAt(clientX, clientY) {
        if (!this.nodePoints)
            return -1;
        const rect = this.renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        const ray = new THREE.Raycaster();
        ray.params.Points.threshold = Math.max(this.controls.getDistance() * 0.012, 2);
        ray.setFromCamera(ndc, this.camera);
        const hits = ray.intersectObject(this.nodePoints, false);
        return hits.length ? hits[0].index : -1;
    }
    getVisibleNodeIds(graphModel) {
        if (!this._positions || !graphModel?.ids?.length)
            return [];
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(matrix);
        const p = new THREE.Vector3();
        const pos = this._positions;
        const visible = [];
        for (let i = 0; i < graphModel.ids.length; i++) {
            p.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
            if (frustum.containsPoint(p))
                visible.push(graphModel.ids[i]);
        }
        return visible;
    }
    start() {
        const loop = () => {
            this._raf = requestAnimationFrame(loop);
            const t = this.clock.getElapsedTime();
            if (this.nodeUniforms?.uTime)
                this.nodeUniforms.uTime.value = t;
            this._advancePositions();
            this._advanceAutoFrame(t);
            this._advanceIdleOrbit(t);
            this._advanceWave(t);
            this._advancePulse(t);
            this._advanceProbe(t);
            this._advanceImpact(t);
            this._advanceShieldDome(t);
            this._advanceFocus(t);
            this.controls.update();
            this.composer.render();
        };
        loop();
    }
    resize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / Math.max(h, 1);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.composer.setSize(w, h);
        if (this.nodeUniforms)
            this.nodeUniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
    clearObjects() {
        this._disposeLabels();
        if (this.nodePoints) {
            this.scene.remove(this.nodePoints);
            this.nodePoints.geometry.dispose();
            this.nodePoints.material.dispose();
        }
        this.nodePoints = null;
        if (this.edgeLines) {
            this.scene.remove(this.edgeLines);
            this.edgeLines.geometry.dispose();
            this.edgeLines.material.dispose();
        }
        this.edgeLines = null;
        this._edgeCount = 0;
        this._edgeTotal = 0;
        this._eFrom = null;
        this._eTo = null;
        this._eKind = null;
        this.edgeUniforms = null;
        this._wave = null;
        this._disposeShell();
        this.cancelSimulationProbe();
        this._disposeImpact();
        this._disposeShieldDome();
        this._pulseMeta = null;
    }
    dispose() {
        cancelAnimationFrame(this._raf);
        window.removeEventListener('resize', this._onResize);
        this._resizeObserver?.disconnect();
        if (this._autoFrameCancelHook) {
            this.controls.removeEventListener('start', this._autoFrameCancelHook);
            this._autoFrameCancelHook = null;
        }
        if (this._idleOrbitCancelHook) {
            this.controls.removeEventListener('start', this._idleOrbitCancelHook);
            this._idleOrbitCancelHook = null;
        }
        this.clearObjects();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
