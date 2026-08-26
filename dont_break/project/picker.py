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

from __future__ import annotations

import os
import platform
import subprocess
import sys
from pathlib import Path

from dont_break.config import EnvVar


class PickerError(RuntimeError):
    pass

_INLINE_ENV = EnvVar.DONT_BREAK_PICKER_INLINE.value


def _pick_macos() -> str:
    script = (
        'tell application "System Events" to activate\n'
        'delay 0.2\n'
        'POSIX path of (choose folder with prompt "Choose your project folder (dont-break)")'
    )
    proc = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True,
        text=True,
        timeout=600,
    )
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip()
        if "User canceled" in err or proc.returncode == 1:
            raise PickerError("Folder selection cancelled.")
        raise PickerError(err or "Folder picker unavailable (check Automation permissions).")
    path = proc.stdout.strip()
    if not path:
        raise PickerError("No folder selected.")
    return path


def _pick_tkinter() -> str:
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError as exc:
        raise PickerError("No folder picker available on this system.") from exc

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    try:
        selected = filedialog.askdirectory(title="Choose your project folder (dont-break)")
    finally:
        root.destroy()
    if not selected:
        raise PickerError("No folder selected.")
    return selected


def _pick_inline() -> str:
    """Run picker in the current process (must be main thread / fresh subprocess)."""
    system = platform.system()
    path = _pick_macos() if system == "Darwin" else _pick_tkinter()
    resolved = Path(path).expanduser().resolve()
    if not resolved.is_dir():
        raise PickerError(f"Not a directory: {resolved}")
    return str(resolved)


def pick_project_folder() -> str:
    """Native folder dialog (macOS osascript, fallback tkinter).

    Spawns a short-lived child process on macOS so the dialog works when dont-break
    serves HTTP from a background thread.
    """
    if os.environ.get(_INLINE_ENV) == "1":
        return _pick_inline()

    env = os.environ.copy()
    env[_INLINE_ENV] = "1"
    code = (
        "from dont_break.project.picker import _pick_inline; "
        "import sys; sys.stdout.write(_pick_inline())"
    )
    proc = subprocess.run(
        [sys.executable, "-c", code],
        capture_output=True,
        text=True,
        timeout=600,
        env=env,
        cwd=str(Path(__file__).resolve().parents[2]),
    )
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip()
        if "Folder selection cancelled" in err or "No folder selected" in err:
            raise PickerError(err.splitlines()[-1] if err else "Folder selection cancelled.")
        raise PickerError(err or "Folder picker failed.")
    path = proc.stdout.strip()
    if not path:
        raise PickerError("No folder selected.")
    return path


if __name__ == "__main__":
    try:
        sys.stdout.write(_pick_inline())
    except PickerError as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1) from exc
