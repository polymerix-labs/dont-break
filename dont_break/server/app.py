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

from fastapi import FastAPI
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.staticfiles import StaticFiles

from dont_break.server.lifespan import lifespan
from dont_break.server.routes import router
from dont_break.server.static_root import static_root
from dont_break.server.viewer_cache import NoCacheViewerMiddleware
from dont_break.viewer_assets import VIEWER_ASSET_VERSION


class SpaStaticFiles(StaticFiles):
    """Serves the dashboard SPA: unknown paths fall back to index.html so
    client routes (/rules/studio, /graph, ...) survive deep links and reloads
    instead of surfacing a bare 404."""

    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


def create_app() -> FastAPI:
    app = FastAPI(title="dont-break", docs_url=None, redoc_url=None, lifespan=lifespan)
    app.add_middleware(NoCacheViewerMiddleware)
    app.include_router(router)

    root = static_root()
    app.state.static_root = root
    app.state.viewer_asset_version = VIEWER_ASSET_VERSION
    nebula_dir = root / "nebula"
    if nebula_dir.is_dir():
        app.mount("/viewer", StaticFiles(directory=str(nebula_dir), html=True), name="nebula-viewer")

    if root.is_dir():
        app.mount("/", SpaStaticFiles(directory=str(root), html=True), name="static")

    return app
