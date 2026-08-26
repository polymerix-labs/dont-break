<div align="center">

# dont-break

**Lo strato di fiducia per il codice scritto dall'IA.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · **🇮🇹 Italiano** · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: descrivi cosa non deve mai rompersi, guarda il grafo trovarlo e testare la protezione](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Gli agenti IA spediscono codice velocemente. Nessuno spedisce fiducia insieme ad esso. Ogni team che usa Cursor, Claude o bot CI condivide la stessa paura non detta: il giorno in cui una correzione rapida romperà silenziosamente l'unica cosa che non doveva mai rompersi.

`dont-break` trasforma quella paura in un contratto:

1. **Dillo con parole semplici.** "Nessuno dovrebbe poter rompere il calcolo delle fatture, nemmeno indirettamente." Nessun percorso di file, nessun codice.
2. **Guardalo essere trovato.** dont-break legge la mappa viva della tua codebase e illumina ogni luogo che porta quella logica, inclusi i percorsi di cui avevi dimenticato l'esistenza.
3. **Guardalo essere attaccato.** Scrive una regola di protezione, poi rigioca le modifiche al codice contro di essa per dimostrare che la protezione tiene davvero. Una prova a secco: nulla nel tuo codice viene toccato.
4. **Attivala.** Da quel momento, ogni modifica dell'agente viene verificata rispetto alla regola prima di entrare in vigore. Il tuo agente sente "questo è più rischioso di quanto sembri" invece che tu lo scopra in produzione.

```text
Tu:      "Rinomina PokemonService.fetchAll"
Agente:  → get_dependents(PokemonService.fetchAll)   "23 punti di chiamata in 4 moduli"
         → get_impact(files: [...])                  "raggio 3, tocca ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService è una zona di pericolo: fan-in 23, stabilità 31"
Agente:  "Questo è più rischioso di quanto sembri. Ecco i 23 punti che si romperanno,
          e un piano più sicuro in 2 passaggi."
```

Quella conversazione avviene automaticamente una volta connesso. Nessun prompt engineering: lo skill dell'agente glielo insegna.

## Installazione

Richiede **Python 3.9+** e **Node.js** (npm). L'estrattore del grafo si installa da solo al primo avvio.

```bash
pip install dont-break
dont-break --wake
```

Questo apre un'interfaccia locale su `http://127.0.0.1:4040`, nella tua lingua (32 disponibili). Accedi, scegli una cartella di progetto, e la mappa del tuo codice si costruisce da sola: un grafo 3D vivo di ogni modulo, chiamata e dipendenza, con le tue zone protette illuminate sopra.

## Scegli la tua battaglia

**"Il mio agente continua a rompere cose che non ha mai aperto"**<br>
Collega dont-break a Cursor o Claude Desktop. Il tuo agente controlla l'impatto e le zone di pericolo prima di modificare, non dopo.<br>
→ [Configura in Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Voglio che la CI blocchi i disastri, non discuta di stile"**<br>
Un job che fa fallire il merge quando una modifica colpisce una zona protetta o un nodo fragile, basato su un grafo di dipendenze reale, non su un'intuizione.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Voglio solo interrogare la mia codebase"**<br>
`dbq dependents <id> | jq`: cosa si rompe se cambio questo? Il tuo repo diventa un database interrogabile.<br>
→ [Ricette Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Sto costruendo il mio agente"**<br>
Gli stessi 11 tool, disponibili come definizioni TypeScript tipizzate o come specifica OpenAPI 3.1 generata.<br>
→ [LangChain / OpenAPI / agenti personalizzati](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## I 11 tool che ottiene il tuo agente

| Tool | La domanda a cui risponde |
|------|----------------------|
| `find_symbol` | "Quale nodo è questo nome / file?" (punto di ingresso) |
| `get_dependents` | "Cosa si rompe se cambio questo?" |
| `get_impact` | "Qual è il raggio d'impatto di queste modifiche?" |
| `get_do_not_touch` | "Cosa dovrei rifiutarmi di toccare senza chiedere?" |
| `get_dependencies` | "Da cosa dipende questo codice?" |
| `find_path` | "Perché una modifica in A influisce su B?" |
| `get_arch_status` | "Con quanta cautela dovrei lavorare in questo repo?" |
| `check_change` | "Questa modifica viola una regola del team?" |
| `propose_rule` | "Registra un avviso ora, o un blocco per l'approvazione umana" |
| `pause_own_rule` | "Metti in pausa una regola creata da questo token dell'agente" |
| `append_rule_reason` | "Aggiungi una giustificazione, mai modificare o eliminare" |

Gli strumenti di query sono di sola lettura, analisi lato server, risposte limitate: sempre sicuri da chiamare. I tre strumenti delle regole scrivono regole del team sotto limiti severi: non possono attivare un blocco, mettere in pausa la regola di qualcun altro, o riscrivere le motivazioni.

## La sala di controllo

- **Rule Studio**: descrivi cosa non deve mai rompersi, guarda il grafo trovarlo, testa la protezione dal vivo prima di attivarla
- **Check**: simulatore pre-modifica: scegli i semi, ottieni un verdetto ok/warn/block, anima il percorso esatto che una rottura seguirebbe
- **Overview**: un verdetto in una frase, letture di stabilità e navigabilità IA, le azioni principali che rafforzerebbero la tua architettura
- **Graph**: la scena 3D Nebula, zone protette e percorsi testimone illuminati come overlay
- **Agents**: collega Cursor, Claude o CI con un clic, con una demo live di try-to-break

Orientato alla tastiera: `cmd+K` apre la command palette.

## Collega il tuo agente in 30 secondi

1. Apri l'app dont-break → **Agents**.
2. Accedi, collega la cartella a un progetto, clicca **Connect Cursor**: un clic genera un token con ambito di progetto e compila `mcp.json`.
3. Incollalo in Cursor (o nel tuo client MCP).
4. Clicca **Install agent skill**: scrive il protocollo di modifica sicura nel file `AGENTS.md` del tuo repo, così gli agenti usano gli strumenti senza doverlo dire.

## Licenza

Apache-2.0. Vedi [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) e [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
