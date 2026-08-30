<div align="center">

![dont-break](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/logo.gif)

**The trust layer for AI coding agents.**

Say what must never break. Prove it holds. Enforce it on every agent edit.

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

📬 Feature requests, bugs, questions, or feedback: **[daryl@dont-break.com](mailto:daryl@dont-break.com)**

**🇬🇧 English** · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: describe what must never break, watch the graph find and test the protection](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI agents ship code fast. Nobody ships trust with it. Every team running Cursor, Claude, or CI bots has the same unspoken fear: the day a quick fix silently breaks the one thing that was never supposed to break.

`dont-break` turns that fear into a contract, in four steps:

1. **Say it in plain words.** "Nobody should be able to break invoice calculation, even indirectly." No file paths, no code.
2. **Watch it get found.** dont-break reads the live map of your codebase and lights up every place that carries that logic — including the paths you forgot existed.
3. **Watch it get attacked.** It writes a protection rule, then replays code changes against it to prove the protection actually holds. A dry run: nothing in your code is touched.
4. **Activate it.** From then on, **every agent edit is checked against the rule before it lands** — in the editor, in CI, on the dashboard.

## 30 seconds of quickstart

Requires **Python 3.9+** and **Node.js** (npm). The graph extractor installs itself on first run.

```bash
pip install dont-break
dont-break --wake
```

That opens a local UI on `http://127.0.0.1:4040`, in your language (32 available). Sign in, pick a project folder, and the map of your code builds itself: a live 3D graph of every module, call, and dependency, with your protected zones lit up on top of it.

## What "enforce it on every agent edit" actually means

Most guardrails are prompts, and prompts get ignored. dont-break sits **outside** the model:

- **In the conversation.** Connected over MCP, your agent calls `check_change` before editing and `get_impact` before refactoring. It gets told "this is riskier than it looks — 23 call sites break" *before* writing, not after.
- **At the write itself.** An editor hook intercepts every file write an agent attempts. The write is compared against your active rules — no prompt engineering, no cooperation required from the model.
- **At the merge.** The same verdicts run in CI and fail the pipeline when a change reaches a protected zone. What your editor tolerated, the default branch still refuses.

```text
You:    "Rename PokemonService.fetchAll"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 call sites across 4 modules"
        → get_impact(files: [...])                  "radius 3, touches ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService is a danger zone: fan-in 23, stability 31"
Agent:  "This is riskier than it looks. Here are the 23 places that break,
         and a safer 2-step plan."
```

That conversation happens automatically once connected. No prompt engineering: the agent skill teaches it.

### Two enforcement modes

You pick the strength per folder, in one click:

| | **Watch mode** (default) | **Hard mode** |
|---|---|---|
| What happens on a risky agent write | The write lands; the verdict (ok / warn / block) is reported to the agent and to your dashboard as an incident | The write is **refused** until a `check_change` has passed for that file |
| Philosophy | Observe first: see what your agents would have broken, build trust in the rules | Enforce: a protected file cannot be touched unchecked, period |
| If dont-break is offline | Fail-open — your agent keeps working, nothing blocks | Fail-closed on protected writes — "hard" is not a lie |
| Best for | First weeks, exploring, low-stakes repos | Payment flows, auth, schemas, anything with an on-call rotation |

Start in Watch, read a week of incidents, then flip the folders that matter to Hard.

### Rules with a spine

- A rule is written in plain language, compiled against the real dependency graph, and **tested by attack before activation** — you see it catch a breaking change before you trust it.
- Agents can *propose* rules and add reasons, but they can never activate a block, pause someone else's rule, or rewrite history. Humans approve; the audit trail is append-only.
- Every verdict comes with a **witness path**: the exact chain of dependencies through which your edit reaches the protected zone. No "the linter said no" — you see *why*.

## Pick your fight

**"My agent keeps breaking things it never opened"**<br>
Plug dont-break into Cursor or Claude Desktop. Your agent checks impact and danger zones before editing, not after.<br>
→ [Set up in Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"I want CI to block disasters, not argue about style"**<br>
One job that fails the merge when a change hits a protected zone or a fragile hub, grounded in the real dependency graph, not vibes.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"My team needs to see this, not just me"**<br>
Everything above runs on your machine — what your agent is doing, right now, on your working copy. [dont-break.com](https://dont-break.com) is the other half: every repository, every agent, and what CI actually enforced on the default branch, in one place.<br>
→ [Team dashboard](https://dont-break.com)

**"I just want to interrogate my codebase"**<br>
`dbq dependents <id> | jq`: who breaks if I change this? Your repo becomes a queryable database.<br>
→ [Shell + jq recipes](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"I'm building my own agent"**<br>
The same 11 tools, exposed as typed TypeScript definitions or a generated OpenAPI 3.1 spec.<br>
→ [LangChain / OpenAPI / custom agents](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

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
| `append_rule_reason` | "Add one justification, never edit or delete" |

Query tools are read-only, server-side analysis, capped responses: always safe to call. The three rule tools write team rules under tight limits: they cannot activate a block, pause someone else's rule, or rewrite reasons.

## The control room

- **Rule Studio**: describe what must never break, watch the graph find it, test the protection live before activating it
- **Check**: pre-edit simulator: pick seeds, get an ok/warn/block verdict, animate the exact path a break would take
- **Overview**: a verdict in one sentence, stability and AI-navigability readouts, the top actions that would harden your architecture
- **Graph**: the Nebula 3D scene, protected zones and witness paths lit as overlays
- **Agents**: connect Cursor, Claude, or CI in one click, with a live try-to-break demo

Keyboard-first: `cmd+K` opens the command palette.

## Connect your agent in 30 seconds

1. Open the dont-break app → **Agents**.
2. Sign in, link the folder to a project, click **Connect Cursor**: one click mints a project-scoped token and fills `mcp.json`.
3. Paste into Cursor (or your MCP client).
4. Click **Install agent skill**: it writes the safe-change protocol into your repo's `AGENTS.md` so agents use the tools without being told.

## Languages and capabilities

The languages dont-break maps, and what each one can actually do, live on **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## License

Apache-2.0. See [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) and [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
