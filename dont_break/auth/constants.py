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

"""Auth connect/callback wire field names and route segments."""

from __future__ import annotations

from enum import Enum

from dont_break.config import CLIENT_NAME


class AuthConnectField(str, Enum):
    """Query parameters for the Polymerix connect flow."""

    STATE = "state"
    SCHEME = "scheme"
    CLIENT = "client"
    EXTENSION = "extension"
    REDIRECT_URI = "redirect_uri"
    APP_NAME = "app_name"


class AuthCallbackField(str, Enum):
    """Query parameters on the local auth callback."""

    TOKEN = "token"
    STATE = "state"
    ORG_SLUG = "org_slug"


class AuthConnectSegment(str, Enum):
    """Connect URL path segment."""

    VSCODE = "vscode"


class CredentialField(str, Enum):
    """Keys in persisted credentials.json."""

    TOKEN = "token"
    ORG_SLUG = "org_slug"


APP_DISPLAY_NAME = "Dont Break"
AUTH_CONNECT_CLIENT = CLIENT_NAME
AUTH_CONNECT_EXTENSION = CLIENT_NAME
AUTH_CALLBACK_SCHEME = "http"
