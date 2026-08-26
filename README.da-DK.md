<div align="center">

# dont-break

**Tillidslaget for AI-skrevet kode.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · **🇩🇰 Dansk** · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: beskriv hvad der aldrig må gå i stykker, se grafen finde og teste beskyttelsen](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI-agenter leverer kode hurtigt. Ingen leverer tillid med den. Ethvert team, der kører Cursor, Claude eller CI-bots, deler den samme uudtalte frygt: den dag en hurtig rettelse i stilhed ødelægger den ene ting, der aldrig måtte gå i stykker.

`dont-break` gør den frygt til en kontrakt:

1. **Sig det med enkle ord.** "Ingen bør kunne ødelægge fakturaberegningen, selv indirekte." Ingen filstier, ingen kode.
2. **Se det blive fundet.** dont-break læser det levende kort over din kodebase og oplyser hvert sted, der bærer den logik, inklusive de stier, du havde glemt eksisterede.
3. **Se det blive angrebet.** Den skriver en beskyttelsesregel og afspiller derefter kodeændringer mod den for at bevise, at beskyttelsen faktisk holder. En prøvekørsel: intet i din kode bliver rørt.
4. **Aktivér den.** Derfra tjekkes hver agentændring mod reglen, før den lander. Din agent får at vide "dette er mere risikabelt, end det ser ud til", i stedet for at du opdager det i produktion.

```text
Dig:    "Omdøb PokemonService.fetchAll"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 kaldesteder på tværs af 4 moduler"
        → get_impact(files: [...])                  "radius 3, rører ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService er en farezone: fan-in 23, stabilitet 31"
Agent:  "Dette er mere risikabelt, end det ser ud til. Her er de 23 steder, der går i stykker,
         og en sikrere plan i 2 trin."
```

Den samtale sker automatisk, når du er forbundet. Ingen prompt engineering: agent-skillet lærer den det.

## Installation

Kræver **Python 3.9+** og **Node.js** (npm). Grafudtrækkeren installerer sig selv ved første kørsel.

```bash
pip install dont-break
dont-break --wake
```

Det åbner en lokal UI på `http://127.0.0.1:4040`, på dit sprog (32 tilgængelige). Log ind, vælg en projektmappe, og kortet over din kode bygger sig selv: en levende 3D-graf over hvert modul, kald og afhængighed, med dine beskyttede zoner oplyst ovenpå.

## Vælg din kamp

**"Min agent bliver ved med at ødelægge ting, den aldrig har åbnet"**<br>
Forbind dont-break til Cursor eller Claude Desktop. Din agent tjekker påvirkning og farezoner før redigering, ikke efter.<br>
→ [Opsætning i Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Jeg vil have CI til at blokere katastrofer, ikke diskutere stil"**<br>
Ét job, der fejler mergen, når en ændring rammer en beskyttet zone eller en skrøbelig knude, baseret på den reelle afhængighedsgraf, ikke fornemmelser.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Jeg vil bare udspørge min kodebase"**<br>
`dbq dependents <id> | jq`: hvad går i stykker, hvis jeg ændrer dette? Dit repo bliver en forespørgselsbar database.<br>
→ [Shell + jq-opskrifter](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Jeg bygger min egen agent"**<br>
De samme 11 værktøjer, eksponeret som typede TypeScript-definitioner eller en genereret OpenAPI 3.1-spec.<br>
→ [LangChain / OpenAPI / egne agenter](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## De 11 værktøjer din agent får

| Værktøj | Spørgsmålet det dræber |
|------|----------------------|
| `find_symbol` | "Hvilken knude er dette navn / denne fil?" (indgangspunkt) |
| `get_dependents` | "Hvad går i stykker, hvis jeg ændrer dette?" |
| `get_impact` | "Hvad er skadesradius for disse ændringer?" |
| `get_do_not_touch` | "Hvad bør jeg nægte at røre uden at spørge?" |
| `get_dependencies` | "Hvad afhænger denne kode af?" |
| `find_path` | "Hvorfor påvirker en ændring af A B?" |
| `get_arch_status` | "Hvor forsigtigt bør jeg arbejde i dette repo?" |
| `check_change` | "Overtræder denne ændring en teamregel?" |
| `propose_rule` | "Registrer en advarsel nu, eller en blokering til menneskelig godkendelse" |
| `pause_own_rule` | "Stop evaluering af en regel, dette agent-token har oprettet" |
| `append_rule_reason` | "Tilføj én begrundelse, aldrig rediger eller slet" |

Forespørgselsværktøjer er skrivebeskyttede, server-side analyse, begrænsede svar: altid sikre at kalde. De tre regelværktøjer skriver teamregler under stramme grænser: de kan ikke aktivere en blokering, sætte en andens regel på pause eller omskrive begrundelser.

## Kontrolrummet

- **Rule Studio**: beskriv hvad der aldrig må gå i stykker, se grafen finde det, test beskyttelsen live før aktivering
- **Check**: simulator før redigering: vælg frø, få en ok/warn/block-dom, animer den præcise sti et brud ville tage
- **Overview**: en dom i én sætning, stabilitets- og AI-navigerbarhedsmålinger, de vigtigste handlinger der ville styrke din arkitektur
- **Graph**: 3D Nebula-scenen, beskyttede zoner og vidnestier oplyst som overlejringer
- **Agents**: forbind Cursor, Claude eller CI med ét klik, med en live prøv-at-ødelægge-demo

Tastaturstyret: `cmd+K` åbner kommandopaletten.

## Forbind din agent på 30 sekunder

1. Åbn dont-break-appen → **Agents**.
2. Log ind, kobl mappen til et projekt, klik **Connect Cursor**: ét klik udsteder et projektbundet token og udfylder `mcp.json`.
3. Indsæt i Cursor (eller din MCP-klient).
4. Klik **Install agent skill**: det skriver den sikre ændringsprotokol ind i dit repos `AGENTS.md`, så agenter bruger værktøjerne uden at blive bedt om det.

## Licens

Apache-2.0. Se [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) og [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
