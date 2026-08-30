<div align="center">

# dont-break

**A camada de confiança para código escrito por IA.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · **🇧🇷 Português (Brasil)** · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: descreva o que nunca deve quebrar, veja o grafo encontrar isso e testar a proteção](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Agentes de IA entregam código rápido. Ninguém entrega confiança junto. Toda equipe que usa Cursor, Claude ou bots de CI compartilha o mesmo medo não dito: o dia em que uma correção rápida vai silenciosamente quebrar a única coisa que nunca deveria quebrar.

O `dont-break` transforma esse medo em um contrato:

1. **Diga em palavras simples.** "Ninguém deveria conseguir quebrar o cálculo de faturas, nem mesmo indiretamente." Sem caminhos de arquivo, sem código.
2. **Veja isso ser encontrado.** O dont-break lê o mapa vivo da sua base de código e ilumina cada lugar que carrega essa lógica, incluindo caminhos que você tinha esquecido que existiam.
3. **Veja isso ser atacado.** Ele escreve uma regra de proteção e depois reproduz mudanças de código contra ela para provar que a proteção realmente se sustenta. Um ensaio: nada no seu código é tocado.
4. **Ative-a.** A partir daí, cada edição de agente é verificada contra a regra antes de entrar em vigor. Seu agente ouve "isso é mais arriscado do que parece" em vez de você descobrir isso em produção.

```text
Você:    "Renomeie PokemonService.fetchAll"
Agente:  → get_dependents(PokemonService.fetchAll)   "23 pontos de chamada em 4 módulos"
         → get_impact(files: [...])                  "raio 3, afeta ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService é uma zona de perigo: fan-in 23, estabilidade 31"
Agente:  "Isso é mais arriscado do que parece. Aqui estão os 23 lugares que vão quebrar,
          e um plano mais seguro em 2 passos."
```

Essa conversa acontece automaticamente assim que você se conecta. Sem engenharia de prompt: a skill do agente ensina isso.

## Linguagens e capacidades

As linguagens que o dont-break mapeia, e o que cada uma realmente faz, estão em **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Instalação

Requer **Python 3.9+** e **Node.js** (npm). O extrator de grafo se instala sozinho na primeira execução.

```bash
pip install dont-break
dont-break --wake
```

Isso abre uma interface local em `http://127.0.0.1:4040`, no seu próprio idioma (32 disponíveis). Faça login, escolha uma pasta de projeto, e o mapa do seu código se constrói sozinho: um grafo 3D vivo de cada módulo, chamada e dependência, com suas zonas protegidas iluminadas por cima.

## Escolha sua batalha

**"Meu agente continua quebrando coisas que ele nunca abriu"**<br>
Conecte o dont-break ao Cursor ou Claude Desktop. Seu agente verifica impacto e zonas de perigo antes de editar, não depois.<br>
→ [Configurar no Cursor / Claude (2 min)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Quero que o CI bloqueie desastres, não discuta sobre estilo"**<br>
Um job que falha o merge quando uma mudança atinge uma zona protegida ou um nó frágil, baseado em um grafo de dependências real, não em intuição.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [hook pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Só quero consultar minha base de código"**<br>
`dbq dependents <id> | jq`: o que quebra se eu mudar isso? Seu repositório vira um banco de dados consultável.<br>
→ [Receitas de Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Estou construindo meu próprio agente"**<br>
As mesmas 11 ferramentas, disponíveis como definições TypeScript tipadas ou uma especificação OpenAPI 3.1 gerada.<br>
→ [LangChain / OpenAPI / agentes personalizados](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## As 11 ferramentas que seu agente recebe

| Ferramenta | A pergunta que ela resolve |
|------|----------------------|
| `find_symbol` | "Qual nó é este nome / arquivo?" (ponto de entrada) |
| `get_dependents` | "O que quebra se eu mudar isso?" |
| `get_impact` | "Qual é o raio de impacto dessas mudanças?" |
| `get_do_not_touch` | "No que eu deveria me recusar a mexer sem perguntar?" |
| `get_dependencies` | "Do que esse código depende?" |
| `find_path` | "Por que uma mudança em A afeta B?" |
| `get_arch_status` | "Com que cuidado eu deveria trabalhar nesse repositório?" |
| `check_change` | "Essa mudança viola uma regra da equipe?" |
| `propose_rule` | "Registrar um aviso agora, ou um bloqueio para aprovação humana" |
| `pause_own_rule` | "Pausar uma regra criada por este token de agente" |
| `append_rule_reason` | "Adicionar uma justificativa, nunca editar ou excluir" |

As ferramentas de consulta são somente leitura, análise no lado do servidor, respostas limitadas: sempre seguras de chamar. As três ferramentas de regras escrevem regras da equipe sob limites rígidos: elas não podem ativar um bloqueio, pausar a regra de outra pessoa, ou reescrever motivos.

## A sala de controle

- **Rule Studio**: descreva o que nunca deve quebrar, veja o grafo encontrar isso, teste a proteção ao vivo antes de ativá-la
- **Check**: simulador pré-edição: escolha sementes, obtenha um veredito ok/warn/block, anime o caminho exato que uma quebra seguiria
- **Overview**: um veredito em uma frase, indicadores de estabilidade e navegabilidade por IA, as principais ações que fortaleceriam sua arquitetura
- **Graph**: a cena 3D Nebula, zonas protegidas e caminhos testemunha iluminados como sobreposições
- **Agents**: conecte Cursor, Claude ou CI com um clique, com uma demo de try-to-break ao vivo

Prioriza teclado: `cmd+K` abre a paleta de comandos.

## Conecte seu agente em 30 segundos

1. Abra o app dont-break → **Agents**.
2. Faça login, vincule a pasta a um projeto, clique em **Connect Cursor**: um clique gera um token com escopo de projeto e preenche o `mcp.json`.
3. Cole no Cursor (ou no seu cliente MCP).
4. Clique em **Install agent skill**: isso grava o protocolo de mudança segura no `AGENTS.md` do seu repositório, para que os agentes usem as ferramentas sem precisar ser instruídos.

## Licença

Apache-2.0. Veja [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) e [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
