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

import asyncio
import json
import logging
from typing import Any

import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from dont_break.application.session_store import get_session_store
from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.config import Settings
from dont_break.credentials import load_credentials
from dont_break.domain.wire import GraphStreamErrorCode, GraphStreamInboundType
from dont_break.infrastructure.gateway_routes import GatewayHeaders, GatewayRoutes
from dont_break.infrastructure.tenant import session_project_key
from dont_break.server.routes_constants import LocalRoutes
from dont_break.server.ws_codes import WS_CLOSE_REASON, WsCloseCode

logger = logging.getLogger(__name__)
router = APIRouter()


def _api_ws_base(settings: Settings) -> str:
    base = settings.api_base_url.rstrip("/")
    if base.startswith("https://"):
        return "wss://" + base[len("https://") :]
    if base.startswith("http://"):
        return "ws://" + base[len("http://") :]
    return "ws://" + base


async def _relay_graph_stream(
    websocket: WebSocket,
    upstream_url: str,
    headers: dict[str, str],
    store: Any,
) -> None:
    async with websockets.connect(upstream_url, additional_headers=headers) as upstream:

        async def client_to_upstream() -> None:
            try:
                while True:
                    raw = await websocket.receive_text()
                    await upstream.send(raw)
            except WebSocketDisconnect:
                pass

        async def upstream_to_client() -> None:
            try:
                async for message in upstream:
                    text = message if isinstance(message, str) else message.decode("utf-8")
                    try:
                        parsed: dict[str, Any] = json.loads(text)
                        await store.on_graph_message(parsed)
                    except json.JSONDecodeError:
                        pass
                    await websocket.send_text(text)
            except websockets.exceptions.ConnectionClosed:
                pass

        await asyncio.gather(
            client_to_upstream(),
            upstream_to_client(),
            return_exceptions=True,
        )


@router.websocket(LocalRoutes.WS_GRAPH)
async def graph_stream_proxy(websocket: WebSocket) -> None:
    """Relay Nebula graph WS to the gateway using the registered project id."""
    store = get_session_store()
    settings = Settings()
    creds = load_credentials()
    token = (creds.token or "").strip()
    if not token:
        reason = WS_CLOSE_REASON[WsCloseCode.NOT_AUTHENTICATED].value
        await websocket.close(code=int(WsCloseCode.NOT_AUTHENTICATED), reason=reason)
        return

    org = resolve_workspace_id(store, creds)
    folders = getattr(websocket.app.state, "folder_projects", None)
    project_key = session_project_key(store, folders)
    if not org or not project_key:
        reason = WS_CLOSE_REASON[WsCloseCode.MISSING_CONTEXT].value
        await websocket.close(code=int(WsCloseCode.MISSING_CONTEXT), reason=reason)
        return

    upstream_url = f"{_api_ws_base(settings)}{GatewayRoutes.graph_stream(org, project_key)}"
    headers = {GatewayHeaders.AUTHORIZATION: GatewayHeaders.bearer(token)}

    await websocket.accept()
    await store.on_graph_stream_open()

    try:
        await _relay_graph_stream(websocket, upstream_url, headers, store)
    except Exception as exc:
        logger.warning("graph stream proxy failed: %s", exc)
        try:
            await websocket.send_text(
                json.dumps(
                    {
                        "t": GraphStreamInboundType.ERROR.value,
                        "code": GraphStreamErrorCode.PROXY_FAILED.value,
                        "message": str(exc),
                    }
                )
            )
        except Exception:
            pass
    finally:
        await store.on_graph_stream_close()
