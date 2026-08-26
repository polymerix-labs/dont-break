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

import { useEffect, useRef } from "react";
import { useViewerOverlays } from "../../../viewer/useViewerOverlays";
import { useStudioStore } from "./studioStore";
export const STUDIO_OVERLAY_ID = "studio:run";
export function useStudioOverlays() {
    const events = useStudioStore((s) => s.events);
    const overlays = useViewerOverlays();
    const seenRef = useRef(0);
    const litRef = useRef(false);
    useEffect(() => {
        for (let i = seenRef.current; i < events.length; i++) {
            const { ev } = events[i];
            if (ev.event === "run_started") {
                if (litRef.current) {
                    overlays.clear();
                    litRef.current = false;
                }
            }
            else if (ev.event === "candidates") {
                const selected = [
                    ...ev.data.selected.map((c) => c.id),
                    ...ev.data.selected_to.map((c) => c.id),
                ];
                overlays.showCandidates(STUDIO_OVERLAY_ID, selected, ev.data.rejected.map((c) => c.id));
                litRef.current = true;
            }
        }
        seenRef.current = events.length;
    }, [events, overlays]);
    useEffect(() => {
        return () => {
            if (litRef.current)
                overlays.clear();
        };
    }, [overlays]);
}
