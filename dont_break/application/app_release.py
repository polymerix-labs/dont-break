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

"""Compare the running dont-break version to the latest GitHub release.

The dashboard badge calls ``app_release_status``. A failed or empty GitHub
response never nags: we keep the last good answer, or report no update.
"""

from __future__ import annotations

import threading
import time
from typing import Any

import httpx

from dont_break import __version__

GITHUB_REPO = "polymerix-labs/dont-break"
GITHUB_LATEST_RELEASE_URL = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
GITHUB_RELEASES_PAGE = f"https://github.com/{GITHUB_REPO}/releases/latest"

_LATEST_TTL_SEC = 600.0
_FETCH_TIMEOUT_SEC = 8.0
_latest_lock = threading.Lock()
_cached: tuple[str, str] | None = None
_cached_at = 0.0


def _parse_semver(raw: str) -> tuple[int, int, int] | None:
    """Parse ``1.2.3`` or ``v1.2.3`` into a comparable triple."""
    text = raw.strip().lstrip("vV")
    if not text:
        return None
    core = text.split("-", 1)[0].split("+", 1)[0]
    parts = core.split(".")
    if len(parts) < 2:
        return None
    try:
        major = int(parts[0])
        minor = int(parts[1])
        patch = int(parts[2]) if len(parts) > 2 else 0
    except ValueError:
        return None
    return (major, minor, patch)


def _is_newer(latest: str, installed: str) -> bool:
    """True when ``latest`` is a strictly newer semver than ``installed``."""
    a = _parse_semver(latest)
    b = _parse_semver(installed)
    if a is None or b is None:
        return bool(latest) and latest != installed
    return a > b


def _normalize_tag(raw: str) -> str:
    """Strip a leading ``v`` so UI and compare share the same number."""
    return raw.strip().lstrip("vV")


def _fetch_latest_release() -> tuple[str, str] | None:
    """Return ``(version, html_url)`` from GitHub, or ``None`` on any failure."""
    try:
        response = httpx.get(
            GITHUB_LATEST_RELEASE_URL,
            headers={
                "Accept": "application/vnd.github+json",
                "User-Agent": f"dont-break/{__version__}",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            timeout=_FETCH_TIMEOUT_SEC,
            follow_redirects=True,
        )
    except httpx.HTTPError:
        return None
    if response.status_code != 200:
        return None
    try:
        payload = response.json()
    except ValueError:
        return None
    if not isinstance(payload, dict):
        return None
    tag = payload.get("tag_name")
    if not isinstance(tag, str) or not tag.strip():
        return None
    version = _normalize_tag(tag)
    if not version:
        return None
    html = payload.get("html_url")
    url = html if isinstance(html, str) and html.startswith("https://") else GITHUB_RELEASES_PAGE
    return (version, url)


def latest_github_release(*, refresh: bool = False) -> tuple[str, str] | None:
    """Latest GitHub release, cached for ten minutes.

    A failed fetch keeps the last good pair so a blip does not hide a real
    update, and does not invent one when we never succeeded.
    """
    global _cached, _cached_at
    now = time.monotonic()
    with _latest_lock:
        if not refresh and _cached is not None and (now - _cached_at) < _LATEST_TTL_SEC:
            return _cached
    fetched = _fetch_latest_release()
    if fetched is None:
        with _latest_lock:
            return _cached
    with _latest_lock:
        _cached = fetched
        _cached_at = time.monotonic()
        return _cached


def app_release_status(*, refresh: bool = False) -> dict[str, Any]:
    """Status payload for ``GET /api/app/update``.

    ``release_url`` is set only when a newer GitHub tag exists, so the badge
    can open that release without a second lookup.
    """
    installed = __version__
    fetched = latest_github_release(refresh=refresh)
    latest = fetched[0] if fetched else None
    update_available = bool(latest and _is_newer(latest, installed))
    return {
        "installed": installed,
        "latest": latest,
        "update_available": update_available,
        "release_url": fetched[1] if fetched and update_available else None,
    }
