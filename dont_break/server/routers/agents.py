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

"""Connect-your-agent endpoints for the local UI.

GET setup is read-only. Mint/regenerate call the gateway with the local
session JWT to create a project-scoped `dbt_` token for MCP/CLI copy-paste.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from dont_break.application.agent_connect import (
    MintTokenError,
    SkillInstallError,
    build_agent_setup,
    install_skill,
    mint_agent_mcp_token,
    regenerate_agent_mcp_token,
)
from dont_break.application.session_store import SessionStore
from dont_break.config import Settings
from dont_break.credentials import load_credentials
from dont_break.hooks.install import hook_status, install_hook
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.server.deps import get_gateway_dep, get_session_store_dep
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


@router.get(LocalRoutes.AGENTS_SETUP)
async def agents_setup(
    store: SessionStore = Depends(get_session_store_dep),
    gateway: GatewayClient = Depends(get_gateway_dep),
) -> JSONResponse:
    payload = await build_agent_setup(Settings(), store, load_credentials(), gateway=gateway)
    status = hook_status()
    payload["hook_installed"] = status["installed"]
    payload["hook_manual"] = status["manual"]
    payload["hook_command"] = status["command"]
    return JSONResponse(payload)


@router.post(LocalRoutes.AGENTS_MINT_TOKEN)
async def agents_mint_token(
    request: Request,
    store: SessionStore = Depends(get_session_store_dep),
    gateway: GatewayClient = Depends(get_gateway_dep),
) -> JSONResponse:
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    target = str(body.get("target") or "cursor").strip() if isinstance(body, dict) else "cursor"
    try:
        payload = await mint_agent_mcp_token(
            Settings(), store, load_credentials(), gateway=gateway, target=target
        )
    except MintTokenError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    return JSONResponse(payload)


@router.post(LocalRoutes.AGENTS_REGENERATE_TOKEN)
async def agents_regenerate_token(
    request: Request,
    store: SessionStore = Depends(get_session_store_dep),
    gateway: GatewayClient = Depends(get_gateway_dep),
) -> JSONResponse:
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    previous = ""
    target = "cursor"
    if isinstance(body, dict):
        previous = str(body.get("previous_token_id") or "").strip()
        target = str(body.get("target") or "cursor").strip()
    try:
        payload = await regenerate_agent_mcp_token(
            Settings(),
            store,
            load_credentials(),
            previous_token_id=previous,
            gateway=gateway,
            target=target,
        )
    except MintTokenError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    return JSONResponse(payload)


@router.post(LocalRoutes.AGENTS_SKILL_INSTALL)
async def agents_skill_install(
    store: SessionStore = Depends(get_session_store_dep),
) -> JSONResponse:
    try:
        result = install_skill(store.project_path)
    except SkillInstallError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    return JSONResponse(result)


@router.get(LocalRoutes.AGENTS_HOOK_STATUS)
async def agents_hook_status() -> JSONResponse:
    return JSONResponse(hook_status())


@router.post(LocalRoutes.AGENTS_HOOK_INSTALL)
async def agents_hook_install() -> JSONResponse:
    return JSONResponse(install_hook())
