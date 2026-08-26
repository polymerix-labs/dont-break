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
    "ar-SA": "الرموز (البحث الدلالي غير متاح)",
    "cs-CZ": "Symboly (sémantické vyhledávání nedostupné)",
    "da-DK": "Symboler (semantisk søgning utilgængelig)",
    "de-DE": "Symbole (semantische Suche nicht verfügbar)",
    "el-GR": "Σύμβολα (η σημασιολογική αναζήτηση δεν είναι διαθέσιμη)",
    "es-ES": "Símbolos (búsqueda semántica no disponible)",
    "fa-IR": "نمادها (جستجوی معنایی در دسترس نیست)",
    "fi-FI": "Symbolit (semanttinen haku ei käytettävissä)",
    "fil-PH": "Mga simbolo (hindi available ang semantic na paghahanap)",
    "fr-FR": "Symboles (recherche sémantique indisponible)",
    "he-IL": "סמלים (חיפוש סמנטי אינו זמין)",
    "hi-IN": "प्रतीक (सिमेंटिक खोज अनुपलब्ध)",
    "hu-HU": "Szimbólumok (szemantikus keresés nem érhető el)",
    "id-ID": "Simbol (pencarian semantik tidak tersedia)",
    "it-IT": "Simboli (ricerca semantica non disponibile)",
    "ja-JP": "シンボル（セマンティック検索は利用できません）",
    "ko-KR": "심볼 (시맨틱 검색 사용 불가)",
    "nl-NL": "Symbolen (semantisch zoeken niet beschikbaar)",
    "no-NO": "Symboler (semantisk søk utilgjengelig)",
    "pl-PL": "Symbole (wyszukiwanie semantyczne niedostępne)",
    "pt-BR": "Símbolos (busca semântica indisponível)",
    "ro-RO": "Simboluri (căutarea semantică indisponibilă)",
    "ru-RU": "Символы (семантический поиск недоступен)",
    "sv-SE": "Symboler (semantisk sökning otillgänglig)",
    "th-TH": "สัญลักษณ์ (การค้นหาเชิงความหมายไม่พร้อมใช้งาน)",
    "tr-TR": "Semboller (anlamsal arama kullanılamıyor)",
    "uk-UA": "Символи (семантичний пошук недоступний)",
    "uz-UZ": "Belgilar (semantik qidiruv mavjud emas)",
    "vi-VN": "Ký hiệu (tìm kiếm ngữ nghĩa không khả dụng)",
    "zh-CN": "符号（语义搜索不可用）",
    "zh-TW": "符號（語意搜尋不可用）",
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes('"palette.symbolsLexical"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const value = WORDS[code] ?? "Symbols (semantic search unavailable)";
    const line = `  "palette.symbolsLexical": ${JSON.stringify(value)},\n`;
    if (content.includes('"palette.symbols"')) {
        content = content.replace(/(  "palette\.symbols": [^\n]*\n)/, `$1${line}`);
    }
    else {
        content = content.replace(/\n};\n\nexport default messages;/, `\n${line}};\n\nexport default messages;`);
    }
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
