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

import { motion } from "framer-motion";
import { cn } from "../../../design";
import { useT } from "../../../i18n";
import { MISSION_STEPS, type MissionStep } from "./mission";
const STEP_LABEL_KEY: Record<MissionStep, `studio.mission.${MissionStep}`> = {
    describe: "studio.mission.describe",
    understand: "studio.mission.understand",
    test: "studio.mission.test",
    decide: "studio.mission.decide",
};
export function MissionStepper({ current }: {
    current: MissionStep;
}) {
    const t = useT();
    const currentIdx = MISSION_STEPS.indexOf(current);
    return (<ol aria-label={t("studio.mission.title")} className="flex min-w-0 items-center gap-1 text-[11px]">
      {MISSION_STEPS.map((step, i) => {
            const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "todo";
            return (<li key={step} className="flex min-w-0 items-center gap-1">
            {i > 0 ? (<span aria-hidden className={cn("h-px w-3 shrink-0", state === "todo" ? "bg-border" : "bg-accent/60")}/>) : null}
            <span aria-current={state === "active" ? "step" : undefined} title={t(STEP_LABEL_KEY[step])} className={cn("relative flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1", state === "active" && "font-medium text-foreground", state === "done" && "text-muted", state === "todo" && "text-faint")}>
              {state === "active" ? (<motion.span layoutId="mission-pill" aria-hidden className="absolute inset-0 rounded-full bg-accent/15" transition={{ type: "spring", stiffness: 400, damping: 32 }}/>) : null}
              <span className={cn("relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px]", state === "active" && "bg-accent text-background", state === "done" && "bg-accent/30 text-foreground", state === "todo" && "bg-border text-muted")}>
                {state === "done" ? "\u2713" : i + 1}
              </span>
              
              {state === "active" ? (<span className="relative truncate">{t(STEP_LABEL_KEY[step])}</span>) : null}
            </span>
          </li>);
        })}
    </ol>);
}
