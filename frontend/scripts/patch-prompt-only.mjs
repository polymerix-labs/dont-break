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
const PIN_PROMPT = {
    "zh-CN": "{name} 必须保持原样：阻止任何直接触及它的更改。",
    "zh-TW": "{name} 必須保持原樣：阻止任何直接觸及它的變更。",
    "ja-JP": "{name} は今のまま維持すること。直接触れる変更はすべてブロックする。",
    "ko-KR": "{name}은(는) 지금 그대로 유지되어야 합니다. 직접 건드리는 모든 변경을 차단하세요.",
    "de-DE": "{name} muss genau so bleiben, wie es ist: Jede Änderung, die es direkt berührt, wird blockiert.",
    "fr-FR": "{name} doit rester exactement tel quel : bloquer tout changement qui le touche directement.",
    "es-ES": "{name} debe permanecer exactamente como está: bloquear cualquier cambio que lo toque directamente.",
    "hi-IN": "{name} बिल्कुल वैसा ही रहना चाहिए: इसे सीधे छूने वाला कोई भी बदलाव रोकें।",
    "pt-BR": "{name} deve permanecer exatamente como está: bloquear qualquer mudança que o toque diretamente.",
    "ru-RU": "{name} должен оставаться ровно таким, как есть: блокировать любое изменение, затрагивающее его напрямую.",
    "ar-SA": "يجب أن يبقى {name} كما هو تمامًا: امنع أي تغيير يمسه مباشرة.",
    "fa-IR": "{name} باید دقیقاً همان‌طور که هست بماند: هر تغییری که مستقیماً به آن دست بزند مسدود شود.",
    "he-IL": "{name} חייב להישאר בדיוק כפי שהוא: חסום כל שינוי שנוגע בו ישירות.",
    "it-IT": "{name} deve restare esattamente com'è: bloccare ogni modifica che lo tocca direttamente.",
    "pl-PL": "{name} musi pozostać dokładnie taki, jaki jest: blokuj każdą zmianę, która go bezpośrednio dotyka.",
    "nl-NL": "{name} moet precies zo blijven als het is: blokkeer elke wijziging die het direct raakt.",
    "tr-TR": "{name} tam olarak olduğu gibi kalmalı: ona doğrudan dokunan her değişikliği engelle.",
    "uk-UA": "{name} має залишатися точно таким, як є: блокувати будь-яку зміну, що торкається його напряму.",
    "vi-VN": "{name} phải giữ nguyên như hiện tại: chặn mọi thay đổi chạm trực tiếp vào nó.",
    "id-ID": "{name} harus tetap persis seperti sekarang: blokir setiap perubahan yang menyentuhnya secara langsung.",
    "sv-SE": "{name} måste förbli exakt som det är: blockera varje ändring som rör det direkt.",
    "el-GR": "Το {name} πρέπει να μείνει ακριβώς όπως είναι: μπλόκαρε κάθε αλλαγή που το αγγίζει άμεσα.",
    "ro-RO": "{name} trebuie să rămână exact așa cum este: blochează orice modificare care îl atinge direct.",
    "cs-CZ": "{name} musí zůstat přesně tak, jak je: blokovat každou změnu, která se ho přímo dotkne.",
    "fi-FI": "{name} on pysyttävä täsmälleen ennallaan: estä jokainen muutos, joka koskee siihen suoraan.",
    "da-DK": "{name} skal forblive præcis som det er: bloker enhver ændring, der rører det direkte.",
    "no-NO": "{name} må forbli nøyaktig som det er: blokker enhver endring som berører det direkte.",
    "hu-HU": "A(z) {name} maradjon pontosan úgy, ahogy van: minden közvetlenül hozzányúló változtatást blokkolni kell.",
    "th-TH": "{name} ต้องคงอยู่อย่างที่เป็นทุกประการ: บล็อกการเปลี่ยนแปลงใดๆ ที่แตะต้องมันโดยตรง",
    "uz-UZ": "{name} aynan hozirgidek qolishi kerak: unga bevosita tegadigan har qanday o'zgarish bloklansin.",
    "fil-PH": "Dapat manatiling eksaktong ganito ang {name}: harangin ang anumang pagbabagong direktang gumagalaw dito.",
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    content = content.replace(/^\s*"rules\.newRule":.*\n(?:\s+".*\n)*?(?=\s*")/m, "");
    content = content.replace(/^\s*"palette\.newRule":.*\n(?:\s+".*\n)*?(?=\s*")/m, "");
    if (!content.includes('"studio.entry.pinPrompt"')) {
        const value = PIN_PROMPT[code];
        if (!value) {
            console.error(`missing pinPrompt translation for ${code}`);
            process.exitCode = 1;
            continue;
        }
        const re = /^(\s*"studio\.entry\.protectPrompt":(?:.*\n)(?:\s+".*\n)*?)(?=\s*")/m;
        if (!re.test(content)) {
            console.error(`anchor studio.entry.protectPrompt not found in ${code}`);
            process.exitCode = 1;
            continue;
        }
        content = content.replace(re, `$1  "studio.entry.pinPrompt": ${JSON.stringify(value)},\n`);
    }
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
