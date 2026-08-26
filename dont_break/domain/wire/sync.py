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

"""Sync SSE wire protocol constants (aligned with backend sync-events.ts / sync-session.ts)."""

from __future__ import annotations

import json
import re
from enum import Enum


_ERROR_CODE_RE = re.compile(r"[A-Z][A-Z0-9_]*")

_STATUS_IN_TEXT_RE = re.compile(r"\((\d{3})\)")


class SyncPhase(str, Enum):
    """Gateway sync session lifecycle phase."""

    UPLOADING = "UPLOADING"
    SEALING = "SEALING"
    READY = "READY"
    FAILED = "FAILED"


class SyncEventType(str, Enum):
    """SSE sync event discriminator (JSON field ``t``)."""

    SESSION_OPEN = "session.open"
    UPLOAD_PROGRESS = "upload.progress"
    UPLOAD_ACCEPTED = "upload.accepted"
    UPLOAD_REJECTED = "upload.rejected"
    GRAPH_VERSION = "graph.version"
    L2_PARTIAL = "l2.partial"
    SEAL_PROGRESS = "seal.progress"
    PHASE = "phase"
    SEALED = "sealed"
    FAILED = "failed"
    HEARTBEAT = "heartbeat"


class SyncUploadMode(str, Enum):
    """Client upload strategy for sync session creation."""

    DELTA = "delta"
    STREAMING = "streaming"


class SyncResultKind(str, Enum):
    """Local sync completion kind returned by SyncService."""

    SYNC_COLD = "sync_cold"
    SYNC_DELTA = "sync_delta"


    SYNC_CAS = "sync_cas"


class SyncProgressLabel(str, Enum):
    """Human-readable sync progress labels pushed to SessionStore."""

    STARTING = "Starting sync…"
    EXTRACTING = "Extracting facts…"
    FACTS_EXTRACTED = "Facts extracted"
    UPLOADING_FILES = "Uploading files…"
    UPLOADING_PARTS = "Uploading parts…"
    UPLOAD_COMPLETE = "Upload complete"
    BUILDING_GRAPH = "Building graph…"
    RETRYING_UNREACHABLE = "Our service was briefly unreachable — retrying…"
    SEALING = "Sealing snapshot…"
    RESOLVING = "Resolving references…"


class SyncProgressThresholds:
    """Numeric thresholds for sync progress UI blending."""

    SEALING_MIN_PCT = 85
    L2_BLEND_BASE = 85
    L2_BLEND_SCALE = 0.15



    UPLOAD_MAX_PCT = 80


class SyncTuning:
    """Incremental sync heuristics and upload parallelism.

    With real per-file fingerprints in the manifest, the server's pending list is
    trustworthy, so delta is worth it up to a large burst (branch checkout territory).
    Beyond DELTA_MAX_FILES changed files (or half the tree), a cold streaming sync is
    cheaper than per-file PUTs. Gateway rate limit is 600 file PUTs/min.
    """

    DELTA_MAX_FILES = 200
    DELTA_MAX_RATIO = 0.5
    UPLOAD_PARALLELISM = 16


    FILES_BATCH_CHUNK = 100


    PART_UPLOAD_PARALLELISM = 3
    PART_QUEUE_DEPTH = 4




    SEAL_RETRY_MAX_ATTEMPTS = 4
    SEAL_RETRY_BASE_S = 1.0
    SEAL_RETRY_MAX_S = 8.0


class WatchStatus(str, Enum):
    """Live-sync watcher state exposed to the UI (synced = watching + last_synced_at)."""

    WATCHING = "watching"
    SYNCING = "syncing"
    ERROR = "error"


class WatchTuning:
    """Filesystem watcher policies for live sync."""

    DEBOUNCE_MS = 400


    MIN_SYNC_INTERVAL_S = 1.0


    BURST_HINT_LIMIT = 200
    BACKOFF_BASE_S = 2.0
    BACKOFF_MAX_S = 60.0


SFS_TRANSPORT_VERSION = 1

DEFAULT_SYNC_BUILD_FAILED = "sync build failed"










