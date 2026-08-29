<div align="center">

# dont-break

**Warstwa zaufania dla kodu pisanego przez AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · **🇵🇱 Polski** · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: opisz, co nigdy nie może się zepsuć, zobacz, jak graf to znajduje i testuje ochronę](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Agenci AI dostarczają kod szybko. Nikt nie dostarcza wraz z nim zaufania. Każdy zespół korzystający z Cursora, Claude'a lub botów CI dzieli ten sam niewypowiedziany strach: dzień, w którym szybka poprawka po cichu zepsuje tę jedną rzecz, która nigdy nie miała się zepsuć.

`dont-break` zamienia ten strach w kontrakt:

1. **Powiedz to prostymi słowami.** "Nikt nie powinien móc zepsuć obliczania faktur, nawet pośrednio." Bez ścieżek plików, bez kodu.
2. **Zobacz, jak to zostaje znalezione.** dont-break czyta żywą mapę twojej bazy kodu i podświetla każde miejsce niosące tę logikę, w tym ścieżki, o których istnieniu zapomniałeś.
3. **Zobacz, jak to zostaje zaatakowane.** Zapisuje regułę ochronną, a następnie odtwarza zmiany kodu przeciwko niej, aby udowodnić, że ochrona naprawdę działa. Suchy przebieg: nic w twoim kodzie nie zostaje dotknięte.
4. **Aktywuj ją.** Od tego momentu każda edycja agenta jest sprawdzana pod kątem reguły, zanim wejdzie w życie. Twój agent słyszy "to jest bardziej ryzykowne, niż wygląda", zamiast żebyś odkrył to na produkcji.

```text
Ty:      "Zmień nazwę PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 miejsca wywołania w 4 modułach"
         → get_impact(files: [...])                  "promień 3, dotyka ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService to strefa zagrożenia: fan-in 23, stabilność 31"
Agent:   "To jest bardziej ryzykowne, niż wygląda. Oto 23 miejsca, które się zepsują,
          i bezpieczniejszy plan w 2 krokach."
```

Ta rozmowa dzieje się automatycznie po połączeniu. Bez inżynierii promptów: uczy tego umiejętność agenta.

## Języki i możliwości

Jakie języki dont-break mapuje i co każdy naprawdę umie, jest na **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Instalacja

Wymaga **Pythona 3.9+** i **Node.js** (npm). Ekstraktor grafu instaluje się sam przy pierwszym uruchomieniu.

```bash
pip install dont-break
dont-break --wake
```

To otwiera lokalny interfejs pod adresem `http://127.0.0.1:4040`, w twoim własnym języku (32 dostępnych). Zaloguj się, wybierz folder projektu, a mapa twojego kodu zbuduje się sama: żywy graf 3D każdego modułu, wywołania i zależności, z podświetlonymi na wierzchu chronionymi strefami.

## Wybierz swoją walkę

**"Mój agent ciągle psuje rzeczy, których nigdy nie otworzył"**<br>
Podłącz dont-break do Cursora lub Claude Desktop. Twój agent sprawdza wpływ i strefy zagrożenia przed edycją, nie po niej.<br>
→ [Konfiguracja w Cursorze / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Chcę, żeby CI blokowało katastrofy, a nie dyskutowało o stylu"**<br>
Jedno zadanie, które nie przepuszcza scalenia, gdy zmiana trafia w chronioną strefę lub kruchy węzeł, oparte na prawdziwym grafie zależności, a nie na przeczuciu.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Chcę po prostu odpytywać moją bazę kodu"**<br>
`dbq dependents <id> | jq`: co się zepsuje, jeśli to zmienię? Twoje repo staje się bazą danych, którą można odpytywać.<br>
→ [Przepisy Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Buduję własnego agenta"**<br>
Te same 11 narzędzi, dostępne jako typowane definicje TypeScript lub wygenerowana specyfikacja OpenAPI 3.1.<br>
→ [LangChain / OpenAPI / niestandardowi agenci](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 narzędzi, które otrzymuje twój agent

| Narzędzie | Pytanie, na które odpowiada |
|------|----------------------|
| `find_symbol` | "Który węzeł to ta nazwa / plik?" (punkt wejścia) |
| `get_dependents` | "Co się zepsuje, jeśli to zmienię?" |
| `get_impact` | "Jaki jest promień wpływu tych zmian?" |
| `get_do_not_touch` | "Czego powinienem odmówić dotknięcia bez pytania?" |
| `get_dependencies` | "Od czego zależy ten kod?" |
| `find_path` | "Dlaczego zmiana w A wpływa na B?" |
| `get_arch_status` | "Jak ostrożnie powinienem pracować w tym repo?" |
| `check_change` | "Czy ta zmiana narusza regułę zespołu?" |
| `propose_rule` | "Zapisz ostrzeżenie teraz albo blokadę do zatwierdzenia przez człowieka" |
| `pause_own_rule` | "Wstrzymaj regułę utworzoną przez ten token agenta" |
| `append_rule_reason` | "Dodaj jedno uzasadnienie, nigdy nie edytuj ani nie usuwaj" |

Narzędzia zapytań są tylko do odczytu, analiza po stronie serwera, ograniczone odpowiedzi: zawsze bezpieczne do wywołania. Trzy narzędzia reguł zapisują reguły zespołu w ścisłych granicach: nie mogą aktywować blokady, wstrzymać cudzej reguły ani przepisać powodów.

## Sala kontroli

- **Rule Studio**: opisz, co nigdy nie może się zepsuć, zobacz, jak graf to znajduje, przetestuj ochronę na żywo przed aktywacją
- **Check**: symulator przed edycją: wybierz ziarna, uzyskaj werdykt ok/warn/block, animuj dokładną ścieżkę, którą podążałoby uszkodzenie
- **Overview**: werdykt w jednym zdaniu, wskaźniki stabilności i nawigowalności AI, najważniejsze działania, które wzmocniłyby twoją architekturę
- **Graph**: scena 3D Nebula, chronione strefy i ścieżki świadków podświetlone jako nakładki
- **Agents**: połącz Cursor, Claude lub CI jednym kliknięciem, z demo try-to-break na żywo

Priorytet klawiatury: `cmd+K` otwiera paletę poleceń.

## Połącz swojego agenta w 30 sekund

1. Otwórz aplikację dont-break → **Agents**.
2. Zaloguj się, powiąż folder z projektem, kliknij **Connect Cursor**: jedno kliknięcie generuje token przypisany do projektu i wypełnia `mcp.json`.
3. Wklej go do Cursora (lub swojego klienta MCP).
4. Kliknij **Install agent skill**: to zapisuje protokół bezpiecznej zmiany w pliku `AGENTS.md` twojego repo, dzięki czemu agenci korzystają z narzędzi bez konieczności instruowania.

## Licencja

Apache-2.0. Zobacz [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) i [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
