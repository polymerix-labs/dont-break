#!/usr/bin/env python3
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

"""Cursor preToolUse hook: ask the local dont-break app.

Stdlib only — copied to ``~/.cursor/hooks/`` without the dont-break package.

Watch mode fail-opens when the app is down. Hard mode (write-mode.json)
fail-closes on a protected write so "hard" is not a lie.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Mapping, Optional

ALLOW = {"permission": "allow"}
DENY_UNCHECKED = {
    "permission": "deny",
    "agent_message": (
        "dont-break: this file is protected and has not been checked. "
        "Call check_change with this path. If the verdict is block, do not write."
    ),
    "user_message": "Hard mode: write refused until a check has passed.",
}
TOTAL_TIMEOUT_SEC = 0.5
HARD_TIMEOUT_SEC = 2.5
DEFAULT_PORT = 4040
DECISION_PATH = "/api/hook/decision"
SUBAGENT_PATH = "/api/hook/subagent"
MUTATING_TOOLS = frozenset(
    {"Write", "StrReplace", "Edit", "ApplyPatch", "search_replace"}
)
_REDIRECT = re.compile(
    r"(?:>>?|tee(?:\s+-a)?)\s+['\"]?([^\s'\"|&;]+)",
    re.IGNORECASE,
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


def fail_open() -> None:
    sys.stdout.write(json.dumps(ALLOW))
    sys.stdout.write("\n")


def fail_closed() -> None:
    sys.stdout.write(json.dumps(DENY_UNCHECKED))
    sys.stdout.write("\n")


def _config_dir() -> Path:
    xdg = os.environ.get("XDG_CONFIG_HOME")
    root = Path(xdg) if xdg else Path.home() / ".config"
    return root / "dont-break"


def _workspace_root(payload: Mapping[str, Any]) -> str:
    roots = payload.get("workspace_roots")
    if isinstance(roots, list):
        for root in roots:
            if isinstance(root, str) and root:
                return root
    return ""


def _path_from_input(tool_input: Any) -> Optional[str]:
    if not isinstance(tool_input, dict):
        return None
    for key in ("file_path", "path"):
        path = tool_input.get(key)
        if isinstance(path, str) and path:
            return path
    return None


def _shell_write_path(command: str) -> Optional[str]:
    if not command:
        return None
    match = _REDIRECT.search(command)
    if match is None:
        return None
    path = match.group(1).strip()
    if not path or path in {"/dev/null", "-"}:
        return None
    return path


def resolve_under_workspace(path: str, workspace_root: str) -> Optional[str]:
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
    tool = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    found: Optional[str] = None
    if tool in MUTATING_TOOLS:
        found = _path_from_input(tool_input)
    elif tool == "Shell":
        command = ""
        if isinstance(tool_input, dict) and isinstance(tool_input.get("command"), str):
            command = tool_input["command"]
        found = _shell_write_path(command)
    if found is None:
        return None
    return resolve_under_workspace(found, _workspace_root(payload))


def observation_fields(payload: Mapping[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key in _STRING_KEYS:
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            out[key] = value.strip()
    roots = payload.get("workspace_roots")
    if isinstance(roots, list):
        cleaned = [root for root in roots if isinstance(root, str) and root]
        if cleaned:
            out["workspace_roots"] = cleaned
    return out


def hard_mode_for(workspace_root: str) -> bool:
    if not workspace_root:
        return False
    path = _config_dir() / "write-mode.json"
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    folders = raw.get("folders") if isinstance(raw, dict) else None
    if not isinstance(folders, dict):
        return False
    root = os.path.realpath(workspace_root)
    for folder, mode in folders.items():
        if not isinstance(folder, str) or mode != "hard":
            continue
        if root == os.path.realpath(folder) or root.startswith(
            os.path.realpath(folder) + os.sep
        ):
            return True
    return False


def _local_url(path: str) -> str:
    port = os.environ.get("DONT_BREAK_PORT") or str(DEFAULT_PORT)
    host = os.environ.get("DONT_BREAK_HOST") or "127.0.0.1"
    return f"http://{host}:{port}{path}"


def _post_json(
    url: str, payload: Mapping[str, Any], timeout: float
) -> Optional[Mapping[str, Any]]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:

        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def notify_subagent(payload: Mapping[str, Any]) -> None:
    _post_json(
        _local_url(SUBAGENT_PATH),
        {
            "conversation_id": payload.get("conversation_id") or "",
            "parent_conversation_id": payload.get("parent_conversation_id") or "",
        },
        TOTAL_TIMEOUT_SEC,
    )


def ask_local(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    if payload.get("hook_event_name") == "subagentStart":
        notify_subagent(payload)
        return ALLOW
    file_path = mutating_file_path(payload)
    workspace_root = _workspace_root(payload)
    hard = hard_mode_for(workspace_root)
    tool_name = str(payload.get("tool_name") or "")
    if file_path is None:
        if hard and tool_name == "Shell":
            return {
                "permission": "deny",
                "agent_message": (
                    "dont-break: Hard mode cannot see which file this Shell writes. "
                    "Use the editor tools, then call check_change."
                ),
                "user_message": "Hard mode: unclear Shell write refused.",
            }
        if hard and tool_name in MUTATING_TOOLS:
            return DENY_UNCHECKED
        return ALLOW
    body = {
        "file_path": file_path,
        "workspace_root": workspace_root,
        **observation_fields(payload),
    }
    if not body.get("tool_name"):
        body["tool_name"] = tool_name or "Write"
    if not body.get("conversation_id"):
        body["conversation_id"] = payload.get("conversation_id") or ""
    timeout = HARD_TIMEOUT_SEC if hard else TOTAL_TIMEOUT_SEC
    parsed = _post_json(_local_url(DECISION_PATH), body, timeout)
    if parsed is None:
        return DENY_UNCHECKED if hard else ALLOW
    permission = parsed.get("permission")
    if permission not in ("allow", "deny"):
        return DENY_UNCHECKED if hard else ALLOW
    out: dict[str, str] = {"permission": permission}
    for key in ("agent_message", "user_message"):
        value = parsed.get(key)
        if isinstance(value, str) and value:
            out[key] = value
    return out


def run() -> None:
    payload: Any = {}
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
        if not isinstance(payload, dict):
            fail_open()
            return
        result = ask_local(payload)
        sys.stdout.write(json.dumps(result))
        sys.stdout.write("\n")
    except Exception:
        hard = False
        if isinstance(payload, dict):
            try:
                hard = hard_mode_for(_workspace_root(payload))
            except Exception:
                hard = False
        if hard:
            fail_closed()
        else:
            fail_open()


if __name__ == "__main__":
    run()
