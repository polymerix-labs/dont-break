<div align="center">

# dont-break

**为 AI 编写的代码提供信任层。**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · **🇨🇳 简体中文** · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio：描述永远不能被破坏的东西，观看图谱找到它并测试保护机制](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI 智能体能快速交付代码，但没有人随之交付信任。每个使用 Cursor、Claude 或 CI 机器人的团队都怀有同样一种未曾言明的恐惧:某一天,一次快速修复会悄无声息地破坏那唯一一件永远不该被破坏的东西。

`dont-break` 将这种恐惧转化为一份契约:

1. **用简单的话说出来。** "任何人都不应该能够破坏发票计算逻辑,即使是间接的也不行。" 无需文件路径,无需代码。
2. **看着它被找到。** dont-break 读取你代码库的实时地图,并照亮承载该逻辑的每一个位置,包括你早已遗忘其存在的路径。
3. **看着它被攻击。** 它编写一条保护规则,然后针对该规则重放代码变更,以证明保护确实有效。这是一次演练:你的代码不会被触碰。
4. **激活它。** 从那时起,每一次智能体的编辑在生效前都会依据规则进行检查。你的智能体会听到"这比看起来更危险",而不是让你在生产环境中才发现。

```text
你:       "重命名 PokemonService.fetchAll"
智能体:   → get_dependents(PokemonService.fetchAll)   "4 个模块中有 23 个调用点"
          → get_impact(files: [...])                  "半径 3,影响 ui/、cache/、api/"
          → get_do_not_touch()                        "PokemonService 是危险区域:扇入 23,稳定性 31"
智能体:   "这比看起来更危险。以下是将会被破坏的 23 个位置,
          以及一个分 2 步进行的更安全方案。"
```

一旦连接,这种对话就会自动发生。无需提示工程:智能体技能会教会它这样做。

## 安装

需要 **Python 3.9+** 和 **Node.js**(npm)。图谱提取器会在首次运行时自动安装自身。

```bash
pip install dont-break
dont-break --wake
```

这将在 `http://127.0.0.1:4040` 打开一个本地界面,使用你自己的语言(支持 32 种)。登录后选择一个项目文件夹,你的代码地图就会自动构建:一个包含每个模块、调用和依赖关系的实时 3D 图谱,受保护区域在其上方被高亮显示。

## 选择你的战场

**"我的智能体不断破坏它从未打开过的东西"**<br>
将 dont-break 连接到 Cursor 或 Claude Desktop。你的智能体会在编辑前检查影响和危险区域,而不是在编辑后。<br>
→ [在 Cursor / Claude 中设置(2 分钟)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"我希望 CI 阻止灾难,而不是争论代码风格"**<br>
一个作业,当变更触及受保护区域或脆弱节点时使合并失败,基于真实的依赖图谱,而非直觉。<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit 钩子](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"我只想查询我的代码库"**<br>
`dbq dependents <id> | jq`:如果我改动这个,什么会被破坏?你的仓库变成一个可查询的数据库。<br>
→ [Shell + jq 使用示例](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"我正在构建自己的智能体"**<br>
同样的 11 个工具,以带类型的 TypeScript 定义或生成的 OpenAPI 3.1 规范形式提供。<br>
→ [LangChain / OpenAPI / 自定义智能体](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 你的智能体获得的 11 个工具

| 工具 | 它解答的问题 |
|------|----------------------|
| `find_symbol` | "这个名称 / 文件对应哪个节点?"(入口点) |
| `get_dependents` | "如果我改动这个,什么会被破坏?" |
| `get_impact` | "这些变更的影响半径是多少?" |
| `get_do_not_touch` | "我应该在未询问的情况下拒绝触碰什么?" |
| `get_dependencies` | "这段代码依赖什么?" |
| `find_path` | "为什么 A 的变更会影响 B?" |
| `get_arch_status` | "我在这个仓库中应该多谨慎地工作?" |
| `check_change` | "这个变更是否违反了团队规则?" |
| `propose_rule` | "现在记录一条警告,或阻止以待人工审批" |
| `pause_own_rule` | "暂停由此智能体令牌创建的规则" |
| `append_rule_reason` | "添加一条理由说明,永不编辑或删除" |

查询工具是只读的、服务器端分析、响应有限:调用总是安全的。三个规则工具在严格限制下编写团队规则:它们无法激活阻止、暂停他人的规则,或改写理由。

## 控制室

- **Rule Studio**:描述永远不能被破坏的东西,观看图谱找到它,在激活前实时测试保护机制
- **Check**:编辑前模拟器:选择种子,获得 ok/warn/block 判定,动画展示破坏将遵循的确切路径
- **Overview**:一句话判定,稳定性和 AI 可导航性读数,能够增强你架构的首要行动建议
- **Graph**:3D Nebula 场景,受保护区域和见证路径作为叠加层被高亮显示
- **Agents**:一键连接 Cursor、Claude 或 CI,附带实时的 try-to-break 演示

以键盘为先:`cmd+K` 打开命令面板。

## 在 30 秒内连接你的智能体

1. 打开 dont-break 应用 → **Agents**。
2. 登录,将文件夹关联到一个项目,点击 **Connect Cursor**:一次点击即可生成项目范围的令牌并填充 `mcp.json`。
3. 将其粘贴到 Cursor(或你的 MCP 客户端)中。
4. 点击 **Install agent skill**:这会将安全变更协议写入你仓库的 `AGENTS.md`,使智能体无需被告知即可使用这些工具。

## 许可证

Apache-2.0。参见 [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) 和 [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE)。
