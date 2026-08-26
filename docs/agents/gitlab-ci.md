# Block the merge request that would have broken prod

Style checks argue about commas; this job fails the pipeline when a change touches a fragile hub or when the architecture verdict says "critical". Structural facts, not opinions.

Same JSON CLI as GitHub Actions (`@polymerix-labs/dont-break-query`), driven by GitLab CI/CD variables.

## Setup

`Settings → CI/CD → Variables`: add `DONT_BREAK_API_URL` and `DONT_BREAK_TOKEN` (masked). The project-scoped `dbt_` token comes from the **Connect your agent** panel in the dont-break app.

## Example: merge-request gate

```yaml
dont-break-gate:
  image: node:20
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    # 1. Fail on critical architecture
    - verdict=$(npx -y @polymerix-labs/dont-break-query arch-status | jq -r .practicability.verdict)
    - echo "verdict:$verdict"
    - '[ "$verdict" != "critical" ] || { echo "architecture critical — blocking"; exit 1; }'

    # 2. Team rules vs the files in this MR (0 ok · 1 warn · 2 block)
    - git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
    - |
      git diff --name-only "origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"... -- 'src/**' \
        | npx -y @polymerix-labs/dont-break-query check --diff -
      # Add --allow-warn to fail only on block.

    # 3. Report the blast radius of this MR
    - args=$(git diff --name-only "origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"... | sed 's/^/--file /' | tr '\n' ' ')
    - '[ -z "$args" ] || npx -y @polymerix-labs/dont-break-query impact $args | jq "{radius, modules}"'

    # 4. Refuse edits inside danger zones
    - danger=$(npx -y @polymerix-labs/dont-break-query do-not-touch | jq -r '.[].fqn')
    - echo "danger zones:"; echo "$danger"
```

## Example: post the blast radius as an MR comment

```yaml
dont-break-report:
  image: node:20
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
    - args=$(git diff --name-only "origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"... -- 'src/**' | sed 's/^/--file /' | tr '\n' ' ')
    - '[ -n "$args" ] || exit 0'
    - report=$(npx -y @polymerix-labs/dont-break-query impact $args)
    - radius=$(echo "$report" | jq .radius)
    - modules=$(echo "$report" | jq -r '.modules | join(", ")')
    - |
      curl --request POST \
        --header "PRIVATE-TOKEN: $COMMENT_TOKEN" \
        --data-urlencode "body=**dont-break impact**: radius $radius across: $modules" \
        "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes"
```

Example comment on the MR:

> **dont-break impact**: radius 3 across: ui/main, ui/detail, cache

## Example: max-radius policy

"Any MR with radius > 2 needs the `breaking-ok` label":

```yaml
dont-break-radius:
  image: node:20
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
    - args=$(git diff --name-only "origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"... -- 'src/**' | sed 's/^/--file /' | tr '\n' ' ')
    - '[ -n "$args" ] || exit 0'
    - radius=$(npx -y @polymerix-labs/dont-break-query impact $args | jq .radius)
    - echo "blast radius:$radius"
    - |
      if [ "$radius" -gt 2 ] && ! echo "$CI_MERGE_REQUEST_LABELS" | grep -q "breaking-ok"; then
        echo "radius $radius > 2 — add the 'breaking-ok' label to proceed"
        exit 1
      fi
```

## Notes

- Exit codes: `0` success, `1` API/network error, `2` usage/config error — non-zero fails the job. `check` uses `0` ok, `1` warn, `2` block (`--allow-warn` keeps warn at `0`).
- All outputs are pure JSON on stdout; combine with `jq` for any policy you want (max radius, forbidden modules, ...).
- Filter diffs to synced source directories (`-- 'src/**'`): `impact` and `check` return `422` for files absent from the snapshot (docs, CI config, ...).
- The same `check --diff -` command is the [pre-commit hook](pre-commit.md).
- Results reflect the last synced snapshot; sync from the dont-break app (CI-side sync arrives in a later phase).
