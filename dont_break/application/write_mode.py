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

"""Watch vs Hard write policy, persisted locally so the Cursor hook can read it.

The hook script is copied off PYTHONPATH, so the file shape is part of the
contract: ``{"folders": {"/abs/project": "hard"|"watch"}}``.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from dont_break.config import config_dir

WATCH = "watch"
HARD = "hard"
MODES = frozenset({WATCH, HARD})


class WriteModeStore:
    def __init__(self, path: Path | None = None) -> None:
        self._path = path or config_dir() / "write-mode.json"
        self._folders: dict[str, str] = {}
        self._load()

    def _load(self) -> None:
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            self._folders = {}
            return
        folders = raw.get("folders") if isinstance(raw, dict) else None
        if not isinstance(folders, dict):
            self._folders = {}
            return
        self._folders = {
            str(folder): mode
            for folder, mode in folders.items()
            if isinstance(folder, str) and folder and mode in MODES
        }

    def _save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        payload: dict[str, Any] = {"folders": dict(sorted(self._folders.items()))}
        self._path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def mode_for_folder(self, folder: str) -> str:
        folder = str(Path(folder).expanduser().resolve()) if folder else ""
        if not folder:
            return WATCH
        if self._folders.get(folder) == HARD:
            return HARD
        for stored, mode in self._folders.items():
            key = str(Path(stored).expanduser().resolve())
            if folder == key or folder.startswith(key + "/"):
                return mode
        return WATCH

    def is_hard(self, folder: str) -> bool:
        return self.mode_for_folder(folder) == HARD

    def set_mode(self, folder: str, mode: str) -> str:
        folder = str(Path(folder).expanduser().resolve()) if folder else ""
        if not folder or mode not in MODES:
            return WATCH
        if mode == WATCH:
            self._folders.pop(folder, None)
        else:
            self._folders[folder] = HARD
        self._save()
        return self.mode_for_folder(folder)
