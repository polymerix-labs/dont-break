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
import { fetchAppReleaseStatus, type AppReleaseStatus } from "../api/client";
import { Badge } from "../design";
import { useT } from "../i18n";
const POLL_MS = 10 * 60 * 1000;
export function AppUpdateBadge() {
    const t = useT();
    const [status, setStatus] = useState<AppReleaseStatus | null>(null);
    const load = useCallback(async () => {
        const next = await fetchAppReleaseStatus();
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
    if (!status?.update_available || !status.latest || !status.release_url)
        return null;
    return (<a href={status.release_url} target="_blank" rel="noreferrer" title={t("header.appUpdateTitle", {
            latest: status.latest,
            installed: status.installed || "—",
        })} className="shrink-0">
      <Badge tone="warn">{t("header.appUpdate", { latest: status.latest })}</Badge>
    </a>);
}
