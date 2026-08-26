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

"""Backward-compatible re-export. Prefer WorkspaceService."""

from __future__ import annotations

from dont_break.application.workspace_service import WorkspaceContext, WorkspaceService
from dont_break.application.session_store import get_session_store
from dont_break.config import Settings


async def load_workspace_context(settings: Settings) -> WorkspaceContext:
    return await WorkspaceService(get_session_store()).load(settings)
