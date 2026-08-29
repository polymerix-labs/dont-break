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

from time import time

from dont_break.application.hook_decision import allow, deny_unverified
from dont_break.application.hook_journal import emit_quietly
from dont_break.application.recent_checks import LOCAL
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


def hard_on_this_machine(request: Request, body: dict | None = None) -> bool:
    """True when Hard is on for this write, or for the project open in the app."""
    modes = getattr(request.app.state, "write_mode", None)
    if modes is None:
        return False
    if body:
        root = str(body.get("workspace_root") or "").strip()
        if root and modes.is_hard(root):
            return True
    store = getattr(request.app.state, "session_store", None)
    folder = str(getattr(store, "project_path", "") or "").strip() if store else ""
    return bool(folder and modes.is_hard(folder))


@router.post(LocalRoutes.HOOK_DECISION)
async def hook_decision(request: Request) -> JSONResponse:
    """Decide a hook write. Hard mode fail-closes on garbage or a down service."""
    try:
        body = await request.json()
    except Exception:
        body = None
    if not isinstance(body, dict):
        if hard_on_this_machine(request, None):
            return JSONResponse(deny_unverified().as_hook_response())
        return JSONResponse(allow().as_hook_response())
    service = getattr(request.app.state, "hook_decision", None)
    if service is None:
        if hard_on_this_machine(request, body):
            return JSONResponse(deny_unverified().as_hook_response())
        return JSONResponse(allow().as_hook_response())
    try:
        decision = await service.decide(body)
    except Exception:
        if service.is_hard(body) or hard_on_this_machine(request, body):
            return JSONResponse(deny_unverified().as_hook_response())
        return JSONResponse(allow().as_hook_response())
    store = getattr(request.app.state, "hook_observations", None)
    if store is not None:
        try:
            store.append(
                {
                    "at": time(),
                    "permission": decision.permission,
                    "relative_path": decision.relative_path,
                    "tool_name": decision.tool_name,
                    "conversation_id": decision.conversation_id,
                    "rule_id": decision.matched.rule_id if decision.matched else "",
                    **decision.extra,
                }
            )
        except Exception:
            pass
    await emit_quietly(getattr(request.app.state, "hook_journal", None), decision)
    return JSONResponse(decision.as_hook_response())


@router.get(LocalRoutes.HOOK_OBSERVATIONS)
async def hook_observations(request: Request) -> JSONResponse:
    store = getattr(request.app.state, "hook_observations", None)
    if store is None:
        return JSONResponse({"observations": []})
    return JSONResponse({"observations": store.recent()})


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


@router.post(LocalRoutes.HOOK_PERMIT)
async def hook_permit(request: Request) -> JSONResponse:
    """Record a just-finished check_change so Hard mode does not wait on the poller."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        return JSONResponse({"ok": False, "remembered": 0}, status_code=400)
    checks = getattr(request.app.state, "recent_checks", None)
    if checks is None:
        return JSONResponse({"ok": False, "remembered": 0}, status_code=503)
    conversation_id = str(body.get("conversation_id") or "").strip()
    verdict_basis = str(body.get("verdict_basis") or "").strip()
    fallback = str(body.get("verdict") or "ok").strip()
    files = body.get("files") or []
    remembered = 0
    if files and isinstance(files[0], dict):
        remembered = checks.ingest_file_verdicts(
            files,
            fallback_verdict=fallback,
            conversation_id=conversation_id,
            source=LOCAL,
            verdict_basis=verdict_basis,
        )
    else:
        remembered = checks.remember_event_files(
            [str(item) for item in files if item],
            fallback,
            conversation_id=conversation_id,
            source=LOCAL,
            verdict_basis=verdict_basis,
        )
    return JSONResponse({"ok": True, "remembered": remembered})
