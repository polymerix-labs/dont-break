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

import { cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "../shared/wire");
const destDir = join(here, "../public/nebula/wire");
function copyRecursive(from, to) {
    mkdirSync(to, { recursive: true });
    for (const name of readdirSync(from)) {
        const srcPath = join(from, name);
        const destPath = join(to, name);
        if (statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
        }
        else if (name.endsWith(".mjs")) {
            cpSync(srcPath, destPath);
        }
    }
}
copyRecursive(srcDir, destDir);
console.log("copied shared/wire -> public/nebula/wire");
