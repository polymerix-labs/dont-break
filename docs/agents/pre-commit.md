# Stop a commit that would break a protected zone

The hook runs on the files you are about to commit. It uses the same `check` command as CI, so a local commit and a merge request tell the same story.

Exit codes: `0` ok · `1` warn · `2` block. A block fails the hook. Add `--allow-warn` if a warning should still commit.

You need `DONT_BREAK_API_URL` and `DONT_BREAK_TOKEN` in the environment (the **Connect your agent** panel copies them).

## Git hook (no extra tool)

`.git/hooks/pre-commit` (executable):

```bash
#!/usr/bin/env bash
set -euo pipefail
files=$(git diff --cached --name-only --diff-filter=ACMR)
[ -n "$files" ] || exit 0
printf '%s\n' "$files" | npx -y @polymerix-labs/dont-break-query check --diff -
```

Install once:

```bash
chmod +x .git/hooks/pre-commit
```

## pre-commit.com

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: dont-break-check
        name: dont-break rules
        language: system
        pass_filenames: false
        entry: bash -c 'git diff --cached --name-only --diff-filter=ACMR | npx -y @polymerix-labs/dont-break-query check --diff -'
```

Then `pre-commit install`.

## Fail only on block

Replace the `check --diff -` line with `check --diff - --allow-warn` if a `warn` verdict must not stop the commit.
