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

"""Local facts-extract version status and opt-in npm update."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from dont_break.domain.errors import ExtractError
from dont_break.extract.facts_extract import facts_extract_status, maybe_upgrade_facts_extract
from dont_break.server.routes_constants import LocalRoutes

router = APIRouter()


@router.get(LocalRoutes.TOOLS_FACTS_EXTRACT)
async def facts_extract_tool_status() -> JSONResponse:
    return JSONResponse(await asyncio.to_thread(facts_extract_status))


@router.post(LocalRoutes.TOOLS_FACTS_EXTRACT_UPDATE)
async def facts_extract_tool_update() -> JSONResponse:
    try:
        payload = await asyncio.to_thread(maybe_upgrade_facts_extract, force=True)
    except ExtractError as exc:
        status = await asyncio.to_thread(facts_extract_status)
        return JSONResponse({"error": str(exc), **status}, status_code=400)
    return JSONResponse(payload)
