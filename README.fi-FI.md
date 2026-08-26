<div align="center">

# dont-break

**Luottamuskerros tekoälyn kirjoittamalle koodille.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · **🇫🇮 Suomi** · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: kuvaile mikä ei saa koskaan hajota, katso kaavion löytävän ja testaavän suojauksen](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Tekoälyagentit toimittavat koodia nopeasti. Kukaan ei toimita luottamusta sen mukana. Jokainen tiimi, joka käyttää Cursoria, Claudea tai CI-botteja, jakaa saman ääneen lausumattoman pelon: päivän, jolloin nopea korjaus hiljaa rikkoo sen yhden asian, jonka ei koskaan pitänyt hajota.

`dont-break` muuttaa tuon pelon sopimukseksi:

1. **Sano se yksinkertaisin sanoin.** "Kenenkään ei pitäisi pystyä rikkomaan laskutuslaskentaa, ei edes epäsuorasti." Ei tiedostopolkuja, ei koodia.
2. **Katso sen löytyvän.** dont-break lukee koodikantasi elävän kartan ja valaisee jokaisen paikan, joka kantaa tuota logiikkaa, mukaan lukien polut, joiden olemassaolon olit unohtanut.
3. **Katso sen joutuvan hyökkäyksen kohteeksi.** Se kirjoittaa suojaussäännön ja toistaa sitten koodimuutokset sitä vasten todistaakseen, että suojaus todella pitää. Kuivaharjoitus: mihinkään koodissasi ei kosketa.
4. **Aktivoi se.** Siitä lähtien jokainen agentin muokkaus tarkistetaan sääntöä vasten ennen kuin se päätyy voimaan. Agenttisi kuulee "tämä on riskialttiimpaa kuin miltä näyttää" sen sijaan, että huomaisit sen tuotannossa.

```text
Sinä:    "Nimeä PokemonService.fetchAll uudelleen"
Agentti: → get_dependents(PokemonService.fetchAll)   "23 kutsukohtaa 4 moduulissa"
         → get_impact(files: [...])                  "säde 3, koskettaa ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService on vaaravyöhyke: fan-in 23, vakaus 31"
Agentti: "Tämä on riskialttiimpaa kuin miltä näyttää. Tässä ovat 23 paikkaa, jotka hajoavat,
          ja turvallisempi suunnitelma 2 vaiheessa."
```

Tämä keskustelu tapahtuu automaattisesti heti kun olet yhdistetty. Ei prompt-suunnittelua: agenttitaito opettaa sen.

## Asennus

Vaatii **Python 3.9+** ja **Node.js** (npm). Kaavion poimija asentaa itsensä ensimmäisellä käynnistyksellä.

```bash
pip install dont-break
dont-break --wake
```

Tämä avaa paikallisen käyttöliittymän osoitteessa `http://127.0.0.1:4040`, omalla kielelläsi (32 saatavilla). Kirjaudu sisään, valitse projektikansio, ja koodisi kartta rakentuu itsestään: elävä 3D-kaavio jokaisesta moduulista, kutsusta ja riippuvuudesta, suojatut vyöhykkeesi valaistuina päällä.

## Valitse taistelusi

**"Agenttini rikkoo jatkuvasti asioita, joita se ei ole koskaan avannut"**<br>
Yhdistä dont-break Cursoriin tai Claude Desktopiin. Agenttisi tarkistaa vaikutuksen ja vaaravyöhykkeet ennen muokkausta, ei sen jälkeen.<br>
→ [Käyttöönotto Cursorissa / Claudessa (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Haluan CI:n estävän katastrofit, ei väittelevän tyylistä"**<br>
Yksi työ, joka epäonnistuttaa yhdistämisen, kun muutos osuu suojattuun vyöhykkeeseen tai hauraaseen solmuun, perustuen todelliseen riippuvuuskaavioon, ei tuntumaan.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit-koukku](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Haluan vain kyselyä koodikantaani"**<br>
`dbq dependents <id> | jq`: mikä hajoaa, jos muutan tämän? Repostasi tulee kyseltävä tietokanta.<br>
→ [Shell + jq -reseptit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Rakennan omaa agenttiani"**<br>
Samat 11 työkalua, saatavilla tyypitettyinä TypeScript-määrityksinä tai generoituna OpenAPI 3.1 -spesifikaationa.<br>
→ [LangChain / OpenAPI / omat agentit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 työkalua, jotka agenttisi saa

| Työkalu | Kysymys, jonka se ratkaisee |
|------|----------------------|
| `find_symbol` | "Mikä solmu tämä nimi / tiedosto on?" (aloituspiste) |
| `get_dependents` | "Mikä hajoaa, jos muutan tämän?" |
| `get_impact` | "Mikä on näiden muutosten vaikutussäde?" |
| `get_do_not_touch` | "Mihin minun pitäisi kieltäytyä koskemasta kysymättä?" |
| `get_dependencies` | "Mistä tämä koodi riippuu?" |
| `find_path` | "Miksi muutos kohteessa A vaikuttaa kohteeseen B?" |
| `get_arch_status` | "Kuinka varovaisesti minun pitäisi työskennellä tässä reposssa?" |
| `check_change` | "Rikkooko tämä muutos tiimisääntöä?" |
| `propose_rule` | "Kirjaa varoitus nyt, tai esto ihmisen hyväksyttäväksi" |
| `pause_own_rule` | "Keskeytä sääntö, jonka tämän agentin token loi" |
| `append_rule_reason` | "Lisää yksi perustelu, älä koskaan muokkaa tai poista" |

Kyselytyökalut ovat vain luku -tyyppisiä, palvelinpuolen analyysiä, rajattuja vastauksia: aina turvallisia kutsua. Kolme sääntötyökalua kirjoittavat tiimisääntöjä tiukkojen rajojen alla: ne eivät voi aktivoida estoa, keskeyttää jonkun toisen sääntöä tai kirjoittaa perusteluja uudelleen.

## Ohjaamo

- **Rule Studio**: kuvaile mikä ei saa koskaan hajota, katso kaavion löytävän sen, testaa suojaus livenä ennen aktivointia
- **Check**: simulaattori ennen muokkausta: valitse siemenet, saa ok/warn/block-tuomio, animoi tarkka polku, jonka rikkoutuminen ottaisi
- **Overview**: tuomio yhdessä lauseessa, vakauden ja tekoälynavigoitavuuden mittarit, tärkeimmät toimet, jotka vahvistaisivat arkkitehtuuriasi
- **Graph**: 3D Nebula -näkymä, suojatut vyöhykkeet ja todistajapolut valaistuina peittokerroksina
- **Agents**: yhdistä Cursor, Claude tai CI yhdellä klikkauksella, live-demolla yritä-rikkoa

Näppäimistökeskeinen: `cmd+K` avaa komentopaletin.

## Yhdistä agenttisi 30 sekunnissa

1. Avaa dont-break-sovellus → **Agents**.
2. Kirjaudu sisään, linkitä kansio projektiin, klikkaa **Connect Cursor**: yksi klikkaus luo projektikohtaisen tokenin ja täyttää `mcp.json`-tiedoston.
3. Liitä se Cursoriin (tai MCP-asiakkaaseesi).
4. Klikkaa **Install agent skill**: se kirjoittaa turvallisen muutoksen protokollan reposi `AGENTS.md`-tiedostoon, jotta agentit käyttävät työkaluja ilman erillistä ohjeistusta.

## Lisenssi

Apache-2.0. Katso [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) ja [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
