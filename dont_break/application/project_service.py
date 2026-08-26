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

"""Native folder picker and project path resolution."""

from __future__ import annotations

import asyncio
from pathlib import Path

from dont_break.application.session_store import SessionStore
from dont_break.application.sync_cache import SyncStateCache
from dont_break.domain.models import ProjectPath, ProjectSlug
from dont_break.project.picker import PickerError, pick_project_folder
from dont_break.project.mapping import FolderProjectStore, ProjectMapping
from dont_break.project.slug import project_slug_from_path


class ProjectService:
    def __init__(self, store: SessionStore, mappings: FolderProjectStore | None = None) -> None:
        self._store = store
        self._mappings = mappings or FolderProjectStore()

    async def _set_folder(self, path: str) -> tuple[ProjectPath, ProjectSlug]:
        mapping = self._mappings.get(path)
        suggestion = project_slug_from_path(path)
        if mapping:






            self._mappings.save(mapping)
        if mapping and mapping.workspace_id:
            await self._store.set_workspace(mapping.workspace_id)
        await self._store.set_project(
            path,
            mapping.project_slug if mapping else suggestion,
            project_id=mapping.project_id if mapping else "",
            display_name=mapping.display_name if mapping else "",
        )
        await self._restore_live_sync_pref(mapping.project_id if mapping else "")
        return ProjectPath(path), ProjectSlug(suggestion)

    async def _restore_live_sync_pref(self, project_id: str) -> None:
        """Load the per-project live-sync toggle from disk (default: on)."""
        if not project_id.strip():
            return
        cache = SyncStateCache(project_id)
        enabled = True if cache.live_sync_enabled is None else cache.live_sync_enabled
        await self._store.set_live_sync_enabled(enabled)

    async def pick_folder(self) -> tuple[ProjectPath, ProjectSlug]:
        try:
            path = await asyncio.to_thread(pick_project_folder)
        except PickerError:
            raise
        return await self._set_folder(path)

    async def apply_dev_path(self, project_path: str) -> tuple[ProjectPath, ProjectSlug]:
        resolved = Path(project_path).expanduser().resolve()
        if not resolved.is_dir():
            raise RuntimeError(f"Not a directory: {resolved}")
        path = str(resolved)
        return await self._set_folder(path)

    async def restore_last_folder(self) -> tuple[ProjectPath, ProjectSlug] | None:
        """Reopen the most recently linked folder if it still exists on disk."""
        mapping = self._mappings.last()
        if mapping is None:
            return None
        try:
            resolved = Path(mapping.folder).expanduser().resolve()
        except OSError:
            return None
        if not resolved.is_dir():
            return None
        return await self._set_folder(str(resolved))

    async def link_registered_project(
        self,
        project_id: str,
        *,
        project_slug: str = "",
        display_name: str = "",
        workspace_id: str = "",
    ) -> None:
        path = self._store.project_path
        if not path:
            raise RuntimeError("Pick a project folder first.")
        project_id = project_id.strip()
        if not project_id:
            raise RuntimeError("A registered project id is required.")
        mapping = ProjectMapping(
            folder=str(Path(path).expanduser().resolve()),
            project_id=project_id,
            project_slug=project_slug.strip(),
            display_name=display_name.strip(),
            workspace_id=workspace_id.strip(),
        )
        self._mappings.save(mapping)
        await self._store.set_project(
            mapping.folder,
            mapping.project_slug or project_slug_from_path(mapping.folder),
            project_id=mapping.project_id,
            display_name=mapping.display_name,
        )
        await self._restore_live_sync_pref(mapping.project_id)

    def require_project(self) -> tuple[str, str, str]:
        if not self._store.project_path:
            raise RuntimeError("Pick a project folder first.")
        if not self._store.project_id:
            raise RuntimeError("Link this folder to a registered project first.")
        return self._store.project_path, self._store.project_id, self._store.project_slug
