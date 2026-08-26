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
    "studio.retrieval.title.tech": "Retrieval candidates",
    "studio.retrieval.summary.tech": "Candidates: {count} kept, {rejected} rejected.",
    "studio.traceDrawer.tech": "Reasoning trace",
};
const T = {
    "fr-FR": { cardTitle: "Mission", edit: "Modifier la mission", retrievalTitle: "Ce que j'ai trouvé", retrievalSummary: "J'ai trouvé {count} endroit(s) dans ton code qui correspondent, et j'en ai écarté {rejected}.", more: "+{count} autres", traceDrawer: "Détail technique" },
    "de-DE": { cardTitle: "Mission", edit: "Mission bearbeiten", retrievalTitle: "Was ich gefunden habe", retrievalSummary: "Ich habe {count} passende Stelle(n) in deinem Code gefunden und {rejected} aussortiert.", more: "+{count} weitere", traceDrawer: "Technisches Detail" },
    "es-ES": { cardTitle: "Misión", edit: "Editar la misión", retrievalTitle: "Lo que encontré", retrievalSummary: "Encontré {count} lugar(es) en tu código que coinciden y descarté {rejected}.", more: "+{count} más", traceDrawer: "Detalle técnico" },
    "it-IT": { cardTitle: "Missione", edit: "Modifica la missione", retrievalTitle: "Cosa ho trovato", retrievalSummary: "Ho trovato {count} punto/i nel tuo codice che corrispondono e ne ho scartati {rejected}.", more: "+{count} altri", traceDrawer: "Dettaglio tecnico" },
    "pt-BR": { cardTitle: "Missão", edit: "Editar a missão", retrievalTitle: "O que encontrei", retrievalSummary: "Encontrei {count} lugar(es) no seu código que correspondem e deixei {rejected} de lado.", more: "+{count} mais", traceDrawer: "Detalhe técnico" },
    "nl-NL": { cardTitle: "Missie", edit: "Missie bewerken", retrievalTitle: "Wat ik vond", retrievalSummary: "Ik vond {count} plek(ken) in je code die overeenkomen en zette er {rejected} opzij.", more: "+{count} meer", traceDrawer: "Technisch detail" },
    "pl-PL": { cardTitle: "Misja", edit: "Edytuj misję", retrievalTitle: "Co znalazłem", retrievalSummary: "Znalazłem {count} pasujące miejsce/miejsca w twoim kodzie i odłożyłem {rejected}.", more: "+{count} więcej", traceDrawer: "Szczegóły techniczne" },
    "ru-RU": { cardTitle: "Миссия", edit: "Изменить миссию", retrievalTitle: "Что я нашёл", retrievalSummary: "Я нашёл {count} подходящих мест(а) в вашем коде и отложил {rejected}.", more: "+{count} ещё", traceDrawer: "Технические детали" },
    "uk-UA": { cardTitle: "Місія", edit: "Змінити місію", retrievalTitle: "Що я знайшов", retrievalSummary: "Я знайшов {count} відповідних місць(я) у вашому коді та відклав {rejected}.", more: "+{count} ще", traceDrawer: "Технічні деталі" },
    "zh-CN": { cardTitle: "任务", edit: "编辑任务", retrievalTitle: "我找到了什么", retrievalSummary: "我在你的代码中找到 {count} 个匹配的位置，并排除了 {rejected} 个。", more: "还有 {count} 个", traceDrawer: "技术细节" },
    "zh-TW": { cardTitle: "任務", edit: "編輯任務", retrievalTitle: "我找到了什麼", retrievalSummary: "我在你的程式碼中找到 {count} 個相符的位置，並排除了 {rejected} 個。", more: "還有 {count} 個", traceDrawer: "技術細節" },
    "ja-JP": { cardTitle: "ミッション", edit: "ミッションを編集", retrievalTitle: "見つかったもの", retrievalSummary: "コード内で一致する場所を {count} 件見つけ、{rejected} 件を除外しました。", more: "他 {count} 件", traceDrawer: "技術的な詳細" },
    "ko-KR": { cardTitle: "미션", edit: "미션 수정", retrievalTitle: "찾은 것", retrievalSummary: "코드에서 일치하는 위치 {count}곳을 찾았고 {rejected}곳은 제외했습니다.", more: "+{count}개 더", traceDrawer: "기술 세부 정보" },
    "hi-IN": { cardTitle: "मिशन", edit: "मिशन संपादित करें", retrievalTitle: "मुझे क्या मिला", retrievalSummary: "मुझे आपके कोड में {count} मेल खाती जगह(ें) मिलीं और {rejected} को अलग रखा।", more: "+{count} और", traceDrawer: "तकनीकी विवरण" },
    "ar-SA": { cardTitle: "المهمة", edit: "تعديل المهمة", retrievalTitle: "ما وجدته", retrievalSummary: "وجدت {count} موضعًا مطابقًا في الكود واستبعدت {rejected}.", more: "+{count} أخرى", traceDrawer: "التفاصيل التقنية" },
    "fa-IR": { cardTitle: "مأموریت", edit: "ویرایش مأموریت", retrievalTitle: "آنچه پیدا کردم", retrievalSummary: "{count} جای منطبق در کد تو پیدا کردم و {rejected} مورد را کنار گذاشتم.", more: "+{count} مورد دیگر", traceDrawer: "جزئیات فنی" },
    "he-IL": { cardTitle: "משימה", edit: "עריכת המשימה", retrievalTitle: "מה מצאתי", retrievalSummary: "מצאתי {count} מקומות מתאימים בקוד שלך והנחתי בצד {rejected}.", more: "+{count} נוספים", traceDrawer: "פירוט טכני" },
    "tr-TR": { cardTitle: "Görev", edit: "Görevi düzenle", retrievalTitle: "Bulduklarım", retrievalSummary: "Kodunda eşleşen {count} yer buldum ve {rejected} tanesini eledim.", more: "+{count} daha", traceDrawer: "Teknik ayrıntı" },
    "vi-VN": { cardTitle: "Nhiệm vụ", edit: "Sửa nhiệm vụ", retrievalTitle: "Những gì tôi tìm thấy", retrievalSummary: "Tôi tìm thấy {count} vị trí phù hợp trong mã của bạn và loại {rejected} vị trí.", more: "+{count} nữa", traceDrawer: "Chi tiết kỹ thuật" },
    "id-ID": { cardTitle: "Misi", edit: "Ubah misi", retrievalTitle: "Yang saya temukan", retrievalSummary: "Saya menemukan {count} tempat yang cocok di kode kamu dan menyisihkan {rejected}.", more: "+{count} lagi", traceDrawer: "Detail teknis" },
    "sv-SE": { cardTitle: "Uppdrag", edit: "Redigera uppdraget", retrievalTitle: "Vad jag hittade", retrievalSummary: "Jag hittade {count} matchande ställe(n) i din kod och lade {rejected} åt sidan.", more: "+{count} till", traceDrawer: "Teknisk detalj" },
    "el-GR": { cardTitle: "Αποστολή", edit: "Επεξεργασία αποστολής", retrievalTitle: "Τι βρήκα", retrievalSummary: "Βρήκα {count} σημείο/α στον κώδικά σου που ταιριάζουν και άφησα στην άκρη {rejected}.", more: "+{count} ακόμα", traceDrawer: "Τεχνική λεπτομέρεια" },
    "ro-RO": { cardTitle: "Misiune", edit: "Editează misiunea", retrievalTitle: "Ce am găsit", retrievalSummary: "Am găsit {count} loc(uri) potrivite în codul tău și am lăsat deoparte {rejected}.", more: "+{count} în plus", traceDrawer: "Detaliu tehnic" },
    "cs-CZ": { cardTitle: "Mise", edit: "Upravit misi", retrievalTitle: "Co jsem našel", retrievalSummary: "Našel jsem {count} odpovídající místo/míst ve tvém kódu a {rejected} jsem odložil.", more: "+{count} dalších", traceDrawer: "Technický detail" },
    "fi-FI": { cardTitle: "Tehtävä", edit: "Muokkaa tehtävää", retrievalTitle: "Mitä löysin", retrievalSummary: "Löysin koodistasi {count} vastaavaa kohtaa ja jätin {rejected} sivuun.", more: "+{count} lisää", traceDrawer: "Tekninen yksityiskohta" },
    "da-DK": { cardTitle: "Mission", edit: "Rediger missionen", retrievalTitle: "Hvad jeg fandt", retrievalSummary: "Jeg fandt {count} matchende sted(er) i din kode og lagde {rejected} til side.", more: "+{count} mere", traceDrawer: "Teknisk detalje" },
    "no-NO": { cardTitle: "Oppdrag", edit: "Rediger oppdraget", retrievalTitle: "Hva jeg fant", retrievalSummary: "Jeg fant {count} samsvarende sted(er) i koden din og la {rejected} til side.", more: "+{count} til", traceDrawer: "Teknisk detalj" },
    "hu-HU": { cardTitle: "Küldetés", edit: "Küldetés szerkesztése", retrievalTitle: "Amit találtam", retrievalSummary: "Találtam {count} egyező helyet a kódodban, és {rejected} darabot félretettem.", more: "+{count} további", traceDrawer: "Technikai részlet" },
    "th-TH": { cardTitle: "ภารกิจ", edit: "แก้ไขภารกิจ", retrievalTitle: "สิ่งที่ฉันพบ", retrievalSummary: "ฉันพบ {count} จุดในโค้ดของคุณที่ตรงกัน และคัดออก {rejected} จุด", more: "+{count} เพิ่มเติม", traceDrawer: "รายละเอียดทางเทคนิค" },
    "uz-UZ": { cardTitle: "Missiya", edit: "Missiyani tahrirlash", retrievalTitle: "Nima topdim", retrievalSummary: "Kodingizda mos keladigan {count} ta joy topdim va {rejected} tasini chetga qo'ydim.", more: "+{count} ta yana", traceDrawer: "Texnik tafsilot" },
    "fil-PH": { cardTitle: "Misyon", edit: "I-edit ang misyon", retrievalTitle: "Ang nakita ko", retrievalSummary: "Nakakita ako ng {count} tumutugmang lugar sa iyong code at isinantabi ang {rejected}.", more: "+{count} pa", traceDrawer: "Teknikal na detalye" },
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
    if (content.includes('"studio.mission.cardTitle"')) {
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
        "studio.mission.cardTitle": dict.cardTitle,
        "studio.mission.edit": dict.edit,
        "studio.retrieval.title": dict.retrievalTitle,
        "studio.retrieval.title.tech": TECH["studio.retrieval.title.tech"],
        "studio.retrieval.summary": dict.retrievalSummary,
        "studio.retrieval.summary.tech": TECH["studio.retrieval.summary.tech"],
        "studio.retrieval.more": dict.more,
        "studio.traceDrawer": dict.traceDrawer,
        "studio.traceDrawer.tech": TECH["studio.traceDrawer.tech"],
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
