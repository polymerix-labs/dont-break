# Build agents that understand your architecture

Most custom agents see code as text. Give yours the dependency graph: 11 ready-made tools (impact, dependents, danger zones, team rules, ...) it can call from LangChain, GPT Actions, or any function-calling framework — with zero graph infrastructure on your side.

The query API ships an OpenAPI 3.1 document (`query-api.openapi.json`) with one operation per tool (`find_symbol`, `get_dependencies`, `get_dependents`, `get_impact`, `find_path`, `get_do_not_touch`, `get_arch_status`, `check_change`, `propose_rule`, `pause_own_rule`, `append_rule_reason`). Any framework that consumes OpenAPI can call dont-break directly.

## Option A — typed client (recommended for custom code)

For TypeScript agents, skip OpenAPI and use the core package directly:

```ts
import { configFromEnv, QueryApiClient, TOOLS } from "@polymerix-labs/agents-core";

const client = new QueryApiClient(configFromEnv());

// Bind the 11 tool definitions to your framework of choice:
const langchainTools = TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  schema: tool.inputSchema,               // JSON Schema — most frameworks accept it as-is
  func: (input: Record<string, unknown>) => tool.execute(client, input),
}));
```

Each `ToolDefinition` carries the agent-oriented description and JSON Schema input — the same ones the MCP server exposes, so behavior is identical across frameworks.

### Complete example: a review bot that annotates diffs

```ts
import { configFromEnv, QueryApiClient } from "@polymerix-labs/agents-core";

const client = new QueryApiClient(configFromEnv());

export async function reviewChangedFiles(files: string[]): Promise<string> {
  const impact = await client.impact({ files });
  const danger = await client.doNotTouch();
  const hits = danger.filter((zone) =>
    impact.impacted_nodes.some((node) => node.fqn === zone.fqn)
  );

  const lines = [
    `Blast radius: ${impact.radius} (${impact.impacted_nodes.length} nodes)`,
    `Modules touched: ${impact.modules.join(", ")}`,
  ];
  if (hits.length > 0) {
    lines.push(`DANGER: this change reaches ${hits.length} fragile hub(s):`);
    for (const zone of hits) {
      lines.push(`  - ${zone.fqn} (fan-in ${zone.fan_in}, ${zone.reason.detail})`);
    }
  }
  return lines.join("\n");
}
```

Output for a typical PR:

```text
Blast radius: 3 (27 nodes)
Modules touched: ui/main, ui/detail, cache
DANGER: this change reaches 1 fragile hub(s):
  - cache.ImageCache.evict (fan-in 19, fan-in 19 with stability score 33)
```

## Option B — OpenAPI document

1. Get `query-api.openapi.json` (shipped with the backend, path `agents/openapi/query-api.openapi.json`).
2. Point your toolkit at it, for example LangChain Python:

```python
from langchain_community.agent_toolkits.openapi import planner
from langchain_community.utilities.requests import RequestsWrapper
import json, os

spec = json.load(open("query-api.openapi.json"))
requests_wrapper = RequestsWrapper(headers={
    "Authorization": f"Bearer {os.environ['DONT_BREAK_TOKEN']}",
})
# Use DONT_BREAK_API_URL and the project-scoped DONT_BREAK_TOKEN only.
```

For GPT Actions, import the document and configure Bearer auth with your token.

### Complete example: LangChain structured tools (Python)

```python
import os, requests
from langchain_core.tools import tool

HEADERS = {"Authorization": f"Bearer {os.environ['DONT_BREAK_TOKEN']}"}
context = requests.get(
    f"{os.environ['DONT_BREAK_API_URL']}/api/v1/me/context", headers=HEADERS
).json()
BASE = (
    f"{os.environ['DONT_BREAK_API_URL']}/api/v1"
    f"/workspaces/{context['workspace_id']}"
    f"/projects/{context['project_slug']}/query"
)


@tool
def find_symbol(name: str, kind: str = "") -> list:
    """Resolve a symbol name or file path into graph node ids. Call this first."""
    params = {"name": name, **({"kind": kind} if kind else {})}
    return requests.get(f"{BASE}/find", params=params, headers=HEADERS).json()


@tool
def get_impact(files: list[str]) -> dict:
    """Blast radius of changing these repository-relative files."""
    return requests.post(f"{BASE}/impact", json={"files": files}, headers=HEADERS).json()


@tool
def get_do_not_touch(scope: str = "") -> list:
    """Nodes that are dangerous to modify (high fan-in, low stability)."""
    params = {"scope": scope} if scope else {}
    return requests.get(f"{BASE}/do-not-touch", params=params, headers=HEADERS).json()


# agent = create_react_agent(model, tools=[find_symbol, get_impact, get_do_not_touch])
# agent.invoke({"messages": "Is it safe to refactor src/services/ledger.ts?"})
```

A typical run:

```text
Human: Is it safe to refactor src/services/ledger.ts?
AI: → find_symbol("src/services/ledger.ts")
    → get_impact(files=["src/services/ledger.ts"])       radius 3, 27 nodes
    → get_do_not_touch(scope="src/services")             LedgerCore.apply, fan-in 41
AI: Not safely in one pass. The file reaches 27 nodes and contains a fragile
    hub (LedgerCore.apply, fan-in 41). Suggested plan: extract pure helpers
    first, keep apply() untouched, then migrate call sites in two batches.
```

## What to expect

- Every operation is read-only (`GET`, plus one `POST /impact` that only computes) — safe to call freely.
- Node ids are opaque: the model must call `find_symbol` first (operation descriptions say so).
- `truncated: true` in responses means the server cap was hit; treat results as partial.
- Errors are JSON `{ "error": "..." }` with 400/401/404/422 semantics described per operation.
