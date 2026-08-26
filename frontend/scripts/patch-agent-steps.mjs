/**
 * Copyright 2026 Polymerix
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const localesDir = join(dirname(fileURLToPath(import.meta.url)), "../src/i18n/locales");
const EN = {
    "agents.pickAgentHint": "Pick your agent first; the steps below adapt to it.",
    "agents.changeAgent": "Change agent",
    "agents.connectAgent": "Connect {name}",
    "agents.connectAgent.tech": "Generate MCP token for {name}",
    "agents.stepCreateToken": "Create the access token",
    "agents.stepCreateToken.tech": "Mint the project-scoped dbt_ token",
    "agents.stepAddConfig": "Add the config to {name}",
    "agents.stepAddConfigCli": "Add these variables to your pipeline",
    "agents.stepTryIt": "Try it with your agent",
};
const FR = {
    "agents.pickAgentHint": "Choisis d'abord ton agent ; les étapes s'adaptent ensuite.",
    "agents.changeAgent": "Changer d'agent",
    "agents.connectAgent": "Connecter {name}",
    "agents.connectAgent.tech": "Générer le token MCP pour {name}",
    "agents.stepCreateToken": "Crée le token d'accès",
    "agents.stepCreateToken.tech": "Mint du token dbt_ scopé au projet",
    "agents.stepAddConfig": "Ajoute la config dans {name}",
    "agents.stepAddConfigCli": "Ajoute ces variables à ta pipeline",
    "agents.stepTryIt": "Essaie avec ton agent",
};
function esc(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function lineFor(key, value) {
    if (value.length > 70 || value.includes("\n")) {
        return `  "${key}":\n    "${esc(value)}",`;
    }
    return `  "${key}": "${esc(value)}",`;
}
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".ts"))) {
    if (file === "en.ts")
        continue;
    const path = join(localesDir, file);
    let src = readFileSync(path, "utf8");
    if (src.includes('"agents.pickAgentHint"'))
        continue;
    const catalog = file === "fr-FR.ts" ? { ...EN, ...FR } : EN;
    const anchor = /  "agents\.pickAgent":[\s\S]*?,\n/;
    if (!anchor.test(src)) {
        console.error(`skip ${file}: no pickAgent anchor`);
        continue;
    }
    const block = Object.keys(EN).map((k) => lineFor(k, catalog[k])).join("\n") + "\n";
    src = src.replace(anchor, (match) => match + block);
    writeFileSync(path, src);
    console.log(`patched ${file}`);
}
