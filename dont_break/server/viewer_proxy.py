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

from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse, Response

from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.credentials import load_credentials
from dont_break.domain.errors import ApiErrorMessage, GatewayError
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.server.deps import gateway_from_app, session_store_from_app


def _tenant_context(request: Request) -> tuple[str, str] | None:
    store = session_store_from_app(request)
    workspace = resolve_workspace_id(store)
    project_slug = store.project_slug.strip()
    if not workspace or not project_slug:
        return None
    return workspace, project_slug


async def proxy_viewer_get(
    request: Request,
    suffix: str,
    *,
    extra_query: dict[str, str] | None = None,
) -> Response:
    """Proxy GET to gateway workspace viewer routes with local Bearer JWT."""
    creds = load_credentials()
    token = (creds.token or "").strip()
    if not token:
        return JSONResponse(
            {"error": ApiErrorMessage.NOT_AUTHENTICATED.value},
            status_code=401,
        )

    ctx = _tenant_context(request)
    if not ctx:
        return JSONResponse(
            {"error": ApiErrorMessage.MISSING_WORKSPACE_PROJECT.value},
            status_code=400,
        )
    workspace, project_slug = ctx

    params: dict[str, str] = dict(extra_query or {})
    for key, value in request.query_params.items():
        if key not in params:
            params[key] = value

    gateway: GatewayClient = gateway_from_app(request)
    owned = getattr(request.app.state, "gateway", None) is None
    try:
        res = await gateway.viewer_get(token, workspace, project_slug, suffix, query=params)
    except GatewayError as exc:
        return JSONResponse({"error": str(exc)}, status_code=502)
    finally:
        if owned:
            await gateway.aclose()

    content_type = res.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body: Any = res.json()
        except ValueError:
            body = {"raw": res.text}
        return JSONResponse(body, status_code=res.status_code)

    return Response(content=res.content, status_code=res.status_code, media_type=content_type or None)
