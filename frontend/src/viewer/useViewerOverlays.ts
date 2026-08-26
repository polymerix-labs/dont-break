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

import { useMemo } from "react";
import { useViewer } from "../shell/ViewerContext";
import { useUiStore } from "../shell/uiStore";
import { HOST_SOURCE, HostMessageType, postToViewer, type ProbeOutcome, type ZoneHaloNode, } from "./hostProtocol";
export function useViewerOverlays() {
    const { iframeRef } = useViewer();
    const setActiveOverlay = useUiStore((s) => s.setActiveOverlay);
    return useMemo(() => ({
        showZone(overlayId: string, core: string[], halo: ZoneHaloNode[]) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.OVERLAY_ZONE,
                overlayId,
                core,
                halo,
            });
            setActiveOverlay(overlayId);
        },
        showPath(overlayId: string, nodes: string[]) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.OVERLAY_PATH,
                overlayId,
                nodes,
            });
            setActiveOverlay(overlayId);
        },
        showCandidates(overlayId: string, nodes: string[], rejected?: string[]) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.OVERLAY_CANDIDATES,
                overlayId,
                nodes,
                rejected,
            });
            setActiveOverlay(overlayId);
        },
        markRejected(overlayId: string, nodes: string[]) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.OVERLAY_REJECTED,
                overlayId,
                nodes,
            });
        },
        playProbe(probeId: string, nodes: string[], verdict?: "block" | "ok", opts?: {
            outcome?: ProbeOutcome;
            freeze?: boolean;
        }) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.SIMULATION_PROBE,
                probeId,
                nodes,
                verdict,
                outcome: opts?.outcome,
                freeze: opts?.freeze,
            });
        },
        flashImpact(nodeId: string, verdict: "block" | "ok", outcome?: ProbeOutcome, opts?: {
            freeze?: boolean;
        }) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.SIMULATION_IMPACT,
                nodeId,
                verdict,
                outcome,
                freeze: opts?.freeze,
            });
        },
        raiseShield(overlayId: string, core: string[], halo: ZoneHaloNode[]) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.SIMULATION_SHIELD,
                overlayId,
                core,
                halo,
            });
            setActiveOverlay(overlayId);
        },
        celebrateShield() {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.SIMULATION_CELEBRATE,
            });
        },
        clear() {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.OVERLAY_CLEAR,
            });
            setActiveOverlay(null);
        },
        focusNode(nodeId: string) {
            postToViewer(iframeRef.current, {
                source: HOST_SOURCE,
                type: HostMessageType.FOCUS_NODE,
                nodeId,
            });
        },
    }), [iframeRef, setActiveOverlay]);
}
