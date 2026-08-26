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

import { useCallback, useEffect, useRef } from "react";
import type { SessionSnapshot } from "../api/session";
import { isSyncInProgress } from "../viewer/graphSessionPolicy";
import { HOST_SOURCE, HostMessageType, isViewerMessage, postToViewer, } from "../viewer/hostProtocol";
import { VIEWER_ASSET_VERSION } from "../viewer/assetVersion";
import { ViewerEmbedParams, ViewerEmbedValues } from "../wire/hostProtocol";
import { LocalRoutes } from "../wire/routes";
import { SyncPhase } from "../wire/sync";
import { useSessionContext } from "./SessionContext";
import { useUiStore } from "./uiStore";
import { useViewer } from "./ViewerContext";
const VIEWER_SRC = `${LocalRoutes.VIEWER_MOUNT}?${ViewerEmbedParams.EMBED}=${ViewerEmbedValues.ENABLED}&${ViewerEmbedParams.VERSION}=${VIEWER_ASSET_VERSION}`;
export type ViewerLayout = "full" | "split" | "hidden";
const LAYOUT_CLASS: Record<ViewerLayout, string> = {
    full: "h-full w-full border-0 bg-background",
    split: "absolute inset-y-0 right-0 h-full w-[calc(100%-max(40%,22rem))] border-0 bg-background",
    hidden: "hidden",
};
export function ViewerHost({ layout }: {
    layout: ViewerLayout;
}) {
    const { session } = useSessionContext();
    const { iframeRef } = useViewer();
    const prevSessionRef = useRef<SessionSnapshot | null>(null);
    const setGraphSelection = useUiStore((s) => s.setGraphSelection);
    useEffect(() => {
        function onMessage(ev: MessageEvent) {
            if (ev.origin !== window.location.origin)
                return;
            if (!isViewerMessage(ev.data))
                return;
            if (ev.data.type === "node-selected") {
                setGraphSelection({
                    nodeId: ev.data.nodeId,
                    name: ev.data.name,
                    nodeType: ev.data.nodeType,
                });
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [setGraphSelection]);
    const requestGraphReload = useCallback(() => {
        if (!session?.snapshot_saved || session.sync_phase !== SyncPhase.READY)
            return;
        if (isSyncInProgress(session))
            return;
        postToViewer(iframeRef.current, {
            source: HOST_SOURCE,
            type: HostMessageType.GRAPH_RELOAD,
        });
    }, [session, iframeRef]);
    useEffect(() => {
        if (!session)
            return;
        postToViewer(iframeRef.current, {
            source: HOST_SOURCE,
            type: HostMessageType.SESSION_UPDATE,
            session,
        });
    }, [session, iframeRef]);
    useEffect(() => {
        if (!session)
            return;
        const prev = prevSessionRef.current;
        prevSessionRef.current = session;
        if (!session.snapshot_saved || session.sync_phase !== SyncPhase.READY)
            return;
        if (isSyncInProgress(session))
            return;
        if (!prev)
            return;
        const becameReady = isSyncInProgress(prev) ||
            (!prev.snapshot_saved && session.snapshot_saved) ||
            (prev.sync_phase !== SyncPhase.READY && session.sync_phase === SyncPhase.READY);
        if (becameReady) {
            requestGraphReload();
        }
    }, [session, requestGraphReload]);
    return (<iframe ref={iframeRef} title="dont-break project viewer" src={VIEWER_SRC} className={LAYOUT_CLASS[layout]}/>);
}
