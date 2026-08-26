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

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Dialog, cn } from "../design";
import { setVoice, useT, useVoice, type Voice } from "../i18n";
import { dismissWelcome, shouldShowWelcome } from "./welcomeGate";
function VoiceCard({ value, label, hint, selected, onSelect, }: {
    value: Voice;
    label: string;
    hint: string;
    selected: boolean;
    onSelect: (voice: Voice) => void;
}) {
    return (<button type="button" onClick={() => onSelect(value)} className={cn("flex-1 rounded border px-3 py-2.5 text-left transition-colors duration-fast", selected
            ? "border-primary/60 bg-primary-subtle"
            : "border-line bg-inset hover:border-line-strong")}>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </button>);
}
export function WelcomeOverlay() {
    const t = useT();
    const voice = useVoice();
    const navigate = useNavigate();
    const [open, setOpen] = useState(() => shouldShowWelcome(window.localStorage));
    function close() {
        dismissWelcome(window.localStorage);
        setOpen(false);
    }
    function start() {
        close();
        void navigate({ to: "/agents" });
    }
    if (!open)
        return null;
    return (<Dialog open={open} onOpenChange={(next) => {
            if (!next)
                close();
        }} title={t("welcome.title")} width="lg">
      <div className="space-y-5" data-welcome-overlay>
        <ul className="space-y-2.5">
          {(["welcome.line1", "welcome.line2", "welcome.line3"] as const).map((key) => (<li key={key} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"/>
              <p className="text-sm leading-relaxed text-muted">{t(key)}</p>
            </li>))}
        </ul>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">{t("welcome.howTitle")}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <VoiceCard value="simple" label={t("welcome.voiceSimple")} hint={t("welcome.voiceSimpleHint")} selected={voice === "simple"} onSelect={setVoice}/>
            <VoiceCard value="technical" label={t("welcome.voiceTechnical")} hint={t("welcome.voiceTechnicalHint")} selected={voice === "technical"} onSelect={setVoice}/>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={close}>
            {t("welcome.skip")}
          </Button>
          <Button variant="primary" onClick={start}>
            {t("welcome.cta")}
          </Button>
        </div>
      </div>
    </Dialog>);
}
