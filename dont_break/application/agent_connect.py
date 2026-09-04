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

import json
from pathlib import Path
from typing import Any

from dont_break.application.session_store import SessionStore
from dont_break.application.workspace_resolve import resolve_workspace_id
from dont_break.config import Settings
from dont_break.credentials import StoredCredentials, is_valid_access_token
from dont_break.domain.errors import GatewayError
from dont_break.git.context import collect_git_context
from dont_break.git.identity import parse_git_remote_url
from dont_break.infrastructure.gateway import GatewayClient
from dont_break.project.mapping import FolderProjectStore

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

CURSOR_SKILL_REL = Path(".cursor") / "skills" / "dont-break" / "SKILL.md"
CURSOR_MCP_REL = Path(".cursor") / "mcp.json"
CURSOR_SKILL_NAME = "dont-break"
CURSOR_SKILL_DESCRIPTION = (
    "Applies the dont-break safe-change protocol. Use before editing code, "
    "when refactoring, or when reviewing impact with the dont-break MCP tools."
)

_SKILL_PATH = Path(__file__).resolve().parent.parent / "agents_skill.md"


class SkillInstallError(RuntimeError):
    pass


class MintTokenError(RuntimeError):
    pass


def skill_text() -> str:
    return _SKILL_PATH.read_text(encoding="utf-8")


def cursor_skill_text() -> str:
    """Cursor `SKILL.md` body: YAML frontmatter plus the shared protocol.

    Omits `disable-model-invocation` so the agent can auto-apply the
    protocol when editing, instead of waiting to be named.
    """
    return (
        f"---\nname: {CURSOR_SKILL_NAME}\n"
        f"description: {CURSOR_SKILL_DESCRIPTION}\n"
        f"---\n\n{skill_text().strip()}\n"
    )


def _write_cursor_skill(root: Path) -> dict[str, str]:
    """Create or refresh `.cursor/skills/dont-break/SKILL.md`."""
    target = root / CURSOR_SKILL_REL
    target.parent.mkdir(parents=True, exist_ok=True)
    body = cursor_skill_text()
    if target.exists() and target.read_text(encoding="utf-8") == body:
        return {"path": str(target), "outcome": "unchanged"}
    created = not target.exists()
    target.write_text(body, encoding="utf-8")
    return {"path": str(target), "outcome": "created" if created else "updated"}


def _write_agents_md(root: Path) -> dict[str, str]:
    """Create or refresh the marked dont-break section of `AGENTS.md`."""
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


def _combine_outcomes(*outcomes: str) -> str:
    """Prefer `updated` over `created` so a mixed refresh still reports work."""
    if "updated" in outcomes or "appended" in outcomes:
        return "updated"
    if "created" in outcomes:
        return "created"
    return "unchanged"


def cursor_project_status(project_path: str) -> dict[str, Any]:
    """Whether this folder already has the Cursor MCP server and skill files."""
    root = Path(project_path) if project_path.strip() else None
    mcp_path = str(root / CURSOR_MCP_REL) if root else ""
    skill_path = str(root / CURSOR_SKILL_REL) if root else ""
    mcp_installed = False
    if root and root.is_dir():
        target = root / CURSOR_MCP_REL
        if target.is_file():
            try:
                data = json.loads(target.read_text(encoding="utf-8"))
                servers = data.get("mcpServers") if isinstance(data, dict) else None
                mcp_installed = isinstance(servers, dict) and MCP_SERVER_KEY in servers
            except json.JSONDecodeError:
                mcp_installed = False
    return {
        "mcp_installed": mcp_installed,
        "mcp_path": mcp_path,
        "skill_installed": bool(root and root.is_dir() and (root / CURSOR_SKILL_REL).is_file()),
        "skill_path": skill_path,
    }


def _mcp_dont_break_token(payload: dict[str, Any]) -> str:
    """Extract the dont-break `DONT_BREAK_TOKEN` from an mcp.json-shaped dict."""
    servers = payload.get("mcpServers")
    if not isinstance(servers, dict):
        return ""
    server = servers.get(MCP_SERVER_KEY)
    if not isinstance(server, dict):
        return ""
    env = server.get("env")
    if not isinstance(env, dict):
        return ""
    return str(env.get("DONT_BREAK_TOKEN") or "").strip()


