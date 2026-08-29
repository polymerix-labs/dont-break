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

from fastapi import APIRouter

from dont_break.server.routers import (
    agents,
    assist,
    auth,
    graph,
    hook,
    incident_diff,
    lockdown,
    project,
    query,
    rules,
    session,
    support,
    tools,
    viewer,
    write_mode,
)

router = APIRouter()
router.include_router(auth.router)
router.include_router(session.router)
router.include_router(project.router)
router.include_router(agents.router)
router.include_router(viewer.router)
router.include_router(query.router)
router.include_router(rules.router)
router.include_router(assist.router)
router.include_router(graph.router)
router.include_router(hook.router)
router.include_router(lockdown.router)
router.include_router(write_mode.router)
router.include_router(incident_diff.router)
router.include_router(tools.router)
router.include_router(support.router)
