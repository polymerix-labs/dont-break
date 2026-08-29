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

import contextlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import threading
import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

from dont_break.config import EnvVar, config_dir
from dont_break.domain.errors import ExtractError
from dont_break.extract.constants import (
    BUNDLE_FILENAME,
    FACTS_EXTRACT_PACKAGE,
    FACTS_EXTRACT_VERSION,
    TEMP_DIR_PREFIX,
    TOOLS_PACKAGE_NAME,
)


def _tools_dir() -> Path:
    path = config_dir() / "tools"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _install_roots() -> list[Path]:
    roots: list[Path] = []
    dev = Path(__file__).resolve().parents[2]
    if (dev / "package.json").is_file():
        roots.append(dev)
    roots.append(_tools_dir())
    return roots


def _binary_in(root: Path) -> Path | None:
    for name in ("facts-extract", "facts-extract.cmd"):
        path = root / "node_modules" / ".bin" / name
        if path.is_file():
            return path
    return None


def _local_binary() -> str | None:
    best: tuple[tuple[int, int, int], Path] | None = None
    for root in _install_roots():
        path = _binary_in(root)
        if path is None:
            continue
        ver = _parse_semver(_installed_version_in(root) or "") or (0, 0, 0)
        if best is None or ver >= best[0]:
            best = (ver, path)
    return str(best[1]) if best else None


def _parse_semver(raw: str) -> tuple[int, int, int] | None:
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
    a = _parse_semver(latest)
    b = _parse_semver(installed)
    if a is None or b is None:
        return bool(latest) and latest != installed
    return a > b


def _floor_tuple() -> tuple[int, int, int]:
    raw = FACTS_EXTRACT_VERSION.lstrip("^~>=< ")
    return _parse_semver(raw) or (0, 16, 0)


def _meets_floor(version: str) -> bool:
    parsed = _parse_semver(version)
    return parsed is not None and parsed >= _floor_tuple()


def _installed_version_in(root: Path) -> str | None:
    pkg = root / "node_modules" / FACTS_EXTRACT_PACKAGE / "package.json"
    if not pkg.is_file():
        return None
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    version = data.get("version")
    return version if isinstance(version, str) and version else None


def installed_facts_extract_version() -> str | None:
    versions = [_installed_version_in(root) for root in _install_roots()]
    present = [v for v in versions if v]
    if not present:
        return None
    return max(present, key=lambda v: _parse_semver(v) or (0, 0, 0))


_LATEST_TTL_SEC = 600.0
_latest_lock = threading.Lock()
_cached_latest: str | None = None
_cached_latest_at = 0.0
_upgrade_lock = threading.Lock()
_installed_for_latest: str | None = None


