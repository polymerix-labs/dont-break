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

import { useCallback, useEffect, useRef } from "react";
import type { AssistProbe, AssistProbeResult } from "../../../api/assistProxy";
import { useViewerOverlays } from "../../../viewer/useViewerOverlays";
import { deriveProbeOutcome, resolveAttackPath, type ProbeOutcome } from "./attackPath";
import { useStudioStore } from "./studioStore";
const SEGMENT_S = 0.35;
const TRAVEL_MIN_S = 0.7;
const TRAVEL_MAX_S = 2.6;
const IMPACT_S = 0.9;
const GAP_S = 0.4;
export const SHIELD_RISE_MS = 3000;
export const COMPRESS_QUEUE_LEN = 6;
const COMPRESS_FACTOR = 0.5;
export type PlaybackStep = {
    kind: "path";
    probeId: string;
    nodes: string[];
    verdict: "block" | "ok";
    outcome: ProbeOutcome;
    holdMs: number;
} | {
    kind: "impact";
    probeId: string;
    nodeId: string;
    verdict: "block" | "ok";
    outcome: ProbeOutcome;
    holdMs: number;
} | null;
export function planProbePlayback(probe: AssistProbe | undefined, result: AssistProbeResult): PlaybackStep {
    const verdict: "block" | "ok" = result.verdict === "ok" ? "ok" : "block";
    const outcome = deriveProbeOutcome(result);
    const path = resolveAttackPath(probe, result) ?? [];
    if (path.length >= 2) {
        const travel = Math.min(Math.max((path.length - 1) * SEGMENT_S, TRAVEL_MIN_S), TRAVEL_MAX_S);
        return {
            kind: "path",
            probeId: result.id,
            nodes: path,
            verdict,
            outcome,
            holdMs: Math.round((travel + IMPACT_S + GAP_S) * 1000),
        };
    }
    const seedNode = probe?.nodes?.[0];
    if (!seedNode)
        return null;
    return {
        kind: "impact",
        probeId: result.id,
        nodeId: seedNode,
        verdict,
        outcome,
        holdMs: Math.round((IMPACT_S + GAP_S) * 1000),
    };
}
export function stepHoldMs(step: Exclude<PlaybackStep, null>, queueLen: number): number {
    return queueLen > COMPRESS_QUEUE_LEN
        ? Math.round(step.holdMs * COMPRESS_FACTOR)
        : step.holdMs;
}
export function useSimulationPlayback() {
    const events = useStudioStore((s) => s.events);
    const overlays = useViewerOverlays();
    const seenRef = useRef(0);
    const probesRef = useRef(new Map<string, AssistProbe>());
    const queueRef = useRef<Exclude<PlaybackStep, null>[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const roundClosedRef = useRef(false);
    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };
    const skip = useCallback(() => {
        const store = useStudioStore.getState();
        queueRef.current = [];
        clearTimer();
        store.skipPlayback([...probesRef.current.keys()]);
    }, []);
    useEffect(() => {
        const store = () => useStudioStore.getState();
        const playNext = () => {
            const step = queueRef.current.shift();
            if (!step) {
                timerRef.current = null;
                if (store().playback.phase !== "idle" && roundClosedRef.current) {
                    store().completePlaybackRound();
                }
                return;
            }
            store().setPlayingProbe(step.probeId);
            if (store().playback.phase === "shield") {
                store().setPlaybackPhase("assault");
            }
            if (step.kind === "path") {
                overlays.playProbe(step.probeId, step.nodes, step.verdict, {
                    outcome: step.outcome,
                    freeze: true,
                });
            }
            else {
                overlays.flashImpact(step.nodeId, step.verdict, step.outcome, {
                    freeze: true,
                });
            }
            const hold = stepHoldMs(step, queueRef.current.length);
            timerRef.current = setTimeout(() => {
                store().revealProbe(step.probeId);
                playNext();
            }, hold);
        };
        const startQueue = (delayMs: number) => {
            if (timerRef.current)
                return;
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                playNext();
            }, delayMs);
        };
        for (let i = seenRef.current; i < events.length; i++) {
            const { ev } = events[i];
            if (ev.event === "run_started") {
                queueRef.current = [];
                probesRef.current.clear();
                roundClosedRef.current = false;
                clearTimer();
            }
            else if (ev.event === "simulation_started") {
                probesRef.current = new Map(ev.data.probes.map((p) => [p.id, p]));
                roundClosedRef.current = false;
                store().startPlaybackRound(ev.data.round);
                const zone = ev.data.zone;
                if (zone && (zone.core.length > 0 || zone.halo.length > 0)) {
                    overlays.raiseShield(`studio:shield:${ev.data.round}`, zone.core, zone.halo);
                    startQueue(SHIELD_RISE_MS);
                }
                else {
                    startQueue(400);
                }
            }
            else if (ev.event === "probe_result") {
                const step = planProbePlayback(probesRef.current.get(ev.data.id), ev.data);
                if (step) {
                    queueRef.current.push(step);
                    if (!timerRef.current)
                        playNext();
                }
                else {
                    store().revealProbe(ev.data.id);
                }
            }
            else if (ev.event === "simulation_result") {
                roundClosedRef.current = true;
                if (!timerRef.current && queueRef.current.length === 0) {
                    store().completePlaybackRound();
                }
            }
        }
        seenRef.current = events.length;
    }, [events, overlays]);
    useEffect(() => {
        return () => {
            queueRef.current = [];
            clearTimer();
        };
    }, []);
    return { skip };
}
