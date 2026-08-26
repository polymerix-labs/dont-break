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

"""facts-extract subprocess adapter."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

from dont_break.extract.facts_extract import FactsStream
from dont_break.extract.facts_extract import list_repo_files as _list_repo_files
from dont_break.extract.facts_extract import load_bundle as _load_bundle
from dont_break.extract.facts_extract import run_facts_extract as _run_facts_extract
from dont_break.extract.facts_extract import run_files as _run_files
from dont_break.extract.facts_extract import run_single_file as _run_single_file
from dont_break.extract.facts_extract import scan_repo as _scan_repo
from dont_break.extract.facts_extract import stream_facts_extract as _stream_facts_extract


class FactsExtractRunner:
    def list_files(
        self,
        project_path: Path,
        *,
        verbose: bool = False,
    ) -> list[str] | None:
        """Walker-authoritative discovery (`--list`); ``None`` on pre-0.13 binaries."""
        return _list_repo_files(project_path, verbose=verbose)

    def scan(
        self,
        project_path: Path,
        *,
        verbose: bool = False,
    ) -> list[dict[str, Any]] | None:
        """Walker listing + blake3 content hashes (`--scan`, zero parse); ``None``
        on binaries that predate the flag."""
        return _scan_repo(project_path, verbose=verbose)

    def stream(
        self,
        project_path: Path,
        *,
        verbose: bool = False,
    ) -> FactsStream | None:
        """Live per-file extraction stream (`--stream`); ``None`` on binaries that
        predate the flag."""
        return _stream_facts_extract(project_path, verbose=verbose)

    def run(
        self,
        project_path: Path,
        *,
        verbose: bool = False,
        progress: bool = True,
    ) -> dict[str, Any]:
        bundle_path = _run_facts_extract(project_path, verbose=verbose, progress=progress)
        return self.load_bundle(bundle_path)

    def run_single_file(
        self,
        project_path: Path,
        relative_path: str,
        *,
        verbose: bool = False,
    ) -> dict[str, Any]:
        return _run_single_file(project_path, relative_path, verbose=verbose)

    def run_files(
        self,
        project_path: Path,
        relative_paths: list[str],
        *,
        verbose: bool = False,
    ) -> dict[str, Any]:
        """Targeted extraction of a path subset, returned as a partial FactsBundle dict."""
        return _run_files(project_path, relative_paths, verbose=verbose)

    def load_bundle(self, path: Path) -> dict[str, Any]:
        return _load_bundle(path)

    def run_facts_extract_path(
        self,
        project_path: Path,
        *,
        verbose: bool = False,
        progress: bool = True,
        on_progress: Callable[[int, int], None] | None = None,
    ) -> Path:
        return _run_facts_extract(
            project_path,
            verbose=verbose,
            progress=progress,
            on_progress=on_progress,
        )