def _npm_view_latest(*, timeout: float = 8.0) -> str | None:
    npm = shutil.which("npm")
    if not npm:
        return None
    try:
        result = subprocess.run(
            [npm, "view", FACTS_EXTRACT_PACKAGE, "version"],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    version = (result.stdout or "").strip().splitlines()[-1] if result.stdout else ""
    return version or None


def latest_facts_extract_version(*, refresh: bool = False) -> str | None:
    global _cached_latest, _cached_latest_at
    now = time.monotonic()
    with _latest_lock:
        if (
            not refresh
            and _cached_latest is not None
            and (now - _cached_latest_at) < _LATEST_TTL_SEC
        ):
            return _cached_latest
    fetched = _npm_view_latest()
    if fetched is None:
        with _latest_lock:
            return _cached_latest
    with _latest_lock:
        _cached_latest = fetched
        _cached_latest_at = time.monotonic()
        return _cached_latest


def _is_overridden() -> bool:
    return bool(os.environ.get(EnvVar.POLYMERIX_FACTS_EXTRACT_EXECUTABLE.value, "").strip())


def facts_extract_status(*, refresh_latest: bool = False) -> dict[str, Any]:
    installed = installed_facts_extract_version()
    overridden = _is_overridden()
    latest = None if overridden else latest_facts_extract_version(refresh=refresh_latest)
    update_available = bool(
        not overridden
        and latest
        and _meets_floor(latest)
        and (not installed or _is_newer(latest, installed))
    )
    return {
        "package": FACTS_EXTRACT_PACKAGE,
        "installed": installed,
        "latest": latest,
        "update_available": update_available,
        "overridden": overridden,
    }


def _install_exact(root: Path, version: str, *, verbose: bool = False) -> None:
    npm = shutil.which("npm")
    if not npm:
        raise ExtractError("npm is required to update facts-extract.")
    if not verbose:
        print(f"Updating {FACTS_EXTRACT_PACKAGE} to {version}…", flush=True)
    spec = f"{FACTS_EXTRACT_PACKAGE}@{version}"
    cmd = [npm, "install", spec, "--omit=dev", "--no-fund", "--no-audit"]
    if verbose:
        cmd.append("--loglevel=verbose")
    result = subprocess.run(cmd, cwd=root, capture_output=not verbose, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise ExtractError(
            f"npm install {spec} failed in {root}"
            + (f": {detail[:500]}" if detail else "")
        )


def maybe_upgrade_facts_extract(*, force: bool = False, verbose: bool = False) -> dict[str, Any]:
    """Install npm latest into ~/.config/dont-break/tools.

    Without ``force``, only runs when npm is newer than the cached binary.
    ``force=True`` reinstalls latest even when already current. Never rewrites
    a git checkout package.json.
    """
    global _installed_for_latest, _cached_latest, _cached_latest_at
    if _is_overridden():
        return facts_extract_status()
    with _upgrade_lock:
        status = facts_extract_status(refresh_latest=force)
        latest = status.get("latest")
        if not isinstance(latest, str) or not latest:
            return status
        if not force and not status["update_available"]:
            return status
        if not force and _installed_for_latest == latest:
            return status
        _install_exact(_tools_dir(), latest, verbose=verbose)
        _installed_for_latest = latest
        with _latest_lock:
            _cached_latest = latest
            _cached_latest_at = time.monotonic()
        return facts_extract_status()


def _try_upgrade_quietly(*, verbose: bool = False) -> None:
    try:
        maybe_upgrade_facts_extract(verbose=verbose)
    except Exception:
        return


def _write_tools_package_json(root: Path) -> bool:
    """Writes (or refreshes) the tools package.json. Returns True when the pinned
    facts-extract version changed, so callers re-run npm install to upgrade a
    cached older binary."""
    package_json = root / "package.json"
    if package_json.is_file():
        try:
            current = json.loads(package_json.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            current = {}
        if current.get("name") != TOOLS_PACKAGE_NAME:

            return False
        pinned = (current.get("dependencies") or {}).get(FACTS_EXTRACT_PACKAGE)
        if pinned == FACTS_EXTRACT_VERSION:
            return False
    payload = {
        "name": TOOLS_PACKAGE_NAME,
        "private": True,
        "dependencies": {FACTS_EXTRACT_PACKAGE: FACTS_EXTRACT_VERSION},
    }
    package_json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return True


def _npm_install(root: Path, *, verbose: bool = False) -> None:
    npm = shutil.which("npm")
    if not npm:
        return
    if not verbose:
        print(f"Installing {FACTS_EXTRACT_PACKAGE}…", flush=True)
    cmd = [npm, "install", "--omit=dev", "--no-fund", "--no-audit"]
    if verbose:
        cmd.append("--loglevel=verbose")
    result = subprocess.run(cmd, cwd=root, capture_output=not verbose, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise ExtractError(
            f"npm install failed in {root}"
            + (f": {detail[:500]}" if detail else "")
        )


def ensure_facts_extract(*, verbose: bool = False) -> None:
    if os.environ.get(EnvVar.POLYMERIX_FACTS_EXTRACT_EXECUTABLE.value, "").strip():
        return
    if _local_binary():
        _try_upgrade_quietly(verbose=verbose)
        return

    npm = shutil.which("npm")
    npx = shutil.which("npx")
    if not npm and not npx:
        raise ExtractError(
            f"Node.js is required for {FACTS_EXTRACT_PACKAGE}. "
            "Install Node.js, then run dont-break --wake again."
        )

    for root in _install_roots():
        pin_changed = _write_tools_package_json(root)
        if not pin_changed and _local_binary():
            _try_upgrade_quietly(verbose=verbose)
            return
        if (pin_changed or not (root / "node_modules").is_dir()) and npm:
            _npm_install(root, verbose=verbose)
            if _local_binary():
                _try_upgrade_quietly(verbose=verbose)
                return
        if _local_binary():
            _try_upgrade_quietly(verbose=verbose)
            return

    if npx:
        _try_upgrade_quietly(verbose=verbose)
        return

    raise ExtractError(
        f"Could not install {FACTS_EXTRACT_PACKAGE}. "
        f"Install Node.js or set {EnvVar.POLYMERIX_FACTS_EXTRACT_EXECUTABLE.value}."
    )


def _resolve_binary() -> list[str]:
    override = os.environ.get(EnvVar.POLYMERIX_FACTS_EXTRACT_EXECUTABLE.value, "").strip()
    if override:
        return [override]

    local = _local_binary()
    if local:
        return [local]

    npx = shutil.which("npx")
    if npx:
        return [npx, FACTS_EXTRACT_PACKAGE]

    raise ExtractError(
        "facts-extract not found after setup. Install Node.js or set "
        f"{EnvVar.POLYMERIX_FACTS_EXTRACT_EXECUTABLE.value}."
    )


def list_repo_files(
    repo_root: Path,
    *,
    verbose: bool = False,
) -> list[str] | None:
    """Repo-relative source paths from `facts-extract --list` — the exact file set a
    full extraction produces (same walker: `.gitignore`, size cap, minified/generated
    guards). Returns ``None`` when the installed binary predates the flag, so callers
    fall back to the legacy Python walk.
    """
    ensure_facts_extract(verbose=verbose)
    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")

    cmd = [*_resolve_binary(), "--repo-root", str(repo_root), "--list"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        if "unknown option: --list" in detail:
            return None
        raise ExtractError(
            f"facts-extract --list failed (exit {result.returncode})"
            + (f": {detail[:500]}" if detail else "")
        )
    try:
        listing = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ExtractError(f"Invalid file listing JSON: {exc}") from exc
    files = listing.get("files")
    if not isinstance(files, list):
        raise ExtractError("File listing missing 'files' array")
    return [str(item) for item in files]


def scan_repo(
    repo_root: Path,
    *,
    verbose: bool = False,
) -> list[dict[str, Any]] | None:
    """`facts-extract --scan`: the walker's file listing with blake3 content hashes,
    zero parsing. Sub-second even on tens of thousands of files, so it replaces
    `--list` as discovery AND feeds the server-side CAS negotiate (unchanged files
    are carried over from the last seal without extraction or upload).

    Returns ``None`` when the installed binary predates the flag, so callers fall
    back to the pre-CAS flow.
    """
    ensure_facts_extract(verbose=verbose)
    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")

    cmd = [*_resolve_binary(), "--repo-root", str(repo_root), "--scan"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        if "unknown option: --scan" in detail:
            return None
        raise ExtractError(
            f"facts-extract --scan failed (exit {result.returncode})"
            + (f": {detail[:500]}" if detail else "")
        )
    try:
        listing = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ExtractError(f"Invalid scan listing JSON: {exc}") from exc
    files = listing.get("files")
    if not isinstance(files, list):
        raise ExtractError("Scan listing missing 'files' array")
    entries: list[dict[str, Any]] = []
    for item in files:
        if not isinstance(item, dict):
            raise ExtractError("Scan listing entry is not an object")
        rel = str(item.get("relative_path") or "").strip()
        content_hash = str(item.get("content_hash") or "").strip()
        if not rel or not content_hash:
            raise ExtractError("Scan listing entry missing relative_path/content_hash")
        entries.append(
            {
                "relative_path": rel,
                "content_hash": content_hash,

                "size": int(item.get("size") or 0),
            }
        )
    entries.sort(key=lambda e: e["relative_path"])
    return entries


class FactsStream:
    """Live NDJSON stream from `facts-extract --stream`.

    Wire form: a header line (`{"t":"header",...}`), then one raw FactsFileEntry
    per line **as each file finishes parsing** (completion order), then an end
    line (`{"t":"end","bundle_fingerprint":...}`). Iterating yields the file
    entries; `header` is available immediately and `end` after exhaustion.
    """

    def __init__(self, proc: subprocess.Popen, header: dict[str, Any]) -> None:
        self._proc = proc
        self.header = header
        self.end: dict[str, Any] | None = None

    @property
    def total(self) -> int:
        return int(self.header.get("total") or 0)

    def iter_raw_lines(self) -> Any:
        """Yields raw FactsFileEntry JSON lines (unparsed, for cheap pass-through
        into part payloads). Control lines are recognized structurally: file lines
        always start with `{"entry"` (serde struct field order), control lines
        carry a top-level `"t"` key. Sets `self.end` when the end line arrives.
        """
        stdout = self._proc.stdout
        assert stdout is not None
        try:
            for line in stdout:
                line = line.strip()
                if not line:
                    continue
                if line.startswith('{"entry"'):
                    yield line
                    continue
                try:
                    item = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ExtractError(f"Invalid stream line JSON: {exc}") from exc
                if isinstance(item, dict) and item.get("t") == "end":
                    self.end = item
                    break

        except GeneratorExit:

            self.kill()
            raise
        self.close()
        if self.end is None:
            raise ExtractError(
                f"facts-extract --stream ended without an end line (exit {self._proc.returncode})"
            )

    def __iter__(self) -> Any:
        for line in self.iter_raw_lines():
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                raise ExtractError(f"Invalid stream line JSON: {exc}") from exc

    def kill(self) -> None:
        """Aborts the extraction (consumer bailed): no exit-code check."""
        with contextlib.suppress(OSError):
            self._proc.kill()
        self._proc.wait()

    def close(self) -> None:
        proc = self._proc
        if proc.stdout is not None:
            proc.stdout.close()
        return_code = proc.wait()
        if return_code != 0:
            raise ExtractError(f"facts-extract --stream failed (exit {return_code})")


def stream_facts_extract(
    repo_root: Path,
    *,
    verbose: bool = False,
) -> FactsStream | None:
    """Spawns `facts-extract --stream` and returns the live stream, or ``None``
    when the installed binary predates the flag (callers fall back to the
    batch extract-then-upload flow)."""
    ensure_facts_extract(verbose=verbose)
    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")

    cmd = [*_resolve_binary(), "--repo-root", str(repo_root), "--stream"]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    stdout = proc.stdout
    assert stdout is not None
    first_line = stdout.readline()
    if not first_line:

        stderr = proc.stderr.read() if proc.stderr is not None else ""
        return_code = proc.wait()
        if "unknown option: --stream" in stderr:
            return None
        raise ExtractError(
            f"facts-extract --stream failed (exit {return_code})"
            + (f": {stderr.strip()[:500]}" if stderr.strip() else "")
        )
    try:
        header = json.loads(first_line)
    except json.JSONDecodeError as exc:
        proc.kill()
        raise ExtractError(f"Invalid stream header JSON: {exc}") from exc
    if not isinstance(header, dict) or header.get("t") != "header":
        proc.kill()
        raise ExtractError("facts-extract --stream did not start with a header line")
    return FactsStream(proc, header)


def run_single_file(
    repo_root: Path,
    relative_path: str,
    *,
    verbose: bool = False,
) -> dict[str, Any]:
    ensure_facts_extract(verbose=verbose)
    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")

    cmd = [
        *_resolve_binary(),
        "--repo-root",
        str(repo_root),
        "--file",
        relative_path,
    ]
    if verbose:
        cmd.append("--verbose")

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise ExtractError(
            f"facts-extract --file failed (exit {result.returncode})"
            + (f": {detail[:500]}" if detail else "")
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ExtractError(f"Invalid FactsFileEntry JSON: {exc}") from exc


def run_files(
    repo_root: Path,
    relative_paths: list[str],
    *,
    verbose: bool = False,
) -> dict[str, Any]:
    """Targeted extraction: facts for only ``relative_paths``, as a partial FactsBundle.

    Uses `facts-extract --files a,b,c` (>= 0.13.0). When the installed binary predates the
    flag, falls back to one `--file` call per path and synthesizes an equivalent bundle
    shape, so live sync keeps working against an older cached install.
    """
    ensure_facts_extract(verbose=verbose)
    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")
    if not relative_paths:
        return {"files": []}

    cmd = [
        *_resolve_binary(),
        "--repo-root",
        str(repo_root),
        "--files",
        ",".join(relative_paths),
    ]
    if verbose:
        cmd.append("--verbose")

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        if "unknown option: --files" in detail:
            files = [
                run_single_file(repo_root, rel, verbose=verbose)
                for rel in relative_paths
            ]
            return {"files": files}
        raise ExtractError(
            f"facts-extract --files failed (exit {result.returncode})"
            + (f": {detail[:500]}" if detail else "")
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ExtractError(f"Invalid FactsBundle JSON: {exc}") from exc


def run_facts_extract(
    repo_root: Path,
    *,
    verbose: bool = False,
    progress: bool = True,
    output: Path | None = None,
    on_progress: Callable[[int, int], None] | None = None,
) -> Path:
    ensure_facts_extract(verbose=verbose)

    repo_root = repo_root.resolve()
    if not repo_root.is_dir():
        raise ExtractError(f"Repository not found: {repo_root}")

    out_path = output or Path(tempfile.mkdtemp(prefix=TEMP_DIR_PREFIX)) / BUNDLE_FILENAME
    out_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        *_resolve_binary(),
        "--repo-root",
        str(repo_root),
        "-o",
        str(out_path),
    ]
    if verbose:
        cmd.append("--verbose")
    if progress:
        cmd.append("--progress")

    if progress and on_progress is not None:
        proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, text=True)
        progress_re = re.compile(r"(\d+)/(\d+)")
        stderr = proc.stderr
        if stderr is not None:
            for line in stderr:
                match = progress_re.search(line)
                if match:
                    on_progress(int(match.group(1)), int(match.group(2)))
        return_code = proc.wait()
        if return_code != 0:
            raise ExtractError(f"facts-extract failed (exit {return_code})")
    else:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            detail = (result.stderr or result.stdout or "").strip()
            raise ExtractError(
                f"facts-extract failed (exit {result.returncode})"
                + (f": {detail[:500]}" if detail else "")
            )

    if not out_path.is_file():
        raise ExtractError(f"facts-extract did not write {BUNDLE_FILENAME}")

    return out_path


def load_bundle(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))
