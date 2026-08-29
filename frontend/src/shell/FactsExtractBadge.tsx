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

import { useCallback, useEffect, useState } from "react";
import { fetchFactsExtractStatus, updateFactsExtract, type FactsExtractStatus, } from "../api/client";
import { Badge, useToast } from "../design";
import { useT } from "../i18n";
const POLL_MS = 10 * 60 * 1000;
export function FactsExtractBadge() {
    const t = useT();
    const toast = useToast();
    const [status, setStatus] = useState<FactsExtractStatus | null>(null);
    const [busy, setBusy] = useState(false);
    const load = useCallback(async () => {
        const next = await fetchFactsExtractStatus();
        setStatus(next);
    }, []);
    useEffect(() => {
        void load();
        const id = window.setInterval(() => void load(), POLL_MS);
        const onFocus = () => void load();
        window.addEventListener("focus", onFocus);
        return () => {
            window.clearInterval(id);
            window.removeEventListener("focus", onFocus);
        };
    }, [load]);
    const apply = useCallback(async () => {
        if (busy)
            return;
        setBusy(true);
        try {
            const next = await updateFactsExtract();
            setStatus(next);
            toast({ title: t("header.extractUpdated"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("header.extractUpdateFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }, [busy, t, toast]);
    if (!status?.update_available || !status.latest)
        return null;
    const label = busy
        ? t("header.extractUpdating")
        : t("header.extractUpdate", { latest: status.latest });
    return (<button type="button" disabled={busy} onClick={() => void apply()} title={t("header.extractUpdateTitle", {
            latest: status.latest,
            installed: status.installed || "—",
        })} className="shrink-0 disabled:opacity-50">
      <Badge tone="warn">{label}</Badge>
    </button>);
}
