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
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const localesDir = join(dirname(fileURLToPath(import.meta.url)), "../src/i18n/locales");
const KEYS = {
    "rules.openStudio": "Create by prompt",
    "studio.title": "Rule Studio",
    "studio.subtitle": "Say what must never break; watch the graph find and test the protection.",
    "studio.backToRules": "Back to rules",
    "studio.promptLabel": "What should never break?",
    "studio.promptPlaceholder": "Nobody should be able to break invoice calculation, even indirectly.",
    "studio.promptHint": "Plain words work best: name the business capability, not files or code.",
    "studio.start": "Analyze",
    "studio.running": "Analyzing",
    "studio.traceTitle": "Reasoning trace",
    "studio.emptyTraceTitle": "Nothing analyzed yet",
    "studio.emptyTraceDetail": "Describe what to protect above and press Analyze. Every step of the reasoning appears here and lights up on the graph.",
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes('"studio.title"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const block = Object.entries(KEYS)
        .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`)
        .join("");
    if (content.includes('"rules.zoneLoadFailed"')) {
        content = content.replace(/(  "rules\.zoneLoadFailed": [^\n]*\n)/, `$1${block}`);
    }
    else {
        content = content.replace(/\n};\n\nexport default messages;/, `\n${block}};\n\nexport default messages;`);
    }
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