SYNC_FAILURE_LABELS: dict[str, str] = {
    "SEAL_STALLED": "The snapshot build stopped responding. Retry the sync.",
    "SEAL_TIMEOUT": "The snapshot build took too long and was stopped. Retry the sync.",
    "SEAL_FAILED": "The snapshot build failed. Retry the sync.",
    "SEAL_ENQUEUE_FAILED": "The snapshot build could not be started. Retry in a moment.",
    "SESSION_FAILED": "The sync session failed. Retry the sync.",
    "FINGERPRINT_MISMATCH": (
        "The project changed while it was uploading. Retry the sync."
    ),
    "COMPUTE_OOM": (
        "The project is too large for the snapshot build to complete. "
        "Contact support."
    ),
    "RATE_LIMITED": "Too many requests. Wait a moment, then retry.",
}

SYNC_FAILURE_FALLBACK = "The sync failed. Retry; contact support if it persists."





WATCH_FAILURE_STOPPED = (
    "Live sync stopped watching this folder — your edits are no longer being "
    "synced. Switch live sync off and on again to restart it."
)




SYNC_FAILURE_UNREACHABLE = "Our service was briefly unreachable. Retry the sync."
SYNC_FAILURE_UNAUTHORIZED = "Your session expired. Sign in again, then retry the sync."



SYNC_FAILURE_UNKNOWN_PREFIX = (
    "The sync failed for a reason we don't recognise. Retry it; if it keeps "
    "failing, send us this: "
)
_UNKNOWN_DETAIL_MAX = 200

_TRANSPORT_MARKERS = (
    "fetch failed",
    "econnrefused",
    "econnreset",
    "etimedout",
    "enotfound",
    "eai_again",
    "socket hang up",
    "connection refused",
    "connection reset",
    "network error",
    "server disconnected",
)
_UNREACHABLE_STATUS = (500, 502, 503, 504)





_TRANSPORT_EXCEPTIONS = frozenset(
    {
        "ConnectError",
        "ConnectTimeout",
        "ReadTimeout",
        "WriteTimeout",
        "PoolTimeout",
        "ReadError",
        "WriteError",
        "NetworkError",
        "ProxyError",
        "RemoteProtocolError",
    }
)


def _human_sentences() -> tuple[str, ...]:
    return (
        *SYNC_FAILURE_LABELS.values(),
        SYNC_FAILURE_FALLBACK,
        SYNC_FAILURE_UNREACHABLE,
        SYNC_FAILURE_UNAUTHORIZED,
        WATCH_FAILURE_STOPPED,
    )


def is_transient_sync_failure(status_code: object, message: object = None) -> bool:
    """True when the failure is our side being momentarily unavailable.

    A 4xx is the project's own answer (limits, auth, a bad request) and must
    surface straight away; retrying it only delays the truth.
    """
    text = str(message or "").lower()
    if any(marker in text for marker in _TRANSPORT_MARKERS):
        return True
    try:
        status = int(status_code)
    except (TypeError, ValueError):
        return False
    return status in _UNREACHABLE_STATUS


def _json_error_payload(text: str) -> dict[str, object] | None:
    """The gateway's JSON error envelope, wherever it sits in the string.

    It rarely arrives alone: the client wraps it, so the founder's error read
    `Gateway request failed (500): {"statusCode":500,…}`.
    """
    start = text.find("{")
    if start < 0:
        return None
    try:
        payload = json.loads(text[start:])
    except (ValueError, TypeError):
        return None
    return payload if isinstance(payload, dict) else None


def _status_code(payload: dict[str, object], text: str) -> int:
    """The HTTP status, from the envelope or from the wrapper around it."""
    raw = payload.get("statusCode") or payload.get("status")
    try:
        return int(raw)
    except (TypeError, ValueError):
        pass
    found = _STATUS_IN_TEXT_RE.search(text)
    return int(found.group(1)) if found else 0


def _reads_as_a_sentence(text: str) -> bool:
    """A message already written for a person, as opposed to a code or a payload."""
    if not text or text[0] in "{[":
        return False
    if _ERROR_CODE_RE.fullmatch(text):
        return False
    return " " in text


def _status_sentence(status: int) -> str:
    """The sentence an HTTP status alone already justifies, if any."""
    if status in (401, 403):
        return SYNC_FAILURE_UNAUTHORIZED
    if status == 429:
        return SYNC_FAILURE_LABELS["RATE_LIMITED"]
    if status in _UNREACHABLE_STATUS:
        return SYNC_FAILURE_UNREACHABLE
    return ""


def _unknown_failure_text(detail: str) -> str:
    compact = " ".join(detail.split())
    if len(compact) > _UNKNOWN_DETAIL_MAX:
        compact = compact[: _UNKNOWN_DETAIL_MAX - 1].rstrip() + "…"
    return f"{SYNC_FAILURE_UNKNOWN_PREFIX}{compact}"


