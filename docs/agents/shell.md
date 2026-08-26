# Interrogate your codebase like a database

"Who breaks if I change this?" shouldn't require opening 15 files. One command, JSON out, pipe to `jq`. Your repo's dependency graph becomes something you can query in the middle of any shell workflow.

`@polymerix-labs/dont-break-query` is a JSON CLI over the query API: 7 subcommands, pure JSON on stdout, composable with `jq`.

## Setup

```bash
# Values from the dont-break app → Connect your agent panel
export DONT_BREAK_API_URL="https://api.dont-break.dev"
export DONT_BREAK_TOKEN="<jwt>"

npx -y @polymerix-labs/dont-break-query --help
```

## Recipes

```bash
alias dbq="npx -y @polymerix-labs/dont-break-query"
```

### "How healthy is this codebase?"

```bash
$ dbq arch-status | jq .practicability
{
  "verdict": "healthy",
  "summary": "Architecture scores indicate healthy practicability for AI-assisted changes."
}
```

### "Which node is this symbol?" (entry point for everything else)

```bash
$ dbq find PokemonAdapter --kind class --limit 2
[
  {
    "id": "818d1fa6f963ebdd",
    "name": "PokemonAdapter",
    "fqn": "com.skydoves.pokedex.ui.main.PokemonAdapter",
    "node_type": "Class"
  }
]
```

### "Who breaks if I change this?"

```bash
$ dbq dependents 818d1fa6f963ebdd --depth 2 | jq '{count: (.nodes | length), callers: [.nodes[].name]}'
{
  "count": 7,
  "callers": ["MainActivity", "MainViewModel", "PokemonViewHolder", ...]
}
```

### "What's the blast radius of my working set?"

```bash
$ dbq impact --file app/src/main/kotlin/com/skydoves/pokedex/ui/main/PokemonAdapter.kt \
  | jq '{radius, modules, truncated}'
{
  "radius": 2,
  "modules": ["app", "app/src/main/kotlin/com/skydoves/pokedex/ui/main"],
  "truncated": false
}

# Or feed it your uncommitted changes directly:
$ git diff --name-only -- 'src/**' | sed 's/^/--file /' | xargs dbq impact | jq .radius
```

### "Would this change break a team rule?"

```bash
$ git diff --name-only -- 'src/**' | dbq check --diff -
# 0 ok · 1 warn · 2 block. Add --allow-warn to fail only on block.
```

### "What should nobody touch this sprint?"

```bash
$ dbq do-not-touch --scope src/services
[
  {
    "node_id": "a41f...",
    "fqn": "services.LedgerCore.apply",
    "fan_in": 41,
    "stability": 28,
    "reason": { "kind": "high_fan_in_low_stability", "detail": "fan-in 41 with stability score 28" }
  }
]
# Empty array = no derived danger zones in that scope.
```

### "Why does changing A affect B?"

```bash
$ from=$(dbq find AuthMiddleware --limit 1 | jq -r '.[0].id')
$ to=$(dbq find SessionStore --limit 1 | jq -r '.[0].id')
$ dbq path "$from" "$to" --k 2 | jq '.[] | {route: .nodes, cost: .total_cost}'
{ "route": ["AuthMiddleware", "TokenValidator", "SessionStore"], "cost": 4.2 }
{ "route": ["AuthMiddleware", "LegacyShim", "SessionStore"], "cost": 9.8 }
# Lower cost = safer, more direct route through stable code.
```

### Script it: refuse to start work on a fragile area

```bash
#!/usr/bin/env bash
# pre-task.sh <path-prefix> — exits 1 if the area contains danger zones
zones=$(dbq do-not-touch --scope "$1" | jq length)
if [ "$zones" -gt 0 ]; then
  echo "WARNING: $zones danger zone(s) in $1 — review before editing:"
  dbq do-not-touch --scope "$1" | jq -r '.[] | "  \(.fqn) (fan-in \(.fan_in))"'
  exit 1
fi
```

## Behavior

| | |
|---|---|
| stdout | JSON result only (pipe-safe) |
| stderr | JSON `{ error, code, status }` on failure |
| exit 0 | success (`check`: verdict `ok`) |
| exit 1 | API or network error (`check`: verdict `warn`) |
| exit 2 | usage or configuration error (`check`: verdict `block`) |

`check --allow-warn` keeps a warning at exit 0. Same command as the [pre-commit hook](pre-commit.md) and the CI jobs.

Configuration is environment-only: the token never appears in argv or shell history. Results reflect the last synced snapshot of the project.
