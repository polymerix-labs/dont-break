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

"""FastAPI application lifespan."""

from __future__ import annotations

import asyncio
import contextlib
import datetime
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.credentials import load_credentials
from dont_break.infrastructure.gateway_routes import GatewayRoutes
from dont_break.server.deps import wire_app_services
from dont_break.server.static_root import static_root

logger = logging.getLogger(__name__)


async def refresh_recent_checks(app: FastAPI) -> None:
    """Pull recent check_change events into the local permit store."""
    checks = getattr(app.state, "recent_checks", None)
    gateway = getattr(app.state, "gateway", None)
    store = getattr(app.state, "session_store", None)
    if checks is None or gateway is None or store is None:
        return
    token = (load_credentials().token or "").strip()
    workspace = resolve_workspace_id(store)
    slug = store.project_slug.strip()
    if not token or not workspace or not slug:
        return
    path = GatewayRoutes.rules(workspace, slug, "/activity")
    response = await gateway.api_request(token, "GET", path)
    if response.status_code >= 400:
        return
    try:
        body = response.json()
    except ValueError:
        return
    if not isinstance(body, dict):
        return
    for event in body.get("events") or []:
        if not isinstance(event, dict):
            continue
        files = event.get("files") or []
        verdict = str(event.get("verdict") or "ok")
        raw_at = event.get("at")
        stamp = None
        if isinstance(raw_at, str):
            try:
                stamp = datetime.datetime.fromisoformat(
                    raw_at.replace("Z", "+00:00")
                ).timestamp()
            except ValueError:
                stamp = None
        checks.remember_event_files(
            [str(item) for item in files if item],
            verdict,
            at=stamp,
            conversation_id=str(event.get("agent_session_id") or ""),
            source="activity",
        )


async def freshness_poller(app: FastAPI) -> None:
    """Compare rules_version for cached tenants; reload protected paths only on change."""
    cache = getattr(app.state, "protected_paths_cache", None)
    if cache is None:
        return
    interval = getattr(cache, "poll_interval", 5.0)
    try:
        await refresh_recent_checks(app)
    except Exception:
        logger.exception("recent-check poll failed")
    while True:
        await asyncio.sleep(interval)
        try:
            await cache.poll()
        except Exception:
            logger.exception("protected-paths freshness poll failed")
        try:
            await refresh_recent_checks(app)
        except Exception:
            logger.exception("recent-check poll failed")


async def watch_supervisor(app: FastAPI) -> None:
    """Starts/stops the live-sync watcher as the linked project or the toggle changes."""
    store = app.state.session_store
    watch = app.state.watch_service
    queue = store.subscribe()
    active_key: tuple[str, bool] | None = None
    try:
        while True:
            path = store.project_path.strip()
            enabled = store.live_sync_enabled and bool(path) and bool(store.project_id)
            key = (path, True) if enabled else None
            if key != active_key:
                try:
                    if key is None:
                        await watch.stop()
                    else:
                        await watch.start(Path(path))
                except Exception:
                    logger.exception("watch supervisor transition failed")
                active_key = key
            await queue.get()
    finally:
        store.unsubscribe(queue)
        await watch.stop()


@asynccontextmanager
async def lifespan(app: FastAPI):
    wire_app_services(app)
    root = static_root()
    app_mjs = root / "nebula" / "app.mjs"
    has_policy = False
    if app_mjs.is_file():
        has_policy = "readyStatusFromMessage" in app_mjs.read_text(encoding="utf-8")
    print(f"[dont-break] static root: {root}")
    print(f"[dont-break] viewer app.mjs policy module: {'ok' if has_policy else 'STALE — run: cd frontend && npm run build'}")
    supervisor = asyncio.create_task(watch_supervisor(app))
    poller = asyncio.create_task(freshness_poller(app))
    yield
    supervisor.cancel()
    poller.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await supervisor
    with contextlib.suppress(asyncio.CancelledError):
        await poller
    gateway = getattr(app.state, "gateway", None)
    if gateway is not None:
        await gateway.aclose()
