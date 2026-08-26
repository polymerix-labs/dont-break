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
import { setLiveSync, syncProject } from "../api/client";
import { useT, type MessageKey } from "../i18n";
import { useSessionContext } from "./SessionContext";
function formatAgo(lastSyncedAt: number | undefined, t: (k: MessageKey, p?: Record<string, string | number>) => string): string {
    if (!lastSyncedAt || lastSyncedAt <= 0)
        return "";
    const seconds = Math.max(0, Math.floor(Date.now() / 1000 - lastSyncedAt));
    if (seconds < 5)
        return t("header.liveSyncJustNow");
    if (seconds < 60)
        return t("header.liveSyncSecondsAgo", { n: seconds });
    return t("header.liveSyncMinutesAgo", { n: Math.floor(seconds / 60) });
}
export function LiveSyncIndicator() {
    const { session, refresh } = useSessionContext();
    const t = useT();
    const [busy, setBusy] = useState(false);
    const [, setTick] = useState(0);
    const enabled = session?.live_sync_enabled !== false;
    const status = String(session?.watch_status || "");
    const error = String(session?.watch_error || "");
    const lastSyncedAt = Number(session?.last_synced_at || 0);
    useEffect(() => {
        if (!enabled || status !== "watching" || !lastSyncedAt)
            return;
        const id = window.setInterval(() => setTick((n) => n + 1), 5000);
        return () => window.clearInterval(id);
    }, [enabled, status, lastSyncedAt]);
    const toggle = useCallback(async () => {
        setBusy(true);
        try {
            await setLiveSync(!enabled);
            await refresh();
        }
        finally {
            setBusy(false);
        }
    }, [enabled, refresh]);
    const retry = useCallback(async () => {
        setBusy(true);
        try {
            await syncProject();
            await refresh();
        }
        finally {
            setBusy(false);
        }
    }, [refresh]);
    if (!session?.project_id)
        return null;
    const showsError = enabled && status === "error";
    let label = enabled ? t("header.liveSyncOn") : t("header.liveSyncOff");
    let tone = "text-faint";
    if (enabled) {
        if (status === "syncing") {
            label = t("header.liveSyncSyncing");
            tone = "text-muted";
        }
        else if (status === "error") {
            label = error || t("header.liveSyncError");
            tone = "text-danger";
        }
        else if (status === "watching") {
            const ago = formatAgo(lastSyncedAt, t);
            label = ago
                ? t("header.liveSyncSynced", { ago })
                : t("header.liveSyncWatching");
            tone = "text-muted";
        }
    }
    return (<div className="flex shrink-0 items-center gap-1.5">
      <button type="button" role="switch" aria-checked={enabled} aria-label={t("header.liveSync")} title={showsError ? label : t("header.liveSync")} disabled={busy} onClick={() => void toggle()} className="flex items-center gap-1.5 rounded border border-line bg-inset px-2 py-1 text-xs transition-colors duration-fast hover:border-line-strong disabled:opacity-50">
        
        <span className={!enabled
            ? "inline-block h-1.5 w-1.5 rounded-full bg-faint"
            : status === "error"
                ? "inline-block h-1.5 w-1.5 rounded-full bg-danger"
                : status === "syncing"
                    ? "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warn"
                    : "inline-block h-1.5 w-1.5 rounded-full bg-ok"} aria-hidden/>
        
        <span className={`${showsError ? "max-w-[28rem]" : "max-w-[12rem]"} truncate ${tone}`}>
          {status === "syncing" ? (<span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-line border-t-foreground"/>
              {label}
            </span>) : (label)}
        </span>
      </button>
      {enabled && status === "error" ? (<button type="button" disabled={busy} onClick={() => void retry()} className="rounded border border-line px-1.5 py-1 text-xs text-muted hover:border-line-strong hover:text-foreground disabled:opacity-50">
          {t("header.liveSyncRetry")}
        </button>) : null}
    </div>);
}
