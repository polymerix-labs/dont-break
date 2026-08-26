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

"""Graph WebSocket stream wire protocol constants (aligned with backend GRAPH_STREAM.md)."""

from __future__ import annotations

from enum import Enum


class GraphStreamInboundType(str, Enum):
    """Inbound graph stream message discriminator (JSON field ``t``)."""

    READY = "ready"
    NODES = "nodes"
    EDGES = "edges"
    VIEW_DELTA = "view_delta"
    GRAPH_DELTA = "graph_delta"
    GRAPH_UPGRADED = "graph_upgraded"
    COMPLETE = "complete"
    ERROR = "error"


class GraphStreamOutboundType(str, Enum):
    """Outbound graph stream message discriminator."""

    HELLO = "hello"
    VIEW = "view"
    PING = "ping"
    WINDOW = "window"


class GraphStreamPhase(str, Enum):
    """Phase value on ``complete`` messages."""

    BOOTSTRAP = "bootstrap"


class GraphReadyMode(str, Enum):
    """Mode on ``ready`` messages during live sync."""

    LIVE = "live"
    COLD_WAIT = "cold_wait"


class GraphDeltaOp(str, Enum):
    """Operation type in graph_delta ops array."""

    ADD_NODE = "add_node"
    ADD_EDGE = "add_edge"


class GraphStreamErrorCode(str, Enum):
    """Error codes on graph stream ``error`` messages or proxy failures."""

    GRAPH_UNAVAILABLE = "graph_unavailable"
    PROXY_FAILED = "proxy_failed"
    SOCKET_ERROR = "socket_error"
    BAD_JSON = "bad_json"


class GraphStreamDefaults:
    """Default graph stream protocol tuning."""

    PROTOCOL_VERSION = 1
    DEFAULT_MAX_NODES = 8000
    DEFAULT_MAX_EDGES = 32000
    VIEW_DEBOUNCE_MS = 200
    RESUME_FROM_VERSION = 0


class CanonicalReloadReason(str, Enum):
    """Internal reasons for triggering a canonical graph reload."""

    GRAPH_RELOAD = "graph-reload"
    POLL_READY = "poll-ready"
    GRAPH_UPGRADED = "graph-upgraded"
    SESSION_READY = "session-ready"


def parse_graph_message_type(raw: object) -> GraphStreamInboundType | None:
    """Parse graph stream message type; return None if unknown."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return GraphStreamInboundType(text)
    except ValueError:
        return None


def parse_graph_delta_op(raw: object) -> GraphDeltaOp | None:
    """Parse graph delta operation type; return None if unknown."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return GraphDeltaOp(text)
    except ValueError:
        return None


def parse_graph_stream_phase(raw: object) -> GraphStreamPhase | None:
    """Parse complete-message phase; return None if unknown."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return GraphStreamPhase(text)
    except ValueError:
        return None
