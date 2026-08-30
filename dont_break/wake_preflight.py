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

"""Check the local port before uvicorn binds it, so a second `--wake` gets a
clear choice instead of an asyncio traceback.

`OSError: address already in use` was surfacing as a raw stack trace because
it happens inside uvicorn's own startup task and comes out as `SystemExit`,
which `cli.py`'s `except RuntimeError` never catches. Fixing that catch would
still leave the user staring at "address already in use" with no next step —
the actual question is "is that my own dont-break, or something else, and
what do I do about it."
"""

from __future__ import annotations

import shutil
import signal
import subprocess
import sys
import time
from enum import Enum

import httpx
from rich.console import Console
from rich.prompt import IntPrompt, Prompt

from dont_break.server.routes_constants import LocalRoutes




_SESSION_MARKER_KEYS = {"authenticated", "sync_phase", "graph_version"}

_PREFLIGHT_TIMEOUT = 1.0


class PortStatus(Enum):
    FREE = "free"
    OURS = "ours"
    OCCUPIED = "occupied"


def classify_session_response(status_code: int, body: object) -> PortStatus:
    """Pure classification, split out from the network call so it's testable
    without a real server."""
    if status_code != 200 or not isinstance(body, dict):
        return PortStatus.OCCUPIED
    return PortStatus.OURS if _SESSION_MARKER_KEYS.issubset(body) else PortStatus.OCCUPIED


async def check_port(host: str, port: int) -> PortStatus:
    url = f"http://{host}:{port}{LocalRoutes.SESSION}"
    try:
        async with httpx.AsyncClient(timeout=_PREFLIGHT_TIMEOUT) as client:
            response = await client.get(url)
    except httpx.ConnectError:
        return PortStatus.FREE
    except httpx.HTTPError:


        return PortStatus.OCCUPIED

    try:
        body = response.json()
    except ValueError:
        return PortStatus.OCCUPIED
    return classify_session_response(response.status_code, body)


def find_listening_pid(port: int) -> int | None:
    """Best-effort, POSIX only (macOS/Linux). No `lsof` or no match -> None,
    which just means the "stop it" option can't offer a PID to kill — the
    caller falls back to telling the user to close it themselves."""
    if sys.platform == "win32" or shutil.which("lsof") is None:
        return None
    try:
        out = subprocess.run(
            ["lsof", "-ti", f"tcp:{port}", "-sTCP:LISTEN"],
            capture_output=True,
            text=True,
            timeout=2,
        )
    except (subprocess.SubprocessError, OSError):
        return None
    pids = [line.strip() for line in out.stdout.splitlines() if line.strip()]
    if len(pids) != 1:

        return None
    try:
        return int(pids[0])
    except ValueError:
        return None


def stop_process(pid: int, *, wait_seconds: float = 3.0) -> bool:
    """SIGTERM, then SIGKILL if it's still alive after `wait_seconds`."""
    try:
        import os

        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        return True
    except OSError:
        return False

    deadline = time.monotonic() + wait_seconds
    while time.monotonic() < deadline:
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            return True
        time.sleep(0.1)

    try:
        os.kill(pid, signal.SIGKILL)
        return True
    except (ProcessLookupError, OSError):
        return True


def port_free(host: str, port: int) -> bool:
    """True only if a new uvicorn can bind ``(host, port)``.

    A TCP connect is the wrong probe. TIME_WAIT and a listener that is no
    longer accepting look free to ``connect_ex``, then uvicorn raises
    ``SystemExit`` from its own startup task and the user sees a stack
    trace instead of a choice. Probe the same way uvicorn binds: IPv4
    (or IPv6 if ``host`` is an address with colons) and ``SO_REUSEADDR``.
    """
    import socket

    bind_host = host.strip("[]")
    family = socket.AF_INET6 if ":" in bind_host else socket.AF_INET
    sock = socket.socket(family, socket.SOCK_STREAM)
    try:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        if family == socket.AF_INET6:
            sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 1)
        sock.bind((bind_host, port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


async def resolve_port_conflict(
    console: Console, host: str, port: int
) -> tuple[str, int]:
    """Ask what to do when ``(host, port)`` cannot be bound.

    Returns ``("reuse", port)`` to open the existing instance, or
    ``("start", port)`` — possibly a different port — to bind and serve.
    """
    status = await check_port(host, port)

    if status == PortStatus.FREE:

        pid = find_listening_pid(port)
        console.print(
            f"[yellow]Port {port} on {host} is taken but is not answering "
            f"as dont-break.[/yellow]"
        )
        if pid is not None:
            console.print(f"[dim]Process {pid} is listening. Stop it, or pick another port.[/dim]")
        new_port = IntPrompt.ask(
            "Port to use instead", default=port + 1, console=console
        )
        return "start", new_port

    if status == PortStatus.OURS:
        console.print(
            f"[yellow]dont-break is already running on {host}:{port}.[/yellow]"
        )
        pid = find_listening_pid(port)
        choices = ["reuse", "restart", "port"]
        prompt = (
            "Use the running one, stop it and start fresh, or use a different port?"
        )
        default = "reuse"
        choice = Prompt.ask(
            prompt, choices=choices, default=default, console=console
        )

        if choice == "reuse":
            return "reuse", port

        if choice == "restart":
            if pid is None:
                console.print(
                    "[red]Could not identify the process to stop — close it "
                    "yourself (Ctrl+C in its terminal), then run this again.[/red]"
                )
                return "reuse", port
            console.print(f"[dim]Stopping process {pid}...[/dim]")
            stop_process(pid)
            for _ in range(20):
                if port_free(host, port):
                    break
                time.sleep(0.1)
            else:
                console.print(
                    "[red]It did not stop in time — try again, or pick a "
                    "different port.[/red]"
                )
                return "reuse", port
            return "start", port

        new_port = IntPrompt.ask("Port to use instead", console=console)
        return "start", new_port



    console.print(
        f"[red]Port {port} on {host} is already in use by something else "
        f"(not dont-break).[/red]"
    )
    new_port = IntPrompt.ask(
        "Port to use instead", default=port + 1, console=console
    )
    return "start", new_port
