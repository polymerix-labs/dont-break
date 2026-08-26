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

"""Gateway sync request/response JSON field names."""

from __future__ import annotations

from enum import Enum


class SyncJsonField(str, Enum):
    """JSON keys used in sync session wire payloads."""

    FILE_COUNT = "file_count"
    UPLOAD_MODE = "upload_mode"
    FILE_MANIFEST = "file_manifest"
    PREVIOUS_BUNDLE_FINGERPRINT = "previous_bundle_fingerprint"
    BUNDLE_FINGERPRINT = "bundle_fingerprint"
    REPO_ROOT = "repo_root"
    TRANSPORT_VERSION = "transport_version"
    PARTS = "parts"
    BYTE_SIZE = "byte_size"
    CONTENT_SHA256 = "content_sha256"
    SHA256 = "sha256"
    SESSION_ID = "session_id"
    PENDING_INDICES = "pending_indices"
    CONTENT_FINGERPRINT = "content_fingerprint"
    CONTENT_HASH = "content_hash"
    PART_ID = "part_id"
    FILE_INDEX_START = "file_index_start"
    FILE_INDEX_END = "file_index_end"
    URL = "url"
    HEADERS = "headers"
    STATUS = "status"
    PHASE = "phase"
    ESTIMATED_GZIP_BYTES = "estimated_gzip_bytes"
    ENCODING = "encoding"
    FILES = "files"
    RECEIVED = "received"
    TOTAL = "total"
    GRAPH_VERSION = "graph_version"
