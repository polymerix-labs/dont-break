<div align="center">

# dont-break

**Förtroendelagret för kod skriven av AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · **🇸🇪 Svenska** · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: beskriv vad som aldrig får gå sönder, se grafen hitta det och testa skyddet](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI-agenter levererar kod snabbt. Ingen levererar förtroende med den. Varje team som använder Cursor, Claude eller CI-botar delar samma outtalade rädsla: dagen då en snabb fix tyst förstör den enda sak som aldrig fick gå sönder.

`dont-break` förvandlar den rädslan till ett kontrakt:

1. **Säg det med enkla ord.** "Ingen ska kunna förstöra faktureringsberäkningen, inte ens indirekt." Inga filsökvägar, ingen kod.
2. **Se det bli hittat.** dont-break läser den levande kartan över din kodbas och belyser varje plats som bär på den logiken, inklusive sökvägar du glömt fanns.
3. **Se det bli attackerat.** Den skriver en skyddsregel och spelar sedan upp kodändringar mot den för att bevisa att skyddet verkligen håller. En torrkörning: inget i din kod rörs.
4. **Aktivera den.** Från och med då kontrolleras varje agentredigering mot regeln innan den träder i kraft. Din agent hör "det här är mer riskabelt än det ser ut" istället för att du upptäcker det i produktion.

```text
Du:      "Byt namn på PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 anropsställen i 4 moduler"
         → get_impact(files: [...])                  "radie 3, påverkar ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService är en farozon: fan-in 23, stabilitet 31"
Agent:   "Det här är mer riskabelt än det ser ut. Här är de 23 platserna som går sönder,
          och en säkrare plan i 2 steg."
```

Det samtalet sker automatiskt så snart du är ansluten. Ingen prompt engineering: agentens skill lär den det.

## Installation

Kräver **Python 3.9+** och **Node.js** (npm). Grafextraktorn installerar sig själv vid första körningen.

```bash
pip install dont-break
dont-break --wake
```

Detta öppnar ett lokalt gränssnitt på `http://127.0.0.1:4040`, på ditt eget språk (32 tillgängliga). Logga in, välj en projektmapp, så byggs kartan över din kod av sig själv: en levande 3D-graf över varje modul, anrop och beroende, med dina skyddade zoner belysta ovanpå.

## Välj din strid

**"Min agent fortsätter förstöra saker den aldrig har öppnat"**<br>
Anslut dont-break till Cursor eller Claude Desktop. Din agent kontrollerar påverkan och farozoner innan redigering, inte efteråt.<br>
→ [Konfigurera i Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Jag vill att CI ska blockera katastrofer, inte diskutera stil"**<br>
Ett jobb som gör att sammanslagningen misslyckas när en ändring träffar en skyddad zon eller en skör nod, baserat på en verklig beroendegraf, inte magkänsla.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit-hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Jag vill bara fråga min kodbas"**<br>
`dbq dependents <id> | jq`: vad går sönder om jag ändrar det här? Ditt repo blir en frågebar databas.<br>
→ [Shell + jq-recept](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Jag bygger min egen agent"**<br>
Samma 11 verktyg, tillgängliga som typade TypeScript-definitioner eller en genererad OpenAPI 3.1-specifikation.<br>
→ [LangChain / OpenAPI / anpassade agenter](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## De 11 verktyg din agent får

| Verktyg | Frågan det besvarar |
|------|----------------------|
| `find_symbol` | "Vilken nod är detta namn / denna fil?" (ingångspunkt) |
| `get_dependents` | "Vad går sönder om jag ändrar det här?" |
| `get_impact` | "Vad är påverkansradien för dessa ändringar?" |
| `get_do_not_touch` | "Vad bör jag vägra röra utan att fråga?" |
| `get_dependencies` | "Vad är den här koden beroende av?" |
| `find_path` | "Varför påverkar en ändring i A B?" |
| `get_arch_status` | "Hur försiktigt bör jag arbeta i det här repot?" |
| `check_change` | "Bryter den här ändringen mot en teamregel?" |
| `propose_rule` | "Registrera en varning nu, eller en blockering för mänskligt godkännande" |
| `pause_own_rule` | "Pausa en regel som skapats av den här agenttoken" |
| `append_rule_reason` | "Lägg till en motivering, redigera eller ta aldrig bort" |

Frågeverktygen är skrivskyddade, serversidesanalys, begränsade svar: alltid säkra att anropa. De tre regelverktygen skriver teamregler under strikta gränser: de kan inte aktivera en blockering, pausa någon annans regel eller skriva om skäl.

## Kontrollrummet

- **Rule Studio**: beskriv vad som aldrig får gå sönder, se grafen hitta det, testa skyddet live innan aktivering
- **Check**: simulator före redigering: välj frön, få en ok/warn/block-dom, animera den exakta vägen en förstörelse skulle ta
- **Overview**: en dom i en mening, avläsningar av stabilitet och AI-navigerbarhet, de främsta åtgärderna som skulle stärka din arkitektur
- **Graph**: 3D Nebula-scenen, skyddade zoner och vittnesvägar belysta som overlays
- **Agents**: anslut Cursor, Claude eller CI med ett klick, med en live try-to-break-demo

Tangentbordsfokuserat: `cmd+K` öppnar kommandopaletten.

## Anslut din agent på 30 sekunder

1. Öppna dont-break-appen → **Agents**.
2. Logga in, koppla mappen till ett projekt, klicka på **Connect Cursor**: ett klick genererar en projektbegränsad token och fyller i `mcp.json`.
3. Klistra in den i Cursor (eller din MCP-klient).
4. Klicka på **Install agent skill**: detta skriver det säkra ändringsprotokollet till din repos `AGENTS.md`, så att agenter använder verktygen utan att bli tillsagda.

## Licens

Apache-2.0. Se [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) och [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
