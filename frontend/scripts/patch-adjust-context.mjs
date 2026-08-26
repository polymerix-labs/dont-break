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
    "studio.adjust.lead.tech": "Refine run: the original mission and the previous draft are sent as context.",
    "studio.adjust.gaps.tech": "Gaps (expected block, passed): {list}.",
    "studio.adjust.overBlocks.tech": "Over-blocks (expected pass, blocked): {list}.",
};
const LEAD = {
    "ar-SA": "تبقى مهمتك كما كتبتها — فقط أخبرني بما تريد تغييره.",
    "cs-CZ": "Tvoje mise zůstává, jak jsi ji napsal — jen mi řekni, co změnit.",
    "da-DK": "Din mission forbliver som skrevet — fortæl mig bare, hvad der skal ændres.",
    "de-DE": "Deine Mission bleibt wie geschrieben — sag mir nur, was sich ändern soll.",
    "el-GR": "Η αποστολή σου μένει όπως τη έγραψες — πες μου μόνο τι να αλλάξω.",
    "es-ES": "Tu misión se mantiene tal como la escribiste — solo dime qué cambiar.",
    "fa-IR": "ماموریت شما همان‌طور که نوشته‌اید می‌ماند — فقط بگویید چه چیزی تغییر کند.",
    "fi-FI": "Tehtäväsi pysyy sellaisenaan — kerro vain, mitä muutetaan.",
    "fil-PH": "Mananatili ang mission mo gaya ng pagkakasulat — sabihin mo lang kung ano ang babaguhin.",
    "fr-FR": "Ta mission reste telle quelle — dis-moi juste quoi changer.",
    "he-IL": "המשימה שלך נשארת כפי שכתבת — רק תגיד לי מה לשנות.",
    "hi-IN": "आपका मिशन जैसा लिखा है वैसा ही रहेगा — बस बताइए क्या बदलना है।",
    "hu-HU": "A küldetésed marad, ahogy írtad — csak mondd meg, mit változtassak.",
    "id-ID": "Misimu tetap seperti yang ditulis — cukup beri tahu apa yang perlu diubah.",
    "it-IT": "La tua missione resta com'è — dimmi solo cosa cambiare.",
    "ja-JP": "ミッションは書いたまま残ります。変更したい点だけ教えてください。",
    "ko-KR": "미션은 작성한 그대로 유지됩니다. 바꿀 부분만 알려주세요.",
    "nl-NL": "Je missie blijft zoals geschreven — vertel me alleen wat er anders moet.",
    "no-NO": "Oppdraget ditt står som skrevet — bare fortell meg hva som skal endres.",
    "pl-PL": "Twoja misja zostaje bez zmian — powiedz mi tylko, co poprawić.",
    "pt-BR": "Sua missão continua como escrita — só me diga o que mudar.",
    "ro-RO": "Misiunea ta rămâne așa cum ai scris-o — spune-mi doar ce să schimb.",
    "ru-RU": "Ваша миссия остаётся как есть — просто скажите, что изменить.",
    "sv-SE": "Ditt uppdrag står kvar som skrivet — säg bara vad som ska ändras.",
    "th-TH": "ภารกิจของคุณยังคงเดิมตามที่เขียนไว้ — แค่บอกว่าต้องการเปลี่ยนอะไร",
    "tr-TR": "Görevin yazdığın gibi kalır — sadece neyi değiştireceğimi söyle.",
    "uk-UA": "Ваша місія лишається як є — просто скажіть, що змінити.",
    "uz-UZ": "Missiyangiz yozilganicha qoladi — faqat nimani o'zgartirishni ayting.",
    "vi-VN": "Nhiệm vụ của bạn giữ nguyên như đã viết — chỉ cần cho tôi biết cần thay đổi gì.",
    "zh-CN": "你的任务保持原样——只需告诉我要改什么。",
    "zh-TW": "你的任務維持原樣——只要告訴我要改什麼。",
};
function esc(value) {
    return JSON.stringify(value);
}
const files = readdirSync(localesDir).filter((f) => f.endsWith(".ts") && f !== "en.ts");
for (const file of files) {
    const code = file.replace(/\.ts$/, "");
    const path = join(localesDir, file);
    let src = readFileSync(path, "utf8");
    if (src.includes("studio.adjust.lead.tech")) {
        console.log(`skip ${code} (already patched)`);
        continue;
    }
    const lead = LEAD[code];
    if (!lead)
        throw new Error(`no lead translation for ${code}`);
    src = src.replace(/("studio\.adjust\.lead":\s*)"(?:[^"\\]|\\.)*"(,)/, `$1${esc(lead)}$2`);
    src = src.replace(/("studio\.adjust\.lead":[^\n]*,\n)/, `$1  "studio.adjust.lead.tech": ${esc(TECH["studio.adjust.lead.tech"])},\n`);
    src = src.replace(/("studio\.adjust\.gaps":[^\n]*,\n)/, `$1  "studio.adjust.gaps.tech": ${esc(TECH["studio.adjust.gaps.tech"])},\n`);
    src = src.replace(/("studio\.adjust\.overBlocks":[^\n]*,\n)/, `$1  "studio.adjust.overBlocks.tech": ${esc(TECH["studio.adjust.overBlocks.tech"])},\n`);
    if (!src.includes("studio.adjust.lead.tech") || !src.includes("studio.adjust.gaps.tech")) {
        throw new Error(`patch failed for ${code}`);
    }
    writeFileSync(path, src);
    console.log(`patched ${code}`);
}
