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

import { humanName, projectLabel, type SessionSnapshot } from "./session";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond)
        console.log(`ok ${name}`);
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
function base(overrides: Partial<SessionSnapshot> = {}): SessionSnapshot {
    return {
        authenticated: true,
        org_slug: "acme",
        workspace_id: "acme",
        project_path: "",
        project_id: "",
        project_slug: "",
        project_display_name: "",
        snapshot_saved: false,
        graph_error: "",
        graph_stream_available: false,
        graph_bootstrap_complete: false,
        graph_nodes_received: 0,
        ...overrides,
    };
}
check("label uses basename while folder is unlinked", projectLabel(base({ project_path: "/Users/me/code/pokedex" })) === "acme/pokedex");
check("label uses org slug and project slug", projectLabel(base({
    org_slug: "daryl-2",
    workspace_id: "9bb95643-47ee-410b-bc3f-f442475ea281",
    project_path: "/Users/me/code/graphify",
    project_id: "prj_1",
    project_slug: "graphify",
    project_display_name: "Graphify",
})) === "daryl-2/graphify");
check("label never shows a workspace UUID", projectLabel(base({
    org_slug: "9bb95643-47ee-410b-bc3f-f442475ea281",
    workspace_id: "9bb95643-47ee-410b-bc3f-f442475ea281",
    project_slug: "graphify",
})) === "graphify");
check("empty path with no project yields empty label", projectLabel(base()) === "");
check("humanName drops workspace UUID", humanName("9bb95643-47ee-410b-bc3f-f442475ea281") === "");
check("humanName drops project id", humanName("prj_11f75928-8c1b-4337-98d6-b0327b4b0ff1") === "");
check("humanName keeps a slug", humanName("graphify") === "graphify");
if (failures) {
    console.error(`${failures} session helper test(s) failed`);
    process.exit(1);
}
console.log("session helper tests passed");
