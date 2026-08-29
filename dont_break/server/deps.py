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

"""FastAPI dependency providers."""

from __future__ import annotations

from fastapi import Request

from dont_break.application.auth_service import AuthService
from dont_break.application.hook_decision import HookDecisionService
from dont_break.application.hook_journal import GatewayHookJournal
from dont_break.application.hook_observations import HookObservationStore
from dont_break.application.lockdown import LockdownStore
from dont_break.application.recent_checks import RecentCheckStore
from dont_break.application.write_mode import WriteModeStore
from dont_break.application.project_service import ProjectService
from dont_break.application.protected_paths_cache import (
    GatewayProtectedPathsFetcher,
    ProtectedPathsCache,
)
from dont_break.application.session_store import SessionStore, get_session_store
from dont_break.application.sync_service import SyncService
from dont_break.application.watch_service import WatchService
from dont_break.application.workspace_service import WorkspaceService
from dont_break.config import Settings
from dont_break.credentials import load_credentials
from dont_break.infrastructure.credentials import CredentialStore
from dont_break.infrastructure.facts_extract import FactsExtractRunner
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.project.mapping import FolderProjectStore


def session_store_from_app(request: Request) -> SessionStore:
    store = getattr(request.app.state, "session_store", None)
    return store if store is not None else get_session_store()


def gateway_from_app(request: Request) -> GatewayClient:
    gateway = getattr(request.app.state, "gateway", None)
    if gateway is not None:
        return gateway
    return GatewayClient(Settings())


def get_session_store_dep(request: Request) -> SessionStore:
    return session_store_from_app(request)


def get_gateway_dep(request: Request) -> GatewayClient:
    return gateway_from_app(request)


def get_auth_service(request: Request) -> AuthService:
    return AuthService(
        session_store_from_app(request),
        gateway_from_app(request),
        CredentialStore(),
    )


def get_project_service(request: Request) -> ProjectService:
    return ProjectService(session_store_from_app(request))


def get_sync_service(request: Request) -> SyncService:
    return SyncService(
        session_store_from_app(request),
        gateway_from_app(request),
        FactsExtractRunner(),
    )


def get_workspace_service(request: Request) -> WorkspaceService:
    return WorkspaceService(session_store_from_app(request), gateway_from_app(request))


def build_watch_sync_runner(app):
    """One live sync run for the linked project, with the watcher's changed-path hint."""

    async def run(changed_paths):
        store = app.state.session_store
        gateway = app.state.gateway
        settings = Settings()
        sync = SyncService(store, gateway, FactsExtractRunner())
        workspace = await WorkspaceService(store, gateway).load(settings)
        project_path, project_id, _slug = ProjectService(store).require_project()
        await sync.sync(
            settings,
            workspace.workspace_id,
            project_id,
            project_path,
            changed_paths=changed_paths,
        )

    return run


def wire_app_services(app) -> None:
    settings = Settings()
    app.state.session_store = get_session_store()
    app.state.gateway = GatewayClient(settings)
    app.state.watch_service = WatchService(
        app.state.session_store,
        build_watch_sync_runner(app),
        list_files=FactsExtractRunner().list_files,
    )
    if getattr(app.state, "folder_projects", None) is None:
        app.state.folder_projects = FolderProjectStore()
    if getattr(app.state, "protected_paths_cache", None) is None:
        app.state.protected_paths_cache = ProtectedPathsCache(
            GatewayProtectedPathsFetcher(lambda: app.state.gateway),
            lambda: (load_credentials().token or "").strip(),
        )
    if getattr(app.state, "lockdown", None) is None:
        app.state.lockdown = LockdownStore()
    if getattr(app.state, "write_mode", None) is None:
        app.state.write_mode = WriteModeStore()
    if getattr(app.state, "recent_checks", None) is None:
        app.state.recent_checks = RecentCheckStore()
    if getattr(app.state, "hook_observations", None) is None:
        app.state.hook_observations = HookObservationStore()
    if getattr(app.state, "hook_decision", None) is None:
        app.state.hook_decision = HookDecisionService(
            app.state.protected_paths_cache,
            app.state.folder_projects,
            enforce_blocks=True,
            locks=app.state.lockdown,
            write_modes=app.state.write_mode,
            recent_checks=app.state.recent_checks,
        )
    if getattr(app.state, "hook_journal", None) is None:
        app.state.hook_journal = GatewayHookJournal(
            lambda: app.state.gateway,
            lambda: (load_credentials().token or "").strip(),
        )
