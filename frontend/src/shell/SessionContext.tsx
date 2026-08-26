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

import { createContext, useContext, type ReactNode } from "react";
import type { SessionSnapshot } from "../api/session";
import { useSession } from "../hooks/useSession";
type SessionContextValue = {
    session: SessionSnapshot | null;
    refresh: () => Promise<void>;
};
const SessionContext = createContext<SessionContextValue>({
    session: null,
    refresh: async () => { },
});
export function SessionProvider({ children }: {
    children: ReactNode;
}) {
    const value = useSession();
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSessionContext(): SessionContextValue {
    return useContext(SessionContext);
}
