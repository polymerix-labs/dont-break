<div align="center">

# dont-break

**Рівень довіри для коду, написаного ШІ.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · **🇺🇦 Українська** · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: опишіть, що ніколи не повинно зламатися, спостерігайте, як граф знаходить це і тестує захист](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

ШІ-агенти швидко постачають код. Ніхто не постачає разом з ним довіру. Кожна команда, яка використовує Cursor, Claude чи ботів CI, поділяє один і той самий невисловлений страх: день, коли швидке виправлення тихо зламає єдину річ, яка ніколи не мала ламатися.

`dont-break` перетворює цей страх на контракт:

1. **Скажіть це простими словами.** «Ніхто не повинен мати можливість зламати обчислення рахунків, навіть опосередковано». Жодних шляхів до файлів, жодного коду.
2. **Спостерігайте, як це знаходиться.** dont-break читає живу карту вашої кодової бази і висвітлює кожне місце, що несе цю логіку, включно зі шляхами, про існування яких ви забули.
3. **Спостерігайте, як це атакується.** Він пише правило захисту, а потім відтворює зміни коду проти нього, щоб довести, що захист справді тримається. Пробний прогін: нічого у вашому коді не зачіпається.
4. **Активуйте його.** Відтоді кожна правка агента перевіряється на відповідність правилу перед набранням чинності. Ваш агент чує «це ризикованіше, ніж здається», замість того щоб ви дізналися про це в продакшені.

```text
Ви:      "Перейменуй PokemonService.fetchAll"
Агент:   → get_dependents(PokemonService.fetchAll)   "23 точки виклику у 4 модулях"
         → get_impact(files: [...])                  "радіус 3, впливає на ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService — небезпечна зона: fan-in 23, стабільність 31"
Агент:   "Це ризикованіше, ніж здається. Ось 23 місця, які зламаються,
          і безпечніший план у 2 кроки."
```

Ця розмова відбувається автоматично, щойно ви підключені. Жодної інженерії промптів: цьому навчає навичка агента.

## Мови та можливості

Які мови dont-break картографує і що кожна справді вміє — на **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Встановлення

Потрібні **Python 3.9+** та **Node.js** (npm). Екстрактор графа встановлює себе сам під час першого запуску.

```bash
pip install dont-break
dont-break --wake
```

Це відкриває локальний інтерфейс за адресою `http://127.0.0.1:4040`, вашою рідною мовою (доступно 32). Увійдіть, оберіть папку проєкту, і карта вашого коду побудується сама: живий 3D-граф кожного модуля, виклику та залежності, з підсвіченими зверху захищеними зонами.

## Оберіть свою битву

**«Мій агент постійно ламає речі, які він ніколи не відкривав»**<br>
Підключіть dont-break до Cursor або Claude Desktop. Ваш агент перевіряє вплив і небезпечні зони перед редагуванням, а не після.<br>
→ [Налаштування в Cursor / Claude (2 хв)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**«Я хочу, щоб CI блокував катастрофи, а не сперечався про стиль»**<br>
Одне завдання, яке провалює злиття, коли зміна зачіпає захищену зону або крихкий вузол, на основі реального графа залежностей, а не інтуїції.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit хук](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**«Я просто хочу робити запити до своєї кодової бази»**<br>
`dbq dependents <id> | jq`: що зламається, якщо я це зміню? Ваш репозиторій стає базою даних із можливістю запитів.<br>
→ [Рецепти Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**«Я створюю власного агента»**<br>
Ті самі 11 інструментів, доступні як типізовані визначення TypeScript або згенерована специфікація OpenAPI 3.1.<br>
→ [LangChain / OpenAPI / власні агенти](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 інструментів, які отримує ваш агент

| Інструмент | Питання, на яке він відповідає |
|------|----------------------|
| `find_symbol` | «Який вузол відповідає цій назві / файлу?» (точка входу) |
| `get_dependents` | «Що зламається, якщо я це зміню?» |
| `get_impact` | «Який радіус впливу цих змін?» |
| `get_do_not_touch` | «Чого мені варто уникати без запитання?» |
| `get_dependencies` | «Від чого залежить цей код?» |
| `find_path` | «Чому зміна в A впливає на B?» |
| `get_arch_status` | «Наскільки обережно мені варто працювати в цьому репозиторії?» |
| `check_change` | «Чи порушує ця зміна командне правило?» |
| `propose_rule` | «Записати попередження зараз, або блокування для схвалення людиною» |
| `pause_own_rule` | «Призупинити правило, створене цим токеном агента» |
| `append_rule_reason` | «Додати одне обґрунтування, ніколи не редагувати чи видаляти» |

Інструменти запитів доступні лише для читання, серверний аналіз, обмежені відповіді: завжди безпечно викликати. Три інструменти правил пишуть командні правила в суворих межах: вони не можуть активувати блокування, призупинити чуже правило чи переписати причини.

## Диспетчерська

- **Rule Studio**: опишіть, що ніколи не повинно зламатися, спостерігайте, як граф знаходить це, протестуйте захист наживо перед активацією
- **Check**: симулятор перед редагуванням: оберіть відправні точки, отримайте вердикт ok/warn/block, анімуйте точний шлях, яким пішло б пошкодження
- **Overview**: вердикт в одному реченні, показники стабільності та навігованості ШІ, головні дії, які зміцнили б вашу архітектуру
- **Graph**: 3D-сцена Nebula, захищені зони та шляхи-свідки, підсвічені як накладення
- **Agents**: підключіть Cursor, Claude чи CI одним кліком, з живою демонстрацією try-to-break

Орієнтовано на клавіатуру: `cmd+K` відкриває палітру команд.

## Підключіть свого агента за 30 секунд

1. Відкрийте застосунок dont-break → **Agents**.
2. Увійдіть, прив'яжіть папку до проєкту, натисніть **Connect Cursor**: один клік генерує токен, прив'язаний до проєкту, і заповнює `mcp.json`.
3. Вставте його в Cursor (або ваш MCP-клієнт).
4. Натисніть **Install agent skill**: це записує протокол безпечних змін у `AGENTS.md` вашого репозиторію, щоб агенти використовували інструменти без вказівок.

## Ліцензія

Apache-2.0. Див. [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) та [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
