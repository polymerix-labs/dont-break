<div align="center">

![dont-break](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/logo.gif)

**The trust layer for AI-written code.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

📬 Feature requests, bugs, questions, or feedback: **[daryl@dont-break.com](mailto:daryl@dont-break.com)**

**🇬🇧 English** · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: describe what must never break, watch the graph find and test the protection](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI agents ship code fast. Nobody ships trust with it. Every team running Cursor, Claude, or CI bots has the same unspoken fear: the day a quick fix silently breaks the one thing that was never supposed to break.

`dont-break` turns that fear into a contract:

1. **Say it in plain words.** "Nobody should be able to break invoice calculation, even indirectly." No file paths, no code.
2. **Watch it get found.** dont-break reads the live map of your codebase and lights up every place that carries that logic, including the paths you forgot existed.
3. **Watch it get attacked.** It writes a protection rule, then replays code changes against it to prove the protection actually holds. A dry run: nothing in your code is touched.
4. **Activate it.** From then on, every agent edit is checked against the rule before it lands. Your agent gets told "this is riskier than it looks" instead of you finding out in prod.

```text
You:    "Rename PokemonService.fetchAll"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 call sites across 4 modules"
        → get_impact(files: [...])                  "radius 3, touches ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService is a danger zone: fan-in 23, stability 31"
Agent:  "This is riskier than it looks. Here are the 23 places that break,
         and a safer 2-step plan."
```

That conversation happens automatically once connected. No prompt engineering: the agent skill teaches it.

## Install

Requires **Python 3.9+** and **Node.js** (npm). The graph extractor installs itself on first run.

```bash
pip install dont-break
dont-break --wake
```

That opens a local UI on `http://127.0.0.1:4040`, in your language (32 available). Sign in, pick a project folder, and the map of your code builds itself: a live 3D graph of every module, call, and dependency, with your protected zones lit up on top of it.

## Pick your fight

**"My agent keeps breaking things it never opened"**<br>
Plug dont-break into Cursor or Claude Desktop. Your agent checks impact and danger zones before editing, not after.<br>
→ [Set up in Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"I want CI to block disasters, not argue about style"**<br>
One job that fails the merge when a change hits a protected zone or a fragile hub, grounded in the real dependency graph, not vibes.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

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

## License

Apache-2.0. See [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) and [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
