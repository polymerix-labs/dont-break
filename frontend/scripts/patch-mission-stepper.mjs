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
    "studio.mission.describe.tech": "Intent",
    "studio.mission.understand.tech": "Retrieval",
    "studio.mission.test.tech": "Simulation",
    "studio.mission.decide.tech": "Contract",
};
const T = {
    "fr-FR": { title: "Progression de la mission", describe: "Décrire", understand: "Comprendre", test: "Éprouver", decide: "Décider" },
    "de-DE": { title: "Missionsfortschritt", describe: "Beschreiben", understand: "Verstehen", test: "Härtetest", decide: "Entscheiden" },
    "es-ES": { title: "Progreso de la misión", describe: "Describir", understand: "Comprender", test: "Poner a prueba", decide: "Decidir" },
    "it-IT": { title: "Avanzamento della missione", describe: "Descrivi", understand: "Comprendi", test: "Metti alla prova", decide: "Decidi" },
    "pt-BR": { title: "Progresso da missão", describe: "Descrever", understand: "Entender", test: "Testar", decide: "Decidir" },
    "nl-NL": { title: "Missievoortgang", describe: "Beschrijven", understand: "Begrijpen", test: "Stresstest", decide: "Beslissen" },
    "pl-PL": { title: "Postęp misji", describe: "Opisz", understand: "Zrozum", test: "Przetestuj", decide: "Zdecyduj" },
    "ru-RU": { title: "Ход миссии", describe: "Описать", understand: "Понять", test: "Испытать", decide: "Решить" },
    "uk-UA": { title: "Хід місії", describe: "Описати", understand: "Зрозуміти", test: "Випробувати", decide: "Вирішити" },
    "zh-CN": { title: "任务进度", describe: "描述", understand: "理解", test: "压力测试", decide: "决定" },
    "zh-TW": { title: "任務進度", describe: "描述", understand: "理解", test: "壓力測試", decide: "決定" },
    "ja-JP": { title: "ミッションの進行", describe: "記述", understand: "理解", test: "検証", decide: "決定" },
    "ko-KR": { title: "미션 진행", describe: "설명", understand: "이해", test: "검증", decide: "결정" },
    "hi-IN": { title: "मिशन प्रगति", describe: "वर्णन", understand: "समझ", test: "परीक्षण", decide: "निर्णय" },
    "ar-SA": { title: "تقدم المهمة", describe: "صِف", understand: "افهم", test: "اختبر", decide: "قرِّر" },
    "fa-IR": { title: "پیشرفت مأموریت", describe: "توصیف", understand: "درک", test: "آزمایش", decide: "تصمیم" },
    "he-IL": { title: "התקדמות המשימה", describe: "תאר", understand: "הבן", test: "בחן", decide: "החלט" },
    "tr-TR": { title: "Görev ilerlemesi", describe: "Tanımla", understand: "Anla", test: "Sına", decide: "Karar ver" },
    "vi-VN": { title: "Tiến độ nhiệm vụ", describe: "Mô tả", understand: "Hiểu", test: "Thử thách", decide: "Quyết định" },
    "id-ID": { title: "Kemajuan misi", describe: "Jelaskan", understand: "Pahami", test: "Uji", decide: "Putuskan" },
    "sv-SE": { title: "Uppdragets förlopp", describe: "Beskriv", understand: "Förstå", test: "Stresstesta", decide: "Besluta" },
    "el-GR": { title: "Πρόοδος αποστολής", describe: "Περιγραφή", understand: "Κατανόηση", test: "Δοκιμή", decide: "Απόφαση" },
    "ro-RO": { title: "Progresul misiunii", describe: "Descrie", understand: "Înțelege", test: "Testează", decide: "Decide" },
    "cs-CZ": { title: "Průběh mise", describe: "Popiš", understand: "Pochop", test: "Otestuj", decide: "Rozhodni" },
    "fi-FI": { title: "Tehtävän eteneminen", describe: "Kuvaa", understand: "Ymmärrä", test: "Testaa", decide: "Päätä" },
    "da-DK": { title: "Missionens fremdrift", describe: "Beskriv", understand: "Forstå", test: "Stresstest", decide: "Beslut" },
    "no-NO": { title: "Oppdragets fremdrift", describe: "Beskriv", understand: "Forstå", test: "Stresstest", decide: "Bestem" },
    "hu-HU": { title: "Küldetés előrehaladása", describe: "Leírás", understand: "Megértés", test: "Próbatétel", decide: "Döntés" },
    "th-TH": { title: "ความคืบหน้าภารกิจ", describe: "อธิบาย", understand: "ทำความเข้าใจ", test: "ทดสอบ", decide: "ตัดสินใจ" },
    "uz-UZ": { title: "Missiya jarayoni", describe: "Tavsiflash", understand: "Tushunish", test: "Sinash", decide: "Qaror qilish" },
    "fil-PH": { title: "Progreso ng misyon", describe: "Ilarawan", understand: "Unawain", test: "Subukin", decide: "Magpasya" },
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    const dict = T[code];
    if (!dict) {
        console.error(`missing translations for ${code}`);
        process.exitCode = 1;
        continue;
    }
    if (content.includes('"studio.mission.title"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const anchor = /^(\s*"studio\.promptLabel":)/m;
    if (!anchor.test(content)) {
        console.error(`anchor studio.promptLabel not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const entries = {
        "studio.mission.title": dict.title,
        "studio.mission.describe": dict.describe,
        "studio.mission.describe.tech": TECH["studio.mission.describe.tech"],
        "studio.mission.understand": dict.understand,
        "studio.mission.understand.tech": TECH["studio.mission.understand.tech"],
        "studio.mission.test": dict.test,
        "studio.mission.test.tech": TECH["studio.mission.test.tech"],
        "studio.mission.decide": dict.decide,
        "studio.mission.decide.tech": TECH["studio.mission.decide.tech"],
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
