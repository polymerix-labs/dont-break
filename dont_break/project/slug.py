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

import re
import unicodedata
from pathlib import Path

from dont_break.extract.constants import DEFAULT_WORKSPACE_SLUG


def project_slug_from_path(project_path: str) -> str:
    """Slug from directory basename (matches backend `projectSlugFromPath`)."""
    trimmed = project_path.strip().rstrip("/\\")
    base = Path(trimmed).name or trimmed
    nfd = unicodedata.normalize("NFD", base)
    no_marks = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    slug = re.sub(r"[^a-z0-9]+", "-", no_marks.lower()).strip("-")[:48]
    return slug or DEFAULT_WORKSPACE_SLUG
