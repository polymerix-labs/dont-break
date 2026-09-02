# Copyright 2026 Polymerix
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Polymerix gateway API path builders."""

from __future__ import annotations

from urllib.parse import quote


class GatewayRoutes:
    """Upstream gateway REST path templates."""

    ME = "/api/v1/me"
    ME_CONTEXT = "/api/v1/me/context"
    ME_PROJECTS = "/api/v1/me/projects"
    ME_TOKENS = "/api/v1/me/tokens"
    PROJECTS = "/api/v1/projects"
    API_V1 = "/api/v1"

    @staticmethod
    def me_token(token_id: str) -> str:
        return f"/api/v1/me/tokens/{quote(token_id)}"

    @staticmethod
    def sync_sessions(workspace_id: str, project_key: str) -> str:
        """Tenant sync-sessions path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/sync/sessions"

    @staticmethod
    def project_sync_sessions(project_id: str) -> str:
        return f"/api/v1/projects/{quote(project_id)}/sync/sessions"

    @staticmethod
    def sync_session(session_id: str) -> str:
        return f"/api/v1/sync/sessions/{quote(session_id)}"

    @staticmethod
    def sync_upload_url(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/upload-url"

    @staticmethod
    def sync_upload_plan(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/upload-plan"

    @staticmethod
    def sync_complete(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/complete"

    @staticmethod
    def sync_part_uploaded(session_id: str, part_id: str) -> str:
        sid = quote(session_id)
        pid = quote(part_id)
        return f"/api/v1/sync/sessions/{sid}/parts/{pid}/uploaded"

    @staticmethod
    def sync_retry_build(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/retry-build"

    @staticmethod
    def sync_file(session_id: str, file_index: int) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/files/{file_index}"

    @staticmethod
    def sync_files_batch(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/files-batch"

    @staticmethod
    def sync_seal(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/seal"

    @staticmethod
    def sync_events(session_id: str) -> str:
        return f"{GatewayRoutes.sync_session(session_id)}/events"

    @staticmethod
    def viewer(workspace_id: str, project_key: str, suffix: str) -> str:
        """Tenant viewer path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/viewer{suffix}"

    @staticmethod
    def graph_stream(workspace_id: str, project_key: str) -> str:
        """Tenant graph WebSocket path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/graph/stream"

    @staticmethod
    def query(workspace_id: str, project_key: str, suffix: str) -> str:
        """Tenant query path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/query{suffix}"

    @staticmethod
    def rules(workspace_id: str, project_key: str, suffix: str = "") -> str:
        """Tenant rules path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/rules{suffix}"

    @staticmethod
    def assist(workspace_id: str, project_key: str, suffix: str = "") -> str:
        """Tenant assist path. ``project_key`` is a registered id, not a display name."""
        ws = quote(workspace_id)
        key = quote(project_key)
        return f"/api/v1/workspaces/{ws}/projects/{key}/assist{suffix}"


class GatewayHeaders:
    """Standard gateway request header names and values."""

    AUTHORIZATION = "Authorization"
    ACCEPT = "Accept"
    CONTENT_TYPE = "Content-Type"
    CLIENT = "X-Polymerix-Client"
    EXTENSION_VERSION = "X-Polymerix-Extension-Version"
    INSTALL_ID = "X-Polymerix-Install-Id"
    OS = "X-Polymerix-Os"
    IDEMPOTENCY_KEY = "Idempotency-Key"
    SSE_ACCEPT = "text/event-stream"
    JSON_ACCEPT = "application/json"
    JSON_CONTENT = "application/json"

    @staticmethod
    def bearer(token: str) -> str:
        return f"Bearer {token}"
