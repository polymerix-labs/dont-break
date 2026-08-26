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

import { HOST_SOURCE, HostMessageType, VIEWER_PROTOCOL_VERSION, VIEWER_SOURCE, ViewerMessageType, } from "./hostProtocol";
import * as shared from "../../shared/wire/hostProtocol.mjs";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
check("v1 search-input", HostMessageType.SEARCH_INPUT === "search-input");
check("v1 search-pick", HostMessageType.SEARCH_PICK === "search-pick");
check("v1 toolbar-click", HostMessageType.TOOLBAR_CLICK === "toolbar-click");
check("v1 graph-reload", HostMessageType.GRAPH_RELOAD === "graph-reload");
check("v1 session-update", HostMessageType.SESSION_UPDATE === "session-update");
check("v1 viewer-ready", ViewerMessageType.VIEWER_READY === "viewer-ready");
check("v1 toolbar-sync", ViewerMessageType.TOOLBAR_SYNC === "toolbar-sync");
check("v1 search-results", ViewerMessageType.SEARCH_RESULTS === "search-results");
check("v2 overlay-zone", HostMessageType.OVERLAY_ZONE === "overlay-zone");
check("v2 overlay-path", HostMessageType.OVERLAY_PATH === "overlay-path");
check("v2 overlay-clear", HostMessageType.OVERLAY_CLEAR === "overlay-clear");
check("v2 focus-node", HostMessageType.FOCUS_NODE === "focus-node");
check("v2 node-selected", ViewerMessageType.NODE_SELECTED === "node-selected");
check("v3 overlay-candidates", HostMessageType.OVERLAY_CANDIDATES === "overlay-candidates");
check("v3 overlay-rejected", HostMessageType.OVERLAY_REJECTED === "overlay-rejected");
check("v3 simulation-probe", HostMessageType.SIMULATION_PROBE === "simulation-probe");
check("v3 simulation-impact", HostMessageType.SIMULATION_IMPACT === "simulation-impact");
check("v4 simulation-shield", HostMessageType.SIMULATION_SHIELD === "simulation-shield");
check("v4 protocol version", VIEWER_PROTOCOL_VERSION === 4);
check("shared protocol version", shared.VIEWER_PROTOCOL_VERSION === VIEWER_PROTOCOL_VERSION);
check("shared host source", shared.HOST_SOURCE === HOST_SOURCE);
check("shared viewer source", shared.VIEWER_SOURCE === VIEWER_SOURCE);
check("shared host message types", JSON.stringify(shared.HostMessageType) === JSON.stringify(HostMessageType));
check("shared viewer message types", JSON.stringify(shared.ViewerMessageType) === JSON.stringify(ViewerMessageType));
if (failures > 0) {
    console.error(`${failures} hostProtocol contract test(s) failed`);
    process.exit(1);
}
console.log("hostProtocol contract tests passed");
