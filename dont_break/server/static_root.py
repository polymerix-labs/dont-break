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

from pathlib import Path


def static_root() -> Path:
    pkg = Path(__file__).resolve().parent.parent
    repo_root = pkg.parent
    dev = repo_root / "frontend" / "dist"
    bundled = pkg / "static"

    if dev.is_dir() and (repo_root / "frontend" / "package.json").is_file():
        return dev
    if bundled.is_dir():
        return bundled
    return dev if dev.is_dir() else bundled
