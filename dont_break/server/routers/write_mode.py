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

"""Watch vs Hard write policy for the current project folder."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from dont_break.application.write_mode import HARD, WATCH, WriteModeStore
from dont_break.server.deps import session_store_from_app
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


def _store(request: Request) -> WriteModeStore | None:
    return getattr(request.app.state, "write_mode", None)


@router.get(LocalRoutes.WRITE_MODE)
async def write_mode_status(request: Request) -> JSONResponse:
    store = _store(request)
    folder = session_store_from_app(request).project_path.strip()
    mode = store.mode_for_folder(folder) if store and folder else WATCH
    return JSONResponse(
        {
            "mode": mode,
            "folder": folder,
            "hard": mode == HARD,
            "covers_all_tools": False,
        }
    )


@router.put(LocalRoutes.WRITE_MODE)
async def write_mode_set(request: Request) -> JSONResponse:
    """Persist Watch/Hard. Never claim every tool is covered."""
    store = _store(request)
    folder = session_store_from_app(request).project_path.strip()
    if store is None or not folder:
        return JSONResponse(
            {
                "mode": WATCH,
                "folder": folder,
                "hard": False,
                "covers_all_tools": False,
            },
            status_code=400,
        )
    try:
        body = await request.json()
    except Exception:
        body = {}
    mode = str((body or {}).get("mode") or WATCH).strip()
    saved = store.set_mode(folder, mode if mode in {WATCH, HARD} else WATCH)
    return JSONResponse(
        {
            "mode": saved,
            "folder": folder,
            "hard": saved == HARD,
            "covers_all_tools": False,
        }
    )
