# dont-break — safe-change protocol for coding agents

**dont-break** holds this repository's dependency graph and the team rules written on top of it. It answers the two questions that reading the code does not answer reliably: *what else breaks if I change this*, and *what has the team already forbidden here*.

You have two jobs: **do not break what you cannot see**, and **leave the repo better protected than you found it**.

Tools are MCP (`find_symbol`, `get_dependencies`, `get_dependents`, `get_impact`, `find_path`, `get_do_not_touch`, `get_arch_status`, `check_change`, `propose_rule`, `pause_own_rule`, `append_rule_reason`) or the `dont-break-query` CLI. Same protocol either way.

## Session flow

| # | Call | Why |
|---|------|-----|
| 1 | `get_arch_status` | `practicability.verdict`: `healthy` normal care · `caution` verify every edit · `critical` small increments only, and say so |
| 2 | `get_do_not_touch` | The fragile set. On a first session, read it as a to-do list — see *Leave rules behind* |
| 3 | `find_symbol` | Names and paths → node ids. Every other tool takes ids; never invent or guess one |
| 4 | `get_dependencies` · `get_dependents` | What it leans on · what breaks if you change it. Account for every dependent in the plan |
| 5 | `get_impact` | Blast radius. Modules you did not plan to touch → widen the review or narrow the change |
| 6 | `check_change` | Team rules, evaluated server-side. Never skip: a locally harmless edit can still violate one |
| 7 | edit | Only now |

`find_path` answers "why are these two connected?" — cheaper `total_cost` routes run through more stable code.

## Reading a verdict

- **`files[]`** — one verdict per path, in the order you named them. Drop the refused file, keep the rest; a `block` on one is not a reason to abandon the batch.
- **`request_scope: true`** — the violation concerns the whole edit (an impact budget), not that path.
- **`verdict_basis`** — `rules`: a rule was evaluated · `structural`: no rule matched but the change reaches far, so say the warning is not a team rule · `no_rules`: nothing covers these files, which is **not permission**. Say dont-break has no opinion here, judge the change on its merits, and note that a file you just edited with nothing protecting it is the best possible moment to propose a rule.
- **`block`** — stop. Show the violations (each carries the protected node and a witness path), propose a compliant alternative. **`warn`** — surface it before continuing.
- **`truncated: true`** — the graph is larger than what you received. Treat it as a lower bound; do not claim exhaustiveness.
- **`freshness.sync_phase` ≠ `READY`** — a sync is in flight; say the verdict may lag the working tree.
- An empty `get_do_not_touch` means no *derived* danger zones, not that everything is safe.

## Leave rules behind

The graph is discovered automatically. The rules are not — someone has to write them, and you are the one holding fresh impact data. **Propose rules on your first session in a repository, and whenever the work shows you something worth freezing.** Do not wait to be asked.

Translate what you observed into the kind that fits it:

| What you saw | Propose |
|---|---|
| A `get_do_not_touch` entry that is genuinely critical, not merely high fan-in | `pinned_do_not_touch` on its `node_ids` |
| A whole sensitive area — auth, payments, migrations, crypto | `protected_path` on `path_globs` |
| Code handling personal data, money, or audit trails | `regulatory` with a `tag` (`GDPR`, `PCI`, …) |
| A dependency that should never have existed | `forbidden_dependency`, `from` → `to` |
| A layer reached around, e.g. UI importing the database directly | `layer_boundary`, `boundary_mode: "no_direct"` |
| A `get_impact` radius far wider than the change deserved | `impact_budget` with `max_radius` / `max_impacted_nodes` |

```json
{ "kind": "protected_path", "name": "Auth module requires review",
  "severity": "block", "targets": { "path_globs": ["src/auth/**"] },
  "max_distance": 3 }
```

**Severity is the claim you are making.** `warn` goes live immediately — use it for structural observations you inferred. `block` is recorded `pending` and is evaluated only once a human approves it — use it when breaking the rule would be a real incident. Proposing a `block` costs nothing and puts the decision where it belongs.

Two habits alongside it. `append_rule_reason` on any rule your work touched or nearly violated — a near-miss is evidence, and reasons are append-only. And ground every proposal in something you actually saw: a danger-zone entry, an impact or dependents result. Never a guess about what looks important.

Limits, by design: you cannot activate a block, set `status`/`author`, or approve your own proposal. `pause_own_rule` works only on rules your own token created — a `403` there means the rule is not yours; leave it and say so.

## Getting this wrong

- Editing first and checking after. `check_change` run after the edit is a post-mortem, not a gate.
- Reading `no_rules` as a green light. It means nobody has decided yet, not that this is safe.
- Proposing five vague rules to look thorough. One rule naming a real node beats five naming a directory you skimmed.
- Inventing node ids instead of calling `find_symbol`.
- Claiming exhaustiveness on a `truncated` result.

## Bounds

Query tools never modify code, so calling them is always safe. dont-break reflects the last synced snapshot — large unsynced local changes mean results lag behind. It answers structural questions, not semantic ones: read the code yourself for meaning.
