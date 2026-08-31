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

import secrets
from urllib.parse import urlencode

from dont_break.auth.constants import (
    AUTH_CALLBACK_SCHEME,
    AUTH_CONNECT_CLIENT,
    AUTH_CONNECT_EXTENSION,
    AuthConnectField,
    AuthConnectSegment,
)
from dont_break.auth.detect_ide import DetectedIde
from dont_break.config import Settings
from dont_break.server.routes_constants import LocalRoutes


def auth_callback_url(settings: Settings) -> str:
    """Local HTTP callback, including the port we actually bound."""
    return f"{AUTH_CALLBACK_SCHEME}://{settings.host}:{settings.port}{LocalRoutes.AUTH_CALLBACK}"


def build_connect_query(
    state: str,
    settings: Settings,
    ide: DetectedIde | None = None,
) -> dict[str, str]:
    """Query for ``/connect/vscode``.

    ``redirect_uri`` always points at this process. ``scheme`` / ``app_name``
    are the real editor only when detection is unambiguous — otherwise we
    omit them so the website does not persist "Dont Break" / vscode.
    """
    query = {
        AuthConnectField.STATE.value: state,
        AuthConnectField.CLIENT.value: AUTH_CONNECT_CLIENT,
        AuthConnectField.EXTENSION.value: AUTH_CONNECT_EXTENSION,
        AuthConnectField.REDIRECT_URI.value: auth_callback_url(settings),
    }
    if ide is not None:
        query[AuthConnectField.SCHEME.value] = ide.scheme
        query[AuthConnectField.APP_NAME.value] = ide.app_name
    return query


def build_connect_url(
    state: str, settings: Settings, ide: DetectedIde | None = None
) -> str:
    params = build_connect_query(state, settings, ide=ide)
    query = urlencode(params)
    segment = AuthConnectSegment.VSCODE.value
    return f"{settings.app_url}/connect/{segment}?{query}"


def new_auth_state() -> str:
    return secrets.token_urlsafe(32)
