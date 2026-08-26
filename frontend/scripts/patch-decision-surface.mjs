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
    "studio.decision.readyTitle.tech": "Converged: draft ready",
    "studio.decision.partialTitle.tech": "Needs review",
    "studio.decision.activate.tech": "Save the rule",
};
const T = {
    "fr-FR": { readyTitle: "Ta protection est prête", readyDetail: "Toutes les attaques ont été interceptées et les changements normaux sont passés. Active-la et tu es couvert.", partialTitle: "Protection partielle : à toi de décider", partialDetail: "La protection a tenu face à la plupart des tentatives, mais pas toutes. Active-la telle quelle, ajuste-la ou reformule la mission.", activate: "Activer cette protection", rephrase: "Reformuler la mission" },
    "de-DE": { readyTitle: "Dein Schutz ist bereit", readyDetail: "Jeder Angriff wurde abgefangen und normale Änderungen kamen durch. Aktiviere ihn und du bist abgesichert.", partialTitle: "Teilschutz: deine Entscheidung", partialDetail: "Der Schutz hielt den meisten Versuchen stand, aber nicht allen. Aktiviere ihn so, passe ihn an oder formuliere die Mission neu.", activate: "Diesen Schutz aktivieren", rephrase: "Mission neu formulieren" },
    "es-ES": { readyTitle: "Tu protección está lista", readyDetail: "Todos los ataques fueron interceptados y los cambios normales pasaron. Actívala y estás cubierto.", partialTitle: "Protección parcial: tú decides", partialDetail: "La protección resistió la mayoría de los intentos, pero no todos. Actívala tal cual, ajústala o reformula la misión.", activate: "Activar esta protección", rephrase: "Reformular la misión" },
    "it-IT": { readyTitle: "La tua protezione è pronta", readyDetail: "Ogni attacco è stato intercettato e le modifiche normali sono passate. Attivala e sei coperto.", partialTitle: "Protezione parziale: decidi tu", partialDetail: "La protezione ha retto alla maggior parte dei tentativi, ma non a tutti. Attivala così com'è, modificala o riformula la missione.", activate: "Attiva questa protezione", rephrase: "Riformula la missione" },
    "pt-BR": { readyTitle: "Sua proteção está pronta", readyDetail: "Todos os ataques foram interceptados e as mudanças normais passaram. Ative e você está coberto.", partialTitle: "Proteção parcial: você decide", partialDetail: "A proteção resistiu à maioria das tentativas, mas não a todas. Ative como está, ajuste ou reformule a missão.", activate: "Ativar esta proteção", rephrase: "Reformular a missão" },
    "nl-NL": { readyTitle: "Je bescherming is klaar", readyDetail: "Elke aanval werd onderschept en normale wijzigingen kwamen door. Activeer hem en je bent gedekt.", partialTitle: "Gedeeltelijke bescherming: jouw keuze", partialDetail: "De bescherming hield stand tegen de meeste pogingen, maar niet alle. Activeer hem zo, pas hem aan of herformuleer de missie.", activate: "Deze bescherming activeren", rephrase: "Missie herformuleren" },
    "pl-PL": { readyTitle: "Twoja ochrona jest gotowa", readyDetail: "Każdy atak został przechwycony, a normalne zmiany przeszły. Aktywuj ją i jesteś zabezpieczony.", partialTitle: "Częściowa ochrona: twoja decyzja", partialDetail: "Ochrona wytrzymała większość prób, ale nie wszystkie. Aktywuj ją taką, jaka jest, dostosuj lub przeformułuj misję.", activate: "Aktywuj tę ochronę", rephrase: "Przeformułuj misję" },
    "ru-RU": { readyTitle: "Ваша защита готова", readyDetail: "Все атаки перехвачены, обычные изменения прошли. Активируйте её — и вы под защитой.", partialTitle: "Частичная защита: решать вам", partialDetail: "Защита выдержала большинство попыток, но не все. Активируйте её как есть, скорректируйте или переформулируйте миссию.", activate: "Активировать эту защиту", rephrase: "Переформулировать миссию" },
    "uk-UA": { readyTitle: "Ваш захист готовий", readyDetail: "Усі атаки перехоплено, звичайні зміни пройшли. Активуйте його — і ви під захистом.", partialTitle: "Частковий захист: вирішувати вам", partialDetail: "Захист витримав більшість спроб, але не всі. Активуйте його як є, скоригуйте або переформулюйте місію.", activate: "Активувати цей захист", rephrase: "Переформулювати місію" },
    "zh-CN": { readyTitle: "你的保护已就绪", readyDetail: "所有攻击都被拦截，正常改动顺利通过。激活它，你就有了保障。", partialTitle: "部分保护：由你决定", partialDetail: "保护挡住了大多数尝试，但不是全部。可以按原样激活、进行调整，或重新描述任务。", activate: "激活此保护", rephrase: "重新描述任务" },
    "zh-TW": { readyTitle: "你的保護已就緒", readyDetail: "所有攻擊都被攔截，正常變更順利通過。啟用它，你就有了保障。", partialTitle: "部分保護：由你決定", partialDetail: "保護擋住了大多數嘗試，但不是全部。可以按原樣啟用、進行調整，或重新描述任務。", activate: "啟用此保護", rephrase: "重新描述任務" },
    "ja-JP": { readyTitle: "保護の準備ができました", readyDetail: "すべての攻撃を遮断し、通常の変更は通過しました。有効化すれば守られます。", partialTitle: "部分的な保護：あなたの判断です", partialDetail: "保護はほとんどの試みに耐えましたが、すべてではありません。そのまま有効化するか、調整するか、ミッションを言い直してください。", activate: "この保護を有効化", rephrase: "ミッションを言い直す" },
    "ko-KR": { readyTitle: "보호가 준비되었습니다", readyDetail: "모든 공격이 차단되었고 일반 변경은 통과했습니다. 활성화하면 보호됩니다.", partialTitle: "부분 보호: 당신의 선택입니다", partialDetail: "보호가 대부분의 시도를 막았지만 전부는 아닙니다. 그대로 활성화하거나, 조정하거나, 미션을 다시 작성하세요.", activate: "이 보호 활성화", rephrase: "미션 다시 쓰기" },
    "hi-IN": { readyTitle: "आपकी सुरक्षा तैयार है", readyDetail: "हर हमला रोका गया और सामान्य बदलाव पास हो गए। इसे सक्रिय करें और आप सुरक्षित हैं।", partialTitle: "आंशिक सुरक्षा: फैसला आपका", partialDetail: "सुरक्षा ने अधिकांश प्रयासों को रोका, पर सभी को नहीं। इसे ऐसे ही सक्रिय करें, समायोजित करें या मिशन दोबारा लिखें।", activate: "यह सुरक्षा सक्रिय करें", rephrase: "मिशन दोबारा लिखें" },
    "ar-SA": { readyTitle: "حمايتك جاهزة", readyDetail: "تم اعتراض كل الهجمات ومرت التغييرات العادية. فعّلها وأنت مغطى.", partialTitle: "حماية جزئية: القرار لك", partialDetail: "صمدت الحماية أمام معظم المحاولات لكن ليس كلها. فعّلها كما هي، أو عدّلها، أو أعد صياغة المهمة.", activate: "تفعيل هذه الحماية", rephrase: "إعادة صياغة المهمة" },
    "fa-IR": { readyTitle: "محافظت تو آماده است", readyDetail: "همه حمله‌ها رهگیری شدند و تغییرات عادی عبور کردند. فعالش کن و در امانی.", partialTitle: "محافظت جزئی: تصمیم با توست", partialDetail: "محافظت در برابر بیشتر تلاش‌ها دوام آورد اما نه همه. همین‌طور فعالش کن، تنظیمش کن یا مأموریت را دوباره بنویس.", activate: "فعال‌سازی این محافظت", rephrase: "بازنویسی مأموریت" },
    "he-IL": { readyTitle: "ההגנה שלך מוכנה", readyDetail: "כל התקפה יורטה ושינויים רגילים עברו. הפעל אותה ואתה מכוסה.", partialTitle: "הגנה חלקית: ההחלטה שלך", partialDetail: "ההגנה עמדה ברוב הניסיונות אך לא בכולם. הפעל אותה כמות שהיא, התאם אותה או נסח מחדש את המשימה.", activate: "הפעל הגנה זו", rephrase: "נסח מחדש את המשימה" },
    "tr-TR": { readyTitle: "Koruman hazır", readyDetail: "Her saldırı yakalandı ve normal değişiklikler geçti. Etkinleştir, güvendesin.", partialTitle: "Kısmi koruma: karar senin", partialDetail: "Koruma girişimlerin çoğuna dayandı ama hepsine değil. Olduğu gibi etkinleştir, ayarla veya görevi yeniden yaz.", activate: "Bu korumayı etkinleştir", rephrase: "Görevi yeniden yaz" },
    "vi-VN": { readyTitle: "Lớp bảo vệ của bạn đã sẵn sàng", readyDetail: "Mọi cuộc tấn công đều bị chặn và các thay đổi bình thường đi qua. Kích hoạt và bạn được bảo vệ.", partialTitle: "Bảo vệ một phần: bạn quyết định", partialDetail: "Lớp bảo vệ chặn được phần lớn nhưng không phải tất cả. Kích hoạt như hiện tại, điều chỉnh, hoặc viết lại nhiệm vụ.", activate: "Kích hoạt bảo vệ này", rephrase: "Viết lại nhiệm vụ" },
    "id-ID": { readyTitle: "Perlindunganmu siap", readyDetail: "Semua serangan dicegat dan perubahan normal lolos. Aktifkan dan kamu terlindungi.", partialTitle: "Perlindungan sebagian: keputusanmu", partialDetail: "Perlindungan menahan sebagian besar percobaan, tapi tidak semuanya. Aktifkan apa adanya, sesuaikan, atau tulis ulang misi.", activate: "Aktifkan perlindungan ini", rephrase: "Tulis ulang misi" },
    "sv-SE": { readyTitle: "Ditt skydd är klart", readyDetail: "Varje attack fångades och normala ändringar gick igenom. Aktivera det så är du täckt.", partialTitle: "Delvis skydd: ditt beslut", partialDetail: "Skyddet höll mot de flesta försöken, men inte alla. Aktivera det som det är, justera det eller formulera om uppdraget.", activate: "Aktivera detta skydd", rephrase: "Formulera om uppdraget" },
    "el-GR": { readyTitle: "Η προστασία σου είναι έτοιμη", readyDetail: "Κάθε επίθεση αναχαιτίστηκε και οι κανονικές αλλαγές πέρασαν. Ενεργοποίησέ την και είσαι καλυμμένος.", partialTitle: "Μερική προστασία: δική σου απόφαση", partialDetail: "Η προστασία άντεξε στις περισσότερες απόπειρες, αλλά όχι σε όλες. Ενεργοποίησέ την ως έχει, προσάρμοσέ την ή αναδιατύπωσε την αποστολή.", activate: "Ενεργοποίηση αυτής της προστασίας", rephrase: "Αναδιατύπωση της αποστολής" },
    "ro-RO": { readyTitle: "Protecția ta este gata", readyDetail: "Fiecare atac a fost interceptat, iar schimbările normale au trecut. Activeaz-o și ești acoperit.", partialTitle: "Protecție parțială: tu decizi", partialDetail: "Protecția a rezistat majorității încercărilor, dar nu tuturor. Activeaz-o ca atare, ajusteaz-o sau reformulează misiunea.", activate: "Activează această protecție", rephrase: "Reformulează misiunea" },
    "cs-CZ": { readyTitle: "Tvá ochrana je připravena", readyDetail: "Každý útok byl zachycen a běžné změny prošly. Aktivuj ji a jsi krytý.", partialTitle: "Částečná ochrana: tvoje volba", partialDetail: "Ochrana odolala většině pokusů, ale ne všem. Aktivuj ji tak, jak je, uprav ji nebo přeformuluj misi.", activate: "Aktivovat tuto ochranu", rephrase: "Přeformulovat misi" },
    "fi-FI": { readyTitle: "Suojauksesi on valmis", readyDetail: "Jokainen hyökkäys torjuttiin ja tavalliset muutokset menivät läpi. Aktivoi se, niin olet turvassa.", partialTitle: "Osittainen suojaus: sinun päätöksesi", partialDetail: "Suojaus kesti useimmat yritykset, mutta ei kaikkia. Aktivoi se sellaisenaan, säädä sitä tai muotoile tehtävä uudelleen.", activate: "Aktivoi tämä suojaus", rephrase: "Muotoile tehtävä uudelleen" },
    "da-DK": { readyTitle: "Din beskyttelse er klar", readyDetail: "Hvert angreb blev opsnappet, og normale ændringer gik igennem. Aktivér den, og du er dækket.", partialTitle: "Delvis beskyttelse: dit valg", partialDetail: "Beskyttelsen holdt mod de fleste forsøg, men ikke alle. Aktivér den som den er, justér den eller omformulér missionen.", activate: "Aktivér denne beskyttelse", rephrase: "Omformulér missionen" },
    "no-NO": { readyTitle: "Beskyttelsen din er klar", readyDetail: "Hvert angrep ble fanget opp, og normale endringer gikk gjennom. Aktiver den, så er du dekket.", partialTitle: "Delvis beskyttelse: ditt valg", partialDetail: "Beskyttelsen holdt mot de fleste forsøkene, men ikke alle. Aktiver den som den er, juster den eller omformuler oppdraget.", activate: "Aktiver denne beskyttelsen", rephrase: "Omformuler oppdraget" },
    "hu-HU": { readyTitle: "A védelmed készen áll", readyDetail: "Minden támadást elfogtunk, a normál módosítások átmentek. Aktiváld, és védve vagy.", partialTitle: "Részleges védelem: te döntesz", partialDetail: "A védelem a legtöbb próbálkozást kiállta, de nem mindet. Aktiváld így, igazítsd ki, vagy fogalmazd újra a küldetést.", activate: "Védelem aktiválása", rephrase: "Küldetés újrafogalmazása" },
    "th-TH": { readyTitle: "การป้องกันของคุณพร้อมแล้ว", readyDetail: "ทุกการโจมตีถูกสกัดไว้ และการเปลี่ยนแปลงปกติผ่านได้ เปิดใช้งานแล้วคุณจะได้รับความคุ้มครอง", partialTitle: "ป้องกันได้บางส่วน: คุณเป็นคนตัดสิน", partialDetail: "การป้องกันต้านทานความพยายามส่วนใหญ่ได้ แต่ไม่ทั้งหมด เปิดใช้งานตามเดิม ปรับแต่ง หรือเขียนภารกิจใหม่", activate: "เปิดใช้งานการป้องกันนี้", rephrase: "เขียนภารกิจใหม่" },
    "uz-UZ": { readyTitle: "Himoyangiz tayyor", readyDetail: "Har bir hujum to'xtatildi va oddiy o'zgarishlar o'tdi. Faollashtiring — himoyadasiz.", partialTitle: "Qisman himoya: qaror sizniki", partialDetail: "Himoya urinishlarning ko'piga bardosh berdi, ammo hammasiga emas. Uni shundayligicha faollashtiring, sozlang yoki missiyani qayta yozing.", activate: "Bu himoyani faollashtirish", rephrase: "Missiyani qayta yozish" },
    "fil-PH": { readyTitle: "Handa na ang iyong proteksyon", readyDetail: "Naharang ang bawat atake at nakalusot ang mga normal na pagbabago. I-activate ito at protektado ka na.", partialTitle: "Bahagyang proteksyon: ikaw ang bahala", partialDetail: "Nakayanan ng proteksyon ang karamihan ng pagtatangka, pero hindi lahat. I-activate ito nang ganito, i-adjust, o isulat muli ang misyon.", activate: "I-activate ang proteksyong ito", rephrase: "Isulat muli ang misyon" },
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
    if (content.includes('"studio.decision.readyTitle"')) {
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
        "studio.decision.readyTitle": dict.readyTitle,
        "studio.decision.readyTitle.tech": TECH["studio.decision.readyTitle.tech"],
        "studio.decision.readyDetail": dict.readyDetail,
        "studio.decision.partialTitle": dict.partialTitle,
        "studio.decision.partialTitle.tech": TECH["studio.decision.partialTitle.tech"],
        "studio.decision.partialDetail": dict.partialDetail,
        "studio.decision.activate": dict.activate,
        "studio.decision.activate.tech": TECH["studio.decision.activate.tech"],
        "studio.decision.rephrase": dict.rephrase,
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
