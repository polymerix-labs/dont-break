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

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
const BUDGET_BYTES = 300 * 1024;
const LOCALE_CHUNK = /^[a-z]{2,3}-[A-Z]{2}-[\w-]+\.js$/;
const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(here, "../dist/assets");
let entryGz = 0;
let largestLocaleGz = 0;
for (const name of readdirSync(assetsDir)) {
    if (!name.endsWith(".js"))
        continue;
    const gz = gzipSync(readFileSync(join(assetsDir, name))).length;
    if (LOCALE_CHUNK.test(name)) {
        largestLocaleGz = Math.max(largestLocaleGz, gz);
    }
    else {
        entryGz += gz;
    }
}
const totalGz = entryGz + largestLocaleGz;
const kb = (totalGz / 1024).toFixed(1);
const entryKb = (entryGz / 1024).toFixed(1);
const localeKb = (largestLocaleGz / 1024).toFixed(1);
if (totalGz > BUDGET_BYTES) {
    console.error(`bundle budget exceeded: ${kb} KB gz > 300 KB gz (entry ${entryKb} + largest locale ${localeKb})`);
    process.exit(1);
}
console.log(`bundle budget ok: ${kb} KB gz (entry ${entryKb} + largest locale ${localeKb}, limit 300 KB)`);
