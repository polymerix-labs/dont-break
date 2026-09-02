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

"""Local proxies for the gateway assist surface (Rule Studio runs).

The run endpoint is a live SSE stream piped byte for byte from the gateway;
the local server adds the Bearer JWT and the tenant resolved from the
session store, nothing else. The replay endpoint is a plain JSON proxy.
"""

from __future__ import annotations

from typing import AsyncIterator

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse

from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.credentials import load_credentials
from dont_break.domain.errors import ApiErrorMessage, GatewayError
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.infrastructure.gateway_routes import GatewayRoutes
from dont_break.infrastructure.tenant import session_project_key
from dont_break.server.deps import gateway_from_app, session_store_from_app
from dont_break.server.gateway_proxy import proxy_api_request
from dont_break.server.routes_constants import AssistProxyRoutes

router = APIRouter()

SSE_HEADERS = {
    "cache-control": "no-cache",
    "x-accel-buffering": "no",
}


@router.post(AssistProxyRoutes.RULES)
async def assist_rules(request: Request):
    """Starts a Rule Studio run and pipes the gateway SSE stream live."""
    creds = load_credentials()
    token = (creds.token or "").strip()
    if not token:
        return JSONResponse(
            {"error": ApiErrorMessage.NOT_AUTHENTICATED.value}, status_code=401
        )

    store = session_store_from_app(request)
    workspace = resolve_workspace_id(store)
    folders = getattr(request.app.state, "folder_projects", None)
    project_key = session_project_key(store, folders)
    if not workspace or not project_key:
        return JSONResponse(
            {"error": ApiErrorMessage.MISSING_WORKSPACE_PROJECT.value},
            status_code=400,
        )

    body = await request.json()
    path = GatewayRoutes.assist(workspace, project_key, AssistProxyRoutes.RULES_SUFFIX)

    gateway: GatewayClient = gateway_from_app(request)
    owned = getattr(request.app.state, "gateway", None) is None

    async def close_all() -> None:
        if owned:
            await gateway.aclose()

    try:
        upstream = await gateway.open_sse_stream(token, path, body)
    except GatewayError as exc:
        await close_all()
        return JSONResponse({"error": str(exc)}, status_code=502)

    if upstream.status_code >= 400:
        content = await upstream.aread()
        await upstream.aclose()
        await close_all()
        media_type = upstream.headers.get("content-type", "application/json")
        return Response(
            content=content, status_code=upstream.status_code, media_type=media_type
        )

    async def stream() -> AsyncIterator[bytes]:
        try:
            async for chunk in upstream.aiter_bytes():
                yield chunk
        finally:
            await upstream.aclose()
            await close_all()

    return StreamingResponse(
        stream(), media_type="text/event-stream", headers=SSE_HEADERS
    )


@router.get(AssistProxyRoutes.RUN_EVENTS)
async def assist_run_events(request: Request, run_id: str):
    """Replay for reconnecting clients: the recorded event list of a run."""
    return await proxy_api_request(
        request, "assist", "GET", AssistProxyRoutes.run_events_suffix(run_id)
    )
