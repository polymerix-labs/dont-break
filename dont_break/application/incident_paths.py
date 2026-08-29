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

"""Keep incident-diff arguments inside the linked project folder."""

from __future__ import annotations

from pathlib import Path


def contained_relpaths(root: Path, files: list[str]) -> list[str] | None:
    """POSIX paths relative to ``root``, or None if any file escapes."""
    try:
        base = root.expanduser().resolve()
    except OSError:
        return None
    out: list[str] = []
    for item in files:
        raw = Path(item)
        candidate = raw if raw.is_absolute() else base / item
        try:
            resolved = candidate.expanduser().resolve()
            relative = resolved.relative_to(base)
        except (OSError, ValueError):
            return None
        if ".." in relative.parts:
            return None
        out.append(relative.as_posix())
    return out
