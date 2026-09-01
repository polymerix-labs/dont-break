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

"""Canonical Git origin identity. Folder names are not identity."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlparse

MAX_REMOTE_URL_LEN = 512
_SEGMENT = re.compile(r"^[\w.-]+$")
_SCP = re.compile(r"^git@([^:/\s]+):(.+)$", re.IGNORECASE)


@dataclass(frozen=True)
class GitUrlIdentity:
    host: str
    owner: str
    repo: str
    url_key: str

    @property
    def display_name(self) -> str:
        return f"{self.owner}/{self.repo}"


def parse_git_remote_url(raw: str) -> GitUrlIdentity | None:
    """Parse https, ssh, or scp-like `git@host:path` origins. Rejects other schemes."""
    trimmed = raw.strip()
    if not trimmed or len(trimmed) > MAX_REMOTE_URL_LEN:
        return None

    scp = _SCP.match(trimmed)
    if scp:
        return _from_host_path(scp.group(1), scp.group(2))

    try:
        url = urlparse(trimmed)
    except ValueError:
        return None
    if url.scheme.lower() not in {"http", "https", "ssh", "git"}:
        return None
    if not url.hostname:
        return None
    return _from_host_path(url.hostname, url.path)


def origin_needs_reattach(url_key: str, linked_key: str) -> bool:
    """True when this folder's origin is not the linked project's Git identity.

    A local-only project has an empty linked_key. Adding origin later must
    re-resolve, not keep writing to the folder-named project.
    """
    return bool(url_key) and url_key != linked_key


def _from_host_path(host: str, path: str) -> GitUrlIdentity | None:
    h = host.strip().lower().rstrip(".")
    if not h or "/" in h or "\\" in h or ".." in h:
        return None
    p = path.lstrip("/")
    if p.lower().endswith(".git"):
        p = p[:-4]
    p = p.rstrip("/")
    if not p or ".." in p or "\\" in p:
        return None
    parts = [seg for seg in p.split("/") if seg]
    if len(parts) < 2 or len(parts) > 12:
        return None
    if not all(_SEGMENT.match(seg) for seg in parts):
        return None
    repo = parts[-1]
    owner = "/".join(parts[:-1])
    return GitUrlIdentity(host=h, owner=owner, repo=repo, url_key=f"{h}/{p}".lower())
