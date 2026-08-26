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

import { motion, useReducedMotion } from "framer-motion";
import { Badge, Button, Card, cn, EASE } from "../../../design";
import { useT } from "../../../i18n";
import type { StudioEvent } from "./studioStore";
import { useStudioStore } from "./studioStore";
const MAX_NAMES = 4;
export type RetrievalView = {
    found: number;
    rejected: number;
    names: string[];
};
export function deriveRetrieval(events: readonly StudioEvent[]): RetrievalView | null {
    let view: RetrievalView | null = null;
    for (const { ev } of events) {
        if (ev.event !== "candidates")
            continue;
        const kept = [...ev.data.selected, ...ev.data.selected_to];
        view = {
            found: kept.length,
            rejected: ev.data.rejected.length,
            names: kept.slice(0, MAX_NAMES).map((c) => c.name),
        };
    }
    return view;
}
function ShieldIcon() {
    return (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M8 1.5 13.5 3.6v4.1c0 3.3-2.3 5.7-5.5 6.8-3.2-1.1-5.5-3.5-5.5-6.8V3.6L8 1.5Z"/>
    </svg>);
}
export function RetrievalCard({ onRephrase }: {
    onRephrase?: () => void;
}) {
    const events = useStudioStore((s) => s.events);
    const status = useStudioStore((s) => s.status);
    const armed = useStudioStore((s) => s.armed);
    const arm = useStudioStore((s) => s.arm);
    const reduce = useReducedMotion();
    const t = useT();
    const view = deriveRetrieval(events);
    if (!view)
        return null;
    const gateOpen = !armed && status !== "failed";
    return (<motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
    <Card className={cn("space-y-2 p-4 transition-shadow duration-slow", gateOpen &&
            "border-primary/40 shadow-[0_0_28px_var(--db-primary-subtle)]")}>
      <p className="text-xs font-medium text-foreground">
        {t(gateOpen ? "studio.zone.lockedTitle" : "studio.retrieval.title")}
      </p>
      <p className="text-xs leading-relaxed text-muted">
        {t("studio.retrieval.summary", {
            count: view.found,
            rejected: view.rejected,
        })}
      </p>
      {view.names.length > 0 ? (<div className="flex flex-wrap items-center gap-1.5">
          {view.names.map((name) => (<Badge key={name} tone="neutral" className="max-w-full">
              <span className="truncate" title={name}>
                {name}
              </span>
            </Badge>))}
          {view.found > view.names.length ? (<span className="text-[10px] text-faint">
              {t("studio.retrieval.more", {
                    count: view.found - view.names.length,
                })}
            </span>) : null}
        </div>) : null}
      {gateOpen ? (<div className="space-y-2 border-t border-line pt-3">
          <div className="relative">
            <span aria-hidden className="absolute -inset-0.5 animate-pulse rounded bg-primary/25 blur-sm"/>
            <Button variant="primary" className="relative w-full justify-center gap-2" onClick={arm}>
              <ShieldIcon />
              {t("studio.zone.protectCta")}
            </Button>
          </div>
          <p className="break-words text-[11px] leading-relaxed text-faint">
            {t("studio.zone.protectNote")}
          </p>
          {onRephrase ? (<button type="button" onClick={onRephrase} className="text-[11px] text-faint underline-offset-2 hover:text-muted hover:underline">
              {t("studio.zone.rephrase")}
            </button>) : null}
        </div>) : null}
    </Card>
    </motion.div>);
}
