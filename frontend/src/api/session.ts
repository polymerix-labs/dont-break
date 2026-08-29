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

import type { SyncPhase as SyncPhaseType } from "../wire/sync";
const OPAQUE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isOpaqueId(value: string | undefined): boolean {
    const text = value?.trim() ?? "";
    return text.length > 0 && (OPAQUE_ID.test(text) || text.startsWith("prj_"));
}
export function humanName(value: string | undefined, fallback = ""): string {
    const text = value?.trim() ?? "";
    if (!text || isOpaqueId(text))
        return fallback;
    return text;
}
export type SessionSnapshot = {
    authenticated: boolean;
    org_slug: string;
    org_name?: string;
    workspace_id: string;
    project_path: string;
    project_id: string;
    project_slug: string;
    project_display_name: string;
    app_version?: string;
    account_url?: string;
    support_url?: string;
    snapshot_saved: boolean;
    graph_error: string;
    graph_stream_available: boolean;
    graph_bootstrap_complete: boolean;
    graph_nodes_received: number;
    sync_phase?: SyncPhaseType | string;
    sync_session_id?: string;
    graph_version?: number;
    coverage_pct?: number;
    sync_progress_label?: string;
    sync_upload_mode?: string;
    live_sync_enabled?: boolean;
    watch_status?: string;
    watch_error?: string;
    last_synced_at?: number;
};
export function projectLabel(session: SessionSnapshot): string {
    const org = isOpaqueId(session.org_slug) ? "" : session.org_slug.trim();
    const project = session.project_slug.trim() || folderBasename(session.project_path);
    if (!project)
        return "";
    return org ? `${org}/${project}` : project;
}
function folderBasename(path: string): string {
    const trimmed = path.trim().replace(/[/\\]+$/, "");
    if (!trimmed)
        return "";
    const parts = trimmed.split(/[/\\]/);
    return parts[parts.length - 1] || trimmed;
}
export function sessionKey(session: SessionSnapshot): string {
    const ws = session.workspace_id || session.org_slug || "ws";
    return `${ws}/${session.project_slug || "none"}`;
}
