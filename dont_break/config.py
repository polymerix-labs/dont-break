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

import json
import os
import sys
import uuid
from enum import Enum
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from dont_break import __version__

CLIENT_VERSION = __version__
CLIENT_NAME = "dont-break"
INSTALL_ID_FILENAME = "install.json"
AUTH_CALLBACK_TIMEOUT_SEC = 300.0
CONFIG_DIR_NAME = "dont-break"
CREDENTIALS_FILENAME = "credentials.json"


class EnvVar(str, Enum):
    """Environment variable names read by Settings and tooling."""

    POLYMERIX_API_BASE_URL = "POLYMERIX_API_BASE_URL"
    POLYMERIX_API_BASEURL = "POLYMERIX_API_BASEURL"
    POLYMERIX_APP_URL = "POLYMERIX_APP_URL"
    POLYMERIX_ORG_SLUG = "POLYMERIX_ORG_SLUG"
    DONT_BREAK_HOST = "DONT_BREAK_HOST"
    DONT_BREAK_PORT = "DONT_BREAK_PORT"
    POLYMERIX_FACTS_EXTRACT_EXECUTABLE = "POLYMERIX_FACTS_EXTRACT_EXECUTABLE"
    DONT_BREAK_PICKER_INLINE = "DONT_BREAK_PICKER_INLINE"
    XDG_CONFIG_HOME = "XDG_CONFIG_HOME"


def config_dir() -> Path:
    base = os.environ.get(EnvVar.XDG_CONFIG_HOME.value)
    root = Path(base) if base else Path.home() / ".config"
    path = root / CONFIG_DIR_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path


def credentials_path() -> Path:
    return config_dir() / CREDENTIALS_FILENAME


_cached_install_id: str | None = None


def client_os() -> str:
    """Coarse platform token for `X-Polymerix-Os`. Never a hostname."""
    plat = sys.platform
    if plat.startswith("darwin"):
        return "darwin"
    if plat.startswith("linux"):
        return "linux"
    if plat.startswith("win"):
        return "win32"
    return "unknown"


def install_id() -> str:
    """Stable id for this desktop install, persisted under config_dir().

    Derived once from a local file — no analytics token lives here.
    """
    global _cached_install_id
    if _cached_install_id:
        return _cached_install_id
    path = config_dir() / INSTALL_ID_FILENAME
    try:
        if path.is_file():
            data = json.loads(path.read_text(encoding="utf-8"))
            value = str(data.get("install_id") or "").strip()
            if value:
                _cached_install_id = value
                return value
    except (OSError, ValueError, TypeError):
        pass
    value = uuid.uuid4().hex
    try:
        path.write_text(json.dumps({"install_id": value}) + "\n", encoding="utf-8")
    except OSError:
        pass
    _cached_install_id = value
    return value


def reset_install_id_cache() -> None:
    """Test-only: drop the process cache so a new config_dir is re-read."""
    global _cached_install_id
    _cached_install_id = None


def _optional_user_env_files() -> tuple[str, ...]:
    """Optional overrides only — never load a cwd .env.local (lab footgun).

    End users run ``dont-break --wake`` with zero config; defaults are production.
    Power users / local gateway: put vars in ``~/.config/dont-break/.env``.
    """
    user_env = config_dir() / ".env"
    return (str(user_env),) if user_env.is_file() else ()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_optional_user_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    polymerix_api_base_url: str = "https://api.polymerix.io"
    polymerix_app_url: str = "https://dont-break.com"
    polymerix_org_slug: str = ""
    dont_break_host: str = "127.0.0.1"
    dont_break_port: int = 4040

    @property
    def api_base_url(self) -> str:
        raw = (
            os.environ.get(EnvVar.POLYMERIX_API_BASE_URL.value)
            or os.environ.get(EnvVar.POLYMERIX_API_BASEURL.value)
            or self.polymerix_api_base_url
        )
        return raw.rstrip("/")

    @property
    def app_url(self) -> str:
        raw = os.environ.get(EnvVar.POLYMERIX_APP_URL.value) or self.polymerix_app_url
        return raw.rstrip("/")

    @property
    def org_override(self) -> str:
        return (
            os.environ.get(EnvVar.POLYMERIX_ORG_SLUG.value) or self.polymerix_org_slug
        ).strip()

    @property
    def host(self) -> str:
        return os.environ.get(EnvVar.DONT_BREAK_HOST.value) or self.dont_break_host

    @property
    def port(self) -> int:
        env = os.environ.get(EnvVar.DONT_BREAK_PORT.value)
        if env:
            return int(env)
        return self.dont_break_port

    def use_port(self, port: int) -> None:
        """Bind later auth callbacks to the port we actually started on.

        Preflight can pick 4041 when 4040 is taken. ``port`` still reads
        ``DONT_BREAK_PORT`` first, so both the field and the env must move
        or the browser comes back to the old address.
        """
        self.dont_break_port = port
        os.environ[EnvVar.DONT_BREAK_PORT.value] = str(port)
