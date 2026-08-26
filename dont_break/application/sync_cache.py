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

"""Persistent per-project sync state: per-file facts fingerprints + bundle fingerprint.

The fingerprints stored here are the `content_fingerprint` values emitted by the Rust
`facts-extract` binary (FNV-1a over the facts payload, verified server-side on upload).
The client never hashes facts itself: it harvests fingerprints from extracted bundles and
replays them in the sync manifest so the gateway's resync diff can mark unchanged files
as already received.

A missing or corrupt cache can only make the next sync cold (slower), never wrong: the
server re-verifies every claimed fingerprint against the facts it actually receives.
"""

from __future__ import annotations

import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from dont_break.config import config_dir

CACHE_SCHEMA_VERSION = 1
CACHE_DIR_NAME = "sync-cache"


@dataclass
class CachedFileState:
    """Fingerprint + stat snapshot of one source file at extraction time."""

    fingerprint: str
    mtime: float
    size: int


def _sanitize_project_id(project_id: str) -> str:
    cleaned = "".join(
        ch if ch.isalnum() or ch in "-_." else "_" for ch in project_id.strip()
    )
    return cleaned or "default"


def sync_cache_dir() -> Path:
    path = config_dir() / CACHE_DIR_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path


class SyncStateCache:
    """Disk-backed sync fingerprints for one linked project (atomic JSON file)."""

    def __init__(self, project_id: str, base_dir: Path | None = None) -> None:
        root = base_dir if base_dir is not None else sync_cache_dir()
        root.mkdir(parents=True, exist_ok=True)
        self._path = root / f"{_sanitize_project_id(project_id)}.json"
        self._project_id = project_id.strip()
        self.bundle_fingerprint: str = ""
        self.live_sync_enabled: bool | None = None
        self._files: dict[str, CachedFileState] = {}
        self._load()

    @property
    def path(self) -> Path:
        return self._path

    @property
    def file_count(self) -> int:
        return len(self._files)

    def fingerprint_for(self, relative_path: str) -> str:
        state = self._files.get(relative_path)
        return state.fingerprint if state else ""

    def file_state(self, relative_path: str) -> CachedFileState | None:
        return self._files.get(relative_path)

    def is_stale(self, repo_root: Path, relative_path: str) -> bool:
        """True when the cached fingerprint can no longer be trusted for this path.

        Heuristic: missing cache entry, or the file's mtime/size differ from the stat
        snapshot taken at extraction time. A stat failure counts as stale.
        """
        state = self._files.get(relative_path)
        if state is None or not state.fingerprint:
            return True
        try:
            st = (repo_root / relative_path).stat()
        except OSError:
            return True
        return st.st_mtime != state.mtime or st.st_size != state.size

    def stale_paths(
        self,
        repo_root: Path,
        rel_paths: Iterable[str],
        changed_hint: set[str] | None = None,
    ) -> list[str]:
        """Paths whose facts must be re-extracted before the next manifest.

        ``changed_hint`` (from the filesystem watcher) is a additive signal: hinted paths
        are always considered stale even if their stat snapshot matches, because editors
        can rewrite content within the mtime granularity window.
        """
        stale: list[str] = []
        for rel in rel_paths:
            if (changed_hint is not None and rel in changed_hint) or self.is_stale(
                repo_root, rel
            ):
                stale.append(rel)
        return stale

    def record_file(
        self,
        relative_path: str,
        fingerprint: str,
        *,
        repo_root: Path | None = None,
    ) -> None:
        """Stores a fingerprint, snapshotting the file's current mtime/size when possible."""
        mtime = 0.0
        size = -1
        if repo_root is not None:
            try:
                st = (repo_root / relative_path).stat()
                mtime, size = st.st_mtime, st.st_size
            except OSError:
                pass
        self._files[relative_path] = CachedFileState(
            fingerprint=str(fingerprint or ""), mtime=mtime, size=size
        )

    def prune(self, keep: Iterable[str]) -> None:
        """Drops cache entries for files no longer present in the manifest."""
        keep_set = set(keep)
        for rel in [r for r in self._files if r not in keep_set]:
            del self._files[rel]

    def clear(self) -> None:
        self.bundle_fingerprint = ""
        self._files.clear()

    def save(self) -> None:
        """Atomic write (tmp + rename) so a crash can never leave a torn cache file."""
        payload: dict[str, Any] = {
            "version": CACHE_SCHEMA_VERSION,
            "project_id": self._project_id,
            "bundle_fingerprint": self.bundle_fingerprint,
            "files": {
                rel: {
                    "fingerprint": state.fingerprint,
                    "mtime": state.mtime,
                    "size": state.size,
                }
                for rel, state in sorted(self._files.items())
            },
        }
        if self.live_sync_enabled is not None:
            payload["live_sync_enabled"] = self.live_sync_enabled
        fd, tmp_name = tempfile.mkstemp(
            dir=str(self._path.parent), prefix=self._path.name, suffix=".tmp"
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2)
            os.replace(tmp_name, self._path)
        except OSError:
            try:
                os.unlink(tmp_name)
            except OSError:
                pass
            raise

    def _load(self) -> None:
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return
        if not isinstance(raw, dict):
            return
        if raw.get("version") != CACHE_SCHEMA_VERSION:
            return
        if str(raw.get("project_id") or "").strip() != self._project_id:
            return
        self.bundle_fingerprint = str(raw.get("bundle_fingerprint") or "").strip()
        live = raw.get("live_sync_enabled")
        self.live_sync_enabled = live if isinstance(live, bool) else None
        files = raw.get("files")
        if not isinstance(files, dict):
            return
        for rel, item in files.items():
            if not isinstance(item, dict):
                continue
            fp = str(item.get("fingerprint") or "")
            if not fp:
                continue
            try:
                mtime = float(item.get("mtime") or 0.0)
                size = int(item.get("size") if item.get("size") is not None else -1)
            except (TypeError, ValueError):
                mtime, size = 0.0, -1
            self._files[str(rel)] = CachedFileState(
                fingerprint=fp, mtime=mtime, size=size
            )
