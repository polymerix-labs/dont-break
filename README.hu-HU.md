<div align="center">

# dont-break

**A bizalmi réteg az AI által írt kódhoz.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · **🇭🇺 Magyar** · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: írd le, minek nem szabad soha eltörnie, nézd meg, ahogy a gráf megtalálja és teszteli a védelmet](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Az AI ügynökök gyorsan szállítanak kódot. Senki sem szállít vele bizalmat. Minden csapat, amely Cursort, Claude-ot vagy CI botokat használ, ugyanazt a kimondatlan félelmet osztja: azt a napot, amikor egy gyors javítás csendben eltöri azt az egy dolgot, aminek soha nem szabadott volna eltörnie.

A `dont-break` ezt a félelmet szerződéssé alakítja:

1. **Mondd ki egyszerű szavakkal.** "Senki sem törheti el a számlázási számítást, még közvetve sem." Nincs fájlútvonal, nincs kód.
2. **Nézd meg, ahogy megtalálja.** A dont-break beolvassa a kódbázisod élő térképét, és megvilágít minden helyet, ahol ez a logika megjelenik, beleértve azokat az útvonalakat is, amelyekről elfelejtetted, hogy léteznek.
3. **Nézd meg, ahogy megtámadják.** Ír egy védelmi szabályt, majd újra lejátssza ellene a kódváltoztatásokat, hogy bizonyítsa: a védelem valóban tart. Egy próbafuttatás: a kódodban semmi sem érintett.
4. **Aktiváld.** Innentől minden ügynöki szerkesztést ellenőriznek a szabály alapján, mielőtt életbe lépne. Az ügynököd azt hallja: "ez kockázatosabb, mint amilyennek látszik", ahelyett hogy éles környezetben derülne ki.

```text
Te:      "Nevezd át a PokemonService.fetchAll-t"
Ügynök:  → get_dependents(PokemonService.fetchAll)   "23 hívási pont 4 modulban"
         → get_impact(files: [...])                  "3-as sugár, érinti: ui/, cache/, api/"
         → get_do_not_touch()                        "A PokemonService veszélyzóna: fan-in 23, stabilitás 31"
Ügynök:  "Ez kockázatosabb, mint amilyennek látszik. Íme a 23 hely, amely eltörne,
          és egy biztonságosabb terv 2 lépésben."
```

Ez a beszélgetés automatikusan lezajlik, amint csatlakoztattad. Nincs prompt engineering: az ügynökkészség megtanítja rá.

## Telepítés

**Python 3.9+** és **Node.js** (npm) szükséges. A gráfkinyerő az első futtatáskor magát telepíti.

```bash
pip install dont-break
dont-break --wake
```

Ez megnyit egy helyi felületet a `http://127.0.0.1:4040` címen, a saját nyelveden (32 elérhető). Jelentkezz be, válassz egy projektmappát, és a kódod térképe magától felépül: minden modul, hívás és függőség élő 3D gráfja, a tetején megvilágított védett zónáiddal.

## Válaszd ki a harcodat

**"Az ügynököm folyamatosan eltör olyan dolgokat, amiket még soha nem nyitott meg"**<br>
Csatlakoztasd a dont-breaket a Cursorhoz vagy a Claude Desktophoz. Az ügynököd szerkesztés előtt ellenőrzi a hatást és a veszélyzónákat, nem utána.<br>
→ [Beállítás Cursorban / Claude-ban (2 perc)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Azt akarom, hogy a CI blokkolja a katasztrófákat, ne stílusról vitatkozzon"**<br>
Egy job, amely megbuktatja a merge-et, ha egy változtatás védett zónát vagy törékeny csomópontot érint, valódi függőségi gráf alapján, nem megérzés alapján.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Csak lekérdezni akarom a kódbázisomat"**<br>
`dbq dependents <id> | jq`: mi törik el, ha ezt megváltoztatom? A repód lekérdezhető adatbázissá válik.<br>
→ [Shell + jq receptek](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Saját ügynököt építek"**<br>
Ugyanaz a 11 eszköz, típusos TypeScript definíciókként vagy generált OpenAPI 3.1 specifikációként elérhető.<br>
→ [LangChain / OpenAPI / egyedi ügynökök](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## A 11 eszköz, amit az ügynököd kap

| Eszköz | A kérdés, amit megválaszol |
|------|----------------------|
| `find_symbol` | "Melyik csomópont ez a név / fájl?" (belépési pont) |
| `get_dependents` | "Mi törik el, ha ezt megváltoztatom?" |
| `get_impact` | "Mi ezeknek a változtatásoknak a hatássugara?" |
| `get_do_not_touch` | "Mihez ne nyúljak kérdés nélkül?" |
| `get_dependencies` | "Mitől függ ez a kód?" |
| `find_path` | "Miért érinti az A-ban történt változás B-t?" |
| `get_arch_status` | "Mennyire kell óvatosan dolgoznom ebben a repóban?" |
| `check_change` | "Sérti ez a változtatás egy csapatszabályt?" |
| `propose_rule` | "Rögzíts egy figyelmeztetést most, vagy blokkolást emberi jóváhagyásra" |
| `pause_own_rule` | "Szüneteltess egy szabályt, amit ez az ügynöktoken hozott létre" |
| `append_rule_reason` | "Adj hozzá egy indoklást, soha ne szerkeszd vagy töröld" |

A lekérdező eszközök csak olvashatók, szerveroldali elemzést végeznek, korlátozott válaszokkal: mindig biztonságosan hívhatók. A három szabály-eszköz szigorú korlátok mellett ír csapatszabályokat: nem tudják aktiválni a blokkolást, nem szüneteltethetnek mások szabályát, és nem írhatják át az indoklásokat.

## Az irányítóterem

- **Rule Studio**: írd le, minek nem szabad soha eltörnie, nézd meg, ahogy a gráf megtalálja, teszteld élőben a védelmet aktiválás előtt
- **Check**: szerkesztés előtti szimulátor: válassz magokat, kapj ok/warn/block ítéletet, animáld azt a pontos útvonalat, amit egy törés bejárna
- **Overview**: ítélet egy mondatban, stabilitási és AI-navigálhatósági mutatók, a legfontosabb lépések, amelyek megerősítenék az architektúrádat
- **Graph**: a 3D Nebula jelenet, védett zónák és tanú útvonalak overlay-ként megvilágítva
- **Agents**: csatlakoztasd a Cursort, Claude-ot vagy CI-t egy kattintással, élő try-to-break demóval

Billentyűzet-központú: a `cmd+K` megnyitja a parancspalettát.

## Csatlakoztasd az ügynöködet 30 másodperc alatt

1. Nyisd meg a dont-break alkalmazást → **Agents**.
2. Jelentkezz be, kapcsold a mappát egy projekthez, kattints a **Connect Cursor** gombra: egy kattintás projekt-hatókörű tokent generál és kitölti az `mcp.json`-t.
3. Illeszd be a Cursorba (vagy a saját MCP klienseidbe).
4. Kattints az **Install agent skill** gombra: ez beleírja a biztonságos módosítási protokollt a repód `AGENTS.md` fájljába, hogy az ügynökök utasítás nélkül is használják az eszközöket.

## Licenc

Apache-2.0. Lásd a [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) és a [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE) fájlokat.
