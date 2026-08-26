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

import type { AssistAssessment, AssistProbe, AssistProbeResult, AssistZone, } from "../../../api/assistProxy";
import { motion, useReducedMotion } from "framer-motion";
import { Badge, Button, Card, cn, Disclosure, EASE, type BadgeTone, } from "../../../design";
import { useT, useVoice, type TFunc } from "../../../i18n";
import { deriveProbeOutcome, witnessPathsOf, type ProbeOutcome } from "./attackPath";
import { deriveContract } from "./ContractPanel";
import { deriveCoverage } from "./CoveragePanel";
import type { PlaybackState, StudioEvent } from "./studioStore";
import { useStudioStore } from "./studioStore";
export type SimulationView = {
    round: number;
    probes: AssistProbe[];
    results: Map<string, AssistProbeResult>;
    assessment: AssistAssessment | null;
    finalStatus: string | null;
    zone: AssistZone | null;
};
export function deriveSimulation(events: StudioEvent[]): SimulationView | null {
    let view: SimulationView | null = null;
    for (const { ev } of events) {
        if (ev.event === "simulation_started") {
            view = {
                round: ev.data.round,
                probes: ev.data.probes,
                results: new Map(),
                assessment: null,
                finalStatus: null,
                zone: ev.data.zone ?? null,
            };
        }
        else if (ev.event === "probe_result" && view) {
            if (ev.data.round === view.round)
                view.results.set(ev.data.id, ev.data);
        }
        else if (ev.event === "simulation_result" && view) {
            if (ev.data.round === view.round)
                view.assessment = ev.data.assessment;
        }
        else if (ev.event === "final" && view) {
            view.finalStatus = ev.data.status;
            if (ev.data.assessment)
                view.assessment = ev.data.assessment;
        }
    }
    return view;
}
export function probeReveal(result: AssistProbeResult | undefined, probeId: string, round: number, playback: PlaybackState): {
    result: AssistProbeResult | undefined;
    playing: boolean;
} {
    if (playback.phase === "idle" || playback.round !== round) {
        return { result, playing: false };
    }
    if (playback.revealedProbeIds.includes(probeId)) {
        return { result, playing: false };
    }
    return { result: undefined, playing: playback.playingProbeId === probeId };
}
const OUTCOME_BADGE: Record<ProbeOutcome, {
    tone: BadgeTone;
    labelKey: string;
    dot: string;
}> = {
    intercepted: {
        tone: "zone-core",
        labelKey: "studio.sim.outcomeIntercepted",
        dot: "bg-zone-core",
    },
    breach: {
        tone: "danger",
        labelKey: "studio.sim.outcomeBreach",
        dot: "bg-danger",
    },
    allowed: {
        tone: "primary",
        labelKey: "studio.sim.outcomeAllowed",
        dot: "bg-primary",
    },
    over_block: {
        tone: "warn",
        labelKey: "studio.sim.outcomeOverBlock",
        dot: "bg-warn",
    },
    info: { tone: "neutral", labelKey: "studio.sim.verdictOk", dot: "bg-faint" },
};
export function groupProbes(probes: AssistProbe[]): {
    attacks: AssistProbe[];
    controls: AssistProbe[];
} {
    const attacks: AssistProbe[] = [];
    const controls: AssistProbe[] = [];
    for (const probe of probes) {
        (probe.expect === "block" || probe.expect === "warn"
            ? attacks
            : controls).push(probe);
    }
    return { attacks, controls };
}
function PopIn({ children }: {
    children: React.ReactNode;
}) {
    const reduce = useReducedMotion();
    return (<motion.span initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 28 }} className="inline-flex">
      {children}
    </motion.span>);
}
function probeLine(probe: AssistProbe, result: AssistProbeResult | undefined, playing: boolean, t: TFunc, opts: {
    attempt?: number;
    showExpect: boolean;
}) {
    const expected = opts.showExpect && probe.expect ? (<span className="shrink-0 whitespace-nowrap text-[10px] text-faint">
        {probe.expect === "ok"
            ? t("studio.sim.expectPass")
            : t("studio.sim.expectBlock")}
      </span>) : null;
    const attempt = opts.attempt !== undefined ? (<span className="shrink-0 text-[10px] text-faint">
        {t("studio.sim.attempt", { n: opts.attempt })}
      </span>) : null;
    if (!result) {
        return (<li key={probe.id} className={cn("flex items-center gap-2 rounded px-1 py-0.5", playing && "bg-accent/10")}>
        <span className={cn("inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full", playing ? "bg-warn" : "bg-accent")}/>
        {attempt}
        <span title={probe.label} className="min-w-0 flex-1 truncate text-xs text-muted">
          {probe.label}
        </span>
        {expected}
        <span className="shrink-0 whitespace-nowrap">
          <Badge tone="neutral">
            {playing ? t("studio.sim.playing") : t("studio.sim.probePending")}
          </Badge>
        </span>
      </li>);
    }
    const outcome = deriveProbeOutcome(result);
    const badge = OUTCOME_BADGE[outcome];
    const label = outcome === "info"
        ? result.verdict === "ok"
            ? t("studio.sim.verdictOk")
            : t("studio.sim.verdictBlock")
        : t(badge.labelKey as Parameters<TFunc>[0]);
    return (<li key={probe.id} className="flex items-center gap-2 rounded px-1 py-0.5">
      <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", badge.dot)}/>
      {attempt}
      <span title={probe.label} className="min-w-0 flex-1 truncate text-xs text-muted">
        {probe.label}
      </span>
      {expected}
      <span className="shrink-0 whitespace-nowrap">
        <PopIn>
          <Badge tone={badge.tone}>{label}</Badge>
        </PopIn>
      </span>
    </li>);
}
export function deriveHud(sim: SimulationView, playback: PlaybackState): {
    current: number;
    total: number;
    intercepted: number;
    breaches: number;
} {
    const paced = playback.phase !== "idle" && playback.round === sim.round;
    let intercepted = 0;
    let breaches = 0;
    let revealed = 0;
    for (const [id, result] of sim.results) {
        if (paced && !playback.revealedProbeIds.includes(id))
            continue;
        revealed += 1;
        const outcome = deriveProbeOutcome(result);
        if (outcome === "intercepted")
            intercepted += 1;
        else if (outcome === "breach")
            breaches += 1;
    }
    const playing = paced && playback.playingProbeId ? 1 : 0;
    return {
        current: Math.min(revealed + playing, sim.probes.length),
        total: sim.probes.length,
        intercepted,
        breaches,
    };
}
const BANNER: Record<string, {
    titleKey: string;
    className: string;
}> = {
    protected: {
        titleKey: "studio.sim.protectedTitle",
        className: "border-ok/40 bg-ok-subtle text-ok",
    },
    gap: {
        titleKey: "studio.sim.gapTitle",
        className: "border-danger/40 bg-danger-subtle text-danger",
    },
    too_broad: {
        titleKey: "studio.sim.tooBroadTitle",
        className: "border-warn/40 bg-warn-subtle text-warn",
    },
    mixed: {
        titleKey: "studio.sim.mixedTitle",
        className: "border-warn/40 bg-warn-subtle text-warn",
    },
    untested: {
        titleKey: "studio.sim.untestedTitle",
        className: "border-line bg-inset text-muted",
    },
};
function VerdictBanner({ assessment, probes, finalStatus, }: {
    assessment: AssistAssessment;
    probes: AssistProbe[];
    finalStatus: string | null;
}) {
    const t = useT();
    const reduce = useReducedMotion();
    const banner = BANNER[assessment.status] ?? BANNER.untested;
    const labelFor = (id: string) => probes.find((p) => p.id === id)?.label ?? id;
    const names = (ids: string[]) => ids.map(labelFor).join(", ");
    let detail: string;
    if (assessment.status === "protected") {
        detail = t("studio.sim.protectedDetail", {
            blocked: probes.filter((p) => p.expect === "block" || p.expect === "warn")
                .length,
            passed: probes.filter((p) => p.expect === "ok").length,
        });
    }
    else if (assessment.status === "gap") {
        detail = t("studio.sim.gapDetail", { list: names(assessment.gaps) });
    }
    else if (assessment.status === "too_broad") {
        detail = t("studio.sim.tooBroadDetail", {
            list: names(assessment.over_blocks),
        });
    }
    else if (assessment.status === "mixed") {
        detail = t("studio.sim.mixedDetail", {
            gaps: names(assessment.gaps),
            blocked: names(assessment.over_blocks),
        });
    }
    else {
        detail = t("studio.sim.untestedDetail");
    }
    const imperfect = assessment.status !== "protected";
    let action: string | null = null;
    if (imperfect && finalStatus === null) {
        action = t("studio.sim.autoNext");
    }
    else if (finalStatus?.startsWith("needs_review")) {
        action = t("studio.sim.reviewNeeded");
    }
    return (<motion.div initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className={cn("rounded border px-4 py-3", banner.className, assessment.status === "protected" &&
            "shadow-[0_0_28px_var(--db-ok-subtle)]")}>
      <p className="text-base font-semibold uppercase tracking-wide">
        {t(banner.titleKey as Parameters<TFunc>[0])}
      </p>
      <p className="mt-1 break-words text-xs opacity-90">{detail}</p>
      {action ? (<p className="mt-2 text-xs font-medium opacity-80">{action}</p>) : null}
    </motion.div>);
}
export type WitnessPathView = {
    probeId: string;
    label: string;
    nodes: string[];
};
export function deriveWitnessPaths(sim: SimulationView): WitnessPathView[] {
    const out: WitnessPathView[] = [];
    for (const probe of sim.probes) {
        const result = sim.results.get(probe.id);
        if (!result)
            continue;
        for (const nodes of witnessPathsOf(result)) {
            out.push({ probeId: probe.id, label: probe.label, nodes });
        }
    }
    return out;
}
export function roundBannerMode(assessmentStatus: string, finalStatus: string | null, running: boolean): "banner" | "calm" {
    if (assessmentStatus === "protected")
        return "banner";
    return running && finalStatus === null ? "calm" : "banner";
}
export function SimulationPanel({ onSkip }: {
    onSkip?: () => void;
}) {
    const events = useStudioStore((s) => s.events);
    const playback = useStudioStore((s) => s.playback);
    const status = useStudioStore((s) => s.status);
    const t = useT();
    const voice = useVoice();
    const sim = deriveSimulation(events);
    if (!sim)
        return null;
    const paced = playback.phase !== "idle" && playback.round === sim.round;
    const decisionTakesOver = sim.finalStatus !== null && deriveContract(events) !== null;
    const showBanner = (!paced || playback.roundComplete) && !decisionTakesOver;
    const coverage = deriveCoverage(events);
    const nameOf = (id: string) => {
        for (const list of [coverage?.core, coverage?.halo, coverage?.frontier]) {
            const hit = list?.find((n) => n.id === id);
            if (hit?.name)
                return hit.name;
        }
        return id;
    };
    const witnesses = !paced || playback.roundComplete ? deriveWitnessPaths(sim) : [];
    const showSkip = paced && !playback.roundComplete && Boolean(onSkip);
    const hud = deriveHud(sim, playback);
    const zoneCount = sim.zone ? sim.zone.core.length + sim.zone.halo.length : 0;
    const { attacks, controls } = groupProbes(sim.probes);
    const showExpect = voice === "technical";
    const lineFor = (probe: AssistProbe, attempt?: number) => {
        const { result, playing } = probeReveal(sim.results.get(probe.id), probe.id, sim.round, playback);
        return probeLine(probe, result, playing, t, { attempt, showExpect });
    };
    return (<Card data-simulation-panel>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-faint">
            {t("studio.sim.title")}
          </p>
          <div className="flex items-center gap-2">
            {showSkip ? (<Button size="sm" variant="ghost" onClick={onSkip}>
                {t("studio.sim.skip")}
              </Button>) : null}
            <Badge tone="neutral">
              {t("studio.sim.round", { round: sim.round })}
            </Badge>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-faint">
          {t("studio.sim.dryRunNote")}
        </p>
        {zoneCount > 0 ? (<p className="text-xs font-medium text-zone-core">
            {t("studio.sim.zoneArmed", { count: zoneCount })}
          </p>) : null}
        {hud.total > 0 ? (<div data-siege-hud className="space-y-1.5" title={t("studio.sim.hud", {
                current: hud.current,
                total: hud.total,
                intercepted: hud.intercepted,
                breaches: hud.breaches,
            })}>
            <div className="flex items-center justify-between text-[11px] tabular-nums">
              <span className="font-mono text-muted">
                {hud.current}/{hud.total}
              </span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-zone-core">
                  <span className="h-1.5 w-1.5 rounded-full bg-zone-core"/>
                  {hud.intercepted}
                </span>
                <span className={cn("flex items-center gap-1.5", hud.breaches > 0 ? "text-danger" : "text-faint")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", hud.breaches > 0 ? "bg-danger" : "bg-faint")}/>
                  {hud.breaches}
                </span>
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm bg-overlay">
              <motion.div className="h-full rounded-sm bg-primary" animate={{
                width: `${hud.total ? Math.round((hud.current / hud.total) * 100) : 0}%`,
            }} transition={{ duration: 0.4, ease: EASE }}/>
            </div>
          </div>) : null}
        
        {attacks.length + controls.length + witnesses.length > 0 ? (<Disclosure key={`probes-${sim.round}-${playback.roundComplete}`} defaultOpen={paced && !playback.roundComplete} summary={t("studio.sim.groupAttacks")} bodyClassName="space-y-3">
            
            {attacks.length > 0 ? (<ul className="space-y-1.5">
                {attacks.map((probe, i) => lineFor(probe, i + 1))}
              </ul>) : null}
            {controls.length > 0 ? (<div className="space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
                  {t("studio.sim.groupControls")}
                </p>
                <ul className="space-y-1.5">
                  {controls.map((probe) => lineFor(probe))}
                </ul>
              </div>) : null}
            {witnesses.length > 0 ? (<div className="space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
                  {t("studio.sim.witnessTitle")}
                </p>
                <ul className="space-y-1">
                  {witnesses.map((w, i) => (<li key={`${w.probeId}-${i}`} className="min-w-0">
                      <p title={w.label} className="truncate text-[11px] text-muted">
                        {w.label}
                      </p>
                      <p title={w.nodes.join(" \u2192 ")} className="truncate font-mono text-[11px] text-faint">
                        {w.nodes.map(nameOf).join(" \u2192 ")}
                      </p>
                    </li>))}
                </ul>
              </div>) : null}
          </Disclosure>) : null}
        {sim.assessment && showBanner ? (roundBannerMode(sim.assessment.status, sim.finalStatus, status === "running") === "calm" ? (<div className="rounded border border-line bg-inset px-4 py-3">
              <p className="text-xs font-medium text-foreground">
                {t("studio.sim.roundNext", { round: sim.round + 1 })}
              </p>
            </div>) : (<VerdictBanner assessment={sim.assessment} probes={sim.probes} finalStatus={sim.finalStatus}/>)) : null}
      </div>
    </Card>);
}
