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

import { useEffect, useState } from "react";
import { fetchSupportContext, sendSupport, type SupportContext } from "../api/client";
import { Button, Dialog } from "../design";
import { useT } from "../i18n";
import { useUiStore } from "./uiStore";
const KINDS = ["bug", "idea", "question"] as const;
export function SupportDialog() {
    const t = useT();
    const open = useUiStore((s) => s.supportOpen);
    const setOpen = useUiStore((s) => s.setSupportOpen);
    const [kind, setKind] = useState<(typeof KINDS)[number]>("bug");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [facts, setFacts] = useState<SupportContext | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    useEffect(() => {
        if (!open)
            return;
        setSent(false);
        setError("");
        void fetchSupportContext().then(setFacts);
    }, [open]);
    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (sending || !message.trim())
            return;
        if (!email.trim() || !email.includes("@")) {
            setError(t("support.needEmail"));
            return;
        }
        setSending(true);
        setError("");
        try {
            await sendSupport({ kind, email: email.trim(), message: message.trim() });
            setSent(true);
            setMessage("");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : t("support.failed"));
        }
        finally {
            setSending(false);
        }
    }
    return (<Dialog open={open} onOpenChange={setOpen} title={t("support.title")} description={t("support.hint")}>
      {sent ? (<div className="space-y-4">
          <p className="text-sm text-foreground">{t("support.sent")}</p>
          <Button type="button" onClick={() => setOpen(false)}>
            {t("support.close")}
          </Button>
        </div>) : (<form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((id) => (<button key={id} type="button" onClick={() => setKind(id)} className={kind === id
                    ? "rounded border border-primary/60 bg-primary-subtle px-2.5 py-1.5 text-xs text-foreground"
                    : "rounded border border-line bg-inset px-2.5 py-1.5 text-xs text-muted"}>
                {t(`support.kind.${id}`)}
              </button>))}
          </div>
          <label className="block">
            <span className="text-xs text-muted">{t("support.email")}</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("support.emailPlaceholder")} className="mt-1.5 w-full rounded border border-line bg-inset px-2.5 py-2 text-sm text-foreground"/>
          </label>
          <label className="block">
            <span className="text-xs text-muted">{t("support.message")}</span>
            <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("support.messagePlaceholder")} className="mt-1.5 w-full resize-none rounded border border-line bg-inset px-2.5 py-2 text-sm text-foreground"/>
          </label>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded border border-line bg-inset px-3 py-2.5 text-xs">
            <Fact label={t("support.organization")} value={facts?.organization}/>
            <Fact label={t("support.project")} value={facts?.project}/>
            <Fact label={t("support.appVersion")} value={facts?.app_version}/>
            <Fact label={t("support.factsExtract")} value={facts?.facts_extract}/>
            <Fact label={t("support.npm")} value={facts?.npm}/>
          </dl>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("support.cancel")}
            </Button>
            <Button type="submit" disabled={sending || !message.trim()}>
              {sending ? t("support.sending") : t("support.send")}
            </Button>
          </div>
        </form>)}
    </Dialog>);
}
function Fact({ label, value }: {
    label: string;
    value?: string;
}) {
    if (!value)
        return null;
    return (<div>
      <dt className="text-faint">{label}</dt>
      <dd className="truncate text-foreground">{value}</dd>
    </div>);
}
