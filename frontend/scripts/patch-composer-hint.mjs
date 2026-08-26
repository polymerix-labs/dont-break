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
const HINT = {
    "zh-CN": "回车开始分析 · Shift+回车换行",
    "zh-TW": "Enter 開始分析 · Shift+Enter 換行",
    "ja-JP": "Enter で分析 · Shift+Enter で改行",
    "ko-KR": "Enter로 분석 · Shift+Enter로 줄바꿈",
    "de-DE": "Eingabe zum Analysieren · Umschalt+Eingabe für neue Zeile",
    "fr-FR": "Entrée pour analyser · Maj+Entrée pour un saut de ligne",
    "es-ES": "Intro para analizar · Mayús+Intro para salto de línea",
    "hi-IN": "विश्लेषण के लिए Enter · नई पंक्ति के लिए Shift+Enter",
    "pt-BR": "Enter para analisar · Shift+Enter para nova linha",
    "ru-RU": "Enter — анализ · Shift+Enter — новая строка",
    "ar-SA": "Enter للتحليل · Shift+Enter لسطر جديد",
    "fa-IR": "Enter برای تحلیل · Shift+Enter برای خط جدید",
    "he-IL": "Enter לניתוח · Shift+Enter לשורה חדשה",
    "it-IT": "Invio per analizzare · Maiusc+Invio per andare a capo",
    "pl-PL": "Enter, aby analizować · Shift+Enter — nowa linia",
    "nl-NL": "Enter om te analyseren · Shift+Enter voor nieuwe regel",
    "tr-TR": "Analiz için Enter · Yeni satır için Shift+Enter",
    "uk-UA": "Enter — аналіз · Shift+Enter — новий рядок",
    "vi-VN": "Enter để phân tích · Shift+Enter để xuống dòng",
    "id-ID": "Enter untuk menganalisis · Shift+Enter untuk baris baru",
    "sv-SE": "Enter för att analysera · Skift+Enter för ny rad",
    "el-GR": "Enter για ανάλυση · Shift+Enter για νέα γραμμή",
    "ro-RO": "Enter pentru analiză · Shift+Enter pentru rând nou",
    "cs-CZ": "Enter pro analýzu · Shift+Enter pro nový řádek",
    "fi-FI": "Enter analysoi · Shift+Enter lisää rivinvaihdon",
    "da-DK": "Enter for at analysere · Shift+Enter for ny linje",
    "no-NO": "Enter for å analysere · Shift+Enter for ny linje",
    "hu-HU": "Enter az elemzéshez · Shift+Enter az új sorhoz",
    "th-TH": "Enter เพื่อวิเคราะห์ · Shift+Enter เพื่อขึ้นบรรทัดใหม่",
    "uz-UZ": "Tahlil uchun Enter · Yangi qator uchun Shift+Enter",
    "fil-PH": "Enter para suriin · Shift+Enter para sa bagong linya",
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes('"studio.composerHint"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const value = HINT[code];
    if (!value) {
        console.error(`missing translation for ${code}`);
        process.exitCode = 1;
        continue;
    }
    const re = /^(\s*"studio\.promptHint":(?:.*\n)(?:\s+".*\n)*?)(?=\s*")/m;
    if (!re.test(content)) {
        console.error(`anchor studio.promptHint not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    content = content.replace(re, `$1  "studio.composerHint": ${JSON.stringify(value)},\n`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
