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

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, cn, Dialog, Reveal } from "../../../design";
import { useT } from "../../../i18n";
import { ContractPanel } from "./ContractPanel";
import { CoveragePanel } from "./CoveragePanel";
import { MissionStepper } from "./MissionStepper";
import { deriveGatedMissionStep } from "./mission";
import { PromptPanel } from "./PromptPanel";
import { RetrievalCard } from "./RetrievalCard";
import { SimulationPanel } from "./SimulationPanel";
import { TraceTimeline } from "./TraceTimeline";
import { useAssistRun } from "./useAssistRun";
import { useSimulationPlayback } from "./useSimulationPlayback";
import { useStudioOverlays } from "./useStudioOverlays";
import { useStudioStore } from "./studioStore";
export function RuleStudioPage() {
    const status = useStudioStore((s) => s.status);
    const events = useStudioStore((s) => s.events);
    const error = useStudioStore((s) => s.error);
    const armed = useStudioStore((s) => s.armed);
    const requestComposer = useStudioStore((s) => s.requestComposer);
    const reset = useStudioStore((s) => s.reset);
    const { start, cancel } = useAssistRun();
    useStudioOverlays();
    const { skip } = useSimulationPlayback();
    const t = useT();
    const [traceOpen, setTraceOpen] = useState(false);
    const [howOpen, setHowOpen] = useState(false);
    useEffect(() => {
        if (status === "failed")
            setTraceOpen(true);
    }, [status]);
    useEffect(() => {
        if (status === "running")
            setTraceOpen(false);
    }, [status]);
    useEffect(() => {
        return () => {
            if (useStudioStore.getState().status !== "running")
                reset();
        };
    }, [reset]);
    return (<div className="relative flex min-h-full flex-col gap-3 overflow-y-auto p-4">
      
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[420px] max-w-full -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl" style={{
            background: "radial-gradient(closest-side, var(--db-primary), transparent 72%)",
        }}/>
      <div className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {t("studio.title")}
          </h1>
          <p className="text-xs text-muted">{t("studio.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setHowOpen(true)} className="text-xs text-accent underline-offset-2 hover:underline">
            {t("studio.howItWorks.button")}
          </button>
          <Link to="/rules" className="text-xs text-faint underline-offset-2 hover:text-muted hover:underline">
            {t("studio.backToRules")}
          </Link>
        </div>
      </div>

      <Dialog open={howOpen} onOpenChange={setHowOpen} title={t("studio.howItWorks.title")}>
        <ol className="list-decimal space-y-2.5 pl-5 text-xs leading-relaxed text-muted">
          <li>{t("studio.howItWorks.step1")}</li>
          <li>{t("studio.howItWorks.step2")}</li>
          <li>{t("studio.howItWorks.step3")}</li>
          <li>{t("studio.howItWorks.step4")}</li>
        </ol>
      </Dialog>

      <MissionStepper current={deriveGatedMissionStep(events, status, armed)}/>

      <PromptPanel onStart={() => void start()} onCancel={cancel}/>

      <RetrievalCard onRephrase={() => {
            cancel();
            requestComposer();
        }}/>

      {events.length === 0 ? (<Card className="shrink-0">
          <div className="p-5">
            <p className="text-sm font-medium text-foreground">
              {t("studio.emptyTraceTitle")}
            </p>
            <p className="mt-1 text-xs text-muted">{t("studio.emptyTraceDetail")}</p>
            <ol className="mt-5 space-y-4">
              {([
                "studio.howItWorks.step1",
                "studio.howItWorks.step2",
                "studio.howItWorks.step3",
                "studio.howItWorks.step4",
            ] as const).map((key, i) => (<Reveal key={key} delay={0.15 + i * 0.12}>
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[10px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-xs leading-relaxed text-muted">{t(key)}</p>
                  </li>
                </Reveal>))}
            </ol>
          </div>
        </Card>) : (<Card className="shrink-0 overflow-hidden">
          <button type="button" onClick={() => setTraceOpen((open) => !open)} aria-expanded={traceOpen} className="flex w-full items-center justify-between px-4 py-2.5 text-left">
            <span className="text-xs font-medium text-foreground">
              {t("studio.traceDrawer")}
            </span>
            <span aria-hidden className={cn("text-[10px] text-faint transition-transform duration-fast", traceOpen && "rotate-180")}>
              {"\u25BC"}
            </span>
          </button>
          {traceOpen ? (<div className="max-h-[40vh] overflow-y-auto border-t border-line p-4">
              <TraceTimeline events={events}/>
              {status === "failed" && error ? (<p className="mt-3 text-xs text-danger">{error}</p>) : null}
            </div>) : null}
        </Card>)}

      <SimulationPanel onSkip={skip}/>
      <CoveragePanel />
      <ContractPanel onRetest={() => void start()}/>
    </div>);
}
