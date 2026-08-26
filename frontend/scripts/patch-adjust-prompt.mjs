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
const T = {
    "fr-FR": { lead: "Ajuste la protection que tu viens de proposer.", gaps: "Ces attaques sont passées : {list}.", overBlocks: "Ces changements normaux ont été bloqués : {list}.", chipWiden: "Étendre la zone protégée", chipException: "Ajouter une exception pour les changements normaux", chipHarden: "Durcir la règle", advancedEdit: "Édition avancée" },
    "de-DE": { lead: "Passe den gerade vorgeschlagenen Schutz an.", gaps: "Diese Angriffe kamen durch: {list}.", overBlocks: "Diese normalen Änderungen wurden blockiert: {list}.", chipWiden: "Die geschützte Zone erweitern", chipException: "Eine Ausnahme für normale Änderungen hinzufügen", chipHarden: "Die Regel verschärfen", advancedEdit: "Erweiterte Bearbeitung" },
    "es-ES": { lead: "Ajusta la protección que acabas de proponer.", gaps: "Estos ataques pasaron: {list}.", overBlocks: "Estos cambios normales fueron bloqueados: {list}.", chipWiden: "Ampliar la zona protegida", chipException: "Añadir una excepción para cambios normales", chipHarden: "Endurecer la regla", advancedEdit: "Edición avanzada" },
    "it-IT": { lead: "Modifica la protezione appena proposta.", gaps: "Questi attacchi sono passati: {list}.", overBlocks: "Queste modifiche normali sono state bloccate: {list}.", chipWiden: "Ampliare la zona protetta", chipException: "Aggiungere un'eccezione per le modifiche normali", chipHarden: "Rendere la regola più severa", advancedEdit: "Modifica avanzata" },
    "pt-BR": { lead: "Ajuste a proteção que você acabou de propor.", gaps: "Estes ataques passaram: {list}.", overBlocks: "Estas mudanças normais foram bloqueadas: {list}.", chipWiden: "Ampliar a zona protegida", chipException: "Adicionar uma exceção para mudanças normais", chipHarden: "Endurecer a regra", advancedEdit: "Edição avançada" },
    "nl-NL": { lead: "Pas de zojuist voorgestelde bescherming aan.", gaps: "Deze aanvallen kwamen door: {list}.", overBlocks: "Deze normale wijzigingen werden geblokkeerd: {list}.", chipWiden: "De beschermde zone verbreden", chipException: "Een uitzondering toevoegen voor normale wijzigingen", chipHarden: "De regel strenger maken", advancedEdit: "Geavanceerd bewerken" },
    "pl-PL": { lead: "Dostosuj zaproponowaną właśnie ochronę.", gaps: "Te ataki przeszły: {list}.", overBlocks: "Te normalne zmiany zostały zablokowane: {list}.", chipWiden: "Poszerz strefę chronioną", chipException: "Dodaj wyjątek dla normalnych zmian", chipHarden: "Zaostrz regułę", advancedEdit: "Edycja zaawansowana" },
    "ru-RU": { lead: "Скорректируйте только что предложенную защиту.", gaps: "Эти атаки прошли: {list}.", overBlocks: "Эти обычные изменения были заблокированы: {list}.", chipWiden: "Расширить защищённую зону", chipException: "Добавить исключение для обычных изменений", chipHarden: "Ужесточить правило", advancedEdit: "Расширенное редактирование" },
    "uk-UA": { lead: "Скоригуйте щойно запропонований захист.", gaps: "Ці атаки пройшли: {list}.", overBlocks: "Ці звичайні зміни було заблоковано: {list}.", chipWiden: "Розширити захищену зону", chipException: "Додати виняток для звичайних змін", chipHarden: "Посилити правило", advancedEdit: "Розширене редагування" },
    "zh-CN": { lead: "调整你刚刚提出的保护。", gaps: "这些攻击通过了：{list}。", overBlocks: "这些正常改动被拦截了：{list}。", chipWiden: "扩大保护范围", chipException: "为正常改动添加例外", chipHarden: "让规则更严格", advancedEdit: "高级编辑" },
    "zh-TW": { lead: "調整你剛剛提出的保護。", gaps: "這些攻擊通過了：{list}。", overBlocks: "這些正常變更被攔截了：{list}。", chipWiden: "擴大保護範圍", chipException: "為正常變更新增例外", chipHarden: "讓規則更嚴格", advancedEdit: "進階編輯" },
    "ja-JP": { lead: "先ほど提案した保護を調整してください。", gaps: "これらの攻撃が通過しました：{list}。", overBlocks: "これらの通常の変更がブロックされました：{list}。", chipWiden: "保護範囲を広げる", chipException: "通常の変更に例外を追加する", chipHarden: "ルールを厳しくする", advancedEdit: "高度な編集" },
    "ko-KR": { lead: "방금 제안한 보호를 조정하세요.", gaps: "이 공격들이 통과했습니다: {list}.", overBlocks: "이 일반 변경들이 차단되었습니다: {list}.", chipWiden: "보호 구역 넓히기", chipException: "일반 변경에 예외 추가", chipHarden: "규칙 더 엄격하게", advancedEdit: "고급 편집" },
    "hi-IN": { lead: "अभी प्रस्तावित सुरक्षा को समायोजित करें।", gaps: "ये हमले निकल गए: {list}।", overBlocks: "ये सामान्य बदलाव रोक दिए गए: {list}।", chipWiden: "संरक्षित क्षेत्र बढ़ाएँ", chipException: "सामान्य बदलावों के लिए अपवाद जोड़ें", chipHarden: "नियम सख्त करें", advancedEdit: "उन्नत संपादन" },
    "ar-SA": { lead: "عدّل الحماية التي اقترحتها للتو.", gaps: "مرت هذه الهجمات: {list}.", overBlocks: "حُظرت هذه التغييرات العادية: {list}.", chipWiden: "توسيع المنطقة المحمية", chipException: "إضافة استثناء للتغييرات العادية", chipHarden: "تشديد القاعدة", advancedEdit: "تحرير متقدم" },
    "fa-IR": { lead: "محافظتی را که همین حالا پیشنهاد دادی تنظیم کن.", gaps: "این حمله‌ها عبور کردند: {list}.", overBlocks: "این تغییرات عادی مسدود شدند: {list}.", chipWiden: "گسترش ناحیه محافظت‌شده", chipException: "افزودن استثنا برای تغییرات عادی", chipHarden: "سخت‌گیرتر کردن قانون", advancedEdit: "ویرایش پیشرفته" },
    "he-IL": { lead: "התאם את ההגנה שהצעת זה עתה.", gaps: "התקפות אלו עברו: {list}.", overBlocks: "שינויים רגילים אלו נחסמו: {list}.", chipWiden: "הרחבת האזור המוגן", chipException: "הוספת חריגה לשינויים רגילים", chipHarden: "החמרת הכלל", advancedEdit: "עריכה מתקדמת" },
    "tr-TR": { lead: "Az önce önerdiğin korumayı ayarla.", gaps: "Bu saldırılar geçti: {list}.", overBlocks: "Bu normal değişiklikler engellendi: {list}.", chipWiden: "Korunan bölgeyi genişlet", chipException: "Normal değişiklikler için istisna ekle", chipHarden: "Kuralı sıkılaştır", advancedEdit: "Gelişmiş düzenleme" },
    "vi-VN": { lead: "Điều chỉnh lớp bảo vệ bạn vừa đề xuất.", gaps: "Các cuộc tấn công này đã lọt qua: {list}.", overBlocks: "Các thay đổi bình thường này đã bị chặn: {list}.", chipWiden: "Mở rộng vùng được bảo vệ", chipException: "Thêm ngoại lệ cho thay đổi bình thường", chipHarden: "Siết chặt quy tắc", advancedEdit: "Chỉnh sửa nâng cao" },
    "id-ID": { lead: "Sesuaikan perlindungan yang baru saja kamu usulkan.", gaps: "Serangan ini lolos: {list}.", overBlocks: "Perubahan normal ini terblokir: {list}.", chipWiden: "Perluas zona terlindungi", chipException: "Tambahkan pengecualian untuk perubahan normal", chipHarden: "Perketat aturan", advancedEdit: "Edit lanjutan" },
    "sv-SE": { lead: "Justera skyddet du just föreslog.", gaps: "Dessa attacker gick igenom: {list}.", overBlocks: "Dessa normala ändringar blockerades: {list}.", chipWiden: "Utöka den skyddade zonen", chipException: "Lägg till ett undantag för normala ändringar", chipHarden: "Skärp regeln", advancedEdit: "Avancerad redigering" },
    "el-GR": { lead: "Προσάρμοσε την προστασία που μόλις πρότεινες.", gaps: "Αυτές οι επιθέσεις πέρασαν: {list}.", overBlocks: "Αυτές οι κανονικές αλλαγές μπλοκαρίστηκαν: {list}.", chipWiden: "Διεύρυνση της προστατευμένης ζώνης", chipException: "Προσθήκη εξαίρεσης για κανονικές αλλαγές", chipHarden: "Αυστηροποίηση του κανόνα", advancedEdit: "Προχωρημένη επεξεργασία" },
    "ro-RO": { lead: "Ajustează protecția pe care tocmai ai propus-o.", gaps: "Aceste atacuri au trecut: {list}.", overBlocks: "Aceste schimbări normale au fost blocate: {list}.", chipWiden: "Extinde zona protejată", chipException: "Adaugă o excepție pentru schimbările normale", chipHarden: "Înăsprește regula", advancedEdit: "Editare avansată" },
    "cs-CZ": { lead: "Uprav ochranu, kterou jsi právě navrhl.", gaps: "Tyto útoky prošly: {list}.", overBlocks: "Tyto běžné změny byly zablokovány: {list}.", chipWiden: "Rozšířit chráněnou zónu", chipException: "Přidat výjimku pro běžné změny", chipHarden: "Zpřísnit pravidlo", advancedEdit: "Pokročilá úprava" },
    "fi-FI": { lead: "Säädä juuri ehdottamaasi suojausta.", gaps: "Nämä hyökkäykset pääsivät läpi: {list}.", overBlocks: "Nämä tavalliset muutokset estettiin: {list}.", chipWiden: "Laajenna suojattua aluetta", chipException: "Lisää poikkeus tavallisille muutoksille", chipHarden: "Tiukenna sääntöä", advancedEdit: "Edistynyt muokkaus" },
    "da-DK": { lead: "Justér den beskyttelse, du lige har foreslået.", gaps: "Disse angreb kom igennem: {list}.", overBlocks: "Disse normale ændringer blev blokeret: {list}.", chipWiden: "Udvid den beskyttede zone", chipException: "Tilføj en undtagelse for normale ændringer", chipHarden: "Stram reglen", advancedEdit: "Avanceret redigering" },
    "no-NO": { lead: "Juster beskyttelsen du nettopp foreslo.", gaps: "Disse angrepene kom gjennom: {list}.", overBlocks: "Disse normale endringene ble blokkert: {list}.", chipWiden: "Utvid den beskyttede sonen", chipException: "Legg til et unntak for normale endringer", chipHarden: "Stram inn regelen", advancedEdit: "Avansert redigering" },
    "hu-HU": { lead: "Igazítsd ki az imént javasolt védelmet.", gaps: "Ezek a támadások átjutottak: {list}.", overBlocks: "Ezek a normál módosítások blokkolva lettek: {list}.", chipWiden: "A védett zóna bővítése", chipException: "Kivétel hozzáadása a normál módosításokhoz", chipHarden: "A szabály szigorítása", advancedEdit: "Speciális szerkesztés" },
    "th-TH": { lead: "ปรับการป้องกันที่คุณเพิ่งเสนอ", gaps: "การโจมตีเหล่านี้ผ่านไปได้: {list}", overBlocks: "การเปลี่ยนแปลงปกติเหล่านี้ถูกบล็อก: {list}", chipWiden: "ขยายเขตป้องกัน", chipException: "เพิ่มข้อยกเว้นสำหรับการเปลี่ยนแปลงปกติ", chipHarden: "ทำให้กฎเข้มงวดขึ้น", advancedEdit: "แก้ไขขั้นสูง" },
    "uz-UZ": { lead: "Hozirgina taklif qilingan himoyani sozlang.", gaps: "Bu hujumlar o'tib ketdi: {list}.", overBlocks: "Bu oddiy o'zgarishlar bloklandi: {list}.", chipWiden: "Himoyalangan zonani kengaytirish", chipException: "Oddiy o'zgarishlar uchun istisno qo'shish", chipHarden: "Qoidani qattiqlashtirish", advancedEdit: "Kengaytirilgan tahrirlash" },
    "fil-PH": { lead: "I-adjust ang proteksyong kakapropose mo lang.", gaps: "Nakalusot ang mga atakeng ito: {list}.", overBlocks: "Naharang ang mga normal na pagbabagong ito: {list}.", chipWiden: "Palawakin ang protektadong sona", chipException: "Magdagdag ng exception para sa normal na pagbabago", chipHarden: "Higpitan ang panuntunan", advancedEdit: "Advanced na pag-edit" },
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
    if (content.includes('"studio.adjust.lead"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const anchor = /^(\s*"studio\.contract\.title":)/m;
    if (!anchor.test(content)) {
        console.error(`anchor studio.contract.title not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const entries = {
        "studio.adjust.lead": dict.lead,
        "studio.adjust.gaps": dict.gaps,
        "studio.adjust.overBlocks": dict.overBlocks,
        "studio.adjust.chipWiden": dict.chipWiden,
        "studio.adjust.chipException": dict.chipException,
        "studio.adjust.chipHarden": dict.chipHarden,
        "studio.contract.advancedEdit": dict.advancedEdit,
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
