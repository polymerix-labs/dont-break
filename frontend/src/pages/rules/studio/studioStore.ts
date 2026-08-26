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

import { create } from "zustand";
import type { AssistEvent } from "../../../api/assistProxy";
export type StudioStatus = "idle" | "running" | "done" | "failed";
export type StudioEvent = {
    at: number;
    ev: AssistEvent;
};
export type PlaybackPhase = "idle" | "shield" | "assault" | "verdict";
export type PlaybackState = {
    phase: PlaybackPhase;
    round: number | null;
    playingProbeId: string | null;
    revealedProbeIds: string[];
    roundComplete: boolean;
    skipped: boolean;
};
const PLAYBACK_IDLE: PlaybackState = {
    phase: "idle",
    round: null,
    playingProbeId: null,
    revealedProbeIds: [],
    roundComplete: false,
    skipped: false,
};
type StudioState = {
    prompt: string;
    setPrompt: (prompt: string) => void;
    contextSeed: string | null;
    setContextSeed: (seed: string | null) => void;
    status: StudioStatus;
    runId: string | null;
    events: StudioEvent[];
    error: string | null;
    playback: PlaybackState;
    armed: boolean;
    heldEvents: StudioEvent[];
    arm: () => void;
    composerRequest: number;
    requestComposer: () => void;
    adjustContext: {
        gaps: string[];
        overBlocks: string[];
    } | null;
    setAdjustContext: (ctx: {
        gaps: string[];
        overBlocks: string[];
    } | null) => void;
    begin: () => void;
    append: (event: AssistEvent) => void;
    finish: (status: Extract<StudioStatus, "done" | "failed">, error?: string) => void;
    reset: () => void;
    startPlaybackRound: (round: number) => void;
    setPlaybackPhase: (phase: PlaybackPhase) => void;
    setPlayingProbe: (probeId: string | null) => void;
    revealProbe: (probeId: string) => void;
    completePlaybackRound: () => void;
    skipPlayback: (probeIds: string[]) => void;
};
export function seedStudio(prompt: string, contextSeed: string | null): void {
    const s = useStudioStore.getState();
    s.setPrompt(prompt);
    s.setContextSeed(contextSeed);
}
export const useStudioStore = create<StudioState>((set) => ({
    prompt: "",
    setPrompt: (prompt) => set({ prompt }),
    contextSeed: null,
    setContextSeed: (contextSeed) => set({ contextSeed }),
    status: "idle",
    runId: null,
    events: [],
    error: null,
    playback: PLAYBACK_IDLE,
    composerRequest: 0,
    requestComposer: () => set((s) => ({ composerRequest: s.composerRequest + 1 })),
    adjustContext: null,
    setAdjustContext: (adjustContext) => set({ adjustContext }),
    armed: false,
    heldEvents: [],
    arm: () => set((s) => {
        if (s.armed)
            return {};
        let round: number | null = null;
        for (const e of s.heldEvents) {
            if (e.ev.event === "simulation_started") {
                round = e.ev.data.round;
                break;
            }
        }
        return {
            armed: true,
            events: [...s.events, ...s.heldEvents],
            heldEvents: [],
            playback: round !== null
                ? { ...PLAYBACK_IDLE, phase: "shield" as const, round }
                : s.playback,
        };
    }),
    begin: () => set({
        status: "running",
        events: [],
        runId: null,
        error: null,
        playback: PLAYBACK_IDLE,
        adjustContext: null,
        armed: false,
        heldEvents: [],
    }),
    append: (event) => set((s) => {
        const stamped = { at: Date.now(), ev: event };
        const gated = !s.armed &&
            (s.heldEvents.length > 0 ||
                s.events.some((e) => e.ev.event === "candidates"));
        if (gated)
            return { heldEvents: [...s.heldEvents, stamped] };
        return {
            events: [...s.events, stamped],
            runId: event.event === "run_started" ? event.data.run_id : s.runId,
        };
    }),
    finish: (status, error) => set((s) => status === "failed"
        ? {
            status,
            error: error ?? null,
            armed: true,
            events: [...s.events, ...s.heldEvents],
            heldEvents: [],
        }
        : { status, error: error ?? null }),
    reset: () => set({
        status: "idle",
        events: [],
        runId: null,
        error: null,
        contextSeed: null,
        playback: PLAYBACK_IDLE,
        adjustContext: null,
        armed: false,
        heldEvents: [],
    }),
    startPlaybackRound: (round) => set({
        playback: { ...PLAYBACK_IDLE, phase: "shield", round },
    }),
    setPlaybackPhase: (phase) => set((s) => ({ playback: { ...s.playback, phase } })),
    setPlayingProbe: (probeId) => set((s) => ({ playback: { ...s.playback, playingProbeId: probeId } })),
    revealProbe: (probeId) => set((s) => ({
        playback: {
            ...s.playback,
            playingProbeId: s.playback.playingProbeId === probeId
                ? null
                : s.playback.playingProbeId,
            revealedProbeIds: s.playback.revealedProbeIds.includes(probeId)
                ? s.playback.revealedProbeIds
                : [...s.playback.revealedProbeIds, probeId],
        },
    })),
    completePlaybackRound: () => set((s) => ({
        playback: {
            ...s.playback,
            phase: "verdict",
            playingProbeId: null,
            roundComplete: true,
        },
    })),
    skipPlayback: (probeIds) => set((s) => {
        const revealed = new Set(s.playback.revealedProbeIds);
        for (const id of probeIds)
            revealed.add(id);
        return {
            playback: {
                ...s.playback,
                phase: "verdict",
                playingProbeId: null,
                revealedProbeIds: [...revealed],
                roundComplete: true,
                skipped: true,
            },
        };
    }),
}));
