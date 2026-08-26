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

import { useEffect, useRef } from "react";
import type { AssistEvent } from "../../../api/assistProxy";
import { Badge, cn } from "../../../design";
import { useT, type TFunc } from "../../../i18n";
import type { PlaybackState, StudioEvent } from "./studioStore";
import { useStudioStore } from "./studioStore";
const STAGE_LABEL_KEY = {
    planning: "studio.stage.planning",
    retrieval: "studio.stage.retrieval",
    draft: "studio.stage.draft",
    simulation: "studio.stage.simulation",
} as const;
function timeLabel(at: number): string {
    return new Date(at).toLocaleTimeString(undefined, { hour12: false });
}
function describe(ev: AssistEvent, t: TFunc): {
    text: string;
    tone?: "ok" | "danger" | "warn";
} | null {
    switch (ev.event) {
        case "run_started":
            return { text: t("studio.trace.runStarted") };
        case "stage":
            return null;
        case "intent":
            return {
                text: t("studio.trace.intent", { goal: ev.data.business_goal }),
            };
        case "intent_rejected":
            return {
                text: t("studio.trace.intentRejected", {
                    errors: ev.data.errors.join("; "),
                }),
                tone: "warn",
            };
        case "candidates": {
            const names = ev.data.selected
                .slice(0, 4)
                .map((c) => c.name)
                .join(", ");
            return {
                text: t("studio.trace.candidates", {
                    count: ev.data.selected.length + ev.data.selected_to.length,
                    rejected: ev.data.rejected.length,
                    names,
                }),
            };
        }
        case "policy_report":
            if (ev.data.passed) {
                return { text: t("studio.trace.policyPassed"), tone: "ok" };
            }
            return {
                text: t("studio.trace.policyFailed", {
                    message: ev.data.violations.map((v) => v.message).join("; "),
                }),
                tone: "danger",
            };
        case "draft":
            return { text: t("studio.trace.draft") };
        case "simulation_started":
            return {
                text: t("studio.trace.simulationStarted", {
                    round: ev.data.round,
                    count: ev.data.probes.length,
                }),
            };
        case "probe_result":
            return {
                text: t("studio.trace.probeResult", {
                    id: ev.data.id,
                    verdict: ev.data.verdict,
                }),
                tone: ev.data.matches_expectation === false ? "danger" : "ok",
            };
        case "simulation_result":
            return {
                text: t("studio.trace.simulationResult", {
                    round: ev.data.round,
                    status: ev.data.assessment.status,
                }),
                tone: ev.data.assessment.status === "protected" ? "ok" : "warn",
            };
        case "iteration":
            return {
                text: t("studio.trace.iteration", {
                    changes: ev.data.changes.join("; "),
                }),
                tone: "warn",
            };
        case "final":
            if (ev.data.status === "failed") {
                return {
                    text: t("studio.trace.finalFailed", { reason: ev.data.reason ?? "" }),
                    tone: "danger",
                };
            }
            return { text: t("studio.trace.finalReady"), tone: "ok" };
        case "error":
            return {
                text: t("studio.trace.error", { message: ev.data.message }),
                tone: "danger",
            };
        default:
            return null;
    }
}
const TONE_CLASS = {
    ok: "text-ok",
    danger: "text-danger",
    warn: "text-warn",
} as const;
export function traceLineVisible(ev: AssistEvent, playback: PlaybackState): boolean {
    if (playback.phase === "idle")
        return true;
    if (ev.event === "probe_result") {
        if (ev.data.round !== playback.round)
            return true;
        return playback.revealedProbeIds.includes(ev.data.id);
    }
    if (ev.event === "simulation_result") {
        if (ev.data.round !== playback.round)
            return true;
        return playback.roundComplete;
    }
    return true;
}
export function TraceTimeline({ events }: {
    events: StudioEvent[];
}) {
    const status = useStudioStore((s) => s.status);
    const playback = useStudioStore((s) => s.playback);
    const t = useT();
    const endRef = useRef<HTMLDivElement | null>(null);
    const visible = events.filter(({ ev }) => traceLineVisible(ev, playback));
    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "nearest" });
    }, [visible.length]);
    return (<ol className="space-y-1">
      {visible.map(({ at, ev }, i) => {
            if (ev.event === "stage") {
                return (<li key={i} className="flex items-center gap-2 pt-2 first:pt-0">
              <Badge tone="neutral">{t(STAGE_LABEL_KEY[ev.data.stage])}</Badge>
              <span className="h-px flex-1 bg-line"/>
              <span className="font-mono text-[10px] text-faint">
                {timeLabel(at)}
              </span>
            </li>);
            }
            const line = describe(ev, t);
            if (!line)
                return null;
            return (<li key={i} className="flex items-baseline gap-2">
            <span className="shrink-0 font-mono text-[10px] text-faint">
              {timeLabel(at)}
            </span>
            <span className={cn("text-xs leading-relaxed", line.tone ? TONE_CLASS[line.tone] : "text-muted")}>
              {line.text}
            </span>
          </li>);
        })}
      {status === "running" ? (<li className="flex items-center gap-2 pt-1">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"/>
          <span className="text-xs text-faint">{t("studio.trace.working")}</span>
        </li>) : null}
      <div ref={endRef}/>
    </ol>);
}
