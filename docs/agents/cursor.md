# Make Cursor check before it wrecks

Your agent is about to rename a method. Without dont-break, it greps, guesses, and hopes. With it, the agent *knows*: 23 dependents, blast radius 3, and that class is on the danger list — so it warns you first and proposes a safer plan.

The MCP server `@polymerix-labs/dont-break-mcp` exposes the 11 dont-break tools over the Model Context Protocol. Works with Cursor, Claude Desktop, and any MCP-compatible host. Setup takes ~2 minutes.

## Setup

1. Open the dont-break app (`python3 -m dont_break --wake`) → **Agents**.
2. Sign in, link the folder to a registered project, then click **Connect Cursor** (one click).
3. Copy the `mcp.json` block (it contains your project-scoped `dbt_` token — shown once).
4. In Cursor: `Settings → MCP → Add server`, or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "dont-break": {
      "command": "npx",
      "args": ["-y", "@polymerix-labs/dont-break-mcp"],
      "env": {
        "DONT_BREAK_API_URL": "https://api.dont-break.dev",
        "DONT_BREAK_TOKEN": "dbt_<from-the-panel>"
      }
    }
  }
}
```

5. Restart the MCP server list; you should see 11 tools under `dont-break`.
6. (Recommended) Click **Install agent skill** in the panel: it adds the safe-change protocol to your repo's `AGENTS.md`, so the agent calls `get_impact` before editing and checks `get_do_not_touch` before refactors, without you prompting it.

To revoke or renew later, use the website **Account → API tokens** page (Sync / CI presets live there too). In the extension, **New token** regenerates the Agent MCP secret.

## Try it — 4 prompts that change how your agent works

### 1. The risky rename

> Before renaming `PokemonService.fetchAll`, use dont-break to tell me who depends on it and what the blast radius is.

What happens under the hood:

```text
→ find_symbol("PokemonService.fetchAll")      resolves the name to a node id
→ get_dependents(node_id, depth=2)            "23 nodes: MainViewModel, PokemonAdapter, DetailScreen..."
→ get_impact(nodes=[node_id])                 { "radius": 3, "modules": ["ui/main", "ui/detail", "cache"] }
```

The agent now lists every call site it must update — including the ones in files it never opened.

### 2. The "safe to delete?" check

> I think `LegacyImageLoader` is dead code. Verify with dont-break before deleting it.

```text
→ find_symbol("LegacyImageLoader", kind="class")
→ get_dependents(node_id)                     { "nodes": [], "edges": [], "truncated": false }
```

Empty dependents = provably unused. Non-empty = the agent shows you who still calls it instead of deleting blind.

### 3. The pre-refactor danger scan

> We're refactoring the `payments/` module this week. Check the danger zones first.

```text
→ get_do_not_touch(scope="payments")
[
  {
    "fqn": "payments.LedgerCore.apply",
    "fan_in": 41,
    "stability": 28,
    "reason": { "kind": "high_fan_in_low_stability", "detail": "fan-in 41 with stability score 28" }
  }
]
```

The agent flags `LedgerCore.apply` and asks for explicit confirmation before touching it — that's rule 3 of the installed skill.

### 4. Onboarding to an unfamiliar repo

> I've never seen this codebase. Use dont-break to tell me how careful I should be, and how `AuthMiddleware` connects to `SessionStore`.

```text
→ get_arch_status()          { "practicability": { "verdict": "caution", ... } }
→ find_symbol("AuthMiddleware") + find_symbol("SessionStore")
→ find_path(from, to, k=2)   two routes, cheapest goes through TokenValidator (total_cost 4.2)
```

The agent calibrates itself (`caution` → verify impact on every edit) and explains the dependency chain instead of guessing it.

## Troubleshooting

- **Tools missing**: the token may be expired — regenerate from the panel and update the config.
- **`not_found` on node ids**: node ids come from `find_symbol`; the agent must not invent them (the skill enforces this).
- **Empty results after big local changes**: results reflect the last synced snapshot — re-sync the project in the dont-break app.
