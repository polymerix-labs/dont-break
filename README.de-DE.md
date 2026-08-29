<div align="center">

# dont-break

**Die Vertrauensschicht für KI-geschriebenen Code.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · **🇩🇪 Deutsch** · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: beschreibe, was niemals kaputtgehen darf, sieh zu, wie der Graph es findet und den Schutz testet](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

KI-Agenten liefern Code schnell. Niemand liefert Vertrauen mit. Jedes Team, das Cursor, Claude oder CI-Bots einsetzt, teilt dieselbe unausgesprochene Angst: der Tag, an dem ein schneller Fix still das eine kaputt macht, das nie kaputtgehen durfte.

`dont-break` macht aus dieser Angst einen Vertrag:

1. **Sag es in einfachen Worten.** "Niemand darf die Rechnungsberechnung kaputt machen, nicht einmal indirekt." Keine Dateipfade, kein Code.
2. **Sieh zu, wie es gefunden wird.** dont-break liest die lebendige Karte deiner Codebasis und beleuchtet jede Stelle, die diese Logik trägt, einschließlich der Pfade, von denen du vergessen hattest, dass sie existieren.
3. **Sieh zu, wie es angegriffen wird.** Es schreibt eine Schutzregel und spielt dann Codeänderungen dagegen ab, um zu beweisen, dass der Schutz wirklich hält. Ein Probelauf: nichts an deinem Code wird angefasst.
4. **Aktiviere es.** Von da an wird jede Agenten-Änderung gegen die Regel geprüft, bevor sie landet. Dein Agent bekommt gesagt "das ist riskanter, als es aussieht", statt dass du es in Produktion herausfindest.

```text
Du:     "Benenne PokemonService.fetchAll um"
Agent:  → get_dependents(PokemonService.fetchAll)   "23 Aufrufstellen über 4 Module"
        → get_impact(files: [...])                  "Radius 3, betrifft ui/, cache/, api/"
        → get_do_not_touch()                        "PokemonService ist eine Gefahrenzone: fan-in 23, Stabilität 31"
Agent:  "Das ist riskanter, als es aussieht. Hier sind die 23 Stellen, die kaputtgehen,
         und ein sichererer Plan in 2 Schritten."
```

Dieses Gespräch findet automatisch statt, sobald verbunden. Kein Prompt Engineering: der Agent-Skill lehrt es.

## Sprachen und Fähigkeiten

Welche Sprachen dont-break kartiert, und was jede wirklich kann, steht auf **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Installation

Erfordert **Python 3.9+** und **Node.js** (npm). Der Graph-Extraktor installiert sich beim ersten Start selbst.

```bash
pip install dont-break
dont-break --wake
```

Das öffnet eine lokale UI unter `http://127.0.0.1:4040`, in deiner Sprache (32 verfügbar). Melde dich an, wähle einen Projektordner, und die Karte deines Codes baut sich von selbst auf: ein lebendiger 3D-Graph jedes Moduls, Aufrufs und Abhängigkeit, mit deinen geschützten Zonen obenauf beleuchtet.

## Wähle deinen Kampf

**"Mein Agent macht ständig Dinge kaputt, die er nie geöffnet hat"**<br>
Verbinde dont-break mit Cursor oder Claude Desktop. Dein Agent prüft Auswirkung und Gefahrenzonen vor der Bearbeitung, nicht danach.<br>
→ [Einrichtung in Cursor / Claude (2 Min.)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Ich will, dass CI Katastrophen blockiert, nicht über Stil diskutiert"**<br>
Ein Job, der den Merge scheitern lässt, wenn eine Änderung eine geschützte Zone oder einen fragilen Knoten trifft, gestützt auf den echten Abhängigkeitsgraphen, nicht auf Bauchgefühl.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit-Hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Ich will nur meine Codebasis befragen"**<br>
`dbq dependents <id> | jq`: Was geht kaputt, wenn ich das ändere? Dein Repo wird zu einer abfragbaren Datenbank.<br>
→ [Shell + jq-Rezepte](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Ich baue meinen eigenen Agenten"**<br>
Dieselben 11 Tools, verfügbar als typisierte TypeScript-Definitionen oder eine generierte OpenAPI-3.1-Spezifikation.<br>
→ [LangChain / OpenAPI / eigene Agenten](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Die 11 Tools, die dein Agent bekommt

| Tool | Die Frage, die es klärt |
|------|----------------------|
| `find_symbol` | "Welcher Knoten ist dieser Name / diese Datei?" (Einstiegspunkt) |
| `get_dependents` | "Was geht kaputt, wenn ich das ändere?" |
| `get_impact` | "Wie groß ist der Wirkungsradius dieser Änderungen?" |
| `get_do_not_touch` | "Was sollte ich ohne Nachfrage nicht anfassen?" |
| `get_dependencies` | "Wovon hängt dieser Code ab?" |
| `find_path` | "Warum wirkt sich eine Änderung an A auf B aus?" |
| `get_arch_status` | "Wie vorsichtig sollte ich in diesem Repo arbeiten?" |
| `check_change` | "Verletzt diese Änderung eine Teamregel?" |
| `propose_rule` | "Jetzt eine Warnung erfassen, oder eine Blockade zur menschlichen Freigabe" |
| `pause_own_rule` | "Eine Regel pausieren, die dieses Agenten-Token erstellt hat" |
| `append_rule_reason` | "Eine Begründung hinzufügen, nie bearbeiten oder löschen" |

Abfrage-Tools sind schreibgeschützt, serverseitige Analyse, begrenzte Antworten: immer sicher aufzurufen. Die drei Regel-Tools schreiben Teamregeln unter engen Grenzen: sie können keine Blockade aktivieren, die Regel eines anderen pausieren oder Begründungen umschreiben.

## Der Kontrollraum

- **Rule Studio**: beschreibe, was niemals kaputtgehen darf, sieh zu, wie der Graph es findet, teste den Schutz live vor der Aktivierung
- **Check**: Simulator vor der Bearbeitung: wähle Startpunkte, erhalte ein ok/warn/block-Urteil, animiere den genauen Pfad, den ein Bruch nehmen würde
- **Overview**: ein Urteil in einem Satz, Stabilitäts- und KI-Navigierbarkeitswerte, die wichtigsten Maßnahmen zur Stärkung deiner Architektur
- **Graph**: die 3D-Nebula-Szene, geschützte Zonen und Zeugenpfade als Overlays beleuchtet
- **Agents**: verbinde Cursor, Claude oder CI mit einem Klick, mit einer Live-Demo zum Versuch-zu-brechen

Tastaturzentriert: `cmd+K` öffnet die Befehlspalette.

## Verbinde deinen Agenten in 30 Sekunden

1. Öffne die dont-break-App → **Agents**.
2. Melde dich an, verknüpfe den Ordner mit einem Projekt, klicke **Connect Cursor**: ein Klick erstellt ein projektgebundenes Token und füllt `mcp.json`.
3. Füge es in Cursor (oder deinen MCP-Client) ein.
4. Klicke **Install agent skill**: es schreibt das Sichere-Änderungs-Protokoll in die `AGENTS.md` deines Repos, sodass Agenten die Tools nutzen, ohne dass es ihnen gesagt werden muss.

## Lizenz

Apache-2.0. Siehe [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) und [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
