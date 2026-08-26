<div align="center">

# dont-break

**La couche de confiance du code écrit par IA.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · **🇫🇷 Français** · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio : dites ce qui ne doit jamais casser, regardez le graphe trouver et tester la protection](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Les agents IA livrent du code vite. Personne ne livre la confiance avec. Toutes les équipes qui utilisent Cursor, Claude ou des bots CI partagent la même crainte : le jour où un correctif rapide casse silencieusement la seule chose qui ne devait jamais casser.

`dont-break` transforme cette crainte en contrat :

1. **Dites-le avec des mots simples.** « Personne ne doit pouvoir casser le calcul des factures, même indirectement. » Pas de chemins de fichiers, pas de code.
2. **Regardez-le être trouvé.** dont-break lit la carte vivante de votre code et illumine chaque endroit qui porte cette logique, y compris les chemins que vous aviez oubliés.
3. **Regardez-le être attaqué.** Il écrit une règle de protection, puis rejoue des changements de code contre elle pour prouver qu'elle tient vraiment. Un test à blanc : rien dans votre code n'est modifié.
4. **Activez-la.** Ensuite, chaque édition d'agent est vérifiée contre la règle avant d'atterrir. Votre agent s'entend dire « c'est plus risqué qu'il n'y paraît » au lieu que vous le découvriez en prod.

```text
Vous :   « Renomme PokemonService.fetchAll »
Agent :  → get_dependents(PokemonService.fetchAll)   « 23 appels dans 4 modules »
         → get_impact(files: [...])                  « rayon 3, touche ui/, cache/, api/ »
         → get_do_not_touch()                        « PokemonService est une zone dangereuse : fan-in 23, stabilité 31 »
Agent :  « C'est plus risqué qu'il n'y paraît. Voici les 23 endroits qui cassent,
           et un plan plus sûr en 2 étapes. »
```

Cette conversation se produit automatiquement une fois connecté. Aucun prompt engineering : le skill d'agent l'enseigne.

## Installation

Nécessite **Python 3.9+** et **Node.js** (npm). L'extracteur de graphe s'installe tout seul au premier lancement.

```bash
pip install dont-break
dont-break --wake
```

Une interface locale s'ouvre sur `http://127.0.0.1:4040`, dans votre langue (32 disponibles). Connectez-vous, choisissez un dossier projet, et la carte de votre code se construit toute seule : un graphe 3D vivant de chaque module, appel et dépendance, avec vos zones protégées illuminées par-dessus.

## Choisissez votre combat

**« Mon agent casse sans arrêt des choses qu'il n'a jamais ouvertes »**<br>
Branchez dont-break dans Cursor ou Claude Desktop. Votre agent vérifie l'impact et les zones dangereuses avant d'éditer, pas après.<br>
→ [Configuration Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**« Je veux une CI qui bloque les désastres, pas qui discute du style »**<br>
Un seul job qui fait échouer le merge quand un changement touche une zone protégée ou un module fragile, fondé sur le vrai graphe de dépendances.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**« Je veux juste interroger mon code »**<br>
`dbq dependents <id> | jq` : qui casse si je change ça ? Votre repo devient une base de données interrogeable.<br>
→ [Recettes shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**« Je construis mon propre agent »**<br>
Les mêmes 11 outils, exposés en définitions TypeScript typées ou en spec OpenAPI 3.1 générée.<br>
→ [LangChain / OpenAPI / agents maison](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Les 11 outils de votre agent

| Outil | La question qu'il élimine |
|-------|---------------------------|
| `find_symbol` | « Quel nœud correspond à ce nom / fichier ? » (point d'entrée) |
| `get_dependents` | « Qui casse si je change ça ? » |
| `get_impact` | « Quel est le rayon d'impact de ces modifications ? » |
| `get_do_not_touch` | « Que dois-je refuser de toucher sans demander ? » |
| `get_dependencies` | « De quoi ce code dépend-il ? » |
| `find_path` | « Pourquoi changer A affecte B ? » |
| `get_arch_status` | « Avec quelle prudence travailler dans ce repo ? » |
| `check_change` | « Cette modification viole-t-elle une règle d'équipe ? » |
| `propose_rule` | « Enregistrer un warn maintenant, ou un block à faire approuver » |
| `pause_own_rule` | « Suspendre une règle créée par ce token d'agent » |
| `append_rule_reason` | « Ajouter une justification, jamais modifier ni supprimer » |

Les outils de requête sont en lecture seule, analyse côté serveur, réponses plafonnées : toujours sûrs à appeler. Les trois outils de règles écrivent des règles d'équipe sous limites strictes : ils ne peuvent pas activer un block, suspendre la règle de quelqu'un d'autre, ni réécrire des justifications.

## La salle de contrôle

- **Rule Studio** : décrivez ce qui ne doit jamais casser, regardez le graphe le trouver, testez la protection en direct avant de l'activer
- **Check** : simulateur pré-édition : choisissez des points de départ, obtenez un verdict ok/warn/block, animez le chemin exact qu'une casse emprunterait
- **Overview** : un verdict en une phrase, stabilité et navigabilité IA, les actions prioritaires pour durcir votre architecture
- **Graph** : la scène 3D Nebula, zones protégées et chemins témoins illuminés en surcouche
- **Agents** : connectez Cursor, Claude ou la CI en un clic, avec une démo « essayez de casser » en direct

Piloté au clavier : `cmd+K` ouvre la palette de commandes.

## Connectez votre agent en 30 secondes

1. Ouvrez l'app dont-break → **Agents**.
2. Connectez-vous, liez le dossier à un projet, cliquez **Connect Cursor** : un clic génère un token limité au projet et remplit `mcp.json`.
3. Collez dans Cursor (ou votre client MCP).
4. Cliquez **Install agent skill** : le protocole de modification sûre s'écrit dans l'`AGENTS.md` de votre repo, et les agents utilisent les outils sans qu'on le leur dise.

## Licence

Apache-2.0. Voir [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) et [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
