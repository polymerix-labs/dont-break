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

"""Cursor preToolUse hook: ask the local dont-break app, fail-open otherwise.

Stdlib only — this file is copied to ``~/.cursor/hooks/`` and must run with
whatever python3 Cursor finds, without the dont-break package on PYTHONPATH.

Cwd of a user-level hook is ``~/.cursor/``, so hooks.json points at
``./hooks/dont-break-pretooluse.py``.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Mapping, Optional

ALLOW = {"permission": "allow"}
TOTAL_TIMEOUT_SEC = 0.5
DEFAULT_PORT = 4040
DECISION_PATH = "/api/hook/decision"
SUBAGENT_PATH = "/api/hook/subagent"


def fail_open() -> None:
    sys.stdout.write(json.dumps(ALLOW))
    sys.stdout.write("\n")


def _workspace_root(payload: Mapping[str, Any]) -> str:
    roots = payload.get("workspace_roots")
    if isinstance(roots, list):
        for root in roots:
            if isinstance(root, str) and root:
                return root
    return ""


def _write_file_path(payload: Mapping[str, Any]) -> Optional[str]:
    if payload.get("tool_name") != "Write":
        return None
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return None
    path = tool_input.get("file_path")
    return path if isinstance(path, str) and path else None


def _local_url(path: str) -> str:
    port = os.environ.get("DONT_BREAK_PORT") or str(DEFAULT_PORT)
    host = os.environ.get("DONT_BREAK_HOST") or "127.0.0.1"
    return f"http://{host}:{port}{path}"


def decision_url() -> str:
    return _local_url(DECISION_PATH)


def _post_json(url: str, payload: Mapping[str, Any]) -> Optional[Mapping[str, Any]]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:




        with urllib.request.urlopen(request, timeout=TOTAL_TIMEOUT_SEC) as response:
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
    )


def ask_local(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    if payload.get("hook_event_name") == "subagentStart":
        notify_subagent(payload)
        return ALLOW
    file_path = _write_file_path(payload)
    if file_path is None:
        return ALLOW
    parsed = _post_json(
        decision_url(),
        {
            "file_path": file_path,
            "workspace_root": _workspace_root(payload),
            "conversation_id": payload.get("conversation_id") or "",
            "tool_name": payload.get("tool_name") or "Write",
        },
    )
    if parsed is None:
        return ALLOW
    permission = parsed.get("permission")
    if permission not in ("allow", "deny"):
        return ALLOW
    out: dict[str, str] = {"permission": permission}
    for key in ("agent_message", "user_message"):
        value = parsed.get(key)
        if isinstance(value, str) and value:
            out[key] = value
    return out


def run() -> None:
    try:
        raw = sys.stdin.read()
        payload: Any = json.loads(raw) if raw.strip() else {}
        if not isinstance(payload, dict):
            fail_open()
            return
        result = ask_local(payload)
        sys.stdout.write(json.dumps(result))
        sys.stdout.write("\n")
    except Exception:
        fail_open()


if __name__ == "__main__":
    run()
