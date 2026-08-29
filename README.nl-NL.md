<div align="center">

# dont-break

**De vertrouwenslaag voor code geschreven door AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · **🇳🇱 Nederlands** · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: beschrijf wat nooit kapot mag gaan, zie de graaf het vinden en de bescherming testen](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI-agents leveren snel code. Niemand levert er vertrouwen bij. Elk team dat Cursor, Claude of CI-bots gebruikt, deelt dezelfde onuitgesproken angst: de dag waarop een snelle fix stilletjes het ene ding breekt dat nooit mocht breken.

`dont-break` verandert die angst in een contract:

1. **Zeg het in eenvoudige woorden.** "Niemand mag de factuurberekening kunnen breken, zelfs niet indirect." Geen bestandspaden, geen code.
2. **Kijk hoe het gevonden wordt.** dont-break leest de levende kaart van je codebase en verlicht elke plek die die logica draagt, inclusief paden waarvan je vergeten was dat ze bestonden.
3. **Kijk hoe het wordt aangevallen.** Het schrijft een beschermingsregel en speelt vervolgens codewijzigingen ertegen af om te bewijzen dat de bescherming echt standhoudt. Een droogloop: niets in je code wordt aangeraakt.
4. **Activeer het.** Vanaf dat moment wordt elke bewerking van een agent tegen de regel gecontroleerd voordat deze van kracht wordt. Je agent hoort "dit is risicovoller dan het lijkt" in plaats van dat jij het in productie ontdekt.

```text
Jij:     "Hernoem PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 aanroeppunten in 4 modules"
         → get_impact(files: [...])                  "straal 3, raakt ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService is een gevarenzone: fan-in 23, stabiliteit 31"
Agent:   "Dit is risicovoller dan het lijkt. Hier zijn de 23 plekken die zullen breken,
          en een veiliger plan in 2 stappen."
```

Dat gesprek gebeurt automatisch zodra je verbonden bent. Geen prompt engineering: de agent skill leert het.

## Talen en mogelijkheden

Welke talen dont-break in kaart brengt, en wat elke taal echt kan, staat op **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Installatie

Vereist **Python 3.9+** en **Node.js** (npm). De graafextractor installeert zichzelf bij de eerste keer opstarten.

```bash
pip install dont-break
dont-break --wake
```

Dit opent een lokale UI op `http://127.0.0.1:4040`, in je eigen taal (32 beschikbaar). Log in, kies een projectmap, en de kaart van je code bouwt zichzelf op: een levende 3D-graaf van elke module, aanroep en afhankelijkheid, met je beschermde zones er bovenop verlicht.

## Kies je gevecht

**"Mijn agent blijft dingen breken die hij nooit heeft geopend"**<br>
Verbind dont-break met Cursor of Claude Desktop. Je agent controleert impact en gevarenzones vóór het bewerken, niet erna.<br>
→ [Instellen in Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Ik wil dat CI rampen blokkeert, niet over stijl discussieert"**<br>
Eén job die de merge laat mislukken wanneer een wijziging een beschermde zone of kwetsbaar knooppunt raakt, gebaseerd op een echte afhankelijkheidsgraaf, niet op onderbuikgevoel.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Ik wil gewoon mijn codebase kunnen bevragen"**<br>
`dbq dependents <id> | jq`: wat breekt er als ik dit verander? Je repo wordt een bevraagbare database.<br>
→ [Shell + jq recepten](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Ik bouw mijn eigen agent"**<br>
Dezelfde 11 tools, beschikbaar als getypeerde TypeScript-definities of een gegenereerde OpenAPI 3.1-specificatie.<br>
→ [LangChain / OpenAPI / aangepaste agents](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## De 11 tools die je agent krijgt

| Tool | De vraag die het beantwoordt |
|------|----------------------|
| `find_symbol` | "Welk knooppunt is deze naam / dit bestand?" (toegangspunt) |
| `get_dependents` | "Wat breekt er als ik dit verander?" |
| `get_impact` | "Wat is de impactstraal van deze wijzigingen?" |
| `get_do_not_touch` | "Wat moet ik weigeren aan te raken zonder te vragen?" |
| `get_dependencies` | "Waarvan is deze code afhankelijk?" |
| `find_path` | "Waarom beïnvloedt een wijziging in A B?" |
| `get_arch_status` | "Hoe voorzichtig moet ik werken in deze repo?" |
| `check_change` | "Overtreedt deze wijziging een teamregel?" |
| `propose_rule` | "Nu een waarschuwing vastleggen, of blokkeren voor menselijke goedkeuring" |
| `pause_own_rule` | "Een regel pauzeren die door dit agent-token is gemaakt" |
| `append_rule_reason` | "Eén rechtvaardiging toevoegen, nooit bewerken of verwijderen" |

Query-tools zijn alleen-lezen, server-side analyse, beperkte antwoorden: altijd veilig om aan te roepen. De drie regel-tools schrijven teamregels onder strikte grenzen: ze kunnen een blokkering niet activeren, iemands regel niet pauzeren, of redenen niet herschrijven.

## De controlekamer

- **Rule Studio**: beschrijf wat nooit kapot mag gaan, zie de graaf het vinden, test de bescherming live voordat je hem activeert
- **Check**: pre-edit simulator: kies seeds, krijg een ok/warn/block-oordeel, animeer het exacte pad dat een breuk zou volgen
- **Overview**: een oordeel in één zin, stabiliteit- en AI-navigeerbaarheidsindicatoren, de belangrijkste acties die je architectuur zouden versterken
- **Graph**: de 3D Nebula-scene, beschermde zones en getuigenpaden verlicht als overlays
- **Agents**: verbind Cursor, Claude of CI met één klik, met een live try-to-break demo

Toetsenbord eerst: `cmd+K` opent het opdrachtpalet.

## Verbind je agent in 30 seconden

1. Open de dont-break-app → **Agents**.
2. Log in, koppel de map aan een project, klik op **Connect Cursor**: één klik genereert een project-specifieke token en vult `mcp.json` in.
3. Plak het in Cursor (of je MCP-client).
4. Klik op **Install agent skill**: dit schrijft het veilige-wijzigingsprotocol naar de `AGENTS.md` van je repo, zodat agents de tools gebruiken zonder dat het hen verteld hoeft te worden.

## Licentie

Apache-2.0. Zie [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) en [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
