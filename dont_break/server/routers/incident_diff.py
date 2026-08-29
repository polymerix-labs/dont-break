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

"""Bounded git diff for incident files in the linked project folder."""

from __future__ import annotations

import subprocess
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from dont_break.application.incident_paths import contained_relpaths
from dont_break.server.deps import session_store_from_app
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()

MAX_BYTES = 80_000
MAX_FILES = 20


@router.get(LocalRoutes.INCIDENT_DIFF)
async def incident_diff(request: Request) -> JSONResponse:
    store = session_store_from_app(request)
    root = Path(store.project_path.strip())
    files = [item for item in request.query_params.getlist("file") if item][:MAX_FILES]
    if not root.is_dir():
        return JSONResponse({"available": False, "reason": "no_project", "diff": ""})
    if not files:
        return JSONResponse({"available": False, "reason": "no_files", "diff": ""})
    contained = contained_relpaths(root, files)
    if contained is None:
        return JSONResponse({"available": False, "reason": "path_escaped", "diff": ""})
    git_dir = root / ".git"
    if not git_dir.exists():
        return JSONResponse({"available": False, "reason": "not_git", "diff": ""})
    try:
        completed = subprocess.run(
            ["git", "-C", str(root), "diff", "--no-color", "--", *contained],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return JSONResponse({"available": False, "reason": "git_failed", "diff": ""})
    text = completed.stdout or ""
    if len(text.encode("utf-8", errors="replace")) > MAX_BYTES:
        text = text[:MAX_BYTES] + "\n… truncated …\n"
    if not text.strip():
        return JSONResponse({"available": True, "reason": "empty", "diff": ""})
    return JSONResponse({"available": True, "reason": "", "diff": text})
