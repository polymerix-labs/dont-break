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

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../design";
import { useT } from "../../../i18n";
import { useStudioStore } from "./studioStore";
function ThinkingBeam() {
    const reduce = useReducedMotion();
    if (reduce)
        return <div className="h-0.5 w-full rounded-b-2xl bg-primary/40"/>;
    return (<div className="h-0.5 w-full overflow-hidden rounded-b-2xl">
      <motion.div className="h-full w-1/3 rounded-full bg-primary" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}/>
    </div>);
}
const MAX_COMPOSER_HEIGHT_PX = 220;
function ArrowUpIcon() {
    return (<svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M8 12.5v-9M4 7l4-3.5L12 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
function StopIcon() {
    return (<svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor"/>
    </svg>);
}
export function PromptPanel({ onStart, onCancel, }: {
    onStart: () => void;
    onCancel: () => void;
}) {
    const prompt = useStudioStore((s) => s.prompt);
    const setPrompt = useStudioStore((s) => s.setPrompt);
    const contextSeed = useStudioStore((s) => s.contextSeed);
    const setContextSeed = useStudioStore((s) => s.setContextSeed);
    const status = useStudioStore((s) => s.status);
    const adjustContext = useStudioStore((s) => s.adjustContext);
    const t = useT();
    const running = status === "running";
    const canSend = !running && prompt.trim().length > 0;
    const areaRef = useRef<HTMLTextAreaElement>(null);
    const [expanded, setExpanded] = useState(status === "idle");
    useEffect(() => {
        if (status === "running")
            setExpanded(false);
        else if (status === "idle")
            setExpanded(true);
    }, [status]);
    const composerRequest = useStudioStore((s) => s.composerRequest);
    useEffect(() => {
        if (composerRequest > 0)
            setExpanded(true);
    }, [composerRequest]);
    useEffect(() => {
        const area = areaRef.current;
        if (!area)
            return;
        area.style.height = "auto";
        area.style.height = `${Math.min(area.scrollHeight, MAX_COMPOSER_HEIGHT_PX)}px`;
    }, [prompt, expanded]);
    useEffect(() => {
        if (expanded)
            areaRef.current?.focus();
    }, [expanded]);
    function handleKeyDown(ev: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (ev.key !== "Enter" || ev.shiftKey || ev.nativeEvent.isComposing)
            return;
        ev.preventDefault();
        if (canSend)
            onStart();
    }
    function appendChip(text: string) {
        const base = prompt.trim();
        setPrompt(base ? `${base} ${text}.` : `${text}.`);
        areaRef.current?.focus();
    }
    if (!expanded) {
        return (<div className="flex items-center gap-3 rounded-2xl border border-line bg-inset px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-faint">
            {running ? (<span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping"/>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"/>
              </span>) : null}
            {t("studio.mission.cardTitle")}
          </p>
          <p className="truncate text-sm text-foreground" title={prompt}>
            {prompt}
          </p>
        </div>
        {running ? (<button type="button" onClick={onCancel} aria-label={t("common.cancel")} title={t("common.cancel")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity duration-fast hover:opacity-80">
            <StopIcon />
          </button>) : (<button type="button" onClick={() => setExpanded(true)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors duration-fast hover:border-line-strong hover:text-foreground">
            {t("studio.mission.edit")}
          </button>)}
      </div>);
    }
    return (<div className="space-y-1.5">
      <div className={cn("rounded-2xl border bg-inset transition-all duration-slow", running
            ? "border-primary/30 opacity-95"
            : "border-line focus-within:border-primary/40 focus-within:shadow-[0_0_24px_var(--db-primary-subtle)]")}>
        {contextSeed ? (<div className="flex items-center gap-2 px-4 pt-3">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-overlay/60 py-1 pl-2.5 pr-1.5 text-xs text-muted">
              <span className="truncate">{t("studio.contextAttached")}</span>
              <button type="button" onClick={() => setContextSeed(null)} disabled={running} aria-label={t("studio.contextRemove")} title={t("studio.contextRemove")} className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-faint transition-colors duration-fast hover:bg-overlay hover:text-foreground disabled:opacity-50">
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </span>
          </div>) : null}

        {adjustContext && !running ? (<div className="space-y-1.5 px-4 pt-3">
            <p className="text-xs text-muted">{t("studio.adjust.lead")}</p>
            {adjustContext.gaps.length ? (<p className="text-[11px] text-danger">
                {t("studio.adjust.gaps", {
                    list: adjustContext.gaps.join(", "),
                })}
              </p>) : null}
            {adjustContext.overBlocks.length ? (<p className="text-[11px] text-warning">
                {t("studio.adjust.overBlocks", {
                    list: adjustContext.overBlocks.join(", "),
                })}
              </p>) : null}
            <div className="flex flex-wrap gap-1.5">
              {([
                "studio.adjust.chipWiden",
                "studio.adjust.chipException",
                "studio.adjust.chipHarden",
            ] as const).map((key) => (<button key={key} type="button" onClick={() => appendChip(t(key))} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition-colors duration-fast hover:border-line-strong hover:text-foreground">
                  {t(key)}
                </button>))}
            </div>
          </div>) : null}

        <textarea ref={areaRef} id="studio-prompt" value={prompt} onChange={(ev) => setPrompt(ev.target.value)} onKeyDown={handleKeyDown} placeholder={t("studio.promptPlaceholder")} rows={1} maxLength={2000} readOnly={running} aria-label={t("studio.promptLabel")} className="block max-h-[220px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-faint"/>

        <div className="flex items-end justify-between gap-3 px-3 pb-2.5">
          <p className="hidden truncate pl-1 text-[11px] leading-7 text-faint sm:block">
            {t("studio.promptHint")}
          </p>
          {running ? (<button type="button" onClick={onCancel} aria-label={t("common.cancel")} title={t("common.cancel")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity duration-fast hover:opacity-80">
              <StopIcon />
            </button>) : (<button type="button" onClick={onStart} disabled={!canSend} aria-label={t("studio.start")} title={t("studio.start")} className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-background transition-all duration-fast hover:bg-primary-hover disabled:opacity-30", canSend && "shadow-[0_0_16px_var(--db-primary-subtle)]")}>
              <ArrowUpIcon />
            </button>)}
        </div>
        {running ? <ThinkingBeam /> : null}
      </div>
      <p className="px-1 text-[11px] text-faint">
        {running ? t("studio.running") : t("studio.composerHint")}
      </p>
    </div>);
}
