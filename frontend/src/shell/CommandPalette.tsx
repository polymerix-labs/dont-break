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

import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { searchSymbols, type FindMatch } from "../api/dashboard";
import { useT, type MessageKey } from "../i18n";
import { useUiStore } from "./uiStore";
import { useViewerOverlays } from "../viewer/useViewerOverlays";
const PAGES: readonly {
    to: string;
    labelKey: MessageKey;
}[] = [
    { to: "/overview", labelKey: "nav.overview" },
    { to: "/graph", labelKey: "nav.graph" },
    { to: "/rules", labelKey: "nav.rules" },
    { to: "/agents", labelKey: "nav.agents" },
    { to: "/settings", labelKey: "nav.settings" },
];
export function CommandPalette() {
    const open = useUiStore((s) => s.paletteOpen);
    const setOpen = useUiStore((s) => s.setPaletteOpen);
    const t = useT();
    const [query, setQuery] = useState("");
    const [matches, setMatches] = useState<FindMatch[]>([]);
    const [semanticMode, setSemanticMode] = useState(true);
    const navigate = useNavigate();
    const overlays = useViewerOverlays();
    useEffect(() => {
        function onKeyDown(ev: KeyboardEvent) {
            if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
                ev.preventDefault();
                setOpen(!useUiStore.getState().paletteOpen);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [setOpen]);
    useEffect(() => {
        if (!open) {
            setQuery("");
            setMatches([]);
        }
    }, [open]);
    useEffect(() => {
        if (query.trim().length < 2) {
            setMatches([]);
            return;
        }
        let cancelled = false;
        const timer = setTimeout(() => {
            searchSymbols(query.trim(), 8)
                .then((result) => {
                if (cancelled)
                    return;
                setMatches(result.matches);
                setSemanticMode(result.semantic);
            })
                .catch(() => {
                if (!cancelled)
                    setMatches([]);
            });
        }, 200);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);
    function go(to: string) {
        setOpen(false);
        void navigate({ to });
    }
    function focusSymbol(match: FindMatch) {
        setOpen(false);
        overlays.focusNode(match.id);
        void navigate({ to: "/graph" });
    }
    return (<Command.Dialog open={open} onOpenChange={setOpen} shouldFilter={false} label={t("header.commandPalette")} className="fixed left-1/2 top-24 z-50 w-[90vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-surface">
      <Command.Input value={query} onValueChange={setQuery} placeholder={t("palette.placeholder")} className="h-11 w-full border-b border-line bg-transparent px-4 text-sm text-foreground placeholder:text-faint focus:outline-none"/>
      <Command.List className="max-h-80 overflow-y-auto p-1.5">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
          {t("palette.empty")}
        </Command.Empty>

        {matches.length > 0 ? (<Command.Group heading={semanticMode ? t("palette.symbols") : t("palette.symbolsLexical")} className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-faint">
            {matches.map((match) => (<Command.Item key={match.id} value={`symbol-${match.id}`} onSelect={() => focusSymbol(match)} className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-primary-subtle">
                <span className="truncate font-mono text-xs">{match.fqn || match.name}</span>
                <span className="ml-auto shrink-0 text-xs text-faint">
                  {match.node_type}
                </span>
              </Command.Item>))}
          </Command.Group>) : null}

        <Command.Group heading={t("palette.actions")} className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-faint">
          <Command.Item value="action-new-rule" onSelect={() => go("/rules/studio")} className="cursor-pointer rounded px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-primary-subtle">
            {t("rules.openStudio")}
          </Command.Item>
          <Command.Item value="action-clear-overlay" onSelect={() => {
            overlays.clear();
            setOpen(false);
        }} className="cursor-pointer rounded px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-primary-subtle">
            {t("palette.clearOverlay")}
          </Command.Item>
        </Command.Group>

        <Command.Group heading={t("palette.navigate")} className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-faint">
          {PAGES.map((page) => (<Command.Item key={page.to} value={`nav-${page.to}`} onSelect={() => go(page.to)} className="cursor-pointer rounded px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-primary-subtle">
              {t("palette.goTo", { page: t(page.labelKey) })}
            </Command.Item>))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>);
}
