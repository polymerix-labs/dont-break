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

"""Local support form. Bound to loopback; forwards to the public contact inbox."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from dont_break.application.support_mail import (
    deliver_support,
    support_context,
)
from dont_break.server.deps import session_store_from_app
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


@router.get(LocalRoutes.SUPPORT)
async def support_facts(request: Request) -> JSONResponse:
    store = session_store_from_app(request)
    return JSONResponse(support_context(store))


@router.post(LocalRoutes.SUPPORT)
async def support_send(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        return JSONResponse({"ok": False, "error": "Add an email and a message."}, status_code=400)
    email = str(body.get("email") or "").strip()
    message = str(body.get("message") or "").strip()
    kind = str(body.get("kind") or "bug").strip()
    if not email or "@" not in email or not message:
        return JSONResponse(
            {"ok": False, "error": "Add an email so we can reply, and a message."},
            status_code=400,
        )
    store = session_store_from_app(request)
    result = await deliver_support(
        email=email,
        kind=kind,
        message=message,
        context=support_context(store),
    )
    status = 200 if result.get("ok") else 502
    return JSONResponse(result, status_code=status)
