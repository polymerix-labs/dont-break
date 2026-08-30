<div align="center">

# dont-break

**AI가 작성한 코드를 위한 신뢰 레이어.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · **🇰🇷 한국어** · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: 절대 깨지면 안 되는 것을 설명하고, 그래프가 이를 찾아 보호를 테스트하는 과정을 지켜보세요](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI 에이전트는 코드를 빠르게 배포합니다. 하지만 그와 함께 신뢰를 배포하는 사람은 없습니다. Cursor, Claude, CI 봇을 사용하는 모든 팀은 같은 말 못할 두려움을 공유합니다: 빠른 수정이 절대 깨져서는 안 되는 단 하나를 조용히 망가뜨리는 그날 말입니다.

`dont-break`는 그 두려움을 계약으로 바꿉니다:

1. **간단한 말로 설명하세요.** "누구도 청구서 계산을 깨뜨릴 수 없어야 한다, 간접적으로라도." 파일 경로도, 코드도 필요 없습니다.
2. **발견되는 과정을 지켜보세요.** dont-break는 코드베이스의 살아있는 지도를 읽고, 그 로직을 담고 있는 모든 장소를 밝혀냅니다. 존재조차 잊고 있던 경로까지 포함해서요.
3. **공격받는 과정을 지켜보세요.** 보호 규칙을 작성한 다음, 그 보호가 실제로 유지되는지 증명하기 위해 코드 변경을 재생합니다. 드라이 런: 코드에는 아무것도 손대지 않습니다.
4. **활성화하세요.** 그 이후부터는 모든 에이전트의 편집이 적용되기 전에 규칙과 대조하여 확인됩니다. 프로덕션에서 발견하는 대신, 에이전트가 "이건 보이는 것보다 위험합니다"라고 알려줍니다.

```text
당신:      "PokemonService.fetchAll의 이름을 바꿔줘"
에이전트:  → get_dependents(PokemonService.fetchAll)   "4개 모듈에서 23개 호출 지점"
          → get_impact(files: [...])                  "반경 3, ui/, cache/, api/에 영향"
          → get_do_not_touch()                        "PokemonService는 위험 구역: fan-in 23, 안정성 31"
에이전트:  "이건 보이는 것보다 위험합니다. 깨질 23개 지점과
           2단계로 이루어진 더 안전한 계획을 보여드립니다."
```

이 대화는 연결되는 즉시 자동으로 이루어집니다. 프롬프트 엔지니어링 없이: 에이전트 스킬이 이를 가르칩니다.

## 언어와 능력

dont-break가 지도화하는 언어와, 각 언어가 실제로 할 수 있는 것은 **[dont-break.com/language-support](https://dont-break.com/language-support)**에 있습니다.

## 설치

**Python 3.9+**와 **Node.js**(npm)가 필요합니다. 그래프 추출기는 첫 실행 시 스스로 설치됩니다.

```bash
pip install dont-break
dont-break --wake
```

이렇게 하면 `http://127.0.0.1:4040`에서 로컬 UI가 열리며, 원하는 언어로 표시됩니다(32개 언어 지원). 로그인하고 프로젝트 폴더를 선택하면, 코드의 지도가 스스로 구축됩니다: 모든 모듈, 호출, 의존성의 살아있는 3D 그래프 위에 보호 구역이 밝혀집니다.

## 당신의 싸움을 선택하세요

**"내 에이전트가 열어본 적도 없는 것들을 계속 망가뜨려요"**<br>
dont-break를 Cursor나 Claude Desktop에 연결하세요. 에이전트는 편집 후가 아니라 편집 전에 영향과 위험 구역을 확인합니다.<br>
→ [Cursor / Claude에서 설정하기 (2분)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"CI가 재앙을 막아주길 원해요, 스타일에 대해 논쟁하는 게 아니라"**<br>
변경이 보호 구역이나 취약한 노드를 건드릴 때 병합을 실패시키는 하나의 작업, 직감이 아닌 실제 의존성 그래프에 기반합니다.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit 훅](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"그냥 내 코드베이스에 질의하고 싶어요"**<br>
`dbq dependents <id> | jq`: 이걸 바꾸면 뭐가 깨지나요? 당신의 저장소가 질의 가능한 데이터베이스가 됩니다.<br>
→ [Shell + jq 레시피](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"저만의 에이전트를 만들고 있어요"**<br>
동일한 11개 도구를 타입이 지정된 TypeScript 정의 또는 생성된 OpenAPI 3.1 스펙으로 이용할 수 있습니다.<br>
→ [LangChain / OpenAPI / 커스텀 에이전트](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 에이전트가 얻는 11가지 도구

| 도구 | 이 도구가 답하는 질문 |
|------|----------------------|
| `find_symbol` | "이 이름 / 파일은 어떤 노드인가?" (진입점) |
| `get_dependents` | "이걸 바꾸면 뭐가 깨지나?" |
| `get_impact` | "이 변경 사항들의 영향 반경은?" |
| `get_do_not_touch` | "묻지 않고 건드리는 것을 거부해야 할 것은?" |
| `get_dependencies` | "이 코드는 무엇에 의존하는가?" |
| `find_path` | "왜 A의 변경이 B에 영향을 미치는가?" |
| `get_arch_status` | "이 저장소에서 얼마나 조심스럽게 작업해야 하는가?" |
| `check_change` | "이 변경이 팀 규칙을 위반하는가?" |
| `propose_rule` | "지금 경고를 기록하거나, 사람의 승인을 위해 차단" |
| `pause_own_rule` | "이 에이전트 토큰이 만든 규칙을 일시 중지" |
| `append_rule_reason` | "정당화 사유 하나 추가, 절대 편집이나 삭제 금지" |

쿼리 도구는 읽기 전용이며, 서버 사이드 분석, 제한된 응답을 제공합니다: 항상 호출해도 안전합니다. 세 가지 규칙 도구는 엄격한 제한 아래 팀 규칙을 작성합니다: 차단을 활성화하거나, 다른 사람의 규칙을 일시 중지하거나, 사유를 다시 쓸 수 없습니다.

## 컨트롤 룸

- **Rule Studio**: 절대 깨지면 안 되는 것을 설명하고, 그래프가 이를 찾는 과정을 지켜보고, 활성화하기 전에 실시간으로 보호를 테스트하세요
- **Check**: 편집 전 시뮬레이터: 시드를 선택하고, ok/warn/block 판정을 받고, 파손이 따라갈 정확한 경로를 애니메이션으로 확인하세요
- **Overview**: 한 문장으로 된 판정, 안정성 및 AI 탐색 가능성 지표, 아키텍처를 강화할 상위 조치들
- **Graph**: 3D Nebula 장면, 보호 구역과 증거 경로가 오버레이로 밝혀집니다
- **Agents**: 클릭 한 번으로 Cursor, Claude, CI를 연결하고, 실시간 try-to-break 데모를 확인하세요

키보드 우선: `cmd+K`로 명령 팔레트를 엽니다.

## 30초 안에 에이전트 연결하기

1. dont-break 앱을 엽니다 → **Agents**.
2. 로그인하고, 폴더를 프로젝트에 연결하고, **Connect Cursor**를 클릭하세요: 클릭 한 번으로 프로젝트 범위 토큰이 생성되고 `mcp.json`이 채워집니다.
3. Cursor(또는 사용 중인 MCP 클라이언트)에 붙여넣으세요.
4. **Install agent skill**을 클릭하세요: 이렇게 하면 저장소의 `AGENTS.md`에 안전한 변경 프로토콜이 기록되어, 별도 지시 없이도 에이전트가 도구를 사용하게 됩니다.

## 라이선스

Apache-2.0. [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)와 [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE)를 참고하세요.
