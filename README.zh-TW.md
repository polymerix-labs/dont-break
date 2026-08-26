<div align="center">

# dont-break

**為 AI 撰寫的程式碼提供信任層。**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · **🇹🇼 繁體中文**

</div>

![Rule Studio:描述永遠不能被破壞的東西,觀看圖譜找到它並測試保護機制](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI 代理能快速交付程式碼,但沒有人隨之交付信任。每個使用 Cursor、Claude 或 CI 機器人的團隊都懷有同樣一種未曾言明的恐懼:某一天,一次快速修復會悄無聲息地破壞那唯一一件永遠不該被破壞的東西。

`dont-break` 將這種恐懼轉化為一份契約:

1. **用簡單的話說出來。** 「任何人都不應該能夠破壞發票計算邏輯,即使是間接的也不行。」無需檔案路徑,無需程式碼。
2. **看著它被找到。** dont-break 讀取你程式碼庫的即時地圖,並照亮承載該邏輯的每一個位置,包括你早已遺忘其存在的路徑。
3. **看著它被攻擊。** 它編寫一條保護規則,然後針對該規則重播程式碼變更,以證明保護確實有效。這是一次演練:你的程式碼不會被觸碰。
4. **啟用它。** 從那時起,每一次代理的編輯在生效前都會依據規則進行檢查。你的代理會聽到「這比看起來更危險」,而不是讓你在正式環境中才發現。

```text
你:      「重新命名 PokemonService.fetchAll」
代理:    → get_dependents(PokemonService.fetchAll)   「4 個模組中有 23 個呼叫點」
         → get_impact(files: [...])                  「半徑 3,影響 ui/、cache/、api/」
         → get_do_not_touch()                        「PokemonService 是危險區域:扇入 23,穩定性 31」
代理:    「這比看起來更危險。以下是將會被破壞的 23 個位置,
          以及一個分 2 步進行的更安全方案。」
```

一旦連接,這種對話就會自動發生。無需提示工程:代理技能會教會它這樣做。

## 安裝

需要 **Python 3.9+** 和 **Node.js**(npm)。圖譜擷取器會在首次執行時自動安裝自身。

```bash
pip install dont-break
dont-break --wake
```

這將在 `http://127.0.0.1:4040` 開啟一個本機介面,使用你自己的語言(支援 32 種)。登入後選擇一個專案資料夾,你的程式碼地圖就會自動建構:一個包含每個模組、呼叫和依賴關係的即時 3D 圖譜,受保護區域在其上方被高亮顯示。

## 選擇你的戰場

**「我的代理不斷破壞它從未開啟過的東西」**<br>
將 dont-break 連接到 Cursor 或 Claude Desktop。你的代理會在編輯前檢查影響和危險區域,而不是在編輯後。<br>
→ [在 Cursor / Claude 中設定(2 分鐘)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**「我希望 CI 阻止災難,而不是爭論程式碼風格」**<br>
一個作業,當變更觸及受保護區域或脆弱節點時使合併失敗,基於真實的依賴圖譜,而非直覺。<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit 掛鉤](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**「我只想查詢我的程式碼庫」**<br>
`dbq dependents <id> | jq`:如果我改動這個,什麼會被破壞?你的儲存庫變成一個可查詢的資料庫。<br>
→ [Shell + jq 使用範例](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**「我正在建構自己的代理」**<br>
同樣的 11 個工具,以帶型別的 TypeScript 定義或生成的 OpenAPI 3.1 規範形式提供。<br>
→ [LangChain / OpenAPI / 自訂代理](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 你的代理獲得的 11 個工具

| 工具 | 它解答的問題 |
|------|----------------------|
| `find_symbol` | 「這個名稱 / 檔案對應哪個節點?」(入口點) |
| `get_dependents` | 「如果我改動這個,什麼會被破壞?」 |
| `get_impact` | 「這些變更的影響半徑是多少?」 |
| `get_do_not_touch` | 「我應該在未詢問的情況下拒絕觸碰什麼?」 |
| `get_dependencies` | 「這段程式碼依賴什麼?」 |
| `find_path` | 「為什麼 A 的變更會影響 B?」 |
| `get_arch_status` | 「我在這個儲存庫中應該多謹慎地工作?」 |
| `check_change` | 「這個變更是否違反了團隊規則?」 |
| `propose_rule` | 「現在記錄一條警告,或阻止以待人工審批」 |
| `pause_own_rule` | 「暫停由此代理權杖建立的規則」 |
| `append_rule_reason` | 「新增一條理由說明,永不編輯或刪除」 |

查詢工具是唯讀的、伺服器端分析、回應有限:呼叫總是安全的。三個規則工具在嚴格限制下編寫團隊規則:它們無法啟用阻止、暫停他人的規則,或改寫理由。

## 控制室

- **Rule Studio**:描述永遠不能被破壞的東西,觀看圖譜找到它,在啟用前即時測試保護機制
- **Check**:編輯前模擬器:選擇種子,取得 ok/warn/block 判定,動畫展示破壞將遵循的確切路徑
- **Overview**:一句話判定,穩定性和 AI 可導覽性讀數,能夠增強你架構的首要行動建議
- **Graph**:3D Nebula 場景,受保護區域和見證路徑作為疊加層被高亮顯示
- **Agents**:一鍵連接 Cursor、Claude 或 CI,附帶即時的 try-to-break 示範

以鍵盤為先:`cmd+K` 開啟指令面板。

## 在 30 秒內連接你的代理

1. 開啟 dont-break 應用程式 → **Agents**。
2. 登入,將資料夾關聯到一個專案,點擊 **Connect Cursor**:一次點擊即可產生專案範圍的權杖並填入 `mcp.json`。
3. 將其貼上到 Cursor(或你的 MCP 用戶端)中。
4. 點擊 **Install agent skill**:這會將安全變更協定寫入你儲存庫的 `AGENTS.md`,使代理無需被告知即可使用這些工具。

## 授權

Apache-2.0。參見 [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) 和 [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE)。
