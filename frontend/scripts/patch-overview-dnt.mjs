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
    "overview.noDangerTitle": "Nothing looks dangerous yet",
    "overview.noDanger": "Good sign. Connect your agent and try to break a protected node.",
    "overview.goToAgents": "Go to Agents",
    "overview.goToAgents.tech": "Open Agents setup",
    "overview.protected": "protected",
    "overview.pinned": "pinned",
    "overview.noDangerTitle.tech": "No do-not-touch entries",
    "overview.noDanger.tech": "No high fan-in / low-stability nodes and no active pin/protect rules. Arm the Agents demo to see a real block verdict.",
};
const FR = {
    "overview.noDangerTitle": "Rien ne semble dangereux pour l'instant",
    "overview.noDanger": "Bon signe. Connecte ton agent et essaie de casser un nœud protégé.",
    "overview.goToAgents": "Aller aux Agents",
    "overview.goToAgents.tech": "Ouvrir la config Agents",
    "overview.protected": "protégé",
    "overview.pinned": "épinglé",
    "overview.noDangerTitle.tech": "Aucune entrée do-not-touch",
    "overview.noDanger.tech": "Aucun nœud high fan-in / low-stability ni règle pin/protect active. Lance la démo Agents pour voir un vrai block.",
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
function setKey(src, key, value) {
    const re = new RegExp(`  "${key.replace(/\./g, "\\.")}":\\s*(?:\\n\\s*)?"[^"]*",`, "m");
    if (re.test(src))
        return src.replace(re, lineFor(key, value));
    return null;
}
function insertAfter(src, afterKey, key, value) {
    const anchor = new RegExp(`  "${afterKey.replace(/\./g, "\\.")}":[\\s\\S]*?,\\n`);
    if (!anchor.test(src))
        throw new Error(`missing anchor ${afterKey}`);
    return src.replace(anchor, (match) => `${match}${lineFor(key, value)}\n`);
}
const ORDER = [
    ["overview.doNotTouch", "overview.noDangerTitle"],
    ["overview.noDangerTitle", "overview.noDanger"],
    ["overview.noDanger", "overview.goToAgents"],
    ["overview.goToAgents", "overview.goToAgents.tech"],
    ["overview.derived", "overview.protected"],
    ["overview.protected", "overview.pinned"],
    ["overview.noDanger.tech", "overview.noDangerTitle.tech"],
];
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".ts"))) {
    if (file === "en.ts")
        continue;
    const path = join(localesDir, file);
    let src = readFileSync(path, "utf8");
    const catalog = file === "fr-FR.ts" ? { ...EN, ...FR } : EN;
    for (const [after, key] of ORDER) {
        const value = catalog[key];
        const updated = setKey(src, key, value);
        if (updated) {
            src = updated;
            continue;
        }
        if (key === "overview.noDangerTitle.tech" && !src.includes('"overview.noDanger.tech"')) {
            src = insertAfter(src, "overview.pinned", key, value);
            continue;
        }
        src = insertAfter(src, after, key, value);
    }
    const techUpdated = setKey(src, "overview.noDanger.tech", catalog["overview.noDanger.tech"]);
    if (techUpdated) {
        src = techUpdated;
    }
    else if (!src.includes('"overview.noDanger.tech"')) {
        src = insertAfter(src, "overview.pinned", "overview.noDanger.tech", catalog["overview.noDanger.tech"]);
    }
    writeFileSync(path, src);
    console.log(`patched ${file}`);
}
