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

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const versionSrc = readFileSync(join(here, "../src/viewer/assetVersion.ts"), "utf8");
const versionMatch = versionSrc.match(/VIEWER_ASSET_VERSION = "(\d+)"/);
const VERSION = versionMatch?.[1] ?? "4";
const nebulaDir = join(here, "../dist/nebula");
const importRe = /from\s+(['"])(\.\/?(?:wire\/[^'"]+|[^'"]+\.mjs))(?:\?v=\d+)?\1/g;
const scriptRe = /(<script[^>]+src=")(\.\/app\.mjs)(?:\?v=\d+)?(")/g;
function stampMjs(path) {
    const next = readFileSync(path, "utf8").replace(importRe, (_full, quote, mod) => `from ${quote}${mod}?v=${VERSION}${quote}`);
    writeFileSync(path, next);
}
function walk(dir) {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            walk(path);
            continue;
        }
        if (name.endsWith(".mjs"))
            stampMjs(path);
    }
}
walk(nebulaDir);
const indexPath = join(nebulaDir, "index.html");
if (statSync(indexPath).isFile()) {
    const html = readFileSync(indexPath, "utf8").replace(scriptRe, `$1$2?v=${VERSION}$3`);
    writeFileSync(indexPath, html);
}
console.log(`stamped nebula assets v=${VERSION}`);
