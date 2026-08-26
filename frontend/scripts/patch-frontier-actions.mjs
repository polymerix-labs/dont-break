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
    "studio.frontier.note.tech": "Retrieval near-misses outside the compiled zone (core + halo). Add to targets or leave out.",
    "studio.frontier.protectAlso.tech": "Add to zone",
    "studio.frontier.added.tech": "In targets — re-test to certify",
};
const T = {
    "ar-SA": {
        note: "تبدو هذه مرتبطة بهدفك، لكن هذه القاعدة لن تحميها. أضفها بنقرة واحدة أو اتركها خارجًا.",
        protectAlso: "احمِ هذا أيضًا",
        added: "أُضيف — أعد الاختبار للتأكيد",
    },
    "cs-CZ": {
        note: "Vypadají, že souvisejí s tvým cílem, ale toto pravidlo je NEOCHRÁNÍ. Přidej je jedním kliknutím, nebo je nech venku.",
        protectAlso: "Chránit i toto",
        added: "Přidáno — potvrď novým testem",
    },
    "da-DK": {
        note: "Disse ser relaterede til dit mål ud, men denne regel beskytter dem IKKE. Tilføj dem med ét klik, eller lad dem stå udenfor.",
        protectAlso: "Beskyt også denne",
        added: "Tilføjet — test igen for at bekræfte",
    },
    "de-DE": {
        note: "Diese wirken mit deinem Ziel verwandt, aber diese Regel schützt sie NICHT. Füge sie mit einem Klick hinzu oder lass sie draußen.",
        protectAlso: "Auch schützen",
        added: "Hinzugefügt — zum Bestätigen erneut testen",
    },
    "el-GR": {
        note: "Αυτά μοιάζουν σχετικά με τον στόχο σου, αλλά αυτός ο κανόνας ΔΕΝ θα τα προστατεύσει. Πρόσθεσέ τα με ένα κλικ ή άφησέ τα έξω.",
        protectAlso: "Προστάτευσε κι αυτό",
        added: "Προστέθηκε — ξανατρέξε το τεστ για επιβεβαίωση",
    },
    "es-ES": {
        note: "Parecen relacionados con tu objetivo, pero esta regla NO los protegerá. Añádelos con un clic o déjalos fuera.",
        protectAlso: "Proteger esto también",
        added: "Añadido — vuelve a probar para confirmar",
    },
    "fa-IR": {
        note: "این‌ها به هدف شما مرتبط به نظر می‌رسند، اما این قانون از آن‌ها محافظت نمی‌کند. با یک کلیک اضافه‌شان کنید یا بیرون بگذارید.",
        protectAlso: "این را هم محافظت کن",
        added: "اضافه شد — برای تأیید دوباره آزمایش کنید",
    },
    "fi-FI": {
        note: "Nämä näyttävät liittyvän tavoitteeseesi, mutta tämä sääntö EI suojaa niitä. Lisää ne yhdellä klikkauksella tai jätä ulkopuolelle.",
        protectAlso: "Suojaa myös tämä",
        added: "Lisätty — vahvista testaamalla uudelleen",
    },
    "fil-PH": {
        note: "Mukhang kaugnay ito ng layunin mo, pero HINDI sila poprotektahan ng rule na ito. Idagdag sila sa isang click, o hayaang nasa labas.",
        protectAlso: "Protektahan din ito",
        added: "Naidagdag — i-test muli para kumpirmahin",
    },
    "fr-FR": {
        note: "Ces éléments semblent liés à ton objectif, mais cette règle ne les protégera PAS. Ajoute-les en un clic, ou laisse-les dehors.",
        protectAlso: "Protéger aussi",
        added: "Ajouté — relance le test pour confirmer",
    },
    "he-IL": {
        note: "אלה נראים קשורים למטרה שלך, אבל הכלל הזה לא יגן עליהם. הוסף אותם בלחיצה אחת או השאר אותם בחוץ.",
        protectAlso: "הגן גם על זה",
        added: "נוסף — הרץ בדיקה מחדש לאישור",
    },
    "hi-IN": {
        note: "ये आपके लक्ष्य से जुड़े लगते हैं, लेकिन यह नियम इनकी रक्षा नहीं करेगा। एक क्लिक में जोड़ें, या बाहर रहने दें।",
        protectAlso: "इसे भी सुरक्षित करें",
        added: "जोड़ा गया — पुष्टि के लिए फिर से परीक्षण करें",
    },
    "hu-HU": {
        note: "Ezek kapcsolódni látszanak a célodhoz, de ez a szabály NEM védi őket. Add hozzá őket egy kattintással, vagy hagyd kint.",
        protectAlso: "Ezt is védd",
        added: "Hozzáadva — megerősítéshez teszteld újra",
    },
    "id-ID": {
        note: "Ini tampak terkait dengan tujuanmu, tetapi aturan ini TIDAK akan melindunginya. Tambahkan dengan satu klik, atau biarkan di luar.",
        protectAlso: "Lindungi ini juga",
        added: "Ditambahkan — uji ulang untuk konfirmasi",
    },
    "it-IT": {
        note: "Sembrano legati al tuo obiettivo, ma questa regola NON li proteggerà. Aggiungili con un clic o lasciali fuori.",
        protectAlso: "Proteggi anche questo",
        added: "Aggiunto — riesegui il test per confermare",
    },
    "ja-JP": {
        note: "これらは目標に関連しているように見えますが、このルールでは保護されません。ワンクリックで追加するか、外したままにしてください。",
        protectAlso: "これも保護する",
        added: "追加済み — 再テストで確認",
    },
    "ko-KR": {
        note: "목표와 관련되어 보이지만 이 규칙은 보호하지 않습니다. 한 번의 클릭으로 추가하거나 그대로 두세요.",
        protectAlso: "이것도 보호",
        added: "추가됨 — 재테스트로 확인",
    },
    "nl-NL": {
        note: "Deze lijken verwant aan je doel, maar deze regel beschermt ze NIET. Voeg ze met één klik toe of laat ze buiten.",
        protectAlso: "Bescherm dit ook",
        added: "Toegevoegd — test opnieuw om te bevestigen",
    },
    "no-NO": {
        note: "Disse ser ut til å henge sammen med målet ditt, men denne regelen beskytter dem IKKE. Legg dem til med ett klikk, eller la dem stå utenfor.",
        protectAlso: "Beskytt denne også",
        added: "Lagt til — test på nytt for å bekrefte",
    },
    "pl-PL": {
        note: "Wyglądają na powiązane z twoim celem, ale ta reguła ich NIE ochroni. Dodaj je jednym kliknięciem albo zostaw poza zasięgiem.",
        protectAlso: "Chroń też to",
        added: "Dodano — przetestuj ponownie, aby potwierdzić",
    },
    "pt-BR": {
        note: "Parecem relacionados ao seu objetivo, mas esta regra NÃO vai protegê-los. Adicione com um clique ou deixe de fora.",
        protectAlso: "Proteger este também",
        added: "Adicionado — teste de novo para confirmar",
    },
    "ro-RO": {
        note: "Par legate de obiectivul tău, dar această regulă NU le va proteja. Adaugă-le cu un clic sau lasă-le afară.",
        protectAlso: "Protejează și asta",
        added: "Adăugat — retestează pentru confirmare",
    },
    "ru-RU": {
        note: "Они выглядят связанными с вашей целью, но это правило их НЕ защитит. Добавьте их одним кликом или оставьте снаружи.",
        protectAlso: "Защитить и это",
        added: "Добавлено — перезапустите тест для подтверждения",
    },
    "sv-SE": {
        note: "Dessa verkar höra ihop med ditt mål, men den här regeln skyddar dem INTE. Lägg till dem med ett klick eller lämna dem utanför.",
        protectAlso: "Skydda den här också",
        added: "Tillagd — testa igen för att bekräfta",
    },
    "th-TH": {
        note: "รายการเหล่านี้ดูเกี่ยวข้องกับเป้าหมายของคุณ แต่กฎนี้จะไม่ปกป้องพวกมัน เพิ่มด้วยคลิกเดียวหรือปล่อยไว้ข้างนอก",
        protectAlso: "ปกป้องอันนี้ด้วย",
        added: "เพิ่มแล้ว — ทดสอบใหม่เพื่อยืนยัน",
    },
    "tr-TR": {
        note: "Bunlar hedefinle ilgili görünüyor, ancak bu kural onları KORUMAYACAK. Tek tıkla ekle ya da dışarıda bırak.",
        protectAlso: "Bunu da koru",
        added: "Eklendi — doğrulamak için yeniden test et",
    },
    "uk-UA": {
        note: "Вони виглядають пов'язаними з вашою метою, але це правило їх НЕ захистить. Додайте їх одним кліком або залиште поза зоною.",
        protectAlso: "Захистити і це",
        added: "Додано — перезапустіть тест для підтвердження",
    },
    "uz-UZ": {
        note: "Bular maqsadingizga aloqador ko'rinadi, lekin bu qoida ularni HIMOYA QILMAYDI. Bir bosishda qo'shing yoki tashqarida qoldiring.",
        protectAlso: "Buni ham himoya qil",
        added: "Qo'shildi — tasdiqlash uchun qayta sinang",
    },
    "vi-VN": {
        note: "Những mục này có vẻ liên quan đến mục tiêu của bạn, nhưng quy tắc này sẽ KHÔNG bảo vệ chúng. Thêm bằng một cú nhấp, hoặc để chúng ở ngoài.",
        protectAlso: "Bảo vệ cả mục này",
        added: "Đã thêm — chạy lại kiểm tra để xác nhận",
    },
    "zh-CN": {
        note: "这些看起来与你的目标相关，但此规则不会保护它们。一键添加，或保持排除。",
        protectAlso: "也保护这个",
        added: "已添加——重新测试以确认",
    },
    "zh-TW": {
        note: "這些看起來與你的目標相關，但此規則不會保護它們。一鍵加入，或維持排除。",
        protectAlso: "也保護這個",
        added: "已加入——重新測試以確認",
    },
};
function esc(value) {
    return JSON.stringify(value);
}
const files = readdirSync(localesDir).filter((f) => f.endsWith(".ts") && f !== "en.ts");
for (const file of files) {
    const code = file.replace(/\.ts$/, "");
    const path = join(localesDir, file);
    let src = readFileSync(path, "utf8");
    if (src.includes("studio.frontier.protectAlso")) {
        console.log(`skip ${code} (already patched)`);
        continue;
    }
    const tr = T[code];
    if (!tr)
        throw new Error(`no translations for ${code}`);
    src = src.replace(/^[ \t]*"studio\.frontier\.ack":[\s\S]*?",\n/m, "");
    src = src.replace(/^[ \t]*"studio\.frontier\.ackHint":[\s\S]*?",\n/m, "");
    src = src.replace(/("studio\.frontier\.note":\s*\n?\s*)"(?:[^"\\]|\\.)*"(,)/, `$1${esc(tr.note)}$2`);
    src = src.replace(/("studio\.frontier\.note\.tech":\s*\n?\s*)"(?:[^"\\]|\\.)*"(,)/, `$1${esc(TECH["studio.frontier.note.tech"])}$2`);
    const insertion = `  "studio.frontier.protectAlso": ${esc(tr.protectAlso)},\n` +
        `  "studio.frontier.protectAlso.tech": ${esc(TECH["studio.frontier.protectAlso.tech"])},\n` +
        `  "studio.frontier.added": ${esc(tr.added)},\n` +
        `  "studio.frontier.added.tech": ${esc(TECH["studio.frontier.added.tech"])},\n`;
    src = src.replace(/^(\s*"studio\.frontier\.empty":)/m, `${insertion}$1`);
    if (!src.includes("studio.frontier.protectAlso") ||
        src.includes("studio.frontier.ack\"") ||
        src.includes("studio.frontier.ackHint")) {
        throw new Error(`patch failed for ${code}`);
    }
    writeFileSync(path, src);
    console.log(`patched ${code}`);
}
