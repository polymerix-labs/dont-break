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

import asyncio
import webbrowser

import uvicorn
from rich.console import Console

from dont_break.application import build_services
from dont_break.config import Settings
from dont_break.credentials import load_credentials
from dont_break.domain.errors import GatewayError, ProjectLimitError
from dont_break.intro import play_intro
from dont_break.server.app import create_app

console = Console()


async def run_wake(
    settings: Settings | None = None,
    *,
    verbose: bool = False,
    project_path: str | None = None,
    project_id: str | None = None,
) -> None:
    settings = settings or Settings()
    services = build_services()
    store = services["store"]
    auth = services["auth"]
    workspace = services["workspace"]
    project = services["project"]
    sync = services["sync"]

    play_intro()
    await store.begin_wake()

    host = settings.host
    port = settings.port

    config = uvicorn.Config(create_app(), host=host, port=port, log_level="warning")
    server = uvicorn.Server(config)
    server_task = asyncio.create_task(server.serve())
    await asyncio.sleep(0.4)

    creds = load_credentials()
    if await auth.restore_saved_session(settings, creds):
        console.print("[green]Signed in (saved credentials).[/green]")
    else:
        if creds.token:
            console.print("[yellow]Saved credentials expired — sign in again.[/yellow]")
        connect_url = await auth.begin_browser_sign_in(settings)
        console.print(f"Opening browser: {connect_url}")
        auth.open_browser(connect_url)
        await auth.wait_for_callback()
        console.print("[green]Signed in.[/green]")

    try:
        await workspace.load(settings)
    except RuntimeError as exc:
        await store.set_graph_error(str(exc))
        console.print(f"[red]{exc}[/red]")

    if project_path:
        try:
            picked, _ = await project.apply_dev_path(project_path)
            console.print(f"[dim]Project folder (dev): {picked}[/dim]")
            if project_id:
                await project.link_registered_project(project_id)
                console.print(f"[dim]Linked folder to registered project: {project_id}[/dim]")
        except RuntimeError as exc:
            await store.set_graph_error(str(exc))
            console.print(f"[red]{exc}[/red]")
    else:
        restored = await project.restore_last_folder()
        if restored:
            picked, _ = restored
            console.print(f"[dim]Restored last project folder: {picked}[/dim]")

            async def _resync_in_background() -> None:










                try:
                    await sync.sync(
                        settings,
                        store.workspace_id,
                        store.project_id,
                        store.project_path,
                    )
                    console.print("[dim]Resynced.[/dim]")
                except (ProjectLimitError, GatewayError, RuntimeError) as exc:
                    console.print(f"[red]{exc}[/red]")




            asyncio.create_task(_resync_in_background())

    app_url = f"http://{host}:{port}/"
    console.print(f"Opening {app_url}")
    if not store.project_id:
        console.print("[dim]Pick a project folder in the UI to open the graph.[/dim]")
    webbrowser.open(app_url)

    console.print("Local server running. Press Ctrl+C to stop.")
    try:
        await server_task
    except KeyboardInterrupt:
        console.print("\nStopped.")
        server.should_exit = True
        await server_task
