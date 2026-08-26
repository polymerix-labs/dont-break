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

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import ViewerToolbar from "../ViewerToolbar";
import { pickProject, syncProject } from "../api/client";
import { projectLabel } from "../api/session";
import { Button, EmptyState, useToast } from "../design";
import { useT } from "../i18n";
import { ZonePreviewBanner } from "../pages/rules/ZonePreviewBanner";
import { useViewerOverlays } from "../viewer/useViewerOverlays";
import { CommandPalette } from "./CommandPalette";
import { LockdownBanner } from "./LockdownBanner";
import { useSessionContext } from "./SessionContext";
import { useUiStore } from "./uiStore";
import { useViewer } from "./ViewerContext";
import { ViewerHost } from "./ViewerHost";
import { Sidebar } from "./Sidebar";
import { WelcomeOverlay } from "./WelcomeOverlay";
import { LiveSyncIndicator } from "./LiveSyncIndicator";
export function useProjectPick() {
    const { refresh } = useSessionContext();
    const [picking, setPicking] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const t = useT();
    const pick = useCallback(async () => {
        setPicking(true);
        try {
            const selected = await pickProject();
            await refresh();
            void navigate({ to: "/graph" });
            if (!selected.project_id) {
                toast({
                    title: t("settings.syncFailed"),
                    detail: t("agents.mintNeedProject"),
                    tone: "danger",
                });
                return;
            }
            void (async () => {
                try {
                    await syncProject();
                }
                catch (err) {
                    toast({
                        title: t("settings.syncFailed"),
                        detail: err instanceof Error ? err.message : undefined,
                        tone: "danger",
                    });
                }
                finally {
                    await refresh();
                }
            })();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "";
            if (message && !/cancel/i.test(message)) {
                toast({
                    title: t("header.chooseProject"),
                    detail: message,
                    tone: "danger",
                });
            }
        }
        finally {
            setPicking(false);
            await refresh();
        }
    }, [refresh, navigate, toast, t]);
    return { pick, picking };
}
function ProjectSwitcher() {
    const { session } = useSessionContext();
    const { pick, picking } = useProjectPick();
    const t = useT();
    const label = session ? projectLabel(session) : "";
    return (<button type="button" onClick={() => void pick()} disabled={picking} title={t("header.changeProjectTitle")} className="flex max-w-[16rem] shrink-0 items-center gap-1.5 rounded border border-line bg-inset px-2 py-1 text-xs text-muted transition-colors duration-fast hover:border-line-strong hover:text-foreground disabled:opacity-50">
      <span className="truncate font-mono">
        {picking ? t("header.choosingFolder") : label || t("header.chooseProject")}
      </span>
    </button>);
}
function ProjectPrompt({ signedIn }: {
    signedIn: boolean;
}) {
    const { session } = useSessionContext();
    const { pick, picking } = useProjectPick();
    const t = useT();
    if (!signedIn) {
        return (<div className="flex h-full items-center justify-center p-8">
        <EmptyState title={t("prompt.signInTitle")} detail={t("prompt.signInDetail")}/>
      </div>);
    }
    return (<div className="flex h-full items-center justify-center p-8">
      <EmptyState title={t("prompt.chooseTitle")} detail={session?.graph_error || t("prompt.chooseDetail")} action={<Button onClick={() => void pick()} disabled={picking}>
            {picking ? t("header.choosingFolder") : t("header.chooseProject")}
          </Button>}/>
    </div>);
}
export function AppShell() {
    const { session } = useSessionContext();
    const { iframeRef } = useViewer();
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const activeOverlay = useUiStore((s) => s.activeOverlay);
    const overlays = useViewerOverlays();
    const t = useT();
    const signedIn = Boolean(session?.authenticated || session?.workspace_id || session?.org_slug);
    const hasProject = Boolean(session?.project_path && session?.project_id);
    const ready = signedIn && hasProject;
    const onGraph = pathname.startsWith("/graph");
    const onStudio = pathname.startsWith("/rules/studio");
    return (<div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-line px-4">
        <span className="shrink-0 font-display text-base font-semibold tracking-tight text-foreground">
          dont-break
        </span>
        <ProjectSwitcher />
        {ready ? <LiveSyncIndicator /> : null}
        {ready && onGraph ? (<>
            <ViewerToolbar iframeRef={iframeRef}/>
            {activeOverlay ? (<Button size="sm" variant="ghost" onClick={() => overlays.clear()}>
                {t("header.clearOverlay")}
              </Button>) : null}
          </>) : (<div className="flex-1"/>)}
        
        <a href="https://dont-break.com/account" target="_blank" rel="noreferrer" title={t("header.account")} aria-label={t("header.account")} className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-primary-subtle font-display text-xs font-semibold uppercase text-primary transition-colors duration-fast hover:border-primary/50">
          {(session?.org_slug || session?.workspace_id || "?").slice(0, 1)}
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative min-h-0 flex-1">
          {ready ? (<>
              <ViewerHost layout={onGraph ? "full" : onStudio ? "split" : "hidden"}/>
              <div className={onGraph
                ? "hidden"
                : onStudio
                    ? "absolute inset-y-0 left-0 w-2/5 min-w-[22rem] overflow-y-auto border-r border-line bg-background"
                    : "absolute inset-0 overflow-y-auto bg-background"}>
                <div key={pathname} className={onStudio ? "page-enter h-full" : "page-enter"}>
                  <Outlet />
                </div>
              </div>
              <ZonePreviewBanner />
              <LockdownBanner />
              <CommandPalette />
            </>) : (<ProjectPrompt signedIn={signedIn}/>)}
        </main>
      </div>
      <WelcomeOverlay />
    </div>);
}
