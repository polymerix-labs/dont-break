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

"""Decode a Cursor `preToolUse` payload without keeping private fields.

The Write shape is frozen from `tests/fixtures/cursor_pretooluse_write.json`.
StrReplace / Edit / ApplyPatch use the same path keys Cursor sends today.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Mapping, Optional, Sequence

MUTATING_TOOLS = frozenset(
    {"Write", "StrReplace", "Edit", "ApplyPatch", "search_replace"}
)


_DENIED_KEYS = frozenset(
    {"content", "old_string", "new_string", "task", "transcript_path", "user_email"}
)

_STRING_KEYS = (
    "model",
    "subagent_model",
    "subagent_type",
    "cursor_version",
    "conversation_id",
    "generation_id",
    "session_id",
    "parent_conversation_id",
    "tool_use_id",
    "tool_name",
    "hook_event_name",
)

_REDIRECT = re.compile(
    r"(?:>>?|tee(?:\s+-a)?)\s+['\"]?([^\s'\"|&;]+)",
    re.IGNORECASE,
)


def write_file_path(payload: Mapping[str, Any]) -> Optional[str]:
    """Absolute path Cursor is about to write, or None if this is not a Write."""
    if payload.get("tool_name") != "Write":
        return None
    return _path_from_input(payload.get("tool_input"))


def resolve_under_workspace(path: str, workspace_root: str) -> Optional[str]:
    """Join a relative write target to the workspace; reject a path that escapes."""
    if not path:
        return None
    raw = Path(path)
    if not raw.is_absolute():
        if not workspace_root:
            return path
        raw = Path(workspace_root) / path
    try:
        resolved = raw.expanduser().resolve()
    except OSError:
        return None
    if workspace_root:
        try:
            resolved.relative_to(Path(workspace_root).expanduser().resolve())
        except (OSError, ValueError):
            return None
    return str(resolved)


def mutating_file_path(payload: Mapping[str, Any]) -> Optional[str]:
    """Path for Write / StrReplace / Edit / patch, or a Shell redirect."""
    tool = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    found: Optional[str] = None
    if tool in MUTATING_TOOLS:
        found = _path_from_input(tool_input)
    elif tool == "Shell":
        command = ""
        if isinstance(tool_input, dict):
            raw = tool_input.get("command")
            command = raw if isinstance(raw, str) else ""
        paths = shell_write_paths(command)
        found = paths[0] if paths else None
    if found is None:
        return None
    roots = workspace_roots(payload)
    return resolve_under_workspace(found, roots[0] if roots else "")


def _path_from_input(tool_input: Any) -> Optional[str]:
    if not isinstance(tool_input, dict):
        return None
    for key in ("file_path", "path"):
        path = tool_input.get(key)
        if isinstance(path, str) and path:
            return path
    return None


def shell_write_paths(command: str) -> list[str]:
    """Obvious write targets (`>`, `>>`, `tee`). Empty when we cannot tell."""
    if not command:
        return []
    found: list[str] = []
    for match in _REDIRECT.finditer(command):
        path = match.group(1).strip()
        if path and path not in found and path not in {"/dev/null", "-"}:
            found.append(path)
    return found


def conversation_id(payload: Mapping[str, Any]) -> Optional[str]:
    value = payload.get("conversation_id")
    return value if isinstance(value, str) and value else None


def workspace_roots(payload: Mapping[str, Any]) -> Sequence[str]:
    roots = payload.get("workspace_roots")
    if not isinstance(roots, list):
        return []
    return [root for root in roots if isinstance(root, str) and root]


def observation_fields(payload: Mapping[str, Any]) -> dict[str, Any]:
    """Allow-listed hook metadata. Never includes file content or transcripts."""
    out: dict[str, Any] = {}
    for key in _STRING_KEYS:
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            out[key] = value.strip()
    roots = list(workspace_roots(payload))
    if roots:
        out["workspace_roots"] = roots
    for denied in _DENIED_KEYS:
        out.pop(denied, None)
    return out
