<div align="center">

# dont-break

**Stratul de încredere pentru codul scris de AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · **🇷🇴 Română** · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: descrie ce nu trebuie să se strice niciodată, urmărește graful găsindu-l și testând protecția](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Agenții AI livrează cod rapid. Nimeni nu livrează încredere odată cu el. Fiecare echipă care folosește Cursor, Claude sau boți CI împărtășește aceeași frică nerostită: ziua în care o reparație rapidă strică pe tăcute singurul lucru care nu trebuia niciodată să se strice.

`dont-break` transformă acea frică într-un contract:

1. **Spune-o în cuvinte simple.** "Nimeni nu ar trebui să poată strica calculul facturilor, nici măcar indirect." Fără căi de fișiere, fără cod.
2. **Urmărește cum este găsit.** dont-break citește harta vie a bazei tale de cod și luminează fiecare loc care poartă acea logică, inclusiv căile despre care uitaseși că există.
3. **Urmărește cum este atacat.** Scrie o regulă de protecție, apoi redă modificările de cod împotriva ei pentru a dovedi că protecția chiar rezistă. O rulare la sec: nimic din codul tău nu este atins.
4. **Activeaz-o.** De atunci, fiecare editare a unui agent este verificată în raport cu regula înainte de a intra în vigoare. Agentul tău aude "asta este mai riscant decât pare" în loc să afli asta în producție.

```text
Tu:      "Redenumește PokemonService.fetchAll"
Agent:   → get_dependents(PokemonService.fetchAll)   "23 de puncte de apel în 4 module"
         → get_impact(files: [...])                  "rază 3, afectează ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService este o zonă de pericol: fan-in 23, stabilitate 31"
Agent:   "Asta este mai riscant decât pare. Iată cele 23 de locuri care se vor strica,
          și un plan mai sigur în 2 pași."
```

Acea conversație se întâmplă automat odată ce ești conectat. Fără inginerie de prompturi: skill-ul agentului îl învață.

## Instalare

Necesită **Python 3.9+** și **Node.js** (npm). Extractorul de graf se instalează singur la prima rulare.

```bash
pip install dont-break
dont-break --wake
```

Aceasta deschide o interfață locală la `http://127.0.0.1:4040`, în limba ta (32 disponibile). Autentifică-te, alege un folder de proiect, iar harta codului tău se construiește singură: un graf 3D viu al fiecărui modul, apel și dependență, cu zonele tale protejate luminate deasupra.

## Alege-ți lupta

**"Agentul meu continuă să strice lucruri pe care nu le-a deschis niciodată"**<br>
Conectează dont-break la Cursor sau Claude Desktop. Agentul tău verifică impactul și zonele de pericol înainte de editare, nu după.<br>
→ [Configurare în Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Vreau ca CI să blocheze dezastrele, nu să dezbată despre stil"**<br>
Un job care eșuează merge-ul atunci când o modificare atinge o zonă protejată sau un nod fragil, bazat pe un graf real de dependențe, nu pe intuiție.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Vreau doar să interoghez baza mea de cod"**<br>
`dbq dependents <id> | jq`: ce se strică dacă schimb asta? Repo-ul tău devine o bază de date interogabilă.<br>
→ [Rețete Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Îmi construiesc propriul agent"**<br>
Aceleași 11 unelte, disponibile ca definiții TypeScript tipizate sau o specificație OpenAPI 3.1 generată.<br>
→ [LangChain / OpenAPI / agenți personalizați](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Cele 11 unelte pe care le primește agentul tău

| Unealtă | Întrebarea la care răspunde |
|------|----------------------|
| `find_symbol` | "Ce nod este acest nume / fișier?" (punct de intrare) |
| `get_dependents` | "Ce se strică dacă schimb asta?" |
| `get_impact` | "Care este raza de impact a acestor modificări?" |
| `get_do_not_touch` | "Ce ar trebui să refuz să ating fără să întreb?" |
| `get_dependencies` | "De ce depinde acest cod?" |
| `find_path` | "De ce o modificare în A afectează B?" |
| `get_arch_status` | "Cât de atent ar trebui să lucrez în acest repo?" |
| `check_change` | "Această modificare încalcă o regulă a echipei?" |
| `propose_rule` | "Înregistrează un avertisment acum, sau un blocaj pentru aprobare umană" |
| `pause_own_rule` | "Pune pe pauză o regulă creată de acest token de agent" |
| `append_rule_reason` | "Adaugă o justificare, nu edita sau șterge niciodată" |

Uneltele de interogare sunt doar pentru citire, analiză pe partea de server, răspunsuri limitate: întotdeauna sigure de apelat. Cele trei unelte de reguli scriu reguli de echipă sub limite stricte: nu pot activa un blocaj, nu pot pune pe pauză regula altcuiva, nu pot rescrie motivele.

## Camera de control

- **Rule Studio**: descrie ce nu trebuie să se strice niciodată, urmărește graful găsindu-l, testează protecția live înainte de activare
- **Check**: simulator pre-editare: alege semințe, obține un verdict ok/warn/block, animă calea exactă pe care ar urma-o o defecțiune
- **Overview**: un verdict într-o singură propoziție, indicatori de stabilitate și navigabilitate AI, principalele acțiuni care ți-ar întări arhitectura
- **Graph**: scena 3D Nebula, zone protejate și căi martor luminate ca suprapuneri
- **Agents**: conectează Cursor, Claude sau CI cu un singur click, cu un demo live try-to-break

Prioritizat pentru tastatură: `cmd+K` deschide paleta de comenzi.

## Conectează-ți agentul în 30 de secunde

1. Deschide aplicația dont-break → **Agents**.
2. Autentifică-te, leagă folderul de un proiect, apasă pe **Connect Cursor**: un click generează un token limitat la proiect și completează `mcp.json`.
3. Lipește-l în Cursor (sau în clientul tău MCP).
4. Apasă pe **Install agent skill**: aceasta scrie protocolul de modificare sigură în `AGENTS.md` al repo-ului tău, astfel încât agenții să folosească uneltele fără să li se spună.

## Licență

Apache-2.0. Vezi [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) și [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
