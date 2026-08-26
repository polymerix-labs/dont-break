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
import { fetchLockdown, releaseLockdown, saveLockdownPolicy, type LockdownStatus, } from "../api/client";
import { Badge, Button, useToast } from "../design";
import { useT } from "../i18n";
import { policyTtlValue, remainingLabel } from "./lockdownCopy";
const POLL_MS = 5000;
export function useLockdownStatus(pollMs: number | null = POLL_MS) {
    const [status, setStatus] = useState<LockdownStatus | null>(null);
    const [busy, setBusy] = useState(false);
    const refresh = useCallback(async () => {
        const next = await fetchLockdown();
        setStatus(next);
    }, []);
    useEffect(() => {
        void refresh();
        if (pollMs == null)
            return;
        const id = window.setInterval(() => void refresh(), pollMs);
        return () => window.clearInterval(id);
    }, [refresh, pollMs]);
    return { status, setStatus, busy, setBusy, refresh };
}
export function LockdownPolicySelects({ status, busy, onPolicy, }: {
    status: LockdownStatus;
    busy: boolean;
    onPolicy: (patch: Partial<LockdownStatus["policy"]>) => void;
}) {
    const t = useT();
    return (<>
      <select aria-label={t("lockdown.policyScope")} value={status.policy.scope} disabled={busy} onChange={(e) => onPolicy({ scope: e.target.value as "session" | "project" })} className="rounded border border-line bg-inset px-2 py-1 text-xs text-foreground">
        <option value="session">{t("lockdown.scopeSession")}</option>
        <option value="project">{t("lockdown.scopeProject")}</option>
      </select>
      <select aria-label={t("lockdown.policyDuration")} value={policyTtlValue(status.policy.ttl_sec)} disabled={busy} onChange={(e) => onPolicy({ ttl_sec: Number(e.target.value) })} className="rounded border border-line bg-inset px-2 py-1 text-xs text-foreground">
        <option value={1800}>{t("lockdown.duration30")}</option>
        <option value={-1}>{t("lockdown.durationNever")}</option>
      </select>
    </>);
}
export function LockdownBanner() {
    const t = useT();
    const toast = useToast();
    const { status, setStatus, busy, setBusy } = useLockdownStatus();
    async function handleRelease() {
        setBusy(true);
        try {
            const next = await releaseLockdown();
            setStatus(next);
            toast({ title: t("lockdown.released"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("lockdown.releaseFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    async function handlePolicy(patch: Partial<LockdownStatus["policy"]>) {
        if (!status)
            return;
        const policy = { ...status.policy, ...patch };
        setBusy(true);
        try {
            const next = await saveLockdownPolicy(policy);
            setStatus(next);
            toast({ title: t("lockdown.policySaved"), tone: "ok" });
        }
        catch (err) {
            toast({
                title: t("lockdown.policyFailed"),
                detail: err instanceof Error ? err.message : undefined,
                tone: "danger",
            });
        }
        finally {
            setBusy(false);
        }
    }
    if (!status?.locked)
        return null;
    return (<div className="pointer-events-auto fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-overlay px-4 py-2.5">
      <Badge tone="danger">{t("lockdown.banner")}</Badge>
      <span className="text-sm text-foreground">
        {status.scope === "project" ? t("lockdown.scopeProject") : t("lockdown.scopeSession")}
        {" · "}
        {remainingLabel(status.remaining_sec, t)}
      </span>
      <LockdownPolicySelects status={status} busy={busy} onPolicy={(patch) => void handlePolicy(patch)}/>
      <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleRelease()}>
        {busy ? t("lockdown.releasing") : t("lockdown.release")}
      </Button>
    </div>);
}
