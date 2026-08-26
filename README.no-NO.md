<div align="center">

# dont-break

**Tillitslaget for kode skrevet av AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · **🇳🇴 Norsk** · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: beskriv hva som aldri skal ødelegges, se grafen finne det og teste beskyttelsen](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI-agenter leverer kode raskt. Ingen leverer tillit sammen med den. Ethvert team som bruker Cursor, Claude eller CI-boter deler den samme uuttalte frykten: dagen en rask fiks stille ødelegger den ene tingen som aldri skulle ødelegges.

`dont-break` gjør den frykten om til en kontrakt:

1. **Si det med enkle ord.** "Ingen skal kunne ødelegge fakturaberegningen, ikke engang indirekte." Ingen filstier, ingen kode.
2. **Se det bli funnet.** dont-break leser det levende kartet over kodebasen din og lyser opp hvert sted som bærer den logikken, inkludert stier du hadde glemt eksisterte.
3. **Se det bli angrepet.** Det skriver en beskyttelsesregel, og spiller deretter av kodeendringer mot den for å bevise at beskyttelsen faktisk holder. En tørrkjøring: ingenting i koden din blir rørt.
4. **Aktiver den.** Fra da av blir hver agentredigering sjekket mot regelen før den trer i kraft. Agenten din hører "dette er mer risikabelt enn det ser ut til" i stedet for at du finner det ut i produksjon.

```text
Du:      "Gi nytt navn til PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 kallsteder i 4 moduler"
         → get_impact(files: [...])                  "radius 3, påvirker ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService er en faresone: fan-in 23, stabilitet 31"
Agent:   "Dette er mer risikabelt enn det ser ut til. Her er de 23 stedene som vil ødelegges,
          og en tryggere plan i 2 trinn."
```

Den samtalen skjer automatisk så snart du er tilkoblet. Ingen prompt engineering: agentferdigheten lærer den det.

## Installasjon

Krever **Python 3.9+** og **Node.js** (npm). Grafuttrekkeren installerer seg selv ved første oppstart.

```bash
pip install dont-break
dont-break --wake
```

Dette åpner et lokalt grensesnitt på `http://127.0.0.1:4040`, på ditt eget språk (32 tilgjengelige). Logg inn, velg en prosjektmappe, og kartet over koden din bygger seg selv: en levende 3D-graf av hver modul, kall og avhengighet, med de beskyttede sonene dine opplyst over.

## Velg din kamp

**"Agenten min fortsetter å ødelegge ting den aldri har åpnet"**<br>
Koble dont-break til Cursor eller Claude Desktop. Agenten din sjekker påvirkning og faresoner før redigering, ikke etterpå.<br>
→ [Sett opp i Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Jeg vil at CI skal blokkere katastrofer, ikke krangle om stil"**<br>
Én jobb som feiler sammenslåingen når en endring treffer en beskyttet sone eller en skjør node, basert på en ekte avhengighetsgraf, ikke magefølelse.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit-hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Jeg vil bare spørre kodebasen min"**<br>
`dbq dependents <id> | jq`: hva ødelegges hvis jeg endrer dette? Repoet ditt blir en spørrbar database.<br>
→ [Shell + jq-oppskrifter](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Jeg bygger min egen agent"**<br>
De samme 11 verktøyene, tilgjengelig som typede TypeScript-definisjoner eller en generert OpenAPI 3.1-spesifikasjon.<br>
→ [LangChain / OpenAPI / egendefinerte agenter](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## De 11 verktøyene agenten din får

| Verktøy | Spørsmålet det løser |
|------|----------------------|
| `find_symbol` | "Hvilken node er dette navnet / denne filen?" (inngangspunkt) |
| `get_dependents` | "Hva ødelegges hvis jeg endrer dette?" |
| `get_impact` | "Hva er påvirkningsradiusen til disse endringene?" |
| `get_do_not_touch` | "Hva bør jeg nekte å røre uten å spørre?" |
| `get_dependencies` | "Hva avhenger denne koden av?" |
| `find_path` | "Hvorfor påvirker en endring i A B?" |
| `get_arch_status` | "Hvor forsiktig bør jeg jobbe i dette repoet?" |
| `check_change` | "Bryter denne endringen en teamregel?" |
| `propose_rule` | "Registrer en advarsel nå, eller en blokkering for menneskelig godkjenning" |
| `pause_own_rule` | "Sett en regel opprettet av dette agenttokenet på pause" |
| `append_rule_reason` | "Legg til én begrunnelse, aldri rediger eller slett" |

Spørreverktøyene er skrivebeskyttet, server-side analyse, begrensede svar: alltid trygge å kalle. De tre regelverktøyene skriver teamregler under strenge grenser: de kan ikke aktivere en blokkering, sette på pause noen andres regel, eller skrive om grunner.

## Kontrollrommet

- **Rule Studio**: beskriv hva som aldri skal ødelegges, se grafen finne det, test beskyttelsen live før aktivering
- **Check**: simulator før redigering: velg frø, få en ok/warn/block-dom, animer den nøyaktige stien en ødeleggelse ville tatt
- **Overview**: en dom i én setning, stabilitets- og AI-navigerbarhetsmålinger, de viktigste tiltakene som ville styrke arkitekturen din
- **Graph**: 3D Nebula-scenen, beskyttede soner og vitnesti opplyst som overlegg
- **Agents**: koble til Cursor, Claude eller CI med ett klikk, med en live try-to-break-demo

Tastatur først: `cmd+K` åpner kommandopaletten.

## Koble til agenten din på 30 sekunder

1. Åpne dont-break-appen → **Agents**.
2. Logg inn, koble mappen til et prosjekt, klikk **Connect Cursor**: ett klikk genererer et prosjektavgrenset token og fyller ut `mcp.json`.
3. Lim det inn i Cursor (eller MCP-klienten din).
4. Klikk **Install agent skill**: dette skriver den trygge endringsprotokollen inn i `AGENTS.md` i repoet ditt, slik at agenter bruker verktøyene uten å bli fortalt det.

## Lisens

Apache-2.0. Se [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) og [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
