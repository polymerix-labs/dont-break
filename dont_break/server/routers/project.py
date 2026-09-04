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

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from dont_break.application.project_service import ProjectService
from dont_break.application.session_store import SessionStore
from dont_break.application.sync_service import SyncService
from dont_break.application.sync_cache import SyncStateCache
from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.application.workspace_service import WorkspaceService
from dont_break.config import Settings
from dont_break.credentials import load_credentials
from dont_break.domain.errors import GatewayError, ProjectLimitError
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.git.context import collect_git_context
from dont_break.git.identity import (
    origin_needs_reattach,
    parse_git_remote_url,
    sanitize_remote_url,
)
from dont_break.project.picker import PickerError
from dont_break.project.slug import project_slug_from_path
from dont_break.server.routes_constants import LocalRoutes
from dont_break.server.deps import (
    get_project_service,
    get_session_store_dep,
    get_sync_service,
    get_gateway_dep,
    get_workspace_service,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _workspace_id(store: SessionStore) -> str:
    return resolve_workspace_id(store)


def _project_row_id(item: dict[str, Any]) -> str:
    return str(item.get("id") or item.get("project_id") or "").strip()


def _row_display_name(item: dict[str, Any], fallback: str) -> str:
    return str(
        item.get("displayName") or item.get("display_name") or fallback
    ).strip() or fallback


def _row_git_url_key(item: dict[str, Any]) -> str:
    return str(item.get("gitUrlKey") or item.get("git_url_key") or "").strip()


def _folder_origin(project_path: str) -> tuple[str, str, str]:
    """Return sanitized `(remote_url, url_key, owner/repo)` from origin, or empty."""
    try:
        ctx = collect_git_context(Path(project_path))
    except RuntimeError:
        return "", "", ""
    remote = (ctx.remote_url or "").strip()
    if not remote:
        return "", "", ""
    parsed = parse_git_remote_url(remote)
    safe = sanitize_remote_url(remote)
    if parsed is None:
        return "", "", ""
    return safe, parsed.url_key, parsed.display_name


async def _link_row(
    project: ProjectService,
    store: SessionStore,
    item: dict[str, Any],
    *,
    workspace: str,
    fallback_name: str,
) -> None:
    workspace_id = str(
        item.get("workspaceId") or item.get("workspace_id") or workspace
    ).strip()
    if workspace_id:
        await store.set_workspace(workspace_id)
    name = _row_display_name(item, fallback_name)
    await project.link_registered_project(
        _project_row_id(item),
        project_slug=str(item.get("slug") or name),
        display_name=name,
        workspace_id=workspace_id,
    )


async def _ensure_registered_project(
    *,
    project: ProjectService,
    store: SessionStore,
    gateway: GatewayClient,
    display_name: str = "",
) -> None:
    """Create or attach a project by Git origin, never by folder name."""
    token = load_credentials().token.strip()
    workspace = _workspace_id(store)
    folder_name = (
        display_name.strip()
        or store.project_display_name.strip()
        or store.project_slug.strip()
        or (project_slug_from_path(store.project_path) if store.project_path else "")
    )
    remote_url, url_key, origin_label = (
        _folder_origin(store.project_path) if store.project_path else ("", "", "")
    )
    name = origin_label or folder_name
    if not token or not workspace or not name:
        raise RuntimeError("Sign in and choose a folder before syncing.")

    try:
        existing = await gateway.list_projects(token)
    except GatewayError:
        existing = []

    linked_id = store.project_id.strip()
    linked = next((item for item in existing if _project_row_id(item) == linked_id), None)
    if linked_id and linked:
        linked_key = _row_git_url_key(linked)
        if not origin_needs_reattach(url_key, linked_key):
            return
        logger.info(
            "origin changed on %s; re-resolving %s -> %s",
            linked_id,
            linked_key or "(local-only)",
            url_key,
        )
    elif linked_id:
        logger.warning("linked project %s missing remotely; re-registering %s", linked_id, name)

    if url_key:
        match = next(
            (item for item in existing if _row_git_url_key(item) == url_key),
            None,
        )
        if match:
            await _link_row(
                project, store, match, workspace=workspace, fallback_name=name
            )
            return

    payload = await gateway.create_project(
        token, workspace, name, remote_url=remote_url
    )
    created = payload.get("project", payload) if isinstance(payload, dict) else {}
    if not isinstance(created, dict):
        created = {}
    project_id = _project_row_id(created)
    if not project_id:
        raise RuntimeError("Gateway created a project without an id.")
    await _link_row(project, store, created, workspace=workspace, fallback_name=name)


@router.post(LocalRoutes.PROJECT_PICK)
async def pick_project(
    project: ProjectService = Depends(get_project_service),
    store: SessionStore = Depends(get_session_store_dep),
    gateway: GatewayClient = Depends(get_gateway_dep),
) -> JSONResponse:
    try:
        picked, slug = await project.pick_folder()
    except PickerError as exc:
        logger.warning("project pick failed: %s", exc)
        return JSONResponse({"error": str(exc)}, status_code=400)
    except Exception as exc:
        logger.exception("project pick error")
        return JSONResponse({"error": str(exc)}, status_code=500)

    try:
        await _ensure_registered_project(
            project=project,
            store=store,
            gateway=gateway,
            display_name=slug.value,
        )
    except (GatewayError, RuntimeError) as exc:
        logger.warning("auto-create project after pick failed: %s", exc)
        return JSONResponse({"error": str(exc)}, status_code=502)

    workspace = _workspace_id(store)
    return JSONResponse(
        {
            "path": picked.value,
            "project_slug": store.project_slug or slug.value,
            "project_id": store.project_id,
            "workspace_id": workspace,
        }
    )


@router.get(LocalRoutes.PROJECTS)
async def list_projects(gateway: GatewayClient = Depends(get_gateway_dep)) -> JSONResponse:
    token = load_credentials().token.strip()
    if not token:
        return JSONResponse({"error": "Sign in first."}, status_code=401)
    try:
        return JSONResponse({"projects": await gateway.list_projects(token)})
    except GatewayError as exc:
        return JSONResponse({"error": str(exc)}, status_code=502)


@router.post(LocalRoutes.PROJECT_LINK)
async def link_project(
    body: dict[str, Any],
    project: ProjectService = Depends(get_project_service),
    store: SessionStore = Depends(get_session_store_dep),
) -> JSONResponse:
    try:
        await project.link_registered_project(
            str(body.get("project_id") or ""),
            project_slug=str(body.get("slug") or body.get("display_name") or ""),
            display_name=str(body.get("display_name") or ""),
            workspace_id=resolve_workspace_id(store),
        )
    except RuntimeError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    return JSONResponse(store.snapshot().to_json())


@router.post(LocalRoutes.PROJECT_CREATE)
async def create_project(
    body: dict[str, Any],
    project: ProjectService = Depends(get_project_service),
    store: SessionStore = Depends(get_session_store_dep),
    gateway: GatewayClient = Depends(get_gateway_dep),
) -> JSONResponse:
    display_name = str(body.get("display_name") or "").strip()
    try:
        await _ensure_registered_project(
            project=project,
            store=store,
            gateway=gateway,
            display_name=display_name,
        )
    except (GatewayError, RuntimeError) as exc:
        return JSONResponse({"error": str(exc)}, status_code=502)
    return JSONResponse(store.snapshot().to_json())


@router.post(LocalRoutes.PROJECT_SYNC)
async def sync_project(
    project: ProjectService = Depends(get_project_service),
    sync: SyncService = Depends(get_sync_service),
    workspace_svc: WorkspaceService = Depends(get_workspace_service),
    gateway: GatewayClient = Depends(get_gateway_dep),
    store: SessionStore = Depends(get_session_store_dep),
) -> JSONResponse:
    try:
        if not store.project_path:
            raise RuntimeError("Pick a project folder first.")

        await _ensure_registered_project(
            project=project, store=store, gateway=gateway
        )
        project_path, project_id, project_slug = project.require_project()
    except RuntimeError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    except GatewayError as exc:
        return JSONResponse({"error": str(exc)}, status_code=502)

    settings = Settings()
    try:
        workspace = await workspace_svc.load(settings)
        result = await sync.sync(
            settings,
            workspace.workspace_id,
            project_id,
            project_path,
        )
        return JSONResponse(
            {
                "saved": result.get("saved") is True,
                "workspace_id": workspace.workspace_id,
                "project_id": project_id,
                "project_slug": project_slug,
            }
        )
    except ProjectLimitError as exc:
        return JSONResponse({"error": str(exc)}, status_code=409)
    except RuntimeError as exc:
        return JSONResponse({"error": str(exc)}, status_code=502)


@router.post(LocalRoutes.PROJECT_WATCH)
async def set_project_watch(
    body: dict[str, Any],
    store: SessionStore = Depends(get_session_store_dep),
) -> JSONResponse:
    """Enable/disable live filesystem sync for the linked project (persisted)."""
    if "enabled" not in body:
        return JSONResponse({"error": "enabled is required"}, status_code=400)
    enabled = bool(body.get("enabled"))
    await store.set_live_sync_enabled(enabled)
    project_id = store.project_id.strip()
    if project_id:
        cache = SyncStateCache(project_id)
        cache.live_sync_enabled = enabled
        try:
            cache.save()
        except OSError:
            pass
    return JSONResponse(store.snapshot().to_json())
