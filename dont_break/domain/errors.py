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

"""Domain-level errors. Raised by application and infrastructure layers."""

from __future__ import annotations

from enum import Enum


class ErrorCode(str, Enum):
    """Stable error codes for operational failures."""

    GATEWAY_UNREACHABLE = "gateway_unreachable"
    TOKEN_EXPIRED = "token_expired"
    SYNC_NO_FILES = "sync_no_files"
    SYNC_BUILD_FAILED = "sync_build_failed"
    SYNC_FAILED = "sync_failed"
    GRAPH_UNAVAILABLE = "graph_unavailable"
    PROXY_FAILED = "proxy_failed"
    AUTH_INVALID_CALLBACK = "auth_invalid_callback"
    AUTH_INVALID_TOKEN = "auth_invalid_token"
    AUTH_TIMEOUT = "auth_timeout"
    NOT_AUTHENTICATED = "not_authenticated"
    MISSING_WORKSPACE_PROJECT = "missing_workspace_project"


class ApiErrorMessage(str, Enum):
    """Wire/API error message strings returned to clients."""

    NOT_AUTHENTICATED = "not authenticated"
    MISSING_WORKSPACE_PROJECT = "missing workspace/project context"



    GATEWAY_UNREACHABLE = (
        "Cannot reach the Polymerix service. Check your internet connection, then retry."
    )
    INVALID_TOKEN = "Invalid or expired API token (401)"
    SYNC_NO_FILES = "No supported source files found for incremental sync."
    UPLOAD_PLAN_EMPTY = "Upload plan returned no parts"
    AUTH_INVALID_CALLBACK = "Sign-in failed (invalid or expired callback). Run dont-break --wake again."
    AUTH_INVALID_TOKEN = "Sign-in returned an invalid token."
    AUTH_TIMEOUT = "Sign-in timed out. Run dont-break --wake again."
    NOT_GIT_REPO = "Not a git repository. Run dont-break --wake from a git checkout."





GATEWAY_UNREACHABLE_HINT = "set POLYMERIX_API_BASE_URL, or start the API at that address"


class AuthError(Exception):
    """Sign-in callback or token validation failed."""


class GatewayError(Exception):
    """Gateway request failed or returned an unexpected response."""

    def __init__(
        self,
        message: str,
        *,
        code: ErrorCode | None = None,
        status_code: int | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code


class ProjectLimitError(GatewayError):
    """Workspace early-stage project limit reached (HTTP 409)."""


class ExtractError(Exception):
    """facts-extract subprocess or bundle parsing failed."""
