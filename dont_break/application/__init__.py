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

"""Application services and shared store accessor."""

from __future__ import annotations

from dont_break.application.auth_service import AuthService
from dont_break.application.project_service import ProjectService
from dont_break.application.session_store import SessionStore, get_session_store
from dont_break.application.sync_service import SyncService
from dont_break.application.workspace_service import WorkspaceService


def build_services(store: SessionStore | None = None) -> dict[str, object]:
    store = store or get_session_store()
    return {
        "store": store,
        "auth": AuthService(store),
        "project": ProjectService(store),
        "sync": SyncService(store),
        "workspace": WorkspaceService(store),
    }


__all__ = [
    "AuthService",
    "ProjectService",
    "SessionStore",
    "SyncService",
    "WorkspaceService",
    "build_services",
    "get_session_store",
]
