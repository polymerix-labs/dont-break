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

import { useCallback, useEffect, useRef, useState } from "react";
import { HOST_SOURCE, HostMessageType, isViewerMessage, postToViewer, type SearchHit, type ToolbarTools, } from "./viewer/hostProtocol";
import { useT } from "./i18n";
import { ArchSeverity } from "./wire/archSeverity";
import { NebulaElementId } from "./wire/domIds";
import { cn } from "./design";
type Props = {
    iframeRef: React.RefObject<HTMLIFrameElement>;
};
function scoreOnly(text: string): string {
    return text.replace(/^[SN]\s*/, "");
}
function sevDot(sev: string): string {
    if (sev === ArchSeverity.GOOD)
        return "bg-ok";
    if (sev === ArchSeverity.MID)
        return "bg-warn";
    if (sev === ArchSeverity.BAD)
        return "bg-danger";
    return "bg-faint";
}
function SearchIcon() {
    return (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="4.4"/>
      <path d="m10.4 10.4 3.2 3.2"/>
    </svg>);
}
export default function ViewerToolbar({ iframeRef }: Props) {
    const [tools, setTools] = useState<ToolbarTools | null>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchHit[]>([]);
    const [resultsOpen, setResultsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const t = useT();
    const sendSearch = useCallback((value: string) => {
        postToViewer(iframeRef.current, {
            source: HOST_SOURCE,
            type: HostMessageType.SEARCH_INPUT,
            query: value,
        });
    }, [iframeRef]);
    useEffect(() => {
        function onMessage(ev: MessageEvent) {
            if (ev.origin !== window.location.origin)
                return;
            if (!isViewerMessage(ev.data))
                return;
            if (ev.data.type === "toolbar-sync") {
                setTools(ev.data.tools);
            }
            if (ev.data.type === "search-results") {
                setResults(ev.data.items);
                setResultsOpen(ev.data.items.length > 0);
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);
    useEffect(() => {
        function onDocClick(ev: MouseEvent) {
            if (!searchRef.current?.contains(ev.target as Node)) {
                setResultsOpen(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);
    function handleSearchChange(value: string) {
        setQuery(value);
        sendSearch(value);
        if (value.trim().length < 2) {
            setResults([]);
            setResultsOpen(false);
        }
    }
    function pickResult(hit: SearchHit) {
        setQuery(hit.name);
        setResultsOpen(false);
        postToViewer(iframeRef.current, {
            source: HOST_SOURCE,
            type: HostMessageType.SEARCH_PICK,
            index: hit.index,
        });
    }
    function clickTool(id: string) {
        postToViewer(iframeRef.current, {
            source: HOST_SOURCE,
            type: HostMessageType.TOOLBAR_CLICK,
            id,
        });
    }
    const toggleChip = (active: boolean) => cn("rounded border px-2.5 py-1 text-xs transition-colors duration-fast", active
        ? "border-primary/50 bg-primary-subtle text-foreground"
        : "border-line bg-inset text-muted hover:border-line-strong hover:text-foreground");
    return (<div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
      <div ref={searchRef} className="relative min-w-0 max-w-md flex-1">
        <label htmlFor="viewer-search" className="sr-only">
          {t("toolbar.searchSymbols")}
        </label>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
          <SearchIcon />
        </span>
        <input id="viewer-search" type="text" value={query} onChange={(e) => handleSearchChange(e.target.value)} onFocus={() => results.length > 0 && setResultsOpen(true)} placeholder={t("toolbar.searchPlaceholder")} autoComplete="off" className="w-full rounded border border-line bg-inset py-1.5 pl-8 pr-3 text-sm text-foreground outline-none transition-colors duration-fast placeholder:text-faint focus:border-primary/50"/>
        {resultsOpen ? (<ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-md border border-line bg-surface py-1 shadow-xl">
            {results.map((hit) => (<li key={hit.index}>
                <button type="button" onClick={() => pickResult(hit)} className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm transition-colors duration-fast hover:bg-primary-subtle">
                  <span className="truncate text-foreground">{hit.name}</span>
                  <span className="shrink-0 rounded-sm bg-overlay px-1.5 text-xs text-muted">
                    {hit.type}
                  </span>
                </button>
              </li>))}
          </ul>) : null}
      </div>

      
      {tools?.arch ? (<div className="hidden items-center gap-1.5 lg:flex">
          <span className="flex items-center gap-1.5 rounded border border-line bg-inset px-2 py-1 text-xs text-muted" title={t("toolbar.stabilityHint")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", sevDot(tools.arch.stabilitySev))}/>
            {t("toolbar.stabilityLabel")}
            <span className="font-medium tabular-nums text-foreground">
              {scoreOnly(tools.arch.stability)}
            </span>
          </span>
          <span className="flex items-center gap-1.5 rounded border border-line bg-inset px-2 py-1 text-xs text-muted" title={t("toolbar.navHint")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", sevDot(tools.arch.navigabilitySev))}/>
            {t("toolbar.navLabel")}
            <span className="font-medium tabular-nums text-foreground">
              {scoreOnly(tools.arch.navigability)}
            </span>
          </span>
        </div>) : null}

      {tools?.edges ? (<button type="button" title={tools.edges.title} onClick={() => clickTool(NebulaElementId.NEBULA_EDGES)} className={toggleChip(tools.edges.active)}>
          {tools.edges.label}
        </button>) : null}

      {tools?.externals ? (<button type="button" title={tools.externals.title || t("toolbar.externalsTitle")} onClick={() => clickTool(NebulaElementId.NEBULA_EXTERNALS)} className={toggleChip(tools.externals.active)}>
          {t("toolbar.externals")}
        </button>) : null}

      {tools?.heat ? (<button type="button" title={tools.heat.title} onClick={() => clickTool(NebulaElementId.ARCH_HEAT)} className={toggleChip(tools.heat.active)}>
          {t("toolbar.heatmap")}
        </button>) : null}

      {tools?.actions ? (<button type="button" title={t("toolbar.actionsHint")} onClick={() => clickTool(NebulaElementId.ARCH_ACTIONS_TOGGLE)} className={toggleChip(tools.actions.active)}>
          {t("toolbar.actions")}
        </button>) : null}
    </div>);
}
