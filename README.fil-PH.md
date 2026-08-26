<div align="center">

# dont-break

**Ang layer ng tiwala para sa code na isinulat ng AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · **🇵🇭 Filipino** · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: ilarawan kung ano ang hindi dapat masira, panoorin ang graph na hanapin at subukan ang proteksyon](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Mabilis maghatid ng code ang mga AI agent. Walang naghahatid ng tiwala kasama nito. Bawat team na gumagamit ng Cursor, Claude, o CI bots ay may parehong hindi-sinasabing takot: ang araw na tahimik na masisira ng mabilisang ayos ang tanging bagay na hindi dapat masira.

Ginagawang kontrata ng `dont-break` ang takot na iyon:

1. **Sabihin ito sa simpleng salita.** "Walang dapat makapagpasira sa pagkalkula ng invoice, kahit hindi direkta." Walang file path, walang code.
2. **Panoorin itong mahanap.** Binabasa ng dont-break ang buhay na mapa ng iyong codebase at ini-ilaw ang bawat lugar na may dalang logic na iyon, kasama na ang mga path na nakalimutan mong umiiral.
3. **Panoorin itong atakehin.** Sumusulat ito ng protection rule, pagkatapos ay pinapatugtog muli ang mga pagbabago sa code laban dito para patunayan na talagang tumatagal ang proteksyon. Isang dry run: walang nagagalaw sa code mo.
4. **I-activate ito.** Mula noon, ang bawat pag-edit ng agent ay chine-check laban sa rule bago ito i-apply. Sasabihan ang iyong agent na "mas mapanganib ito kaysa sa itsura" sa halip na malaman mo na lang ito sa production.

```text
Ikaw:    "Palitan ang pangalan ng PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 call site sa 4 na module"
         → get_impact(files: [...])                  "radius 3, apektado ang ui/, cache/, api/"
         → get_do_not_touch()                        "Panganib zone ang PokemonService: fan-in 23, stability 31"
Agent:   "Mas mapanganib ito kaysa sa itsura. Narito ang 23 lugar na masisira,
          at mas ligtas na plano sa 2 hakbang."
```

Nangyayari ito nang automatic kapag naka-connect na. Walang prompt engineering: itinuturo ito ng agent skill.

## Pag-install

Kailangan ang **Python 3.9+** at **Node.js** (npm). Nagi-install mag-isa ang graph extractor sa unang pagpapatakbo.

```bash
pip install dont-break
dont-break --wake
```

Nagbubukas ito ng local UI sa `http://127.0.0.1:4040`, sa sarili mong wika (32 available). Mag-sign in, pumili ng project folder, at ang mapa ng code mo ay mabubuo mag-isa: buhay na 3D graph ng bawat module, call, at dependency, na may naka-ilaw na protected zones sa ibabaw nito.

## Piliin ang iyong laban

**"Patuloy na sinisira ng agent ko ang mga bagay na hindi niya pa binuksan"**<br>
I-plug ang dont-break sa Cursor o Claude Desktop. Che-check ng agent mo ang impact at mga panganib na zone bago mag-edit, hindi pagkatapos.<br>
→ [I-setup sa Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Gusto kong harangan ng CI ang mga sakuna, hindi pagtalunan ang style"**<br>
Isang job na magpapasablay sa merge kapag tumama ang pagbabago sa protected zone o marupok na node, base sa tunay na dependency graph, hindi sa kutob.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Gusto ko lang tanungin ang codebase ko"**<br>
`dbq dependents <id> | jq`: ano ang masisira kung babaguhin ko ito? Nagiging queryable database ang repo mo.<br>
→ [Shell + jq recipes](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Gumagawa ako ng sarili kong agent"**<br>
Parehong 11 tools, available bilang typed TypeScript definitions o generated OpenAPI 3.1 spec.<br>
→ [LangChain / OpenAPI / custom agents](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Ang 11 tools na makukuha ng agent mo

| Tool | Ang tanong na sinasagot nito |
|------|----------------------|
| `find_symbol` | "Aling node itong pangalan / file?" (entry point) |
| `get_dependents` | "Ano ang masisira kung babaguhin ko ito?" |
| `get_impact` | "Ano ang radius ng epekto ng mga pagbabagong ito?" |
| `get_do_not_touch` | "Ano ang dapat kong tanggihang galawin nang hindi nagtatanong?" |
| `get_dependencies` | "Ano ang pinagbabatayan ng code na ito?" |
| `find_path` | "Bakit naaapektuhan ng pagbabago sa A ang B?" |
| `get_arch_status` | "Gaano kaingat dapat akong magtrabaho sa repo na ito?" |
| `check_change` | "Lumalabag ba ang pagbabagong ito sa team rule?" |
| `propose_rule` | "Mag-record ng warning ngayon, o block para aprubahan ng tao" |
| `pause_own_rule` | "I-pause ang rule na ginawa ng token ng agent na ito" |
| `append_rule_reason` | "Magdagdag ng isang justification, huwag kailanman i-edit o burahin" |

Read-only ang query tools, server-side analysis, may limitasyong tugon: laging ligtas tawagin. Ang tatlong rule tools ay sumusulat ng team rules sa ilalim ng mahigpit na limitasyon: hindi nila kayang i-activate ang block, i-pause ang rule ng iba, o i-rewrite ang mga dahilan.

## Ang control room

- **Rule Studio**: ilarawan kung ano ang hindi dapat masira, panoorin ang graph na hanapin ito, subukan ang proteksyon nang live bago i-activate
- **Check**: pre-edit simulator: pumili ng mga seed, kumuha ng ok/warn/block verdict, i-animate ang eksaktong landas na tatahakin ng pagkasira
- **Overview**: verdict sa isang pangungusap, mga readout ng stability at AI-navigability, ang mga top action na magpapalakas sa arkitektura mo
- **Graph**: ang 3D Nebula scene, mga protected zone at witness path na naka-ilaw bilang overlay
- **Agents**: i-connect ang Cursor, Claude, o CI sa isang click, may live na try-to-break demo

Keyboard-first: bubuksan ng `cmd+K` ang command palette.

## I-connect ang agent mo sa 30 segundo

1. Buksan ang dont-break app → **Agents**.
2. Mag-sign in, i-link ang folder sa isang project, i-click ang **Connect Cursor**: isang click lang para makagawa ng project-scoped token at mapunan ang `mcp.json`.
3. I-paste sa Cursor (o sa MCP client mo).
4. I-click ang **Install agent skill**: isinusulat nito ang safe-change protocol sa `AGENTS.md` ng repo mo para gamitin ng mga agent ang tools nang hindi na sinasabihan.

## Lisensya

Apache-2.0. Tingnan ang [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) at [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
