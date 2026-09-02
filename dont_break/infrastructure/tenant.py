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

"""Tenant path keys for gateway HTTP and WebSocket routes."""

from __future__ import annotations

from typing import Iterable, Protocol

from dont_break.project.mapping import FolderProjectStore, ProjectMapping


class ProjectPathSource(Protocol):
    """Session or mapping that may hold a registered id and a display slug."""

    project_id: str
    project_slug: str


def _safe_segment(value: str) -> str:
    """Return a single URL path segment, or empty if the value would split."""
    text = (value or "").strip()
    if not text or "/" in text or "\\" in text:
        return ""
    return text


def project_path_key(store: ProjectPathSource) -> str:
    """Gateway path segment: registered id, never owner/repo.

    Display names such as ``polymerix/backend`` split into extra URL segments.
    A slash slug is therefore rejected when no registered id is present.
    """
    return _safe_segment(store.project_id) or _safe_segment(store.project_slug)


def resolve_project_path_key(
    session: ProjectPathSource,
    mapping: ProjectMapping | None = None,
) -> str:
    """Single tenant key shared by session proxies and folder-mapping hooks.

    Registered ids win, mapping before session, so a linked folder is never
    keyed by a display slug just because the session has not stored the id yet.
    """
    for source in (mapping, session):
        if source is None:
            continue
        key = _safe_segment(source.project_id)
        if key:
            return key
    for source in (mapping, session):
        if source is None:
            continue
        key = _safe_segment(source.project_slug)
        if key:
            return key
    return ""


def project_key_aliases(*sources: ProjectPathSource | None) -> tuple[str, ...]:
    """Id and slug variants, including slash slugs, for legacy lockdown lookup."""
    keys: list[str] = []
    for source in sources:
        if source is None:
            continue
        for raw in (source.project_id, source.project_slug):
            text = (raw or "").strip()
            if text and text not in keys:
                keys.append(text)
    return tuple(keys)


def mapping_for_session(
    session: ProjectPathSource, folders: FolderProjectStore | None
) -> ProjectMapping | None:
    """Folder mapping for the session's linked path, if any."""
    path = (getattr(session, "project_path", None) or "").strip()
    if not path or folders is None:
        return None
    return folders.get(path)


def session_project_key(
    session: ProjectPathSource, folders: FolderProjectStore | None = None
) -> str:
    """Resolve the gateway/cache/lock key from session plus its folder mapping."""
    mapping = mapping_for_session(session, folders)
    return resolve_project_path_key(session, mapping)


def session_project_aliases(
    session: ProjectPathSource, folders: FolderProjectStore | None = None
) -> tuple[str, ...]:
    """Primary key first, then every id/slug that may exist on disk."""
    mapping = mapping_for_session(session, folders)
    primary = resolve_project_path_key(session, mapping)
    extras = project_key_aliases(mapping, session)
    ordered: list[str] = []
    if primary:
        ordered.append(primary)
    for key in extras:
        if key not in ordered:
            ordered.append(key)
    return tuple(ordered)


def alias_tail(primary: str, aliases: Iterable[str]) -> tuple[str, ...]:
    """Aliases excluding the primary key, for LockdownStore ``also=``."""
    return tuple(key for key in aliases if key and key != primary)
