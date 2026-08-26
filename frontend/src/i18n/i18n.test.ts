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

import { en } from "./locales/en";
import { CATALOG_LOADERS, LOCALES, setVoice, translate } from "./index";
let failures = 0;
function check(name: string, cond: boolean) {
    if (cond) {
        console.log(`ok ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL ${name}`);
    }
}
function placeholders(template: string): string[] {
    return [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}
const enKeys = Object.keys(en).sort();
async function main() {
    check("catalog loaders cover every locale", LOCALES.every((l) => l.code in CATALOG_LOADERS));
    for (const { code } of LOCALES) {
        const catalog = await CATALOG_LOADERS[code]();
        const keys = Object.keys(catalog).sort();
        const missing = enKeys.filter((k) => !keys.includes(k));
        const extra = keys.filter((k) => !enKeys.includes(k));
        check(`${code} has exactly the en keys`, missing.length === 0 && extra.length === 0);
        if (missing.length > 0)
            console.error(`  missing: ${missing.join(", ")}`);
        if (extra.length > 0)
            console.error(`  extra: ${extra.join(", ")}`);
        const empty = keys.filter((k) => !(catalog as Record<string, string>)[k]?.trim());
        check(`${code} has no empty values`, empty.length === 0);
        if (empty.length > 0)
            console.error(`  empty: ${empty.join(", ")}`);
        const brokenPlaceholders = enKeys.filter((k) => {
            const wanted = placeholders(en[k as keyof typeof en]);
            if (wanted.length === 0)
                return false;
            const got = placeholders((catalog as Record<string, string>)[k] ?? "");
            return wanted.join(",") !== got.join(",");
        });
        check(`${code} preserves placeholders`, brokenPlaceholders.length === 0);
        if (brokenPlaceholders.length > 0) {
            console.error(`  placeholders broken in: ${brokenPlaceholders.join(", ")}`);
        }
    }
    const techKeys = enKeys.filter((k) => k.endsWith(".tech"));
    const orphanTech = techKeys.filter((k) => !enKeys.includes(k.slice(0, -".tech".length)));
    check("every .tech variant has a base key", orphanTech.length === 0);
    if (orphanTech.length > 0)
        console.error(`  orphans: ${orphanTech.join(", ")}`);
    check("there are .tech variants to test", techKeys.length > 0);
    check("simple voice resolves the base key", translate("editor.newDescription") === en["editor.newDescription"]);
    setVoice("technical");
    check("technical voice resolves the .tech variant", translate("editor.newDescription") === en["editor.newDescription.tech"]);
    check("technical voice falls back to base for keys without a variant", translate("common.cancel") === en["common.cancel"]);
    setVoice("simple");
    check("switching back restores the base key", translate("editor.newDescription") === en["editor.newDescription"]);
    check("translate interpolates params", translate("palette.goTo", { page: "Rules" }) === "Go to Rules");
    check("translate keeps unknown placeholders intact", translate("palette.goTo", {}) === "Go to {page}");
    check("translate handles numeric params", translate("editor.matches", { count: 4 }) === "Indicative matches (4):");
    if (failures > 0) {
        console.error(`${failures} i18n test(s) failed`);
        process.exit(1);
    }
    console.log(`i18n tests passed (${LOCALES.length} locales, ${enKeys.length} keys)`);
}
void main();
