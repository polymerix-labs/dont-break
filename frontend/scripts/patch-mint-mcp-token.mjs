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
    "agents.signInFirst": "Sign in first: then one click creates the block you paste into your agent.",
    "agents.pickProjectFirst": "Link this folder to a project first: the agent config needs a registered project.",
    "agents.mintCta": "Connect Cursor",
    "agents.mintCta.tech": "Generate MCP token",
    "agents.mintHint": "One click, then paste the block into Cursor. That's all.",
    "agents.mintHint.tech": "Creates a project-scoped dbt_ token (Agent MCP scopes) and fills mcp.json.",
    "agents.mintOnce": "Copy it now — we won't be able to show this secret again.",
    "agents.mintOnce.tech": "Secret is returned once; revoke/rotate from the account page or Regenerate here.",
    "agents.mintNeedAuth": "Sign in first.",
    "agents.mintNeedAuth.tech": "Sign in to obtain a session JWT before calling POST /me/tokens.",
    "agents.mintNeedProject": "Link this folder to a project first.",
    "agents.mintNeedProject.tech": "Folder must map to a registered prj_ before minting.",
    "agents.regenerate": "New token",
    "agents.regenerate.tech": "Rotate / re-issue token",
    "agents.regenerateConfirm": "The old token will stop working. Continue?",
    "agents.regenerateConfirm.tech": "Previous dbt_ will be revoked. MCP clients must be updated with the new secret.",
    "agents.mintFailed": "Could not create the link. Try again.",
    "agents.mintFailed.tech": "Token creation failed (gateway error).",
    "agents.minting": "Creating…",
    "agents.minting.tech": "Minting token…",
};
const FR = {
    "agents.signInFirst": "Connecte-toi d'abord : un clic crée ensuite le bloc à coller dans ton agent.",
    "agents.pickProjectFirst": "Lie d'abord ce dossier à un projet : la config agent a besoin d'un projet enregistré.",
    "agents.mintCta": "Connecter Cursor",
    "agents.mintCta.tech": "Générer le token MCP",
    "agents.mintHint": "Un clic, puis colle le bloc dans Cursor. C'est tout.",
    "agents.mintHint.tech": "Crée un token dbt_ scopé au projet (scopes Agent MCP) et remplit mcp.json.",
    "agents.mintOnce": "Copie-le maintenant — on ne pourra plus réafficher ce secret.",
    "agents.mintOnce.tech": "Le secret n'est renvoyé qu'une fois ; révoque/rotate depuis le compte ou Régénérer ici.",
    "agents.mintNeedAuth": "Connecte-toi d'abord.",
    "agents.mintNeedAuth.tech": "Connecte-toi pour obtenir un JWT de session avant POST /me/tokens.",
    "agents.mintNeedProject": "Lie ce dossier à un projet d'abord.",
    "agents.mintNeedProject.tech": "Le dossier doit être lié à un prj_ enregistré avant le mint.",
    "agents.regenerate": "Nouveau token",
    "agents.regenerate.tech": "Rotation / réémission du token",
    "agents.regenerateConfirm": "L'ancien token arrêtera de marcher. Continuer ?",
    "agents.regenerateConfirm.tech": "Le dbt_ précédent sera révoqué. Mets à jour les clients MCP avec le nouveau secret.",
    "agents.mintFailed": "Impossible de créer le lien. Réessaie.",
    "agents.mintFailed.tech": "Échec de création du token (erreur gateway).",
    "agents.minting": "Création…",
    "agents.minting.tech": "Mint du token…",
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
const INSERT_KEYS = Object.keys(EN).filter((k) => k.startsWith("agents.mint") || k.startsWith("agents.regenerate"));
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".ts"))) {
    if (file === "en.ts")
        continue;
    const path = join(localesDir, file);
    let src = readFileSync(path, "utf8");
    const catalog = file === "fr-FR.ts" ? { ...EN, ...FR } : EN;
    for (const key of ["agents.signInFirst", "agents.pickProjectFirst"]) {
        const re = new RegExp(`  "${key}":\\s*(?:\\n\\s*)?"[^"]*",`, "m");
        if (re.test(src)) {
            src = src.replace(re, lineFor(key, catalog[key]));
        }
    }
    if (src.includes('"agents.mintCta"')) {
        writeFileSync(path, src);
        continue;
    }
    const anchor = /  "agents\.pickProjectFirst":[\s\S]*?,\n/;
    if (!anchor.test(src)) {
        console.error(`skip ${file}: no pickProjectFirst anchor`);
        continue;
    }
    const block = INSERT_KEYS.map((k) => lineFor(k, catalog[k])).join("\n") + "\n";
    src = src.replace(anchor, (match) => match + block);
    writeFileSync(path, src);
    console.log(`patched ${file}`);
}
