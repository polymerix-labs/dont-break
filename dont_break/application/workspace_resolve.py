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

"""Resolve workspace id from session store and stored credentials."""

from __future__ import annotations

from dont_break.application.session_store import SessionStore
from dont_break.credentials import StoredCredentials, load_credentials


def resolve_workspace_id(
    store: SessionStore,
    creds: StoredCredentials | None = None,
) -> str:
    """Return workspace id from store, falling back to stored org slug."""
    creds = creds or load_credentials()
    return (store.workspace_id or store.org_slug or creds.org_slug or "").strip()
