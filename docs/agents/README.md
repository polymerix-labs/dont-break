# Your AI agent can't break what it can see

AI agents edit code blind. They read the file in front of them, change a function, and have no idea that 47 other places depend on it. You find out in review — or in prod.

**dont-break** gives any agent (Cursor, Claude, your CI, your own bot) a live structural map of your codebase: who depends on what, the blast radius of every change, and which parts are too fragile to touch. Before the edit, not after.

```text
You:    "Rename PokemonService.fetchAll"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 call sites across 4 modules"
        → get_impact(files: [...])                  "radius 3, touches ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService is a danger zone: fan-in 23, stability 31"
Agent:  "This is riskier than it looks. Here are the 23 places that break,
         and a safer 2-step plan."
```

That conversation happens automatically once connected. No prompt engineering required — the agent skill teaches it.

## Pick your fight

### "My agent keeps breaking things it never opened"

Vibe coding is great until a quick fix ripples somewhere invisible. Plug dont-break into **Cursor or Claude Desktop** and your agent checks impact and danger zones *before* editing — then warns you instead of apologizing after.

→ [Set up in Cursor / Claude (2 min)](cursor.md)

### "I want CI to block disasters, not argue about style"

Your linter can't see architecture. Add one job that fails the merge when the change hits a fragile hub, or just posts the real blast radius on every PR — grounded in the dependency graph, not vibes.

→ [GitHub Actions](github-actions.md) · [GitLab CI](gitlab-ci.md) · [pre-commit hook](pre-commit.md)

### "I just want to interrogate my codebase"

`dbq dependents <id> | jq` — who breaks if I change this? What's the safest path between these two modules? Which files should nobody touch this sprint? Your repo becomes a queryable database.

→ [Shell + jq recipes](shell.md)

### "I'm building my own agent"

Same 11 tools, exposed as typed TypeScript definitions or a generated OpenAPI 3.1 spec. Bind them to LangChain, GPT Actions, or anything that speaks function calling — identical behavior everywhere, because every surface derives from one core.

→ [LangChain / OpenAPI / custom agents](langchain.md)

## The 11 tools your agent gets

| Tool | The question it kills |
|------|----------------------|
| `find_symbol` | "Which node is this name / file?" (entry point) |
| `get_dependents` | "Who breaks if I change this?" |
| `get_impact` | "What's the blast radius of these edits?" |
| `get_do_not_touch` | "What should I refuse to touch without asking?" |
| `get_dependencies` | "What does this code rely on?" |
| `find_path` | "Why does changing A affect B?" |
| `get_arch_status` | "How carefully should I work in this repo?" |
| `check_change` | "Does this edit violate a team rule?" |
| `propose_rule` | "Record a warn now, or a block for a human to approve" |
| `pause_own_rule` | "Stop evaluating a rule this agent token authored" |
| `append_rule_reason` | "Add one justification — never edit or delete" |

Query tools are read-only, server-side analysis, capped responses. Calling them is always safe. The three rule tools write team rules under tight limits: they cannot activate a block, pause someone else's rule, or rewrite reasons.

## Connect in 30 seconds

1. Open the dont-break app → **Agents**.
2. Sign in, link the folder to a project, click **Connect Cursor** — one click mints a project-scoped `dbt_` token and fills `mcp.json`.
3. Paste into Cursor (or your MCP client). Copy it now: the secret is shown once.
4. Click **Install agent skill** — it writes the safe-change protocol into your repo's `AGENTS.md` so agents use the tools without being told.

Everything is configured through two environment variables (`DONT_BREAK_API_URL`, `DONT_BREAK_TOKEN`). The `dbt_` token binds the workspace and project server-side; tokens travel via environment only — never in argv, never in shell history. Manage / revoke / Sync & CI presets on the website **Account → API tokens** page.
