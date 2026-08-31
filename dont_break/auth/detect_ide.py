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

"""Detect the editor that is actually running, only when it is unambiguous.

dont-break is a local app, not an IDE plugin. Guessing Cursor vs VS Code
from the process list is useful for ``preferred_ide_*``; guessing wrong
is worse than leaving the fields empty. One known editor → return it.
Zero or more than one → return None.
"""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class DetectedIde:
    """A known editor we can persist without asking the user."""

    scheme: str
    app_name: str




_IDE_PATTERNS: tuple[tuple[str, str, tuple[str, ...]], ...] = (
    (
        "cursor",
        "Cursor",
        (
            r"/Cursor\.app/",
            r"\\Cursor\\",
            r"/cursor-app/",
        ),
    ),
    (
        "windsurf",
        "Windsurf",
        (
            r"/Windsurf\.app/",
            r"\\Windsurf\\",
        ),
    ),
    (
        "vscode",
        "VS Code",
        (
            r"/Visual Studio Code\.app/",
            r"/Code\.app/",
            r"\\Microsoft VS Code\\",
            r"\\Code\\Code\.exe",
        ),
    ),
)


def _process_command_lines() -> list[str]:
    """Best-effort snapshot of running process command lines."""
    if sys.platform == "win32":
        try:
            out = subprocess.run(
                ["wmic", "process", "get", "CommandLine"],
                capture_output=True,
                text=True,
                timeout=2,
            )
        except (subprocess.SubprocessError, OSError):
            return []
        return [line.strip() for line in out.stdout.splitlines() if line.strip()]

    try:
        out = subprocess.run(
            ["ps", "-ax", "-o", "command="],
            capture_output=True,
            text=True,
            timeout=2,
        )
    except (subprocess.SubprocessError, OSError):
        return []
    return [line.strip() for line in out.stdout.splitlines() if line.strip()]


def detect_running_ide(command_lines: list[str] | None = None) -> DetectedIde | None:
    """Return the running IDE only when exactly one known editor is present.

    ``command_lines`` is injectable for tests. Production callers omit it.
    """
    lines = command_lines if command_lines is not None else _process_command_lines()
    found: list[DetectedIde] = []
    seen: set[str] = set()
    for scheme, app_name, patterns in _IDE_PATTERNS:
        compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
        if any(any(p.search(line) for p in compiled) for line in lines):
            if scheme not in seen:
                seen.add(scheme)
                found.append(DetectedIde(scheme=scheme, app_name=app_name))
    if len(found) != 1:
        return None
    return found[0]
