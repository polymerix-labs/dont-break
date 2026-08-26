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

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path

from dont_break.domain.errors import ApiErrorMessage


@dataclass
class GitContext:
    root: Path
    remote_url: str | None
    branch: str | None
    head_sha: str | None


def _git(cwd: Path, *args: str) -> str | None:
    try:
        out = subprocess.run(
            ["git", *args],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
        text = out.stdout.strip()
        return text or None
    except (subprocess.SubprocessError, OSError):
        return None


def git_root(cwd: Path | None = None) -> Path:
    start = (cwd or Path.cwd()).resolve()
    root = _git(start, "rev-parse", "--show-toplevel")
    if not root:
        raise RuntimeError(ApiErrorMessage.NOT_GIT_REPO.value)
    return Path(root)


def collect_git_context(root: Path) -> GitContext:
    return GitContext(
        root=root,
        remote_url=_git(root, "config", "--get", "remote.origin.url"),
        branch=_git(root, "rev-parse", "--abbrev-ref", "HEAD"),
        head_sha=_git(root, "rev-parse", "HEAD"),
    )
