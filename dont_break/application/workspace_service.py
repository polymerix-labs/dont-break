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

"""Resolves workspace context from stored credentials and settings."""

from __future__ import annotations

from dataclasses import dataclass

from dont_break.application.session_store import SessionStore
from dont_break.config import Settings
from dont_break.credentials import StoredCredentials, load_credentials
from dont_break.domain.models import WorkspaceId
from dont_break.infrastructure.gateway import GatewayClient


@dataclass(frozen=True)
class WorkspaceContext:
    workspace_id: str


class WorkspaceService:
    def __init__(self, store: SessionStore, gateway: GatewayClient | None = None) -> None:
        self._store = store
        self._gateway = gateway

    def resolve_id(self, settings: Settings, creds: StoredCredentials | None = None) -> WorkspaceId:
        creds = creds or load_credentials()
        workspace = settings.org_override or creds.org_slug
        if not workspace.strip():
            raise RuntimeError("Missing workspace (org). Sign in again.")
        return WorkspaceId(workspace.strip())

    async def load(self, settings: Settings) -> WorkspaceContext:
        try:
            workspace_id = str(self.resolve_id(settings))
        except RuntimeError:
            creds = load_credentials()
            gateway = self._gateway or GatewayClient(settings)
            owned = self._gateway is None
            try:
                context = await gateway.get_context(creds.token.strip())
            finally:
                if owned:
                    await gateway.aclose()
            workspace_id = str(
                context.get("workspace_id")
                or context.get("workspace", {}).get("id")
                or ""
            ).strip()
            if not workspace_id:
                raise RuntimeError("No workspace is available for this token.")
        await self._store.set_workspace(workspace_id)
        return WorkspaceContext(workspace_id=workspace_id)
