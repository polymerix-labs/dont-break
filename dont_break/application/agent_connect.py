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

"""Build the "Connect your agent" payload and mint project-scoped MCP tokens.

The panel uses the local session JWT only to call the gateway. MCP/CLI
snippets get a project-scoped `dbt_` API token minted on explicit user
action — never the session JWT.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from dont_break.application.session_store import SessionStore
from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.config import Settings
from dont_break.credentials import StoredCredentials, is_valid_access_token
from dont_break.domain.errors import GatewayError
from dont_break.infrastructure.gateway import GatewayClient

MCP_SERVER_KEY = "dont-break"
MCP_PACKAGE = "@polymerix-labs/dont-break-mcp"
CLI_PACKAGE = "@polymerix-labs/dont-break-query"

AGENT_MCP_SCOPES = (
    "query:read",
    "rules:read",
    "rules:check",
    "rules:propose",
    "assist:run",
)







AGENT_MCP_LABELS: dict[str, str] = {
    "cursor": "Cursor",
    "claude-code": "Claude Code",
    "claude-desktop": "Claude Desktop",
    "ci": "CI",
    "other": "MCP client",
}
DEFAULT_AGENT_MCP_LABEL = "MCP client"

SKILL_FILENAME = "AGENTS.md"
SKILL_MARKER_START = "<!-- dont-break:skill:start -->"
SKILL_MARKER_END = "<!-- dont-break:skill:end -->"

_SKILL_PATH = Path(__file__).resolve().parent.parent / "agents_skill.md"


class SkillInstallError(RuntimeError):
    pass


class MintTokenError(RuntimeError):
    pass


def skill_text() -> str:
    return _SKILL_PATH.read_text(encoding="utf-8")


def _env_block(api_url: str, dbt_secret: str = "") -> dict[str, str]:
    return {
        "DONT_BREAK_API_URL": api_url.rstrip("/"),
        "DONT_BREAK_TOKEN": dbt_secret,
    }


def _mcp_payload(api_url: str, dbt_secret: str = "") -> dict[str, Any]:
    env = _env_block(api_url, dbt_secret)
    mcp_config = {
        "mcpServers": {
            MCP_SERVER_KEY: {
                "command": "npx",
                "args": ["-y", MCP_PACKAGE],
                "env": env,
            }
        }
    }
    cli_snippet = "\n".join(f'export {key}="{value}"' for key, value in env.items())
    return {"mcp_config": mcp_config, "cli_snippet": cli_snippet, "env": env}


async def _find_existing_agent_token(
    gateway: GatewayClient, session_token: str, project_id: str
) -> dict[str, Any] | None:
    """Most recent live (non-revoked) Agent MCP token for this project.

    The gateway never returns a secret outside the mint/regenerate
    response, so this can only report that a token exists (id, label,
    created_at) — never enough to fill DONT_BREAK_TOKEN back in.
    """
    try:
        tokens = await gateway.list_api_tokens(session_token)
    except GatewayError:
        return None



    agent_scopes = set(AGENT_MCP_SCOPES)
    candidates = [
        item
        for item in tokens
        if item.get("project_id") == project_id
        and set(item.get("scopes") or []) == agent_scopes
        and not item.get("revoked_at")
    ]
    if not candidates:
        return None
    candidates.sort(key=lambda item: item.get("created_at") or "", reverse=True)
    return candidates[0]


async def build_agent_setup(
    settings: Settings,
    store: SessionStore,
    creds: StoredCredentials,
    gateway: GatewayClient | None = None,
) -> dict[str, Any]:
    """Status flags + empty MCP template. Does not mint tokens."""
    project_slug = (store.project_slug or "").strip()
    project_id = (store.project_id or "").strip()
    workspace_id = resolve_workspace_id(store, creds)
    session_token = creds.token.strip()
    token_valid = is_valid_access_token(session_token)
    project_selected = bool(project_id or project_slug)
    ready_to_mint = bool(
        store.authenticated and token_valid and workspace_id and project_id
    )
    snippets = _mcp_payload(settings.api_base_url, "")

    existing_token: dict[str, Any] | None = None
    if ready_to_mint and gateway is not None:
        existing_token = await _find_existing_agent_token(
            gateway, session_token, project_id
        )

    return {
        "authenticated": store.authenticated,
        "token_valid": token_valid,
        "project_selected": project_selected,
        "ready": ready_to_mint,
        "ready_to_mint": ready_to_mint,
        "has_mcp_secret": False,




        "existing_token_id": (existing_token or {}).get("token_id", ""),
        "existing_token_created_at": (existing_token or {}).get("created_at"),
        "api_url": settings.api_base_url.rstrip("/"),
        "workspace_id": workspace_id,
        "project_id": project_id,
        "project_slug": project_slug,
        "mcp_config": snippets["mcp_config"],
        "cli_snippet": snippets["cli_snippet"],
        "cli_package": CLI_PACKAGE,
        "mcp_package": MCP_PACKAGE,
    }


async def mint_agent_mcp_token(
    settings: Settings,
    store: SessionStore,
    creds: StoredCredentials,
    gateway: GatewayClient | None = None,
    target: str = "cursor",
) -> dict[str, Any]:
    """Create an Agent MCP `dbt_` token for the linked project.

    `target` is whichever tile the user had selected on the Agents page
    (cursor/claude-code/claude-desktop/ci/other) — it becomes the token's
    label, which is what later shows up as `agent_label` on every check and
    rule event this token produces. Getting this right is the only way the
    activity dashboard can tell a CI enforcement run from a developer's
    local session.
    """
    session_token = creds.token.strip()
    if not store.authenticated or not is_valid_access_token(session_token):
        raise MintTokenError("Sign in first before connecting an agent.")

    workspace_id = resolve_workspace_id(store, creds)
    project_id = (store.project_id or "").strip()
    if not workspace_id or not project_id:
        raise MintTokenError("Link this folder to a registered project first.")

    label = AGENT_MCP_LABELS.get(target, DEFAULT_AGENT_MCP_LABEL)

    owned = gateway is None
    client = gateway or GatewayClient(settings)
    try:
        created = await client.create_api_token(
            session_token,
            workspace_id=workspace_id,
            project_id=project_id,
            label=label,
            scopes=list(AGENT_MCP_SCOPES),
        )
    except GatewayError as exc:
        raise MintTokenError(str(exc)) from exc
    finally:
        if owned:
            await client.aclose()

    token_id = str(created.get("token_id") or "").strip()
    secret = str(created.get("secret") or "").strip()
    if not token_id or not secret:
        raise MintTokenError("Gateway returned an incomplete token response.")

    snippets = _mcp_payload(settings.api_base_url, secret)
    return {
        "token_id": token_id,
        "secret": secret,
        "api_url": settings.api_base_url.rstrip("/"),
        "workspace_id": workspace_id,
        "project_id": project_id,
        "mcp_config": snippets["mcp_config"],
        "cli_snippet": snippets["cli_snippet"],
        "cli_package": CLI_PACKAGE,
        "mcp_package": MCP_PACKAGE,
    }


async def revoke_agent_token(
    settings: Settings,
    creds: StoredCredentials,
    token_id: str,
    gateway: GatewayClient | None = None,
) -> None:
    """Best-effort revoke before regenerate. Missing tokens are ignored."""
    session_token = creds.token.strip()
    tid = token_id.strip()
    if not tid or not is_valid_access_token(session_token):
        return

    owned = gateway is None
    client = gateway or GatewayClient(settings)
    try:
        await client.revoke_api_token(session_token, tid)
    except GatewayError as exc:
        if exc.status_code != 404:
            raise MintTokenError(str(exc)) from exc
    finally:
        if owned:
            await client.aclose()


async def regenerate_agent_mcp_token(
    settings: Settings,
    store: SessionStore,
    creds: StoredCredentials,
    previous_token_id: str = "",
    gateway: GatewayClient | None = None,
    target: str = "cursor",
) -> dict[str, Any]:
    """Revoke the previous token (if known) then mint a new one."""
    owned = gateway is None
    client = gateway or GatewayClient(settings)
    try:
        if previous_token_id.strip():
            await revoke_agent_token(
                settings, creds, previous_token_id, gateway=client
            )
        return await mint_agent_mcp_token(
            settings, store, creds, gateway=client, target=target
        )
    finally:
        if owned:
            await client.aclose()


def install_skill(project_path: str) -> dict[str, str]:
    """Write (or refresh) the dont-break section of `AGENTS.md` in the project.

    Idempotent: the section lives between explicit markers; an existing
    section is replaced in place, any surrounding user content is preserved.
    """
    root = Path(project_path)
    if not project_path.strip() or not root.is_dir():
        raise SkillInstallError("No project folder selected yet — pick a project first.")

    target = root / SKILL_FILENAME
    section = f"{SKILL_MARKER_START}\n{skill_text().strip()}\n{SKILL_MARKER_END}\n"

    if not target.exists():
        target.write_text(section, encoding="utf-8")
        return {"path": str(target), "outcome": "created"}

    existing = target.read_text(encoding="utf-8")
    if SKILL_MARKER_START in existing and SKILL_MARKER_END in existing:
        before = existing.split(SKILL_MARKER_START, 1)[0]
        after = existing.split(SKILL_MARKER_END, 1)[1]
        updated = before + section + after.lstrip("\n")
        if updated == existing:
            return {"path": str(target), "outcome": "unchanged"}
        target.write_text(updated, encoding="utf-8")
        return {"path": str(target), "outcome": "updated"}

    target.write_text(existing.rstrip("\n") + "\n\n" + section, encoding="utf-8")
    return {"path": str(target), "outcome": "appended"}