def humanize_sync_error(raw: object) -> str:
    """The one place that decides what a person reads when a sync fails.

    Every error that can reach the dashboard goes through here — the SSE
    `failed` event, a gateway exception, a local abort — because a user seeing
    `{"statusCode":500,...}` learns nothing and trusts less. Already-humanised
    text passes through untouched, so routing an error twice is harmless.
    """
    text = str(raw or "").strip()
    if not text:
        return SYNC_FAILURE_FALLBACK
    if text in _human_sentences() or text.startswith(SYNC_FAILURE_UNKNOWN_PREFIX):
        return text

    payload = _json_error_payload(text)
    if payload is None:
        if text in SYNC_FAILURE_LABELS:
            return SYNC_FAILURE_LABELS[text]
        if is_transient_sync_failure(None, text):
            return SYNC_FAILURE_UNREACHABLE




        found = _STATUS_IN_TEXT_RE.search(text)
        sentence = _status_sentence(int(found.group(1)) if found else 0)
        if sentence:
            return sentence
        if _reads_as_a_sentence(text):
            return text
        return _unknown_failure_text(text)

    code = str(payload.get("code") or "").strip()
    message = str(payload.get("message") or "").strip()
    if code in SYNC_FAILURE_LABELS:
        return SYNC_FAILURE_LABELS[code]
    status_code = _status_code(payload, text)
    sentence = _status_sentence(status_code)
    if sentence:
        return sentence
    if is_transient_sync_failure(status_code, message):
        return SYNC_FAILURE_UNREACHABLE



    if 400 <= status_code < 500 and _reads_as_a_sentence(message):
        return message
    detail = " ".join(
        part
        for part in (
            f"HTTP {status_code}" if status_code else "",
            str(payload.get("error") or "").strip(),
            message,
        )
        if part
    )
    return _unknown_failure_text(detail or text)


def humanize_sync_exception(exc: BaseException) -> str:
    """The sentence for an exception that ended a sync — same rule, one input less.

    Live sync fails through exceptions rather than SSE events, and the ones it
    fails through most often (httpx timeouts) carry no message at all. Handing
    ``str(exc)`` straight to {@link humanize_sync_error} would turn the
    commonest failure of all into the generic fallback, so the type answers
    when the message cannot.
    """
    if type(exc).__name__ in _TRANSPORT_EXCEPTIONS:
        return SYNC_FAILURE_UNREACHABLE
    return humanize_sync_error(str(exc))


def sync_failure_text(code: object, message: object = None) -> str:
    """A sentence a human can act on, for a `failed` sync event.

    The server's own `message` wins when it sends one; otherwise the code is
    resolved through {@link SYNC_FAILURE_LABELS}. Only the sentence reaches the
    UI — users were being shown `SEAL_STALLED`.
    """
    text = str(message or "").strip()
    if text:
        return humanize_sync_error(text)
    raw = str(code or "").strip()
    if not raw:
        return SYNC_FAILURE_FALLBACK
    return SYNC_FAILURE_LABELS.get(raw, SYNC_FAILURE_FALLBACK)






SYNC_PHASE_LABELS: dict[SyncPhase, str] = {
    SyncPhase.UPLOADING: SyncProgressLabel.UPLOADING_FILES.value,
    SyncPhase.SEALING: SyncProgressLabel.SEALING.value,
}


def sync_phase_label(phase: SyncPhase | None) -> str:
    """The default sentence for a phase; empty once the sync is over."""
    if phase is None:
        return ""
    return SYNC_PHASE_LABELS.get(phase, "")


def sync_l2_blend_pct(l2_coverage_pct: int) -> int:
    """Blend L2 resolve coverage into overall progress (85–100 band)."""
    l2 = max(0, min(100, int(l2_coverage_pct)))
    return SyncProgressThresholds.L2_BLEND_BASE + round(
        l2 * SyncProgressThresholds.L2_BLEND_SCALE
    )


def parse_sync_phase(raw: object) -> SyncPhase | None:
    """Parse a wire sync phase string; return None if unknown."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return SyncPhase(text)
    except ValueError:
        return None


def parse_sync_event_type(raw: object) -> SyncEventType | None:
    """Parse SSE sync event type (``t`` field); return None if unknown."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return SyncEventType(text)
    except ValueError:
        return None
