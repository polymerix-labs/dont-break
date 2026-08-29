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

"""Send a support note from the local app to the public contact inbox.

The person never sees workspace or project ids. Those stay off the form
and off the mail we attach. Names and tool versions are enough to reply.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from typing import Any, Mapping

import httpx

from dont_break import __version__
from dont_break.application.session_store import SessionStore
from dont_break.config import Settings
from dont_break.extract.facts_extract import facts_extract_status

KIND_SUBJECT = {
    "bug": "Support",
    "idea": "Feedback",
    "question": "Product question",
}

_UUID = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def human_label(value: str | None) -> str:
    """Return a name a person can read, or empty if this is an internal id."""
    text = (value or "").strip()
    if not text or text.startswith("prj_") or _UUID.match(text):
        return ""
    return text


def npm_version() -> str:
    npm = shutil.which("npm")
    if not npm:
        return ""
    try:
        completed = subprocess.run(
            [npm, "-v"],
            capture_output=True,
            text=True,
            timeout=2,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return completed.stdout.strip() if completed.returncode == 0 else ""


def support_context(store: SessionStore) -> dict[str, str]:
    snap = store.snapshot()
    facts = facts_extract_status()
    return {
        "organization": human_label(snap.org_name) or human_label(snap.org_slug),
        "project": human_label(snap.project_display_name) or human_label(snap.project_slug),
        "app_version": (snap.app_version or __version__).strip(),
        "facts_extract": str(facts.get("installed") or "").strip(),
        "npm": npm_version(),
    }


def format_context(ctx: Mapping[str, str]) -> str:
    rows = [
        ("Organization", ctx.get("organization") or ""),
        ("Project", ctx.get("project") or ""),
        ("dont-break", ctx.get("app_version") or ""),
        ("facts-extract", ctx.get("facts_extract") or ""),
        ("npm", ctx.get("npm") or ""),
    ]
    lines = [f"{label}: {value}" for label, value in rows if value]
    if not lines:
        return ""
    return "\n\n---\n" + "\n".join(lines)


async def deliver_support(
    *,
    email: str,
    kind: str,
    message: str,
    context: Mapping[str, str],
) -> dict[str, Any]:
    subject = KIND_SUBJECT.get(kind, "Support")
    body = message.strip() + format_context(context)
    url = f"{Settings().app_url}/api/contact"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            url,
            json={"email": email, "subject": subject, "message": body},
        )
    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = {}
        error = ""
        if isinstance(payload, dict):
            error = str(payload.get("error") or "")
        return {
            "ok": False,
            "error": error or "Could not send that. Try again in a moment.",
        }
    return {"ok": True}
