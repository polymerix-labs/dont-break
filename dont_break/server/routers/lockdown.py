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

"""Human-facing lockdown status, release, and policy. Local store is authority."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from dont_break.application.lockdown import NEVER, LockdownStore
from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.credentials import load_credentials
from dont_break.infrastructure.gateway_routes import GatewayRoutes
from dont_break.server.deps import gateway_from_app, session_store_from_app
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


def _tenant(request: Request) -> tuple[str, str] | None:
    store = session_store_from_app(request)
    workspace = resolve_workspace_id(store)
    slug = store.project_slug.strip()
    if not workspace or not slug:
        return None
    return workspace, slug


def _locks(request: Request) -> LockdownStore | None:
    return getattr(request.app.state, "lockdown", None)


def _remaining_payload(remaining: float | None) -> int | None:
    if remaining is None:
        return None
    return int(remaining)


def _status_body(locks: LockdownStore, workspace_id: str, project_slug: str) -> dict:
    entry = locks.current(workspace_id, project_slug)
    ttl = locks.default_ttl_sec
    return {
        "locked": entry is not None,
        "scope": entry.scope if entry is not None else locks.default_scope,
        "remaining_sec": None
        if entry is None
        else _remaining_payload(locks.remaining_sec(entry)),
        "policy": {
            "scope": locks.default_scope,
            "ttl_sec": -1 if ttl == NEVER or ttl < 0 else int(ttl),
        },
    }


@router.get(LocalRoutes.LOCKDOWN)
async def lockdown_status(request: Request) -> JSONResponse:
    tenant = _tenant(request)
    locks = _locks(request)
    if tenant is None or locks is None:
        return JSONResponse(
            {
                "locked": False,
                "scope": "session",
                "remaining_sec": None,
                "policy": {"scope": "session", "ttl_sec": 1800},
            }
        )
    return JSONResponse(_status_body(locks, tenant[0], tenant[1]))


@router.post(LocalRoutes.LOCKDOWN_RELEASE)
async def lockdown_release(request: Request) -> JSONResponse:
    tenant = _tenant(request)
    locks = _locks(request)
    if tenant is None or locks is None:
        return JSONResponse({"released": False})
    workspace_id, project_slug = tenant
    locks.release(workspace_id, project_slug)
    token = (load_credentials().token or "").strip()
    if token:
        try:
            gateway = gateway_from_app(request)
            path = GatewayRoutes.rules(workspace_id, project_slug, "/lockdown/release")
            await gateway.api_request(token, "POST", path, json_body={})
        except Exception:
            pass
    return JSONResponse({"released": True, **_status_body(locks, workspace_id, project_slug)})


@router.put(LocalRoutes.LOCKDOWN_POLICY)
async def lockdown_policy(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        body = {}
    scope = str(body.get("scope") or "session")
    if scope not in ("session", "project"):
        scope = "session"
    ttl_raw = body.get("ttl_sec")
    ttl = float(ttl_raw) if isinstance(ttl_raw, (int, float)) else 1800.0
    tenant = _tenant(request)
    locks = _locks(request)
    if locks is not None:
        locks.set_policy(scope, ttl)
    if tenant is not None:
        token = (load_credentials().token or "").strip()
        if token:
            try:
                gateway = gateway_from_app(request)
                path = GatewayRoutes.rules(tenant[0], tenant[1], "/lockdown/policy")
                await gateway.api_request(
                    token,
                    "PUT",
                    path,
                    json_body={
                        "scope": scope,
                        "ttl_sec": -1 if ttl < 0 or ttl == NEVER else int(ttl),
                    },
                )
            except Exception:
                pass
    if tenant is None or locks is None:
        return JSONResponse(
            {
                "policy": {
                    "scope": scope,
                    "ttl_sec": -1 if ttl < 0 or ttl == NEVER else int(ttl),
                }
            }
        )
    return JSONResponse(_status_body(locks, tenant[0], tenant[1]))
