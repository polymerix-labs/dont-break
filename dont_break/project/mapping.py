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

"""Local folder-to-registered-project mappings.

Mappings deliberately live in the user configuration directory, never in a
repository.  A folder is only associated with a backend project after the
user selects or creates that registered project.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dont_break.config import config_dir

_FILENAME = "folder-projects.json"


def _folder_key(folder: str) -> str:
    """Canonical mapping key: symlinks resolved (e.g. /tmp -> /private/tmp)."""
    return str(Path(folder).expanduser().resolve())


@dataclass(frozen=True)
class ProjectMapping:
    folder: str
    project_id: str
    project_slug: str = ""
    display_name: str = ""
    workspace_id: str = ""


class FolderProjectStore:
    def __init__(self, path: Path | None = None) -> None:
        self._path = path or config_dir() / _FILENAME

    def get(self, folder: str) -> ProjectMapping | None:
        key = _folder_key(folder)
        for item in self._load():
            if _folder_key(item.folder) == key:
                return item
        return None

    def for_file(self, file_path: str, workspace_root: str = "") -> ProjectMapping | None:
        """Mapping for the file's repo, never the session's current project.

        Walks ancestors of the canonical file path (O(depth) dict lookups).
        `workspace_root` is only used when it is itself mapped *and* the file
        sits under it — Cursor's `workspace_roots` can name a different folder
        than the file being written.
        """
        by_folder = {_folder_key(item.folder): item for item in self._load()}
        if not by_folder:
            return None
        try:
            current = Path(file_path).expanduser().resolve()
        except OSError:
            return None
        if current.is_file() or current.suffix:
            current = current.parent
        while True:
            mapped = by_folder.get(str(current))
            if mapped is not None:
                return mapped
            parent = current.parent
            if parent == current:
                break
            current = parent
        if not workspace_root:
            return None
        mapped = by_folder.get(_folder_key(workspace_root))
        if mapped is None:
            return None
        if relative_to_folder(file_path, mapped.folder) is None:
            return None
        return mapped

    def last(self) -> ProjectMapping | None:
        """Most recently saved mapping (last entry), or None if empty."""
        items = self._load()
        return items[-1] if items else None

    def save(self, mapping: ProjectMapping) -> None:
        key = _folder_key(mapping.folder)

        canonical = ProjectMapping(
            folder=key,
            project_id=mapping.project_id,
            project_slug=mapping.project_slug,
            display_name=mapping.display_name,
            workspace_id=mapping.workspace_id,
        )
        items = [item for item in self._load() if _folder_key(item.folder) != key]
        items.append(canonical)
        payload = [
            {
                "folder": item.folder,
                "project_id": item.project_id,
                "project_slug": item.project_slug,
                "display_name": item.display_name,
                "workspace_id": item.workspace_id,
            }
            for item in items
        ]
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _load(self) -> list[ProjectMapping]:
        try:
            raw: Any = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return []
        if not isinstance(raw, list):
            return []
        result: list[ProjectMapping] = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            folder = str(item.get("folder") or "").strip()
            project_id = str(item.get("project_id") or "").strip()
            if folder and project_id:
                result.append(
                    ProjectMapping(
                        folder=folder,
                        project_id=project_id,
                        project_slug=str(item.get("project_slug") or "").strip(),
                        display_name=str(item.get("display_name") or "").strip(),
                        workspace_id=str(item.get("workspace_id") or "").strip(),
                    )
                )
        return result


def relative_to_folder(file_path: str, folder: str) -> str | None:
    """POSIX relative path of `file_path` inside `folder`, or None if outside."""
    try:
        file = Path(file_path).expanduser().resolve()
        root = Path(folder).expanduser().resolve()
        return file.relative_to(root).as_posix()
    except (OSError, ValueError):
        return None
