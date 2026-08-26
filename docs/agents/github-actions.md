# The CI job that catches what reviewers can't see

A PR looks small — 12 lines, 2 files. Your reviewer approves. Nobody saw that one of those files is a hub with 40 dependents. dont-break's CLI turns that invisible risk into a failing check (or a comment with the real blast radius) in one job.

Use `@polymerix-labs/dont-break-query` to gate merges on structural facts: architecture health, blast radius of the changed files, danger-zone touches. No agent required — plain JSON + `jq`.

## Setup

Add two values as repository secrets/variables (`Settings → Secrets and variables → Actions`): `DONT_BREAK_API_URL` and `DONT_BREAK_TOKEN` (secret). The `dbt_` token is project-scoped; the **Connect your agent** panel provides it.

## Example: block merges when architecture is critical

```yaml
name: dont-break gate
on: pull_request

jobs:
  arch-gate:
    runs-on: ubuntu-latest
    env:
      DONT_BREAK_API_URL: ${{ vars.DONT_BREAK_API_URL }}
      DONT_BREAK_TOKEN: ${{ secrets.DONT_BREAK_TOKEN }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }

      - name: Architecture verdict
        run: |
          verdict=$(npx -y @polymerix-labs/dont-break-query arch-status | jq -r .practicability.verdict)
          echo "verdict: $verdict"
          [ "$verdict" != "critical" ] || { echo "::error::architecture critical — merge blocked"; exit 1; }

      - name: Team rules vs this PR
        run: |
          git diff --name-only origin/${{ github.base_ref }}... -- 'src/**' \
            | npx -y @polymerix-labs/dont-break-query check --diff -
          # exits 0 ok · 1 warn · 2 block. Add --allow-warn to fail only on block.
```

## Example: fail when the blast radius is too big

Team policy as code — "no PR may ripple more than 2 levels deep without a senior review label":

```yaml
      - name: Enforce max blast radius
        run: |
          args=$(git diff --name-only origin/${{ github.base_ref }}... -- 'src/**' | sed 's/^/--file /' | tr '\n' ' ')
          [ -n "$args" ] || exit 0
          radius=$(npx -y @polymerix-labs/dont-break-query impact $args | jq .radius)
          echo "blast radius: $radius"
          if [ "$radius" -gt 2 ] && ! ${{ contains(github.event.pull_request.labels.*.name, 'senior-reviewed') }}; then
            echo "::error::radius $radius > 2 — add the 'senior-reviewed' label to merge"
            exit 1
          fi
```

## Example: fail when a PR touches a danger zone

```yaml
      - name: Danger-zone gate
        run: |
          changed=$(git diff --name-only origin/${{ github.base_ref }}... -- 'src/**')
          danger=$(npx -y @polymerix-labs/dont-break-query do-not-touch | jq -r '.[].fqn')
          for f in $changed; do
            if echo "$danger" | grep -q "$f"; then
              echo "::error file=$f::$f is a danger zone (high fan-in, low stability)"
              exit 1
            fi
          done
```

## Example: post the blast radius as a PR comment

Turn the invisible into a review artifact — every PR gets a structural summary:

```yaml
      - name: Comment blast radius
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          args=$(git diff --name-only origin/${{ github.base_ref }}... -- 'src/**' | sed 's/^/--file /' | tr '\n' ' ')
          [ -n "$args" ] || exit 0
          report=$(npx -y @polymerix-labs/dont-break-query impact $args)
          radius=$(echo "$report" | jq .radius)
          modules=$(echo "$report" | jq -r '.modules | join(", ")')
          count=$(echo "$report" | jq '.impacted_nodes | length')
          gh pr comment ${{ github.event.number }} --body "**dont-break impact**: radius $radius, $count nodes across: $modules"
```

Example comment on the PR:

> **dont-break impact**: radius 3, 27 nodes across: ui/main, ui/detail, cache

## Exit codes

The CLI exits `0` on success, `1` on API/network errors, `2` on usage/config errors — so any unexpected failure fails the job by default. Errors are JSON on stderr (`{ error, code, status }`).

`check` overlays the verdict on those codes: `0` ok, `1` warn, `2` block. Add `--allow-warn` to keep a warning at `0` and fail only on `block`.

Note: `impact` returns `422` (exit 1) if a changed file is not part of the synced snapshot (e.g. docs); filter paths to your source directories first (the `-- 'src/**'` in the examples above). A local [pre-commit hook](pre-commit.md) uses the same `check --diff -` command.
