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

"""Local ring of hook observations for the incident page when the API lags."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Mapping

from dont_break.config import config_dir

MAX_ROWS = 200


class HookObservationStore:
    def __init__(self, path: Path | None = None) -> None:
        self._path = path or config_dir() / "hook-observations.jsonl"

    def append(self, row: Mapping[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with self._path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(dict(row), ensure_ascii=True) + "\n")
        self._trim()

    def recent(self, limit: int = 50) -> list[dict[str, Any]]:
        try:
            lines = self._path.read_text(encoding="utf-8").splitlines()
        except OSError:
            return []
        rows: list[dict[str, Any]] = []
        for line in lines[-limit:]:
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                rows.append(parsed)
        return list(reversed(rows))

    def _trim(self) -> None:
        try:
            lines = self._path.read_text(encoding="utf-8").splitlines()
        except OSError:
            return
        if len(lines) <= MAX_ROWS:
            return
        self._path.write_text("\n".join(lines[-MAX_ROWS:]) + "\n", encoding="utf-8")
