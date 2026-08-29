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

import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../design";
import { useT, type MessageKey } from "../i18n";
import { useSessionContext } from "./SessionContext";
const STORAGE_KEY = "dont-break.sidebar";
function initialCollapsed(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "collapsed";
    }
    catch {
        return false;
    }
}
function persistCollapsed(collapsed: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded");
    }
    catch {
    }
}
type IconProps = {
    className?: string;
};
const icon = (paths: ReactNode) => function NavIcon({ className }: IconProps) {
    return (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
        {paths}
      </svg>);
};
const OverviewIcon = icon(<>
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/>
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/>
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/>
    <rect x="9" y="9" width="5.5" height="5.5" rx="1"/>
  </>);
const GraphIcon = icon(<>
    <circle cx="3.5" cy="12.5" r="2"/>
    <circle cx="12.5" cy="12.5" r="2"/>
    <circle cx="8" cy="3.5" r="2"/>
    <path d="M7 5.2 4.4 10.8M9 5.2l2.6 5.6M5.5 12.5h5"/>
  </>);
const RulesIcon = icon(<path d="M8 1.5 13.5 3.6v4.1c0 3.3-2.3 5.7-5.5 6.8-3.2-1.1-5.5-3.5-5.5-6.8V3.6L8 1.5Z"/>);
const AgentsIcon = icon(<>
    <rect x="2.5" y="5" width="11" height="8" rx="2"/>
    <path d="M8 5V2.5M6 2.5h4"/>
    <circle cx="5.75" cy="9" r="0.5" fill="currentColor"/>
    <circle cx="10.25" cy="9" r="0.5" fill="currentColor"/>
  </>);
const SettingsIcon = icon(<>
    <path d="M2 4.5h12M2 8h12M2 11.5h12"/>
    <circle cx="10.5" cy="4.5" r="1.4" fill="var(--db-inset)"/>
    <circle cx="5.5" cy="8" r="1.4" fill="var(--db-inset)"/>
    <circle cx="9" cy="11.5" r="1.4" fill="var(--db-inset)"/>
  </>);
const TeamDashboardIcon = icon(<>
    <rect x="1.5" y="2.5" width="13" height="9" rx="1.5"/>
    <path d="M5.5 14h5M8 11.5V14"/>
  </>);
const FeedbackIcon = icon(<>
    <path d="M2.5 3.5h11v7.5H8L5 13.5V11H2.5V3.5Z"/>
    <path d="M5.5 7h5M5.5 9h3.5"/>
  </>);
const NAV: readonly {
    to: string;
    labelKey: MessageKey;
    Icon: (props: IconProps) => ReactNode;
}[] = [
    { to: "/overview", labelKey: "nav.overview", Icon: OverviewIcon },
    { to: "/graph", labelKey: "nav.graph", Icon: GraphIcon },
    { to: "/rules", labelKey: "nav.rules", Icon: RulesIcon },
    { to: "/agents", labelKey: "nav.agents", Icon: AgentsIcon },
    { to: "/settings", labelKey: "nav.settings", Icon: SettingsIcon },
];
export function Sidebar() {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const { session } = useSessionContext();
    const t = useT();
    const supportHref = session?.support_url || "https://dont-break.com/app/overview?support=1";
    const onStudio = pathname.startsWith("/rules/studio");
    const beforeStudio = useRef<boolean | null>(null);
    useEffect(() => {
        if (onStudio) {
            setCollapsed((prev) => {
                beforeStudio.current = prev;
                return true;
            });
        }
        else if (beforeStudio.current !== null) {
            setCollapsed(beforeStudio.current);
            beforeStudio.current = null;
        }
    }, [onStudio]);
    function toggle() {
        const next = !collapsed;
        beforeStudio.current = null;
        setCollapsed(next);
        persistCollapsed(next);
    }
    return (<aside data-sidebar={collapsed ? "collapsed" : "expanded"} className={cn("flex shrink-0 flex-col border-r border-line bg-background transition-[width] duration-slow", collapsed ? "w-12" : "w-48")}>
      <nav className="flex flex-1 flex-col gap-1 p-2.5 pt-3">
        {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (<Link key={item.to} to={item.to} title={collapsed ? t(item.labelKey) : undefined} className={cn("flex items-center gap-3 rounded px-2.5 py-1.5 text-sm transition-colors duration-fast", collapsed && "justify-center px-0", active
                    ? "bg-overlay/70 font-medium text-foreground"
                    : "text-faint hover:text-foreground")}>
              <item.Icon className={active ? undefined : "opacity-80"}/>
              {collapsed ? null : <span className="truncate">{t(item.labelKey)}</span>}
            </Link>);
        })}
        <div className="mt-auto pt-2">
          <a href={supportHref} target="_blank" rel="noreferrer" title={t("nav.feedback")} className={cn("flex rounded-lg border border-line bg-inset text-faint transition-colors duration-fast hover:border-line-strong hover:text-foreground", collapsed
            ? "h-8 w-8 items-center justify-center"
            : "min-h-[5.5rem] flex-col items-start justify-between p-2.5")}>
            <FeedbackIcon className="opacity-80"/>
            {collapsed ? null : (<span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {t("nav.feedback")}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-faint/80">
                  {t("nav.feedback.hint")}
                </span>
              </span>)}
          </a>
        </div>
      </nav>
      
      <div className="border-t border-line p-2.5">
        <a href="https://dont-break.com/app/overview" target="_blank" rel="noreferrer" title={collapsed ? t("nav.teamDashboard") : undefined} className={cn("flex items-center gap-3 rounded px-2.5 py-1.5 text-sm text-faint transition-colors duration-fast hover:text-foreground", collapsed && "justify-center px-0")}>
          <TeamDashboardIcon className="opacity-80"/>
          {collapsed ? null : (<span className="min-w-0 flex-1">
              <span className="block truncate">{t("nav.teamDashboard")}</span>
              <span className="block truncate text-[11px] text-faint/70">
                {t("nav.teamDashboard.hint")}
              </span>
            </span>)}
        </a>
      </div>
      <div className="p-2.5 pt-0">
        <button type="button" onClick={toggle} title={collapsed ? t("nav.expand") : t("nav.collapse")} aria-expanded={!collapsed} className={cn("flex w-full items-center gap-3 rounded px-2.5 py-1.5 text-sm text-faint transition-colors duration-fast hover:text-muted", collapsed && "justify-center px-0")}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 shrink-0 transition-transform duration-slow", collapsed && "rotate-180")} aria-hidden>
            <path d="M9.5 4 5.5 8l4 4"/>
            <path d="M12 4 8 8l4 4" opacity="0.45"/>
          </svg>
          {collapsed ? null : <span className="truncate">{t("nav.collapse")}</span>}
        </button>
      </div>
    </aside>);
}
