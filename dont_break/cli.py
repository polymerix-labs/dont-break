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

import argparse
import asyncio
import sys

from dont_break import __version__
from dont_break.wake import run_wake


def main() -> None:
    parser = argparse.ArgumentParser(prog="dont-break", description="Polymerix local front")
    parser.add_argument("--wake", action="store_true", help="Start auth flow and open Nebula UI")
    parser.add_argument(
        "--logout",
        action="store_true",
        help="Forget the sign-in saved on this machine",
    )
    parser.add_argument("--verbose", action="store_true", help="Verbose facts-extract logs")
    parser.add_argument(
        "--project",
        metavar="PATH",
        help="Project folder path (dev bypass for native picker)",
    )
    parser.add_argument(
        "--project-id",
        metavar="PRJ_ID",
        help="Registered Polymerix project id for --project (non-interactive/CI)",
    )
    parser.add_argument("--version", action="version", version=f"dont-break {__version__}")
    args = parser.parse_args()

    if args.logout:



        from dont_break.application.auth_service import AuthService
        from dont_break.application.session_store import SessionStore

        had_token = AuthService(SessionStore()).sign_out()
        print(
            "Signed out." if had_token else "Not signed in on this machine."
        )
        return

    if args.wake:
        try:
            asyncio.run(
                run_wake(
                    verbose=args.verbose,
                    project_path=args.project,
                    project_id=args.project_id,
                )
            )
        except KeyboardInterrupt:
            sys.exit(0)
        except SystemExit as exc:



            code = exc.code if isinstance(exc.code, int) else 1
            if code:
                print(
                    "dont-break: that port is already in use. "
                    "If another dont-break is open, use that window or stop it with Ctrl+C.",
                    file=sys.stderr,
                )
            sys.exit(code or 1)
        except RuntimeError as exc:
            print(f"dont-break: {exc}", file=sys.stderr)
            sys.exit(1)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
