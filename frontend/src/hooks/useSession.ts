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
import { fetchSession } from "../api/client";
import type { SessionSnapshot } from "../api/session";
import { LocalRoutes } from "../wire/routes";
export function useSession() {
    const [session, setSession] = useState<SessionSnapshot | null>(null);
    const refresh = useCallback(async () => {
        const data = await fetchSession();
        if (data)
            setSession(data);
    }, []);
    useEffect(() => {
        let cancelled = false;
        void refresh();
        const source = new EventSource(LocalRoutes.SESSION_EVENTS);
        source.onmessage = (ev) => {
            if (cancelled)
                return;
            try {
                setSession(JSON.parse(ev.data) as SessionSnapshot);
            }
            catch {
            }
        };
        return () => {
            cancelled = true;
            source.close();
        };
    }, [refresh]);
    return { session, refresh };
}
