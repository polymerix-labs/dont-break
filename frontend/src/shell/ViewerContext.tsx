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

import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";
type ViewerContextValue = {
    iframeRef: RefObject<HTMLIFrameElement>;
};
const ViewerContext = createContext<ViewerContextValue | null>(null);
export function ViewerProvider({ children }: {
    children: ReactNode;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    return (<ViewerContext.Provider value={{ iframeRef }}>{children}</ViewerContext.Provider>);
}
export function useViewer(): ViewerContextValue {
    const ctx = useContext(ViewerContext);
    if (!ctx)
        throw new Error("useViewer must be used inside ViewerProvider");
    return ctx;
}
