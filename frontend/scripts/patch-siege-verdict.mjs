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
const REPLACED = ["studio.sim.gapDetail", "studio.sim.tooBroadDetail", "studio.sim.mixedDetail"];
const ADDED = ["studio.sim.autoNext", "studio.sim.reviewNeeded"];
const T = {
    "fr-FR": {
        "studio.sim.gapDetail": "Ces attaques sont passées sans protection : {list}.",
        "studio.sim.tooBroadDetail": "Des changements ordinaires ont été bloqués : {list}.",
        "studio.sim.mixedDetail": "Des attaques sont passées ({gaps}) et des changements normaux ont été bloqués ({blocked}).",
        "studio.sim.autoNext": "Rien à faire de ton côté : l'assistant ajuste déjà la règle et va rejouer les attaques.",
        "studio.sim.reviewNeeded": "L'assistant n'a pas pu converger complètement. Regarde la règle proposée ci-dessous et décide.",
    },
    "de-DE": {
        "studio.sim.gapDetail": "Diese Angriffe kamen ungeschützt durch: {list}.",
        "studio.sim.tooBroadDetail": "Alltägliche Änderungen wurden blockiert: {list}.",
        "studio.sim.mixedDetail": "Einige Angriffe kamen durch ({gaps}), während normale Änderungen blockiert wurden ({blocked}).",
        "studio.sim.autoNext": "Nichts zu tun: Der Assistent passt die Regel bereits an und spielt die Angriffe erneut ab.",
        "studio.sim.reviewNeeded": "Der Assistent konnte nicht vollständig konvergieren. Prüfe die vorgeschlagene Regel unten und entscheide.",
    },
    "es-ES": {
        "studio.sim.gapDetail": "Estos ataques pasaron sin protección: {list}.",
        "studio.sim.tooBroadDetail": "Cambios cotidianos fueron bloqueados: {list}.",
        "studio.sim.mixedDetail": "Algunos ataques pasaron ({gaps}) y cambios normales fueron bloqueados ({blocked}).",
        "studio.sim.autoNext": "No tienes que hacer nada: el asistente ya está ajustando la regla y repetirá los ataques.",
        "studio.sim.reviewNeeded": "El asistente no pudo converger del todo. Revisa la regla propuesta abajo y decide.",
    },
    "it-IT": {
        "studio.sim.gapDetail": "Questi attacchi sono passati senza protezione: {list}.",
        "studio.sim.tooBroadDetail": "Modifiche ordinarie sono state bloccate: {list}.",
        "studio.sim.mixedDetail": "Alcuni attacchi sono passati ({gaps}) e modifiche normali sono state bloccate ({blocked}).",
        "studio.sim.autoNext": "Non devi fare nulla: l'assistente sta già correggendo la regola e ripeterà gli attacchi.",
        "studio.sim.reviewNeeded": "L'assistente non è riuscito a convergere del tutto. Esamina la regola proposta qui sotto e decidi.",
    },
    "pt-BR": {
        "studio.sim.gapDetail": "Estes ataques passaram sem proteção: {list}.",
        "studio.sim.tooBroadDetail": "Mudanças do dia a dia foram bloqueadas: {list}.",
        "studio.sim.mixedDetail": "Alguns ataques passaram ({gaps}) e mudanças normais foram bloqueadas ({blocked}).",
        "studio.sim.autoNext": "Nada a fazer do seu lado: o assistente já está ajustando a regra e vai repetir os ataques.",
        "studio.sim.reviewNeeded": "O assistente não conseguiu convergir totalmente. Revise a regra proposta abaixo e decida.",
    },
    "nl-NL": {
        "studio.sim.gapDetail": "Deze aanvallen kwamen onbeschermd door: {list}.",
        "studio.sim.tooBroadDetail": "Gewone wijzigingen werden geblokkeerd: {list}.",
        "studio.sim.mixedDetail": "Sommige aanvallen kwamen door ({gaps}) terwijl normale wijzigingen werden geblokkeerd ({blocked}).",
        "studio.sim.autoNext": "Je hoeft niets te doen: de assistent past de regel al aan en speelt de aanvallen opnieuw af.",
        "studio.sim.reviewNeeded": "De assistent kon niet volledig convergeren. Bekijk de voorgestelde regel hieronder en beslis.",
    },
    "pl-PL": {
        "studio.sim.gapDetail": "Te ataki przeszły bez ochrony: {list}.",
        "studio.sim.tooBroadDetail": "Codzienne zmiany zostały zablokowane: {list}.",
        "studio.sim.mixedDetail": "Część ataków przeszła ({gaps}), a normalne zmiany zostały zablokowane ({blocked}).",
        "studio.sim.autoNext": "Nic nie musisz robić: asystent już poprawia regułę i powtórzy ataki.",
        "studio.sim.reviewNeeded": "Asystent nie zdołał w pełni dopracować reguły. Przejrzyj propozycję poniżej i zdecyduj.",
    },
    "ru-RU": {
        "studio.sim.gapDetail": "Эти атаки прошли без защиты: {list}.",
        "studio.sim.tooBroadDetail": "Обычные изменения были заблокированы: {list}.",
        "studio.sim.mixedDetail": "Часть атак прошла ({gaps}), а обычные изменения были заблокированы ({blocked}).",
        "studio.sim.autoNext": "Делать ничего не нужно: ассистент уже корректирует правило и повторит атаки.",
        "studio.sim.reviewNeeded": "Ассистент не смог полностью сойтись. Просмотрите предложенное правило ниже и решите.",
    },
    "uk-UA": {
        "studio.sim.gapDetail": "Ці атаки пройшли без захисту: {list}.",
        "studio.sim.tooBroadDetail": "Звичайні зміни було заблоковано: {list}.",
        "studio.sim.mixedDetail": "Частина атак пройшла ({gaps}), а звичайні зміни було заблоковано ({blocked}).",
        "studio.sim.autoNext": "Нічого робити не треба: асистент уже коригує правило й повторить атаки.",
        "studio.sim.reviewNeeded": "Асистент не зміг повністю зійтися. Перегляньте запропоноване правило нижче та вирішіть.",
    },
    "zh-CN": {
        "studio.sim.gapDetail": "这些攻击未受保护地通过了：{list}。",
        "studio.sim.tooBroadDetail": "日常改动被拦截了：{list}。",
        "studio.sim.mixedDetail": "部分攻击通过了（{gaps}），而正常改动被拦截（{blocked}）。",
        "studio.sim.autoNext": "你无需做任何事：助手正在调整规则，并将重新演练这些攻击。",
        "studio.sim.reviewNeeded": "助手未能完全收敛。请查看下方提议的规则并做决定。",
    },
    "zh-TW": {
        "studio.sim.gapDetail": "這些攻擊未受保護地通過了：{list}。",
        "studio.sim.tooBroadDetail": "日常變更被攔截了：{list}。",
        "studio.sim.mixedDetail": "部分攻擊通過了（{gaps}），而正常變更被攔截（{blocked}）。",
        "studio.sim.autoNext": "你無需做任何事：助手正在調整規則，並將重新演練這些攻擊。",
        "studio.sim.reviewNeeded": "助手未能完全收斂。請查看下方提議的規則並做決定。",
    },
    "ja-JP": {
        "studio.sim.gapDetail": "これらの攻撃は保護されずに通過しました：{list}。",
        "studio.sim.tooBroadDetail": "日常的な変更がブロックされました：{list}。",
        "studio.sim.mixedDetail": "一部の攻撃が通過し（{gaps}）、通常の変更がブロックされました（{blocked}）。",
        "studio.sim.autoNext": "何もする必要はありません。アシスタントがすでにルールを調整し、攻撃を再演します。",
        "studio.sim.reviewNeeded": "アシスタントは完全には収束できませんでした。下の提案ルールを確認して判断してください。",
    },
    "ko-KR": {
        "studio.sim.gapDetail": "이 공격들은 보호 없이 통과했습니다: {list}.",
        "studio.sim.tooBroadDetail": "일상적인 변경이 차단되었습니다: {list}.",
        "studio.sim.mixedDetail": "일부 공격은 통과했고({gaps}), 정상 변경은 차단되었습니다({blocked}).",
        "studio.sim.autoNext": "할 일은 없습니다. 어시스턴트가 이미 규칙을 조정하고 공격을 다시 재생합니다.",
        "studio.sim.reviewNeeded": "어시스턴트가 완전히 수렴하지 못했습니다. 아래 제안된 규칙을 검토하고 결정하세요.",
    },
    "hi-IN": {
        "studio.sim.gapDetail": "ये हमले बिना सुरक्षा के निकल गए: {list}।",
        "studio.sim.tooBroadDetail": "रोज़मर्रा के बदलाव रोक दिए गए: {list}।",
        "studio.sim.mixedDetail": "कुछ हमले निकल गए ({gaps}) जबकि सामान्य बदलाव रोक दिए गए ({blocked})।",
        "studio.sim.autoNext": "आपको कुछ नहीं करना है: सहायक नियम को पहले से सुधार रहा है और हमलों को फिर से चलाएगा।",
        "studio.sim.reviewNeeded": "सहायक पूरी तरह समाधान नहीं कर सका। नीचे प्रस्तावित नियम देखें और निर्णय लें।",
    },
    "ar-SA": {
        "studio.sim.gapDetail": "مرت هذه الهجمات دون حماية: {list}.",
        "studio.sim.tooBroadDetail": "تم حظر تغييرات اعتيادية: {list}.",
        "studio.sim.mixedDetail": "مرت بعض الهجمات ({gaps}) بينما حُظرت تغييرات عادية ({blocked}).",
        "studio.sim.autoNext": "لا شيء عليك فعله: المساعد يعدّل القاعدة بالفعل وسيعيد تشغيل الهجمات.",
        "studio.sim.reviewNeeded": "لم يتمكن المساعد من الوصول إلى نتيجة كاملة. راجع القاعدة المقترحة أدناه وقرر.",
    },
    "fa-IR": {
        "studio.sim.gapDetail": "این حمله‌ها بدون محافظت عبور کردند: {list}.",
        "studio.sim.tooBroadDetail": "تغییرات روزمره مسدود شدند: {list}.",
        "studio.sim.mixedDetail": "برخی حمله‌ها عبور کردند ({gaps}) و تغییرات عادی مسدود شدند ({blocked}).",
        "studio.sim.autoNext": "کاری لازم نیست انجام دهی: دستیار در حال اصلاح قانون است و حمله‌ها را دوباره اجرا می‌کند.",
        "studio.sim.reviewNeeded": "دستیار نتوانست کاملاً به نتیجه برسد. قانون پیشنهادی زیر را بررسی کن و تصمیم بگیر.",
    },
    "he-IL": {
        "studio.sim.gapDetail": "התקפות אלו עברו ללא הגנה: {list}.",
        "studio.sim.tooBroadDetail": "שינויים שגרתיים נחסמו: {list}.",
        "studio.sim.mixedDetail": "חלק מההתקפות עברו ({gaps}) בעוד שינויים רגילים נחסמו ({blocked}).",
        "studio.sim.autoNext": "אין מה לעשות מצדך: העוזר כבר מתקן את הכלל ויריץ את ההתקפות מחדש.",
        "studio.sim.reviewNeeded": "העוזר לא הצליח להתכנס לגמרי. עיין בכלל המוצע למטה והחלט.",
    },
    "tr-TR": {
        "studio.sim.gapDetail": "Bu saldırılar korumasız geçti: {list}.",
        "studio.sim.tooBroadDetail": "Günlük değişiklikler engellendi: {list}.",
        "studio.sim.mixedDetail": "Bazı saldırılar geçti ({gaps}), normal değişiklikler ise engellendi ({blocked}).",
        "studio.sim.autoNext": "Senin yapman gereken bir şey yok: asistan kuralı zaten düzeltiyor ve saldırıları yeniden oynatacak.",
        "studio.sim.reviewNeeded": "Asistan tam olarak sonuca ulaşamadı. Aşağıda önerilen kuralı incele ve karar ver.",
    },
    "vi-VN": {
        "studio.sim.gapDetail": "Các cuộc tấn công này đã đi qua mà không bị chặn: {list}.",
        "studio.sim.tooBroadDetail": "Các thay đổi thường ngày đã bị chặn: {list}.",
        "studio.sim.mixedDetail": "Một số cuộc tấn công đã lọt qua ({gaps}) trong khi thay đổi bình thường bị chặn ({blocked}).",
        "studio.sim.autoNext": "Bạn không cần làm gì: trợ lý đang điều chỉnh quy tắc và sẽ chạy lại các cuộc tấn công.",
        "studio.sim.reviewNeeded": "Trợ lý chưa thể hội tụ hoàn toàn. Hãy xem quy tắc đề xuất bên dưới và quyết định.",
    },
    "id-ID": {
        "studio.sim.gapDetail": "Serangan ini lolos tanpa perlindungan: {list}.",
        "studio.sim.tooBroadDetail": "Perubahan sehari-hari terblokir: {list}.",
        "studio.sim.mixedDetail": "Sebagian serangan lolos ({gaps}) sementara perubahan normal terblokir ({blocked}).",
        "studio.sim.autoNext": "Tidak ada yang perlu kamu lakukan: asisten sedang menyesuaikan aturan dan akan mengulang serangan.",
        "studio.sim.reviewNeeded": "Asisten belum bisa konvergen sepenuhnya. Tinjau aturan yang diusulkan di bawah dan putuskan.",
    },
    "sv-SE": {
        "studio.sim.gapDetail": "Dessa attacker gick igenom oskyddat: {list}.",
        "studio.sim.tooBroadDetail": "Vardagliga ändringar blockerades: {list}.",
        "studio.sim.mixedDetail": "Vissa attacker gick igenom ({gaps}) medan normala ändringar blockerades ({blocked}).",
        "studio.sim.autoNext": "Du behöver inte göra något: assistenten justerar redan regeln och spelar upp attackerna igen.",
        "studio.sim.reviewNeeded": "Assistenten kunde inte konvergera helt. Granska den föreslagna regeln nedan och besluta.",
    },
    "el-GR": {
        "studio.sim.gapDetail": "Αυτές οι επιθέσεις πέρασαν χωρίς προστασία: {list}.",
        "studio.sim.tooBroadDetail": "Καθημερινές αλλαγές μπλοκαρίστηκαν: {list}.",
        "studio.sim.mixedDetail": "Κάποιες επιθέσεις πέρασαν ({gaps}) ενώ κανονικές αλλαγές μπλοκαρίστηκαν ({blocked}).",
        "studio.sim.autoNext": "Δεν χρειάζεται να κάνεις τίποτα: ο βοηθός ήδη διορθώνει τον κανόνα και θα ξαναπαίξει τις επιθέσεις.",
        "studio.sim.reviewNeeded": "Ο βοηθός δεν μπόρεσε να συγκλίνει πλήρως. Δες τον προτεινόμενο κανόνα παρακάτω και αποφάσισε.",
    },
    "ro-RO": {
        "studio.sim.gapDetail": "Aceste atacuri au trecut fără protecție: {list}.",
        "studio.sim.tooBroadDetail": "Schimbări obișnuite au fost blocate: {list}.",
        "studio.sim.mixedDetail": "Unele atacuri au trecut ({gaps}), iar schimbări normale au fost blocate ({blocked}).",
        "studio.sim.autoNext": "Nu ai nimic de făcut: asistentul ajustează deja regula și va rejuca atacurile.",
        "studio.sim.reviewNeeded": "Asistentul nu a putut converge complet. Analizează regula propusă mai jos și decide.",
    },
    "cs-CZ": {
        "studio.sim.gapDetail": "Tyto útoky prošly bez ochrany: {list}.",
        "studio.sim.tooBroadDetail": "Běžné změny byly zablokovány: {list}.",
        "studio.sim.mixedDetail": "Některé útoky prošly ({gaps}), zatímco běžné změny byly zablokovány ({blocked}).",
        "studio.sim.autoNext": "Nemusíš nic dělat: asistent už pravidlo upravuje a útoky přehraje znovu.",
        "studio.sim.reviewNeeded": "Asistent nedokázal plně konvergovat. Prohlédni si navržené pravidlo níže a rozhodni.",
    },
    "fi-FI": {
        "studio.sim.gapDetail": "Nämä hyökkäykset pääsivät läpi suojaamatta: {list}.",
        "studio.sim.tooBroadDetail": "Arkiset muutokset estettiin: {list}.",
        "studio.sim.mixedDetail": "Osa hyökkäyksistä pääsi läpi ({gaps}) ja tavalliset muutokset estettiin ({blocked}).",
        "studio.sim.autoNext": "Sinun ei tarvitse tehdä mitään: avustaja säätää sääntöä jo ja toistaa hyökkäykset.",
        "studio.sim.reviewNeeded": "Avustaja ei päässyt täysin ratkaisuun. Tarkista alla ehdotettu sääntö ja päätä.",
    },
    "da-DK": {
        "studio.sim.gapDetail": "Disse angreb kom igennem ubeskyttet: {list}.",
        "studio.sim.tooBroadDetail": "Hverdagsændringer blev blokeret: {list}.",
        "studio.sim.mixedDetail": "Nogle angreb kom igennem ({gaps}), mens normale ændringer blev blokeret ({blocked}).",
        "studio.sim.autoNext": "Du behøver ikke gøre noget: assistenten justerer allerede reglen og afspiller angrebene igen.",
        "studio.sim.reviewNeeded": "Assistenten kunne ikke konvergere helt. Gennemgå den foreslåede regel nedenfor og beslut.",
    },
    "no-NO": {
        "studio.sim.gapDetail": "Disse angrepene kom gjennom ubeskyttet: {list}.",
        "studio.sim.tooBroadDetail": "Hverdagslige endringer ble blokkert: {list}.",
        "studio.sim.mixedDetail": "Noen angrep kom gjennom ({gaps}), mens normale endringer ble blokkert ({blocked}).",
        "studio.sim.autoNext": "Du trenger ikke gjøre noe: assistenten justerer allerede regelen og spiller av angrepene på nytt.",
        "studio.sim.reviewNeeded": "Assistenten klarte ikke å konvergere helt. Se over den foreslåtte regelen nedenfor og bestem.",
    },
    "hu-HU": {
        "studio.sim.gapDetail": "Ezek a támadások védelem nélkül átjutottak: {list}.",
        "studio.sim.tooBroadDetail": "Hétköznapi módosítások lettek blokkolva: {list}.",
        "studio.sim.mixedDetail": "Néhány támadás átjutott ({gaps}), miközben normál módosítások blokkolva lettek ({blocked}).",
        "studio.sim.autoNext": "Nincs teendőd: az asszisztens már igazítja a szabályt, és újrajátssza a támadásokat.",
        "studio.sim.reviewNeeded": "Az asszisztens nem tudott teljesen konvergálni. Nézd át az alábbi javasolt szabályt és dönts.",
    },
    "th-TH": {
        "studio.sim.gapDetail": "การโจมตีเหล่านี้ผ่านไปโดยไม่มีการป้องกัน: {list}",
        "studio.sim.tooBroadDetail": "การเปลี่ยนแปลงทั่วไปถูกบล็อก: {list}",
        "studio.sim.mixedDetail": "การโจมตีบางส่วนผ่านไป ({gaps}) ขณะที่การเปลี่ยนแปลงปกติถูกบล็อก ({blocked})",
        "studio.sim.autoNext": "คุณไม่ต้องทำอะไร: ผู้ช่วยกำลังปรับกฎอยู่แล้วและจะเล่นการโจมตีซ้ำ",
        "studio.sim.reviewNeeded": "ผู้ช่วยไม่สามารถหาข้อสรุปได้สมบูรณ์ ตรวจดูกฎที่เสนอด้านล่างแล้วตัดสินใจ",
    },
    "uz-UZ": {
        "studio.sim.gapDetail": "Bu hujumlar himoyasiz o'tib ketdi: {list}.",
        "studio.sim.tooBroadDetail": "Oddiy o'zgarishlar bloklandi: {list}.",
        "studio.sim.mixedDetail": "Ba'zi hujumlar o'tib ketdi ({gaps}), oddiy o'zgarishlar esa bloklandi ({blocked}).",
        "studio.sim.autoNext": "Sizdan hech narsa talab qilinmaydi: yordamchi qoidani allaqachon sozlayapti va hujumlarni qayta ijro etadi.",
        "studio.sim.reviewNeeded": "Yordamchi to'liq yechimga kela olmadi. Quyidagi taklif qilingan qoidani ko'rib chiqing va qaror qiling.",
    },
    "fil-PH": {
        "studio.sim.gapDetail": "Nakalusot ang mga atakeng ito nang walang proteksyon: {list}.",
        "studio.sim.tooBroadDetail": "Naharang ang mga pang-araw-araw na pagbabago: {list}.",
        "studio.sim.mixedDetail": "May mga atakeng nakalusot ({gaps}) habang naharang ang mga normal na pagbabago ({blocked}).",
        "studio.sim.autoNext": "Wala kang kailangang gawin: inaayos na ng assistant ang panuntunan at uulitin ang mga atake.",
        "studio.sim.reviewNeeded": "Hindi tuluyang nakabuo ng solusyon ang assistant. Suriin ang iminungkahing panuntunan sa ibaba at magpasya.",
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
    if (content.includes('"studio.sim.autoNext"')) {
        console.log(`skip ${code}`);
        continue;
    }
    let ok = true;
    for (const key of REPLACED) {
        const re = entryRegex(key);
        if (!re.test(content)) {
            console.error(`entry ${key} not found in ${code}`);
            ok = false;
            break;
        }
        content = content.replace(re, `${JSON.stringify(key)}: ${JSON.stringify(dict[key])},`);
    }
    if (!ok) {
        process.exitCode = 1;
        continue;
    }
    const anchor = /^(\s*"studio\.sim\.untestedTitle":)/m;
    if (!anchor.test(content)) {
        console.error(`anchor studio.sim.untestedTitle not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const block = ADDED.map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(dict[key])},`).join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
