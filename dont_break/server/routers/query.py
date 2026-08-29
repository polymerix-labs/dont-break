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

"""Local proxies for the gateway query surface (phase 1 + phase 3 check)."""

from __future__ import annotations

import json

from fastapi import APIRouter, Request

from dont_break.application.recent_checks import LOCAL
from dont_break.server.gateway_proxy import proxy_api_request
from dont_break.server.routes_constants import QueryProxyRoutes

router = APIRouter()


@router.get(QueryProxyRoutes.FIND)
async def query_find(request: Request):
    return await proxy_api_request(request, "query", "GET", QueryProxyRoutes.FIND_SUFFIX)


@router.get(QueryProxyRoutes.SEMANTIC_FIND)
async def query_semantic_find(request: Request):
    """Semantic KNN search; a gateway 409 (embeddings not ready) passes
    through untouched so the frontend can fall back to lexical find."""
    return await proxy_api_request(
        request, "query", "GET", QueryProxyRoutes.SEMANTIC_FIND_SUFFIX
    )


@router.post(QueryProxyRoutes.IMPACT)
async def query_impact(request: Request):
    body = await request.json()
    return await proxy_api_request(
        request, "query", "POST", QueryProxyRoutes.IMPACT_SUFFIX, json_body=body
    )


@router.get(QueryProxyRoutes.PATH)
async def query_path(request: Request):
    return await proxy_api_request(request, "query", "GET", QueryProxyRoutes.PATH_SUFFIX)


@router.get(QueryProxyRoutes.DO_NOT_TOUCH)
async def query_do_not_touch(request: Request):
    return await proxy_api_request(
        request, "query", "GET", QueryProxyRoutes.DO_NOT_TOUCH_SUFFIX
    )


@router.get(QueryProxyRoutes.ARCH_STATUS)
async def query_arch_status(request: Request):
    return await proxy_api_request(
        request, "query", "GET", QueryProxyRoutes.ARCH_STATUS_SUFFIX
    )


@router.get(QueryProxyRoutes.CHECK)
async def query_check(request: Request):
    response = await proxy_api_request(request, "query", "GET", QueryProxyRoutes.CHECK_SUFFIX)
    try:
        _remember_proxy_check(request, response)
    except Exception:
        pass
    return response


def _remember_proxy_check(request: Request, response) -> None:
    checks = getattr(request.app.state, "recent_checks", None)
    if checks is None or getattr(response, "status_code", 500) >= 400:
        return
    raw = getattr(response, "body", b"") or b""
    try:
        body = json.loads(raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else raw)
    except (ValueError, AttributeError, UnicodeDecodeError):
        return
    if not isinstance(body, dict):
        return
    files = body.get("files") or []
    if files and isinstance(files[0], dict):
        checks.ingest_file_verdicts(
            files,
            fallback_verdict=str(body.get("verdict") or "ok"),
            source=LOCAL,
            verdict_basis=str(body.get("verdict_basis") or ""),
        )
        return
    seeds = [item for item in request.query_params.get("files", "").split(",") if item]
    if seeds:
        checks.remember_event_files(
            seeds,
            str(body.get("verdict") or "ok"),
            source=LOCAL,
            verdict_basis=str(body.get("verdict_basis") or ""),
        )


@router.post(QueryProxyRoutes.SIMULATE_RULE)
async def query_simulate_rule(request: Request):
    """Dry-run of a draft rule against probes; the gateway validates the
    draft and stamps its placeholder id, nothing is persisted anywhere."""
    body = await request.json()
    return await proxy_api_request(
        request, "query", "POST", QueryProxyRoutes.SIMULATE_RULE_SUFFIX, json_body=body
    )
