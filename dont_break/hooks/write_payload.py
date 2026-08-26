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

"""Decode a Cursor `preToolUse` payload for the Write tool.

The shape is frozen from a live capture (Cursor 3.15.6) in
`tests/fixtures/cursor_pretooluse_write.json`. Docs only show Shell.
"""

from __future__ import annotations

from typing import Any, Mapping, Optional, Sequence


def write_file_path(payload: Mapping[str, Any]) -> Optional[str]:
    """Absolute path Cursor is about to write, or None if this is not a Write."""
    if payload.get("tool_name") != "Write":
        return None
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return None
    path = tool_input.get("file_path")
    if isinstance(path, str) and path:
        return path
    return None


def conversation_id(payload: Mapping[str, Any]) -> Optional[str]:
    value = payload.get("conversation_id")
    return value if isinstance(value, str) and value else None


def workspace_roots(payload: Mapping[str, Any]) -> Sequence[str]:
    roots = payload.get("workspace_roots")
    if not isinstance(roots, list):
        return []
    return [root for root in roots if isinstance(root, str) and root]
