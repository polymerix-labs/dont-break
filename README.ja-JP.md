<div align="center">

# dont-break

**AIが書いたコードのための信頼レイヤー。**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · **🇯🇵 日本語** · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: 絶対に壊れてはいけないものを記述し、グラフがそれを見つけて保護をテストする様子を見る](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AIエージェントはコードを素早く出荷します。しかし、それとともに信頼を出荷する者はいません。Cursor、Claude、CIボットを使うすべてのチームは、同じ言葉にならない恐怖を共有しています。それは、素早い修正が静かに、決して壊れてはいけない唯一のものを壊してしまう日です。

`dont-break`は、その恐怖を契約に変えます:

1. **シンプルな言葉で言う。** 「請求書の計算は、間接的にであっても、誰にも壊せてはいけない。」ファイルパスもコードも不要です。
2. **見つかる様子を見る。** dont-breakはコードベースの生きた地図を読み込み、そのロジックを運ぶすべての場所を、存在すら忘れていたパスも含めて照らし出します。
3. **攻撃される様子を見る。** 保護ルールを書き、それに対してコード変更を再生し、保護が本当に機能することを証明します。ドライラン: あなたのコードには何も触れられません。
4. **有効化する。** そこから先、すべてのエージェントの編集は適用される前にルールと照合されます。あなたのエージェントは「これは見た目より危険です」と聞くようになり、本番環境で発見することはなくなります。

```text
あなた:      「PokemonService.fetchAllの名前を変更して」
エージェント: → get_dependents(PokemonService.fetchAll)   「4モジュールに23の呼び出し箇所」
             → get_impact(files: [...])                  「半径3、ui/、cache/、api/に影響」
             → get_do_not_touch()                        「PokemonServiceは危険地帯: fan-in 23、安定性31」
エージェント: 「これは見た目より危険です。壊れる23箇所と、
              2ステップのより安全なプランをお見せします。」
```

この会話は接続した瞬間に自動的に行われます。プロンプトエンジニアリングは不要: エージェントスキルがそれを教えます。

## 言語と能力

dont-break が地図化する言語と、それぞれが実際にできることは **[dont-break.com/language-support](https://dont-break.com/language-support)** にあります。

## インストール

**Python 3.9+** と **Node.js**(npm)が必要です。グラフ抽出ツールは初回実行時に自動でインストールされます。

```bash
pip install dont-break
dont-break --wake
```

これにより`http://127.0.0.1:4040`にローカルUIが開き、あなた自身の言語で表示されます(32言語対応)。サインインしてプロジェクトフォルダを選択すると、コードの地図が自動的に構築されます: すべてのモジュール、呼び出し、依存関係の生きた3Dグラフに、保護ゾーンが照らし出されます。

## あなたの戦いを選ぶ

**「私のエージェントが、開いたこともないものを何度も壊す」**<br>
dont-breakをCursorまたはClaude Desktopに接続。エージェントは編集の後ではなく前に、影響と危険ゾーンをチェックします。<br>
→ [Cursor / Claudeでのセットアップ(2分)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**「CIには災害をブロックしてほしい、スタイルについて議論してほしくない」**<br>
変更が保護ゾーンや壊れやすいノードに触れたときにマージを失敗させる1つのジョブ。勘ではなく実際の依存関係グラフに基づきます。<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commitフック](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**「自分のコードベースに問い合わせたいだけ」**<br>
`dbq dependents <id> | jq`: これを変更したら何が壊れるか?あなたのリポジトリはクエリ可能なデータベースになります。<br>
→ [Shell + jqレシピ](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**「自分自身のエージェントを構築している」**<br>
同じ11のツールを、型付きTypeScript定義または生成されたOpenAPI 3.1仕様として利用できます。<br>
→ [LangChain / OpenAPI / カスタムエージェント](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## エージェントが得る11のツール

| ツール | 解決する質問 |
|------|----------------------|
| `find_symbol` | 「この名前 / ファイルはどのノードか?」(エントリーポイント) |
| `get_dependents` | 「これを変更したら何が壊れるか?」 |
| `get_impact` | 「これらの変更の影響半径は?」 |
| `get_do_not_touch` | 「聞かずに触ることを拒否すべきものは何か?」 |
| `get_dependencies` | 「このコードは何に依存しているか?」 |
| `find_path` | 「なぜAの変更がBに影響するのか?」 |
| `get_arch_status` | 「このリポジトリでどれだけ慎重に作業すべきか?」 |
| `check_change` | 「この変更はチームのルールに違反しているか?」 |
| `propose_rule` | 「今すぐ警告を記録するか、人間の承認のためにブロックする」 |
| `pause_own_rule` | 「このエージェントトークンが作成したルールを一時停止する」 |
| `append_rule_reason` | 「1つの正当化理由を追加する、決して編集や削除はしない」 |

クエリツールは読み取り専用で、サーバーサイドの解析、限定された応答: 常に安全に呼び出せます。3つのルールツールは厳格な制限のもとでチームルールを書き込みます: ブロックを有効化したり、他人のルールを一時停止したり、理由を書き換えたりすることはできません。

## コントロールルーム

- **Rule Studio**: 絶対に壊れてはいけないものを記述し、グラフがそれを見つける様子を見て、有効化する前に保護をライブでテストする
- **Check**: 編集前のシミュレーター: シードを選択し、ok/warn/blockの判定を得て、破壊が辿る正確なパスをアニメーションで表示する
- **Overview**: 一文での判定、安定性とAIナビゲーション性の指標、アーキテクチャを強化する上位のアクション
- **Graph**: 3D Nebulaシーン、保護ゾーンと証拠パスをオーバーレイとして照らし出す
- **Agents**: ワンクリックでCursor、Claude、CIを接続、ライブのtry-to-breakデモ付き

キーボード優先: `cmd+K`でコマンドパレットを開きます。

## エージェントを30秒で接続する

1. dont-breakアプリを開く → **Agents**。
2. サインインし、フォルダをプロジェクトにリンクし、**Connect Cursor**をクリック: ワンクリックでプロジェクトスコープのトークンを生成し、`mcp.json`を埋めます。
3. Cursor(またはあなたのMCPクライアント)に貼り付けます。
4. **Install agent skill**をクリック: これによりリポジトリの`AGENTS.md`に安全な変更プロトコルが書き込まれ、指示なしでエージェントがツールを使うようになります。

## ライセンス

Apache-2.0。[LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)と[NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE)を参照してください。
