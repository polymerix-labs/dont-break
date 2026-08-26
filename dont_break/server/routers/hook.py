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

"""Local hook decision endpoint. Bound to 127.0.0.1; the Cursor hook has no JWT."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from dont_break.application.hook_decision import allow
from dont_break.application.hook_journal import emit_quietly
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


@router.post(LocalRoutes.HOOK_DECISION)
async def hook_decision(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(allow().as_hook_response())
    if not isinstance(body, dict):
        return JSONResponse(allow().as_hook_response())
    service = getattr(request.app.state, "hook_decision", None)
    if service is None:
        return JSONResponse(allow().as_hook_response())
    decision = await service.decide(body)
    await emit_quietly(getattr(request.app.state, "hook_journal", None), decision)
    return JSONResponse(decision.as_hook_response())


@router.post(LocalRoutes.HOOK_SUBAGENT)
async def hook_subagent(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": True})
    locks = getattr(request.app.state, "lockdown", None)
    if locks is None or not isinstance(body, dict):
        return JSONResponse({"ok": True})
    try:
        locks.remember_subagent(
            str(body.get("conversation_id") or ""),
            str(body.get("parent_conversation_id") or ""),
        )
    except Exception:
        pass
    return JSONResponse({"ok": True})
