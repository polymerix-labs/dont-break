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

"""Wire protocol enums and parse helpers (sync SSE + graph WebSocket)."""

from dont_break.domain.wire.graph import (
    CanonicalReloadReason,
    GraphDeltaOp,
    GraphReadyMode,
    GraphStreamDefaults,
    GraphStreamErrorCode,
    GraphStreamInboundType,
    GraphStreamOutboundType,
    GraphStreamPhase,
    parse_graph_delta_op,
    parse_graph_message_type,
    parse_graph_stream_phase,
)
from dont_break.domain.wire.sync import (
    DEFAULT_SYNC_BUILD_FAILED,
    SFS_TRANSPORT_VERSION,
    SYNC_FAILURE_FALLBACK,
    SYNC_FAILURE_LABELS,
    SYNC_FAILURE_UNAUTHORIZED,
    SYNC_FAILURE_UNKNOWN_PREFIX,
    SYNC_FAILURE_UNREACHABLE,
    SYNC_PHASE_LABELS,
    WATCH_FAILURE_STOPPED,
    SyncEventType,
    SyncPhase,
    SyncProgressLabel,
    SyncProgressThresholds,
    SyncResultKind,
    SyncTuning,
    SyncUploadMode,
    WatchStatus,
    WatchTuning,
    parse_sync_event_type,
    humanize_sync_error,
    humanize_sync_exception,
    is_transient_sync_failure,
    parse_sync_phase,
    sync_failure_text,
    sync_l2_blend_pct,
    sync_phase_label,
)

__all__ = [
    "CanonicalReloadReason",
    "DEFAULT_SYNC_BUILD_FAILED",
    "GraphDeltaOp",
    "GraphReadyMode",
    "GraphStreamDefaults",
    "GraphStreamErrorCode",
    "GraphStreamInboundType",
    "GraphStreamOutboundType",
    "GraphStreamPhase",
    "SFS_TRANSPORT_VERSION",
    "SYNC_FAILURE_FALLBACK",
    "SYNC_FAILURE_LABELS",
    "SYNC_FAILURE_UNAUTHORIZED",
    "SYNC_FAILURE_UNKNOWN_PREFIX",
    "SYNC_FAILURE_UNREACHABLE",
    "SYNC_PHASE_LABELS",
    "WATCH_FAILURE_STOPPED",
    "SyncEventType",
    "SyncPhase",
    "SyncProgressLabel",
    "SyncProgressThresholds",
    "SyncResultKind",
    "SyncTuning",
    "SyncUploadMode",
    "WatchStatus",
    "WatchTuning",
    "parse_graph_delta_op",
    "parse_graph_message_type",
    "parse_graph_stream_phase",
    "parse_sync_event_type",
    "humanize_sync_error",
    "humanize_sync_exception",
    "is_transient_sync_failure",
    "parse_sync_phase",
    "sync_failure_text",
    "sync_l2_blend_pct",
    "sync_phase_label",
]
