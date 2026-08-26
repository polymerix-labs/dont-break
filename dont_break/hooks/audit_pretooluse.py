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

"""Capture the raw JSON Cursor sends to a preToolUse / subagentStart hook.

Cursor's docs only show `tool_input` for Shell. This script is how we freeze
the real Write shape: install it by hand, trigger a Write, then copy one
observed payload into `tests/fixtures/`.

Always fail-open (`permission: allow`) so an audit never blocks an edit.

Install (user-level; cwd of a user hook is `~/.cursor/`):

    python3 -m dont_break.hooks.audit_pretooluse --install

Remove with `--uninstall`. Always fail-open (`permission: allow`) so an audit never blocks an edit.

Or copy this file to `~/.cursor/hooks/dont-break-audit.py` and merge:

    {
      "version": 1,
      "hooks": {
        "preToolUse": [{"command": "./hooks/dont-break-audit.py"}],
        "subagentStart": [{"command": "./hooks/dont-break-audit.py"}]
      }
    }

Log: `~/.cursor/dont-break-hook-audit.jsonl`
"""

from __future__ import annotations

import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_NAME = "dont-break-hook-audit.jsonl"
HOOK_SCRIPT_NAME = "dont-break-audit.py"


def cursor_dir() -> Path:
    return Path.home() / ".cursor"


def log_path() -> Path:
    return cursor_dir() / LOG_NAME


def fail_open() -> None:
    sys.stdout.write(json.dumps({"permission": "allow"}))
    sys.stdout.write("\n")


def capture() -> None:
    raw = sys.stdin.read()
    try:
        payload: object = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {"_unparsed": raw, "_parse_error": True}
    record = {
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }
    path = log_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")
    fail_open()


def install() -> None:
    """Copy this script into ~/.cursor/hooks and merge hooks.json without dropping other entries."""
    home = cursor_dir()
    hooks_dir = home / "hooks"
    hooks_dir.mkdir(parents=True, exist_ok=True)
    dest = hooks_dir / HOOK_SCRIPT_NAME
    shutil.copyfile(Path(__file__).resolve(), dest)
    dest.chmod(dest.stat().st_mode | 0o111)

    config_path = home / "hooks.json"
    if config_path.exists():
        config = json.loads(config_path.read_text(encoding="utf-8"))
    else:
        config = {"version": 1, "hooks": {}}
    hooks = config.setdefault("hooks", {})
    command = f"./hooks/{HOOK_SCRIPT_NAME}"
    for event in ("preToolUse", "subagentStart"):
        entries = list(hooks.get(event) or [])
        if any(isinstance(entry, dict) and entry.get("command") == command for entry in entries):
            continue
        entries.append({"command": command})
        hooks[event] = entries
    config_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    sys.stdout.write(f"installed {dest}\nlog {log_path()}\n")


def uninstall() -> None:
    """Remove our audit entries; leave any other hooks the user already had."""
    home = cursor_dir()
    config_path = home / "hooks.json"
    command = f"./hooks/{HOOK_SCRIPT_NAME}"
    if config_path.exists():
        config = json.loads(config_path.read_text(encoding="utf-8"))
        hooks = config.get("hooks") or {}
        for event, entries in list(hooks.items()):
            kept = [
                entry
                for entry in (entries or [])
                if not (isinstance(entry, dict) and entry.get("command") == command)
            ]
            if kept:
                hooks[event] = kept
            else:
                hooks.pop(event, None)
        if not hooks:
            config_path.unlink()
        else:
            config["hooks"] = hooks
            config_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    dest = home / "hooks" / HOOK_SCRIPT_NAME
    if dest.exists():
        dest.unlink()
    sys.stdout.write(f"removed {dest}\n")


def main(argv: list[str]) -> int:
    if argv[1:] == ["--install"]:
        install()
        return 0
    if argv[1:] == ["--uninstall"]:
        uninstall()
        return 0
    try:
        capture()
    except Exception:
        fail_open()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
