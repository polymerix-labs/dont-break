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
const TECH = {
    "studio.sim.title.tech": "Live simulation",
    "studio.sim.dryRunNote.tech": "Dry-run: probes evaluate against the graph only, no writes.",
    "studio.sim.zoneArmed.tech": "Shield up: {count} node(s) under protection",
    "studio.sim.hud.tech": "Probe {current}/{total} · {intercepted} intercepted · {breaches} breach(es)",
    "studio.sim.outcomeIntercepted.tech": "Intercepted",
    "studio.sim.outcomeBreach.tech": "Breach",
    "studio.sim.outcomeAllowed.tech": "Passed clear",
};
const DRY = {
    "fr-FR": "Test à blanc : l'assistant ne fait que simuler ces changements. Rien dans ton code n'est modifié.",
    "de-DE": "Trockentest: Der Assistent simuliert diese Änderungen nur. An deinem Code wird nichts geändert.",
    "es-ES": "Prueba en seco: el asistente solo simula estos cambios. No se modifica nada en tu código.",
    "it-IT": "Test a vuoto: l'assistente si limita a simulare queste modifiche. Nel tuo codice non viene toccato nulla.",
    "pt-BR": "Teste a seco: o assistente apenas simula essas mudanças. Nada no seu código é modificado.",
    "nl-NL": "Testrun: de assistent simuleert deze wijzigingen alleen. Er wordt niets in je code gewijzigd.",
    "pl-PL": "Test na sucho: asystent tylko symuluje te zmiany. Nic w twoim kodzie nie jest modyfikowane.",
    "ru-RU": "Пробный прогон: ассистент лишь симулирует эти изменения. В вашем коде ничего не меняется.",
    "uk-UA": "Пробний прогін: асистент лише симулює ці зміни. У вашому коді нічого не змінюється.",
    "zh-CN": "试运行：助手只是模拟这些改动，不会修改你的任何代码。",
    "zh-TW": "試執行：助手只是模擬這些變更，不會修改你的任何程式碼。",
    "ja-JP": "お試し実行：アシスタントはこれらの変更をシミュレートするだけです。あなたのコードは一切変更されません。",
    "ko-KR": "모의 실행: 어시스턴트는 이 변경들을 시뮬레이션만 합니다. 당신의 코드는 전혀 수정되지 않습니다.",
    "hi-IN": "ड्राई टेस्ट: सहायक इन बदलावों की केवल नकल करता है। आपके कोड में कुछ भी नहीं बदला जाता।",
    "ar-SA": "اختبار تجريبي: يكتفي المساعد بمحاكاة هذه التغييرات. لا يُعدَّل أي شيء في شفرتك.",
    "fa-IR": "اجرای آزمایشی: دستیار فقط این تغییرات را شبیه‌سازی می‌کند. هیچ چیزی در کد تو تغییر نمی‌کند.",
    "he-IL": "הרצת ניסיון: העוזר רק מדמה את השינויים האלה. שום דבר בקוד שלך לא משתנה.",
    "tr-TR": "Kuru test: asistan bu değişiklikleri yalnızca simüle eder. Kodunda hiçbir şey değiştirilmez.",
    "vi-VN": "Chạy thử: trợ lý chỉ mô phỏng những thay đổi này. Không có gì trong mã của bạn bị sửa đổi.",
    "id-ID": "Uji coba: asisten hanya menyimulasikan perubahan ini. Tidak ada yang diubah di kode kamu.",
    "sv-SE": "Torrkörning: assistenten simulerar bara dessa ändringar. Inget i din kod ändras.",
    "el-GR": "Δοκιμαστική εκτέλεση: ο βοηθός απλώς προσομοιώνει αυτές τις αλλαγές. Τίποτα στον κώδικά σου δεν τροποποιείται.",
    "ro-RO": "Test în gol: asistentul doar simulează aceste schimbări. Nimic din codul tău nu este modificat.",
    "cs-CZ": "Zkušební běh: asistent tyto změny pouze simuluje. Ve tvém kódu se nic nemění.",
    "fi-FI": "Kuivaharjoittelu: avustaja vain simuloi nämä muutokset. Koodiisi ei tehdä mitään muutoksia.",
    "da-DK": "Tørtest: assistenten simulerer kun disse ændringer. Intet i din kode ændres.",
    "no-NO": "Tørrkjøring: assistenten simulerer bare disse endringene. Ingenting i koden din endres.",
    "hu-HU": "Próbafuttatás: az asszisztens csak szimulálja ezeket a változtatásokat. A kódodban semmi sem módosul.",
    "th-TH": "ทดสอบเปล่า: ผู้ช่วยเพียงจำลองการเปลี่ยนแปลงเหล่านี้ ไม่มีอะไรในโค้ดของคุณถูกแก้ไข",
    "uz-UZ": "Sinov ishga tushirish: yordamchi bu o'zgarishlarni faqat simulyatsiya qiladi. Kodingizda hech narsa o'zgarmaydi.",
    "fil-PH": "Dry run: sinisimulate lang ng assistant ang mga pagbabagong ito. Walang binabago sa code mo.",
};
function entryRegex(key) {
    const k = key.replace(/\./g, "\\.");
    return new RegExp(`"${k}":\\s*\\n?\\s*"(?:[^"\\\\]|\\\\.)*",`);
}
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    const dry = DRY[code];
    if (!dry) {
        console.error(`missing dry-run translation for ${code}`);
        process.exitCode = 1;
        continue;
    }
    if (content.includes('"studio.sim.dryRunNote"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const anchor = entryRegex("studio.sim.round");
    if (!anchor.test(content)) {
        console.error(`anchor studio.sim.round not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const entries = {
        "studio.sim.title.tech": TECH["studio.sim.title.tech"],
        "studio.sim.dryRunNote": dry,
        "studio.sim.dryRunNote.tech": TECH["studio.sim.dryRunNote.tech"],
        "studio.sim.zoneArmed.tech": TECH["studio.sim.zoneArmed.tech"],
        "studio.sim.hud.tech": TECH["studio.sim.hud.tech"],
        "studio.sim.outcomeIntercepted.tech": TECH["studio.sim.outcomeIntercepted.tech"],
        "studio.sim.outcomeBreach.tech": TECH["studio.sim.outcomeBreach.tech"],
        "studio.sim.outcomeAllowed.tech": TECH["studio.sim.outcomeAllowed.tech"],
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, (m) => `${block}\n${m}`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
