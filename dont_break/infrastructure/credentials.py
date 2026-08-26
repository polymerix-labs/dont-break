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

"""Persistent credential storage."""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from typing import Any

from dont_break.auth.constants import CredentialField
from dont_break.config import credentials_path


@dataclass
class StoredCredentials:
    token: str = ""
    org_slug: str = ""


def is_valid_access_token(token: str) -> bool:
    """Accept session JWTs and opaque API tokens without tenant metadata."""
    return bool(token.strip())


class CredentialStore:
    def load(self) -> StoredCredentials:
        path = credentials_path()
        if not path.is_file():
            return StoredCredentials()
        try:
            raw: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return StoredCredentials()
        return StoredCredentials(
            token=str(raw.get(CredentialField.TOKEN.value) or ""),
            org_slug=str(raw.get(CredentialField.ORG_SLUG.value) or ""),
        )

    def save(self, creds: StoredCredentials) -> None:
        path = credentials_path()
        path.write_text(json.dumps(asdict(creds), indent=2), encoding="utf-8")
        os.chmod(path, 0o600)


_DEFAULT_STORE = CredentialStore()


def load_credentials() -> StoredCredentials:
    return _DEFAULT_STORE.load()


def save_credentials(creds: StoredCredentials) -> None:
    _DEFAULT_STORE.save(creds)
