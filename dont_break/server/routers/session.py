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

import json

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, StreamingResponse

from dont_break.application.session_store import SessionStore
from dont_break.server.deps import get_session_store_dep
from dont_break.server.routes_constants import LocalRoutes
from dont_break.server.static_root import static_root
from dont_break.viewer_assets import VIEWER_ASSET_VERSION

router = APIRouter()


@router.get(LocalRoutes.DEBUG_VIEWER)
async def debug_viewer() -> JSONResponse:
    root = static_root()
    app_mjs = root / "nebula" / "app.mjs"
    text = app_mjs.read_text(encoding="utf-8") if app_mjs.is_file() else ""
    return JSONResponse(
        {
            "viewer_asset_version": VIEWER_ASSET_VERSION,
            "static_root": str(root),
            "app_mjs_exists": app_mjs.is_file(),
            "has_readyStatusFromMessage": "readyStatusFromMessage" in text,
            "has_legacy_question_mark_nodes": "?? '?'" in text or "? nodes" in text,
            "app_mjs_mtime": app_mjs.stat().st_mtime if app_mjs.is_file() else None,
        }
    )


@router.get(LocalRoutes.SESSION)
async def session(store: SessionStore = Depends(get_session_store_dep)) -> JSONResponse:
    return JSONResponse(store.snapshot().to_json())


@router.get(LocalRoutes.SESSION_EVENTS)
async def session_events(store: SessionStore = Depends(get_session_store_dep)) -> StreamingResponse:
    async def stream():
        queue = store.subscribe()
        try:
            yield f"data: {json.dumps(store.snapshot().to_json())}\n\n"
            while True:
                snap = await queue.get()
                if snap is None:
                    break
                yield f"data: {json.dumps(snap.to_json())}\n\n"
        finally:
            store.unsubscribe(queue)

    return StreamingResponse(stream(), media_type="text/event-stream")
