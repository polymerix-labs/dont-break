<div align="center">

# dont-break

**Vrstva důvěry pro kód psaný AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · **🇨🇿 Čeština** · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: popište, co nesmí nikdy selhat, sledujte, jak to graf najde a otestuje ochranu](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

AI agenti dodávají kód rychle. Nikdo s ním nedodává důvěru. Každý tým používající Cursor, Claude nebo CI boty sdílí stejnou nevyslovenou obavu: den, kdy rychlá oprava tiše rozbije jedinou věc, která nikdy neměla selhat.

`dont-break` mění tuto obavu ve smlouvu:

1. **Řekněte to jednoduše.** "Nikdo by neměl být schopen rozbít výpočet faktur, ani nepřímo." Žádné cesty k souborům, žádný kód.
2. **Sledujte, jak to najde.** dont-break čte živou mapu vaší kódové báze a osvětlí každé místo, které nese tuto logiku, včetně cest, o kterých jste zapomněli.
3. **Sledujte, jak to napadne.** Napíše ochranné pravidlo, poté proti němu přehraje změny kódu, aby dokázal, že ochrana skutečně drží. Zkouška nanečisto: nic ve vašem kódu se nedotkne.
4. **Aktivujte to.** Od té chvíle je každá úprava agenta ověřena proti pravidlu, než se uplatní. Váš agent se dozví "tohle je riskantnější, než to vypadá" místo toho, abyste to zjistili v produkci.

```text
Vy:     "Přejmenuj PokemonService.fetchAll"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 volání napříč 4 moduly"
        → get_impact(files: [...])                  "poloměr 3, zasahuje ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService je nebezpečná zóna: fan-in 23, stabilita 31"
Agent:  "Tohle je riskantnější, než to vypadá. Tady je 23 míst, která selžou,
         a bezpečnější plán ve 2 krocích."
```

Tato konverzace probíhá automaticky po připojení. Žádné prompt engineering: agent skill to naučí.

## Jazyky a schopnosti

Jaké jazyky dont-break mapuje a co každý opravdu umí, je na **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Instalace

Vyžaduje **Python 3.9+** a **Node.js** (npm). Extraktor grafu se při prvním spuštění nainstaluje sám.

```bash
pip install dont-break
dont-break --wake
```

Otevře se lokální UI na `http://127.0.0.1:4040`, ve vašem jazyce (32 dostupných). Přihlaste se, vyberte složku projektu a mapa vašeho kódu se sestaví sama: živý 3D graf každého modulu, volání a závislosti, s vašimi chráněnými zónami rozsvícenými navrchu.

## Vyberte si svůj boj

**"Můj agent pořád rozbíjí věci, které nikdy neotevřel"**<br>
Připojte dont-break do Cursoru nebo Claude Desktop. Váš agent kontroluje dopad a nebezpečné zóny před úpravou, ne po ní.<br>
→ [Nastavení v Cursoru / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Chci, aby CI blokovala katastrofy, ne aby diskutovala o stylu"**<br>
Jedna úloha, která shodí merge, když změna zasáhne chráněnou zónu nebo křehký uzel, založená na skutečném grafu závislostí, ne na pocitech.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Chci jen prozkoumávat svou kódovou bázi"**<br>
`dbq dependents <id> | jq`: co se rozbije, když tohle změním? Váš repozitář se stane dotazovatelnou databází.<br>
→ [Recepty Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Stavím si vlastního agenta"**<br>
Stejných 11 nástrojů, vystavených jako typované definice TypeScriptu nebo generovaná specifikace OpenAPI 3.1.<br>
→ [LangChain / OpenAPI / vlastní agenti](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 nástrojů, které váš agent získá

| Nástroj | Otázka, kterou řeší |
|------|----------------------|
| `find_symbol` | "Který uzel odpovídá tomuto jménu / souboru?" (vstupní bod) |
| `get_dependents` | "Co se rozbije, když tohle změním?" |
| `get_impact` | "Jaký je poloměr dopadu těchto úprav?" |
| `get_do_not_touch` | "Čeho bych se měl bez zeptání vyvarovat?" |
| `get_dependencies` | "Na čem tento kód závisí?" |
| `find_path` | "Proč změna A ovlivňuje B?" |
| `get_arch_status` | "Jak opatrně bych měl v tomto repozitáři pracovat?" |
| `check_change` | "Porušuje tato úprava týmové pravidlo?" |
| `propose_rule` | "Zaznamenat varování hned, nebo blokaci ke schválení člověkem" |
| `pause_own_rule` | "Pozastavit pravidlo, které vytvořil token tohoto agenta" |
| `append_rule_reason` | "Přidat jeden důvod, nikdy needitovat ani nemazat" |

Dotazovací nástroje jsou pouze pro čtení, analýza na straně serveru, omezené odpovědi: vždy bezpečné volat. Tři nástroje pravidel zapisují týmová pravidla v přísných mezích: nemohou aktivovat blokaci, pozastavit cizí pravidlo ani přepsat důvody.

## Řídicí místnost

- **Rule Studio**: popište, co nesmí nikdy selhat, sledujte, jak to graf najde, otestujte ochranu naživo před aktivací
- **Check**: simulátor před úpravou: vyberte semena, získejte verdikt ok/warn/block, animujte přesnou cestu, kterou by selhání sledovalo
- **Overview**: verdikt v jedné větě, ukazatele stability a AI-navigovatelnosti, hlavní akce, které by zpevnily vaši architekturu
- **Graph**: 3D scéna Nebula, chráněné zóny a svědecké cesty rozsvícené jako překrytí
- **Agents**: připojte Cursor, Claude nebo CI jedním kliknutím, s živou ukázkou pokusu o rozbití

Ovládání z klávesnice: `cmd+K` otevře paletu příkazů.

## Připojte svého agenta za 30 sekund

1. Otevřete aplikaci dont-break → **Agents**.
2. Přihlaste se, propojte složku s projektem, klikněte na **Connect Cursor**: jedno kliknutí vygeneruje token vázaný na projekt a vyplní `mcp.json`.
3. Vložte do Cursoru (nebo vašeho MCP klienta).
4. Klikněte na **Install agent skill**: zapíše protokol bezpečné změny do `AGENTS.md` vašeho repozitáře, takže agenti nástroje používají, aniž by jim to bylo řečeno.

## Licence

Apache-2.0. Viz [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) a [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
