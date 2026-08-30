<div align="center">

# dont-break

**La capa de confianza para el código escrito por IA.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · **🇪🇸 Español** · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: describe lo que nunca debe romperse, mira al grafo encontrarlo y probar la protección](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Los agentes de IA envían código rápido. Nadie envía confianza con él. Todo equipo que usa Cursor, Claude o bots de CI comparte el mismo miedo no dicho: el día en que un arreglo rápido rompe en silencio lo único que nunca debía romperse.

`dont-break` convierte ese miedo en un contrato:

1. **Dilo con palabras simples.** "Nadie debería poder romper el cálculo de facturas, ni siquiera indirectamente." Sin rutas de archivo, sin código.
2. **Míralo ser encontrado.** dont-break lee el mapa vivo de tu base de código e ilumina cada lugar que lleva esa lógica, incluidas las rutas que habías olvidado que existían.
3. **Míralo ser atacado.** Escribe una regla de protección y luego repite cambios de código contra ella para probar que la protección realmente aguanta. Una prueba en seco: nada en tu código se toca.
4. **Actívala.** A partir de ahí, cada edición de agente se verifica contra la regla antes de aplicarse. Tu agente escucha "esto es más arriesgado de lo que parece" en lugar de que lo descubras en producción.

```text
Tú:      "Renombra PokemonService.fetchAll"
Agente:  → get_dependents(PokemonService.fetchAll)   "23 puntos de llamada en 4 módulos"
         → get_impact(files: [...])                  "radio 3, afecta ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService es una zona peligrosa: fan-in 23, estabilidad 31"
Agente:  "Esto es más arriesgado de lo que parece. Aquí están los 23 lugares que se romperán,
          y un plan más seguro en 2 pasos."
```

Esa conversación ocurre automáticamente una vez conectado. Sin ingeniería de prompts: el skill del agente se lo enseña.

## Lenguajes y capacidades

Los lenguajes que dont-break mapea, y lo que cada uno sabe hacer de verdad, están en **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Instalación

Requiere **Python 3.9+** y **Node.js** (npm). El extractor de grafos se instala solo en el primer arranque.

```bash
pip install dont-break
dont-break --wake
```

Eso abre una interfaz local en `http://127.0.0.1:4040`, en tu idioma (32 disponibles). Inicia sesión, elige una carpeta de proyecto, y el mapa de tu código se construye solo: un grafo 3D vivo de cada módulo, llamada y dependencia, con tus zonas protegidas iluminadas encima.

## Elige tu batalla

**"Mi agente sigue rompiendo cosas que nunca abrió"**<br>
Conecta dont-break a Cursor o Claude Desktop. Tu agente verifica impacto y zonas peligrosas antes de editar, no después.<br>
→ [Configurar en Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Quiero que CI bloquee desastres, no que discuta sobre estilo"**<br>
Un job que hace fallar el merge cuando un cambio golpea una zona protegida o un nodo frágil, basado en el grafo de dependencias real, no en corazonadas.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Solo quiero interrogar mi base de código"**<br>
`dbq dependents <id> | jq`: ¿qué se rompe si cambio esto? Tu repo se convierte en una base de datos consultable.<br>
→ [Recetas Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Estoy construyendo mi propio agente"**<br>
Las mismas 11 herramientas, expuestas como definiciones TypeScript tipadas o una especificación OpenAPI 3.1 generada.<br>
→ [LangChain / OpenAPI / agentes propios](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Las 11 herramientas que obtiene tu agente

| Herramienta | La pregunta que resuelve |
|------|----------------------|
| `find_symbol` | "¿Qué nodo es este nombre / archivo?" (punto de entrada) |
| `get_dependents` | "¿Qué se rompe si cambio esto?" |
| `get_impact` | "¿Cuál es el radio de impacto de estos cambios?" |
| `get_do_not_touch` | "¿Qué debería negarme a tocar sin preguntar?" |
| `get_dependencies` | "¿De qué depende este código?" |
| `find_path` | "¿Por qué un cambio en A afecta a B?" |
| `get_arch_status` | "¿Con qué cuidado debería trabajar en este repo?" |
| `check_change` | "¿Este cambio viola una regla del equipo?" |
| `propose_rule` | "Registrar una advertencia ahora, o un bloqueo para aprobación humana" |
| `pause_own_rule` | "Pausar una regla que creó este token de agente" |
| `append_rule_reason` | "Añadir una justificación, nunca editar ni borrar" |

Las herramientas de consulta son de solo lectura, análisis del lado del servidor, respuestas limitadas: siempre seguras de llamar. Las tres herramientas de reglas escriben reglas de equipo bajo límites estrictos: no pueden activar un bloqueo, pausar la regla de otro, ni reescribir razones.

## La sala de control

- **Rule Studio**: describe lo que nunca debe romperse, mira al grafo encontrarlo, prueba la protección en vivo antes de activarla
- **Check**: simulador previo a la edición: elige semillas, obtén un veredicto ok/warn/block, anima la ruta exacta que tomaría una rotura
- **Overview**: un veredicto en una frase, indicadores de estabilidad y navegabilidad por IA, las principales acciones que reforzarían tu arquitectura
- **Graph**: la escena 3D Nebula, zonas protegidas y rutas testigo iluminadas como superposiciones
- **Agents**: conecta Cursor, Claude o CI con un clic, con una demo en vivo de intentar romper

Centrado en teclado: `cmd+K` abre la paleta de comandos.

## Conecta tu agente en 30 segundos

1. Abre la app dont-break → **Agents**.
2. Inicia sesión, vincula la carpeta a un proyecto, haz clic en **Connect Cursor**: un clic genera un token limitado al proyecto y rellena `mcp.json`.
3. Pégalo en Cursor (o tu cliente MCP).
4. Haz clic en **Install agent skill**: escribe el protocolo de cambio seguro en el `AGENTS.md` de tu repo, para que los agentes usen las herramientas sin que se les diga.

## Licencia

Apache-2.0. Consulta [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) y [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
