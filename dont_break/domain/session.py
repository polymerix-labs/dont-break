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

"""Immutable session projection exposed to the HTTP API."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass


_OPAQUE_ID = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def is_opaque_id(value: str) -> bool:
    """True for a UUID — never show this as an organisation or project label."""
    return bool(value) and _OPAQUE_ID.fullmatch(value.strip()) is not None


def human_org_label(*candidates: str) -> str:
    """First value that is a real slug/name, not a workspace UUID."""
    for raw in candidates:
        value = raw.strip()
        if value and not is_opaque_id(value):
            return value
    return ""


@dataclass(frozen=True)
class SessionSnapshot:
    authenticated: bool
    org_slug: str
    org_name: str
    workspace_id: str
    project_path: str
    project_id: str
    project_slug: str
    project_display_name: str
    snapshot_saved: bool
    graph_error: str
    graph_stream_available: bool
    graph_bootstrap_complete: bool
    graph_nodes_received: int
    sync_phase: str
    sync_session_id: str
    graph_version: int
    coverage_pct: int
    sync_progress_label: str
    sync_upload_mode: str
    live_sync_enabled: bool = True
    watch_status: str = ""
    watch_error: str = ""
    last_synced_at: float = 0.0
    app_version: str = ""
    account_url: str = ""
    support_url: str = ""

    def to_json(self) -> dict[str, object]:
        return asdict(self)
