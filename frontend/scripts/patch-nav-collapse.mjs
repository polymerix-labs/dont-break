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
const WORDS = {
    "fr-FR": ["Replier", "Déplier"],
    "de-DE": ["Einklappen", "Ausklappen"],
    "es-ES": ["Contraer", "Expandir"],
    "it-IT": ["Comprimi", "Espandi"],
    "pt-BR": ["Recolher", "Expandir"],
    "nl-NL": ["Inklappen", "Uitklappen"],
    "ja-JP": ["折りたたむ", "展開する"],
    "ko-KR": ["접기", "펼치기"],
    "zh-CN": ["收起", "展开"],
    "zh-TW": ["收合", "展開"],
    "ru-RU": ["Свернуть", "Развернуть"],
    "uk-UA": ["Згорнути", "Розгорнути"],
    "pl-PL": ["Zwiń", "Rozwiń"],
    "tr-TR": ["Daralt", "Genişlet"],
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes('"nav.collapse"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const [collapse, expand] = WORDS[code] ?? ["Collapse", "Expand"];
    const block = `  "nav.collapse": ${JSON.stringify(collapse)},\n  "nav.expand": ${JSON.stringify(expand)},\n`;
    content = content.replace(/\n};\n\nexport default messages;/, `\n${block}};\n\nexport default messages;`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
