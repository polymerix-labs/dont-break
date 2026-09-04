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

"""Idempotent install of the dont-break Cursor hook into ~/.cursor/.

The working directory of a user-level hook is ``~/.cursor/``, so the command
in hooks.json is relative to that directory. Existing user hooks are kept;
ours is identified by its command string, never by position.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any

HOOK_SCRIPT_NAME = "dont-break-pretooluse.py"
HOOK_COMMAND = f"./hooks/{HOOK_SCRIPT_NAME}"
HOOK_EVENTS = ("preToolUse", "subagentStart")


def _has_our_command(entries: Any) -> bool:
    if not isinstance(entries, list):
        return False
    return any(
        isinstance(entry, dict) and entry.get("command") == HOOK_COMMAND
        for entry in entries
    )


def cursor_dir(home: Path | None = None) -> Path:
    """User-level Cursor config directory (`~/.cursor`).

    Tests redirect this via ``DONT_BREAK_CURSOR_HOME`` so hook and MCP writes
    never touch the real machine.
    """
    if home is not None:
        return home / ".cursor"
    override = os.environ.get("DONT_BREAK_CURSOR_HOME")
    if override:
        return Path(override) / ".cursor"
    return Path.home() / ".cursor"


def hook_status(home: Path | None = None) -> dict[str, Any]:
    """Whether our command is present in hooks.json and the script file exists."""
    root = cursor_dir(home)
    script = root / "hooks" / HOOK_SCRIPT_NAME
    config_path = root / "hooks.json"
    installed = False
    if config_path.is_file():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            config = {}
        if not isinstance(config, dict):
            config = {}
        hooks_config = config.get("hooks") if isinstance(config.get("hooks"), dict) else {}
        installed = all(
            _has_our_command(hooks_config.get(event) or [])
            for event in HOOK_EVENTS
        )
    return {
        "installed": installed and script.is_file(),
        "script": str(script),
        "config": str(config_path),
        "command": HOOK_COMMAND,
        "manual": (
            f"Copy {HOOK_SCRIPT_NAME} to ~/.cursor/hooks/ and add "
            f'{{"command": "{HOOK_COMMAND}"}} to preToolUse and subagentStart '
            "in ~/.cursor/hooks.json."
        ),
    }


def install_hook(home: Path | None = None) -> dict[str, Any]:
    """Write the script and merge our command into preToolUse and subagentStart."""
    root = cursor_dir(home)
    hooks_dir = root / "hooks"
    hooks_dir.mkdir(parents=True, exist_ok=True)
    source = Path(__file__).resolve().parent / "pretooluse.py"
    dest = hooks_dir / HOOK_SCRIPT_NAME
    shutil.copyfile(source, dest)
    dest.chmod(dest.stat().st_mode | 0o111)

    config_path = root / "hooks.json"
    existed = config_path.exists()
    if existed:
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            config = {"version": 1, "hooks": {}}
        if not isinstance(config, dict):
            config = {"version": 1, "hooks": {}}
    else:
        config = {"version": 1, "hooks": {}}

    hooks = config.setdefault("hooks", {})
    if not isinstance(hooks, dict):
        hooks = {}
        config["hooks"] = hooks
    added = False
    for event in HOOK_EVENTS:
        entries = list(hooks.get(event) or [])
        if _has_our_command(entries):
            continue
        entries.append({"command": HOOK_COMMAND})
        hooks[event] = entries
        added = True
    outcome = "created" if not existed else "updated"
    if not added and existed:
        outcome = "updated"
    config.setdefault("version", 1)
    config_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    status = hook_status(home)
    return {
        "path": str(dest),
        "config": str(config_path),
        "outcome": outcome,
        "command": HOOK_COMMAND,
        "manual": str(status["manual"]),
        "installed": True,
    }


def uninstall_hook(home: Path | None = None) -> dict[str, str]:
    """Remove our entry and script; leave every other hook the user already had."""
    root = cursor_dir(home)
    config_path = root / "hooks.json"
    if config_path.exists():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            config = {}
        hooks = config.get("hooks") if isinstance(config, dict) else None
        if isinstance(hooks, dict):
            for event in HOOK_EVENTS:
                entries = hooks.get(event) or []
                kept = [
                    entry
                    for entry in entries
                    if not (isinstance(entry, dict) and entry.get("command") == HOOK_COMMAND)
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
    dest = root / "hooks" / HOOK_SCRIPT_NAME
    if dest.exists():
        dest.unlink()
    return {"path": str(dest), "outcome": "removed"}
