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

import { createHashHistory, createRootRoute, createRoute, createRouter, redirect, } from "@tanstack/react-router";
import { AppShell } from "./shell/AppShell";
import { AgentsPage } from "./pages/agents/AgentsPage";
import { GraphPage } from "./pages/GraphPage";
import { OverviewPage } from "./pages/OverviewPage";
import { RulesPage } from "./pages/rules/RulesPage";
import { RuleStudioPage } from "./pages/rules/studio/RuleStudioPage";
import { SettingsPage } from "./pages/SettingsPage";
const rootRoute = createRootRoute({ component: AppShell });
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    beforeLoad: () => {
        throw redirect({ to: "/overview" });
    },
});
const overviewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/overview",
    component: OverviewPage,
});
const graphRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/graph",
    component: GraphPage,
});
const rulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/rules",
    component: RulesPage,
});
const ruleStudioRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/rules/studio",
    component: RuleStudioPage,
});
const agentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/agents",
    component: AgentsPage,
});
const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: SettingsPage,
});
const routeTree = rootRoute.addChildren([
    indexRoute,
    overviewRoute,
    graphRoute,
    rulesRoute,
    ruleStudioRoute,
    agentsRoute,
    settingsRoute,
]);
export const router = createRouter({
    routeTree,
    history: createHashHistory(),
});
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