def user_mcp_has_other_dont_break_token(minted_mcp: dict[str, Any]) -> bool:
    """True when `~/.cursor/mcp.json` has a different dont-break token."""
    user_path = Path.home() / ".cursor" / "mcp.json"
    if not user_path.is_file():
        return False
    try:
        raw = json.loads(user_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return False
    existing = _mcp_dont_break_token(raw if isinstance(raw, dict) else {})
    incoming = _mcp_dont_break_token(minted_mcp)
    return bool(existing) and bool(incoming) and existing != incoming


def _ensure_mcp_gitignored(cursor_dir: Path) -> None:
    """Ignore `.cursor/mcp.json` so a minted `dbt_` is not committed."""
    ignore = cursor_dir / ".gitignore"
    try:
        existing = ignore.read_text(encoding="utf-8") if ignore.is_file() else ""
    except OSError:
        existing = ""
    names = {line.strip() for line in existing.splitlines()}
    if "mcp.json" in names or "/mcp.json" in names:
        return
    prefix = f"{existing.rstrip()}\n" if existing.strip() else ""
    ignore.write_text(f"{prefix}mcp.json\n", encoding="utf-8")


def write_cursor_mcp_json(project_path: str, mcp_config: dict[str, Any]) -> dict[str, Any]:
    """Merge the dont-break MCP server into `.cursor/mcp.json`, keeping other servers."""
    root = Path(project_path)
    if not project_path.strip() or not root.is_dir():
        raise SkillInstallError("No project folder selected yet — pick a project first.")
    incoming = mcp_config.get("mcpServers")
    if not isinstance(incoming, dict) or MCP_SERVER_KEY not in incoming:
        raise SkillInstallError("MCP payload is missing the dont-break server.")
    target = root / CURSOR_MCP_REL
    target.parent.mkdir(parents=True, exist_ok=True)
    _ensure_mcp_gitignored(target.parent)
    existing: dict[str, Any] = {}
    if target.exists():
        try:
            parsed = json.loads(target.read_text(encoding="utf-8"))
            if isinstance(parsed, dict):
                existing = parsed
        except json.JSONDecodeError:
            existing = {}
    servers = existing.get("mcpServers")
    if not isinstance(servers, dict):
        servers = {}
    created = MCP_SERVER_KEY not in servers
    servers[MCP_SERVER_KEY] = incoming[MCP_SERVER_KEY]
    existing["mcpServers"] = servers
    body = json.dumps(existing, indent=2) + "\n"
    conflict = user_mcp_has_other_dont_break_token(mcp_config)
    if target.exists() and target.read_text(encoding="utf-8") == body:
        return {
            "path": str(target),
            "outcome": "unchanged",
            "user_mcp_conflict": conflict,
        }
    target.write_text(body, encoding="utf-8")
    return {
        "path": str(target),
        "outcome": "created" if created else "updated",
        "user_mcp_conflict": conflict,
    }


def apply_cursor_project_files(
    project_path: str, mcp_config: dict[str, Any]
) -> dict[str, Any]:
    """Write `.cursor/mcp.json` and the skill when the local folder is known."""
    if not project_path.strip() or not Path(project_path).is_dir():
        return {}
    return {
        "mcp": write_cursor_mcp_json(project_path, mcp_config),
        "skill": install_skill(project_path),
    }


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

    files = cursor_project_status(store.project_path)

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
        **files,
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
    path = (store.project_path or "").strip()
    if not path or not Path(path).is_dir():
        raise MintTokenError("Pick a project folder first.")
    mapping = FolderProjectStore().get(path)
    if mapping is None or mapping.project_id != project_id:
        raise MintTokenError("Link this folder to a registered project first.")
    ctx = collect_git_context(Path(path))
    parsed = parse_git_remote_url(ctx.remote_url) if ctx.remote_url else None

    owned = gateway is None
    client = gateway or GatewayClient(settings)
    try:
        if parsed is not None:
            try:
                existing = await client.list_projects(session_token)
            except GatewayError as exc:
                raise MintTokenError(str(exc)) from exc
            row = next(
                (
                    item
                    for item in existing
                    if str(item.get("id") or item.get("project_id") or "").strip()
                    == project_id
                ),
                None,
            )
            if row is None:
                raise MintTokenError("Link this folder to a registered project first.")
            remote_key = str(
                row.get("gitUrlKey") or row.get("git_url_key") or ""
            ).strip().lower()
            if remote_key and remote_key != parsed.url_key:
                raise MintTokenError(
                    "This folder's Git origin does not match the linked project."
                )
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


    project_files: dict[str, Any] = {}
    try:
        if target == "cursor":
            project_files = apply_cursor_project_files(
                store.project_path, snippets["mcp_config"]
            )
        elif store.project_path.strip() and Path(store.project_path).is_dir():
            project_files = {"skill": install_skill(store.project_path)}
    except SkillInstallError as exc:
        project_files = {"error": str(exc)}
    mcp_meta = project_files.get("mcp") if isinstance(project_files.get("mcp"), dict) else {}
    return {
        "token_id": token_id,
        "secret": secret,
        "api_url": settings.api_base_url.rstrip("/"),
        "workspace_id": workspace_id,
        "project_id": project_id,
        "project_display_name": (store.project_display_name or "").strip(),
        "mcp_config": snippets["mcp_config"],
        "cli_snippet": snippets["cli_snippet"],
        "cli_package": CLI_PACKAGE,
        "mcp_package": MCP_PACKAGE,
        "project_files": project_files,
        "user_mcp_conflict": bool(mcp_meta.get("user_mcp_conflict")),
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
    """Write the Cursor skill and the `AGENTS.md` protocol into the project.

    Cursor loads `.cursor/skills/dont-break/SKILL.md`. Other agents still
    read `AGENTS.md`. Both writes are idempotent.
    """
    root = Path(project_path)
    if not project_path.strip() or not root.is_dir():
        raise SkillInstallError("No project folder selected yet — pick a project first.")

    cursor = _write_cursor_skill(root)
    agents = _write_agents_md(root)
    return {
        "path": cursor["path"],
        "outcome": _combine_outcomes(cursor["outcome"], agents["outcome"]),
        "agents_md": agents["path"],
    }
