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
    "studio.zone.lockedTitle.tech": "Candidates locked",
    "studio.zone.protectCta.tech": "Arm the shield",
    "studio.zone.protectNote.tech": "Releases the buffered run: shield overlay, probe replay, verdict. Dry-run only, no writes.",
};
const T = {
    "fr-FR": {
        lockedTitle: "Zone identifiée",
        protectCta: "Protéger cette zone",
        protectNote: "Le bouclier se lève et des changements simulés viennent le tester, en direct sur le graphe. Rien dans ton code n'est modifié.",
        rephrase: "Pas la bonne zone ? Reformule",
    },
    "de-DE": {
        lockedTitle: "Zone erkannt",
        protectCta: "Diese Zone schützen",
        protectNote: "Der Schutzschild steigt auf und simulierte Änderungen testen ihn, live auf dem Graphen. An deinem Code wird nichts geändert.",
        rephrase: "Nicht die richtige Zone? Umformulieren",
    },
    "es-ES": {
        lockedTitle: "Zona identificada",
        protectCta: "Proteger esta zona",
        protectNote: "El escudo se levanta y cambios simulados vienen a probarlo, en directo sobre el grafo. No se modifica nada en tu código.",
        rephrase: "¿No es la zona correcta? Reformula",
    },
    "it-IT": {
        lockedTitle: "Zona identificata",
        protectCta: "Proteggi questa zona",
        protectNote: "Lo scudo si alza e modifiche simulate vengono a metterlo alla prova, in diretta sul grafo. Nel tuo codice non viene modificato nulla.",
        rephrase: "Non è la zona giusta? Riformula",
    },
    "pt-BR": {
        lockedTitle: "Zona identificada",
        protectCta: "Proteger esta zona",
        protectNote: "O escudo sobe e mudanças simuladas vêm testá-lo, ao vivo no grafo. Nada no seu código é modificado.",
        rephrase: "Não é a zona certa? Reformule",
    },
    "nl-NL": {
        lockedTitle: "Zone geïdentificeerd",
        protectCta: "Deze zone beschermen",
        protectNote: "Het schild gaat omhoog en gesimuleerde wijzigingen komen het testen, live op de grafiek. Er wordt niets in je code gewijzigd.",
        rephrase: "Niet de juiste zone? Herformuleer",
    },
    "pl-PL": {
        lockedTitle: "Strefa zidentyfikowana",
        protectCta: "Chroń tę strefę",
        protectNote: "Tarcza się podnosi, a symulowane zmiany przychodzą ją przetestować, na żywo na grafie. Nic w twoim kodzie nie jest modyfikowane.",
        rephrase: "Nie ta strefa? Przeformułuj",
    },
    "ru-RU": {
        lockedTitle: "Зона определена",
        protectCta: "Защитить эту зону",
        protectNote: "Щит поднимается, и смоделированные изменения приходят его проверить — вживую на графе. В вашем коде ничего не меняется.",
        rephrase: "Не та зона? Переформулируйте",
    },
    "uk-UA": {
        lockedTitle: "Зону визначено",
        protectCta: "Захистити цю зону",
        protectNote: "Щит піднімається, і змодельовані зміни приходять його перевірити — наживо на графі. У вашому коді нічого не змінюється.",
        rephrase: "Не та зона? Переформулюйте",
    },
    "zh-CN": {
        lockedTitle: "已识别区域",
        protectCta: "保护这个区域",
        protectNote: "护盾升起，模拟的改动会前来测试它，在图上实时呈现。你的代码不会被修改。",
        rephrase: "不是这个区域？重新描述",
    },
    "zh-TW": {
        lockedTitle: "已識別區域",
        protectCta: "保護這個區域",
        protectNote: "護盾升起，模擬的變更會前來測試它，在圖上即時呈現。你的程式碼不會被修改。",
        rephrase: "不是這個區域？重新描述",
    },
    "ja-JP": {
        lockedTitle: "ゾーンを特定",
        protectCta: "このゾーンを保護する",
        protectNote: "シールドが立ち上がり、模擬変更がそれを試しに来ます。グラフ上でライブで見られます。あなたのコードは一切変更されません。",
        rephrase: "違うゾーン？言い直す",
    },
    "ko-KR": {
        lockedTitle: "구역 식별됨",
        protectCta: "이 구역 보호하기",
        protectNote: "보호막이 올라가고 시뮬레이션된 변경들이 그래프 위에서 실시간으로 시험합니다. 당신의 코드는 수정되지 않습니다.",
        rephrase: "이 구역이 아닌가요? 다시 작성",
    },
    "hi-IN": {
        lockedTitle: "क्षेत्र पहचाना गया",
        protectCta: "इस क्षेत्र की रक्षा करें",
        protectNote: "कवच उठता है और नकली बदलाव उसे परखने आते हैं, ग्राफ़ पर लाइव। आपके कोड में कुछ नहीं बदला जाता।",
        rephrase: "सही क्षेत्र नहीं? दोबारा लिखें",
    },
    "ar-SA": {
        lockedTitle: "تم تحديد المنطقة",
        protectCta: "احمِ هذه المنطقة",
        protectNote: "يرتفع الدرع وتأتي تغييرات محاكاة لاختباره، مباشرة على المخطط. لا يُعدَّل أي شيء في شفرتك.",
        rephrase: "ليست المنطقة الصحيحة؟ أعد الصياغة",
    },
    "fa-IR": {
        lockedTitle: "ناحیه شناسایی شد",
        protectCta: "از این ناحیه محافظت کن",
        protectNote: "سپر بالا می‌رود و تغییرات شبیه‌سازی‌شده برای آزمودنش می‌آیند، به‌صورت زنده روی گراف. هیچ چیزی در کد تو تغییر نمی‌کند.",
        rephrase: "ناحیه درست نیست؟ دوباره بنویس",
    },
    "he-IL": {
        lockedTitle: "האזור זוהה",
        protectCta: "הגן על האזור הזה",
        protectNote: "המגן עולה ושינויים מדומים באים לבחון אותו, בשידור חי על הגרף. שום דבר בקוד שלך לא משתנה.",
        rephrase: "לא האזור הנכון? נסח מחדש",
    },
    "tr-TR": {
        lockedTitle: "Bölge belirlendi",
        protectCta: "Bu bölgeyi koru",
        protectNote: "Kalkan yükselir ve simüle edilmiş değişiklikler onu test etmeye gelir, grafik üzerinde canlı. Kodunda hiçbir şey değiştirilmez.",
        rephrase: "Doğru bölge değil mi? Yeniden yaz",
    },
    "vi-VN": {
        lockedTitle: "Đã xác định vùng",
        protectCta: "Bảo vệ vùng này",
        protectNote: "Lá chắn dựng lên và các thay đổi mô phỏng đến thử thách nó, trực tiếp trên đồ thị. Không có gì trong mã của bạn bị sửa đổi.",
        rephrase: "Không đúng vùng? Viết lại",
    },
    "id-ID": {
        lockedTitle: "Zona teridentifikasi",
        protectCta: "Lindungi zona ini",
        protectNote: "Perisai naik dan perubahan simulasi datang mengujinya, langsung di grafik. Tidak ada yang diubah di kodemu.",
        rephrase: "Bukan zona yang tepat? Tulis ulang",
    },
    "sv-SE": {
        lockedTitle: "Zon identifierad",
        protectCta: "Skydda den här zonen",
        protectNote: "Skölden reser sig och simulerade ändringar kommer för att testa den, live på grafen. Inget i din kod ändras.",
        rephrase: "Fel zon? Omformulera",
    },
    "el-GR": {
        lockedTitle: "Η ζώνη εντοπίστηκε",
        protectCta: "Προστάτευσε αυτή τη ζώνη",
        protectNote: "Η ασπίδα υψώνεται και προσομοιωμένες αλλαγές έρχονται να τη δοκιμάσουν, ζωντανά στον γράφο. Τίποτα στον κώδικά σου δεν τροποποιείται.",
        rephrase: "Λάθος ζώνη; Αναδιατύπωσε",
    },
    "ro-RO": {
        lockedTitle: "Zonă identificată",
        protectCta: "Protejează această zonă",
        protectNote: "Scutul se ridică și schimbări simulate vin să-l testeze, în direct pe graf. Nimic din codul tău nu este modificat.",
        rephrase: "Nu e zona potrivită? Reformulează",
    },
    "cs-CZ": {
        lockedTitle: "Zóna nalezena",
        protectCta: "Chránit tuto zónu",
        protectNote: "Štít se zvedá a simulované změny ho přicházejí otestovat, živě na grafu. Ve tvém kódu se nic nemění.",
        rephrase: "Není to ta správná zóna? Přeformuluj",
    },
    "fi-FI": {
        lockedTitle: "Alue tunnistettu",
        protectCta: "Suojaa tämä alue",
        protectNote: "Kilpi nousee ja simuloidut muutokset tulevat testaamaan sitä, suorana graafilla. Koodiisi ei tehdä mitään muutoksia.",
        rephrase: "Väärä alue? Muotoile uudelleen",
    },
    "da-DK": {
        lockedTitle: "Zone identificeret",
        protectCta: "Beskyt denne zone",
        protectNote: "Skjoldet rejser sig, og simulerede ændringer kommer for at teste det, live på grafen. Intet i din kode ændres.",
        rephrase: "Ikke den rigtige zone? Omformulér",
    },
    "no-NO": {
        lockedTitle: "Sone identifisert",
        protectCta: "Beskytt denne sonen",
        protectNote: "Skjoldet reiser seg og simulerte endringer kommer for å teste det, live på grafen. Ingenting i koden din endres.",
        rephrase: "Feil sone? Omformuler",
    },
    "hu-HU": {
        lockedTitle: "Zóna azonosítva",
        protectCta: "Védd meg ezt a zónát",
        protectNote: "A pajzs felemelkedik, és szimulált módosítások jönnek tesztelni, élőben a gráfon. A kódodban semmi sem módosul.",
        rephrase: "Nem a jó zóna? Fogalmazd újra",
    },
    "th-TH": {
        lockedTitle: "ระบุเขตแล้ว",
        protectCta: "ป้องกันเขตนี้",
        protectNote: "โล่ยกขึ้นและการเปลี่ยนแปลงจำลองจะเข้ามาทดสอบมัน แบบสดบนกราฟ ไม่มีอะไรในโค้ดของคุณถูกแก้ไข",
        rephrase: "ไม่ใช่เขตที่ถูกต้อง? เขียนใหม่",
    },
    "uz-UZ": {
        lockedTitle: "Zona aniqlandi",
        protectCta: "Bu zonani himoya qilish",
        protectNote: "Qalqon ko'tariladi va simulyatsiya qilingan o'zgarishlar uni sinash uchun keladi, grafda jonli. Kodingizda hech narsa o'zgartirilmaydi.",
        rephrase: "Noto'g'ri zonami? Qayta yozing",
    },
    "fil-PH": {
        lockedTitle: "Natukoy ang sona",
        protectCta: "Protektahan ang sonang ito",
        protectNote: "Tumataas ang kalasag at dumarating ang mga simuladong pagbabago para subukin ito, live sa graph. Walang binabago sa code mo.",
        rephrase: "Hindi tamang sona? Isulat muli",
    },
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
    const dict = T[code];
    if (!dict) {
        console.error(`missing translations for ${code}`);
        process.exitCode = 1;
        continue;
    }
    if (content.includes('"studio.zone.protectCta"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const anchor = entryRegex("studio.traceDrawer");
    if (!anchor.test(content)) {
        console.error(`anchor studio.traceDrawer not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const entries = {
        "studio.zone.lockedTitle": dict.lockedTitle,
        "studio.zone.lockedTitle.tech": TECH["studio.zone.lockedTitle.tech"],
        "studio.zone.protectCta": dict.protectCta,
        "studio.zone.protectCta.tech": TECH["studio.zone.protectCta.tech"],
        "studio.zone.protectNote": dict.protectNote,
        "studio.zone.protectNote.tech": TECH["studio.zone.protectNote.tech"],
        "studio.zone.rephrase": dict.rephrase,
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, (m) => `${block}\n${m}`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
