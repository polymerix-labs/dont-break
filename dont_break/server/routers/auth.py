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

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from dont_break.application.auth_service import AuthService
from dont_break.domain.errors import AuthError
from dont_break.server.deps import get_auth_service
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


@router.get(LocalRoutes.AUTH_CALLBACK)
async def auth_callback(
    request: Request,
    auth: AuthService = Depends(get_auth_service),
) -> HTMLResponse:
    query = {k: v for k, v in request.query_params.items()}
    try:
        await auth.handle_callback(query)
        return HTMLResponse(
            "<html><body style='font-family:system-ui;background:#05060a;color:#e9ecf6;"
            "display:flex;align-items:center;justify-content:center;height:100vh'>"
            "<p>Sign-in complete. You can close this tab and return to the terminal.</p>"
            "</body></html>"
        )
    except AuthError as exc:
        return HTMLResponse(
            f"<html><body><p>{exc}</p></body></html>",
            status_code=400,
        )
