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
const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, "../src/i18n/locales");
const NEW_BLOCK = `
  "overview.goToAgents": "Go to Agents",
  "prompt.signInDetail.tech":
    "Run dont-break --wake in the terminal to mint a session JWT, then reload so the dashboard can reach the gateway.",
  "rules.unavailable.tech":
    "Rules proxy returned an error. Verify gateway connectivity and workspace snapshot status in Settings.",`;
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes("overview.goToAgents")) {
        console.log(`skip ${file}`);
        continue;
    }
    content = content.replace(/\n};\n\nexport default messages;/, `${NEW_BLOCK}\n};\n\nexport default messages;`);
    writeFileSync(path, content);
    console.log(`patched ${file}`);
}
