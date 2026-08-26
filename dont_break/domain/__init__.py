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

"""Pure domain types for dont-break. No I/O or framework imports."""

from dont_break.domain.errors import (
    AuthError,
    ExtractError,
    GatewayError,
    ProjectLimitError,
)
from dont_break.domain.models import (
    AuthState,
    GraphStreamState,
    ProjectPath,
    ProjectSlug,
    SyncState,
    WorkspaceId,
)
from dont_break.domain.session import SessionSnapshot
from dont_break.domain.wire import (
    GraphStreamInboundType,
    SyncEventType,
    SyncPhase,
    SyncUploadMode,
)

__all__ = [
    "AuthError",
    "AuthState",
    "ExtractError",
    "GatewayError",
    "GraphStreamInboundType",
    "GraphStreamState",
    "ProjectLimitError",
    "ProjectPath",
    "ProjectSlug",
    "SessionSnapshot",
    "SyncEventType",
    "SyncPhase",
    "SyncState",
    "SyncUploadMode",
    "WorkspaceId",
]
