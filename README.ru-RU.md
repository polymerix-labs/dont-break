<div align="center">

# dont-break

**Уровень доверия для кода, написанного ИИ.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · **🇷🇺 Русский** · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: опишите, что никогда не должно сломаться, наблюдайте, как граф находит это и тестирует защиту](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

ИИ-агенты быстро поставляют код. Никто не поставляет вместе с ним доверие. Каждая команда, использующая Cursor, Claude или CI-ботов, разделяет один и тот же невысказанный страх: день, когда быстрое исправление тихо сломает единственную вещь, которая никогда не должна была сломаться.

`dont-break` превращает этот страх в контракт:

1. **Скажите это простыми словами.** «Никто не должен иметь возможность сломать расчёт счетов, даже косвенно». Никаких путей к файлам, никакого кода.
2. **Понаблюдайте, как это находится.** dont-break читает живую карту вашей кодовой базы и подсвечивает каждое место, несущее эту логику, включая пути, о существовании которых вы забыли.
3. **Понаблюдайте, как это атакуется.** Он пишет правило защиты, а затем воспроизводит изменения кода против него, чтобы доказать, что защита действительно держится. Пробный прогон: ничто в вашем коде не затрагивается.
4. **Активируйте его.** С этого момента каждое изменение агента проверяется на соответствие правилу перед вступлением в силу. Ваш агент слышит «это рискованнее, чем кажется», вместо того чтобы вы узнали об этом в продакшене.

```text
Вы:      "Переименуй PokemonService.fetchAll"
Агент:   → get_dependents(PokemonService.fetchAll)   "23 точки вызова в 4 модулях"
         → get_impact(files: [...])                  "радиус 3, затрагивает ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService — опасная зона: fan-in 23, стабильность 31"
Агент:   "Это рискованнее, чем кажется. Вот 23 места, которые сломаются,
          и более безопасный план из 2 шагов."
```

Этот разговор происходит автоматически, как только вы подключены. Никакого prompt engineering: этому учит навык агента.

## Языки и возможности

Какие языки dont-break картографирует и что каждый реально умеет — на **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Установка

Требуется **Python 3.9+** и **Node.js** (npm). Экстрактор графа устанавливает себя сам при первом запуске.

```bash
pip install dont-break
dont-break --wake
```

Это открывает локальный интерфейс по адресу `http://127.0.0.1:4040`, на вашем родном языке (доступно 32). Войдите, выберите папку проекта, и карта вашего кода построится сама: живой 3D-граф каждого модуля, вызова и зависимости, с подсвеченными сверху защищёнными зонами.

## Выберите свою битву

**«Мой агент постоянно ломает вещи, которые он никогда не открывал»**<br>
Подключите dont-break к Cursor или Claude Desktop. Ваш агент проверяет влияние и опасные зоны перед редактированием, а не после.<br>
→ [Настройка в Cursor / Claude (2 мин)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**«Я хочу, чтобы CI блокировал катастрофы, а не спорил о стиле»**<br>
Одна задача, которая проваливает слияние, когда изменение затрагивает защищённую зону или хрупкий узел, основанная на реальном графе зависимостей, а не на интуиции.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**«Я просто хочу делать запросы к своей кодовой базе»**<br>
`dbq dependents <id> | jq`: что сломается, если я это изменю? Ваш репозиторий становится базой данных с возможностью запросов.<br>
→ [Рецепты Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**«Я создаю собственного агента»**<br>
Те же 11 инструментов, доступные в виде типизированных определений TypeScript или сгенерированной спецификации OpenAPI 3.1.<br>
→ [LangChain / OpenAPI / собственные агенты](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 инструментов, которые получает ваш агент

| Инструмент | Вопрос, на который он отвечает |
|------|----------------------|
| `find_symbol` | «Какой узел соответствует этому имени / файлу?» (точка входа) |
| `get_dependents` | «Что сломается, если я это изменю?» |
| `get_impact` | «Каков радиус влияния этих изменений?» |
| `get_do_not_touch` | «Чего мне следует избегать без вопросов?» |
| `get_dependencies` | «От чего зависит этот код?» |
| `find_path` | «Почему изменение в A влияет на B?» |
| `get_arch_status` | «Насколько осторожно мне следует работать в этом репозитории?» |
| `check_change` | «Нарушает ли это изменение командное правило?» |
| `propose_rule` | «Записать предупреждение сейчас или блокировку для одобрения человеком» |
| `pause_own_rule` | «Приостановить правило, созданное этим токеном агента» |
| `append_rule_reason` | «Добавить одно обоснование, никогда не редактировать и не удалять» |

Инструменты запросов доступны только для чтения, серверный анализ, ограниченные ответы: всегда безопасно вызывать. Три инструмента правил пишут командные правила в строгих рамках: они не могут активировать блокировку, приостановить чужое правило или переписать причины.

## Диспетчерская

- **Rule Studio**: опишите, что никогда не должно сломаться, наблюдайте, как граф находит это, протестируйте защиту вживую перед активацией
- **Check**: симулятор перед редактированием: выберите отправные точки, получите вердикт ok/warn/block, анимируйте точный путь, по которому пошло бы поломка
- **Overview**: вердикт в одном предложении, показатели стабильности и AI-навигируемости, главные действия, которые укрепят вашу архитектуру
- **Graph**: 3D-сцена Nebula, защищённые зоны и пути-свидетели, подсвеченные в виде наложений
- **Agents**: подключите Cursor, Claude или CI одним кликом, с живой демонстрацией try-to-break

Ориентировано на клавиатуру: `cmd+K` открывает палитру команд.

## Подключите вашего агента за 30 секунд

1. Откройте приложение dont-break → **Agents**.
2. Войдите, свяжите папку с проектом, нажмите **Connect Cursor**: один клик генерирует токен, привязанный к проекту, и заполняет `mcp.json`.
3. Вставьте его в Cursor (или ваш MCP-клиент).
4. Нажмите **Install agent skill**: это записывает протокол безопасных изменений в `AGENTS.md` вашего репозитория, чтобы агенты использовали инструменты без указаний.

## Лицензия

Apache-2.0. См. [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) и [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
