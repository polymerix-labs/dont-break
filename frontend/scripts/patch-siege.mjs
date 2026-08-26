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
const KEY_ORDER = [
    "studio.sim.skip",
    "studio.sim.playing",
    "studio.sim.zoneArmed",
    "studio.sim.hud",
    "studio.sim.outcomeIntercepted",
    "studio.sim.outcomeBreach",
    "studio.sim.outcomeAllowed",
    "studio.sim.outcomeOverBlock",
];
const T = {
    "fr-FR": {
        "studio.sim.skip": "Passer",
        "studio.sim.playing": "En vol",
        "studio.sim.zoneArmed": "Bouclier levé : {count} nœud(s) sous protection",
        "studio.sim.hud": "Tentative {current}/{total} · {intercepted} interceptée(s) · {breaches} brèche(s)",
        "studio.sim.outcomeIntercepted": "Interceptée",
        "studio.sim.outcomeBreach": "Brèche",
        "studio.sim.outcomeAllowed": "Passée sans toucher",
        "studio.sim.outcomeOverBlock": "Bloquée à tort",
    },
    "de-DE": {
        "studio.sim.skip": "Überspringen",
        "studio.sim.playing": "Im Flug",
        "studio.sim.zoneArmed": "Schild aktiv: {count} Knoten unter Schutz",
        "studio.sim.hud": "Versuch {current}/{total} · {intercepted} abgefangen · {breaches} Durchbruch/Durchbrüche",
        "studio.sim.outcomeIntercepted": "Abgefangen",
        "studio.sim.outcomeBreach": "Durchbruch",
        "studio.sim.outcomeAllowed": "Sauber durchgelassen",
        "studio.sim.outcomeOverBlock": "Fälschlich blockiert",
    },
    "es-ES": {
        "studio.sim.skip": "Saltar",
        "studio.sim.playing": "En vuelo",
        "studio.sim.zoneArmed": "Escudo activo: {count} nodo(s) bajo protección",
        "studio.sim.hud": "Intento {current}/{total} · {intercepted} interceptado(s) · {breaches} brecha(s)",
        "studio.sim.outcomeIntercepted": "Interceptado",
        "studio.sim.outcomeBreach": "Brecha",
        "studio.sim.outcomeAllowed": "Pasó sin tocar",
        "studio.sim.outcomeOverBlock": "Bloqueado por error",
    },
    "it-IT": {
        "studio.sim.skip": "Salta",
        "studio.sim.playing": "In volo",
        "studio.sim.zoneArmed": "Scudo attivo: {count} nodo/i sotto protezione",
        "studio.sim.hud": "Tentativo {current}/{total} · {intercepted} intercettato/i · {breaches} falla/e",
        "studio.sim.outcomeIntercepted": "Intercettato",
        "studio.sim.outcomeBreach": "Falla",
        "studio.sim.outcomeAllowed": "Passato senza toccare",
        "studio.sim.outcomeOverBlock": "Bloccato per errore",
    },
    "pt-BR": {
        "studio.sim.skip": "Pular",
        "studio.sim.playing": "Em voo",
        "studio.sim.zoneArmed": "Escudo ativo: {count} nó(s) sob proteção",
        "studio.sim.hud": "Tentativa {current}/{total} · {intercepted} interceptada(s) · {breaches} brecha(s)",
        "studio.sim.outcomeIntercepted": "Interceptada",
        "studio.sim.outcomeBreach": "Brecha",
        "studio.sim.outcomeAllowed": "Passou sem tocar",
        "studio.sim.outcomeOverBlock": "Bloqueada por engano",
    },
    "nl-NL": {
        "studio.sim.skip": "Overslaan",
        "studio.sim.playing": "In de lucht",
        "studio.sim.zoneArmed": "Schild actief: {count} node(s) beschermd",
        "studio.sim.hud": "Poging {current}/{total} · {intercepted} onderschept · {breaches} doorbraak/doorbraken",
        "studio.sim.outcomeIntercepted": "Onderschept",
        "studio.sim.outcomeBreach": "Doorbraak",
        "studio.sim.outcomeAllowed": "Zonder aanraking gepasseerd",
        "studio.sim.outcomeOverBlock": "Onterecht geblokkeerd",
    },
    "pl-PL": {
        "studio.sim.skip": "Pomiń",
        "studio.sim.playing": "W locie",
        "studio.sim.zoneArmed": "Tarcza aktywna: {count} węzłów pod ochroną",
        "studio.sim.hud": "Próba {current}/{total} · {intercepted} przechwycono · {breaches} wyłomów",
        "studio.sim.outcomeIntercepted": "Przechwycona",
        "studio.sim.outcomeBreach": "Wyłom",
        "studio.sim.outcomeAllowed": "Przeszła bez kontaktu",
        "studio.sim.outcomeOverBlock": "Zablokowana omyłkowo",
    },
    "ru-RU": {
        "studio.sim.skip": "Пропустить",
        "studio.sim.playing": "В полёте",
        "studio.sim.zoneArmed": "Щит поднят: {count} узел(ов) под защитой",
        "studio.sim.hud": "Попытка {current}/{total} · {intercepted} перехвачено · {breaches} прорыв(ов)",
        "studio.sim.outcomeIntercepted": "Перехвачена",
        "studio.sim.outcomeBreach": "Прорыв",
        "studio.sim.outcomeAllowed": "Прошла, не задев",
        "studio.sim.outcomeOverBlock": "Заблокирована ошибочно",
    },
    "uk-UA": {
        "studio.sim.skip": "Пропустити",
        "studio.sim.playing": "У польоті",
        "studio.sim.zoneArmed": "Щит піднято: {count} вузол(ів) під захистом",
        "studio.sim.hud": "Спроба {current}/{total} · {intercepted} перехоплено · {breaches} пролом(ів)",
        "studio.sim.outcomeIntercepted": "Перехоплена",
        "studio.sim.outcomeBreach": "Пролом",
        "studio.sim.outcomeAllowed": "Пройшла, не зачепивши",
        "studio.sim.outcomeOverBlock": "Заблокована помилково",
    },
    "zh-CN": {
        "studio.sim.skip": "跳过",
        "studio.sim.playing": "进行中",
        "studio.sim.zoneArmed": "护盾已开启：{count} 个节点受保护",
        "studio.sim.hud": "尝试 {current}/{total} · 拦截 {intercepted} 次 · 突破 {breaches} 次",
        "studio.sim.outcomeIntercepted": "已拦截",
        "studio.sim.outcomeBreach": "被突破",
        "studio.sim.outcomeAllowed": "顺利通过",
        "studio.sim.outcomeOverBlock": "误拦截",
    },
    "zh-TW": {
        "studio.sim.skip": "跳過",
        "studio.sim.playing": "進行中",
        "studio.sim.zoneArmed": "護盾已開啟：{count} 個節點受保護",
        "studio.sim.hud": "嘗試 {current}/{total} · 攔截 {intercepted} 次 · 突破 {breaches} 次",
        "studio.sim.outcomeIntercepted": "已攔截",
        "studio.sim.outcomeBreach": "被突破",
        "studio.sim.outcomeAllowed": "順利通過",
        "studio.sim.outcomeOverBlock": "誤攔截",
    },
    "ja-JP": {
        "studio.sim.skip": "スキップ",
        "studio.sim.playing": "進行中",
        "studio.sim.zoneArmed": "シールド展開：{count} 個のノードを保護中",
        "studio.sim.hud": "試行 {current}/{total} · 阻止 {intercepted} 件 · 突破 {breaches} 件",
        "studio.sim.outcomeIntercepted": "阻止",
        "studio.sim.outcomeBreach": "突破",
        "studio.sim.outcomeAllowed": "無接触で通過",
        "studio.sim.outcomeOverBlock": "誤ブロック",
    },
    "ko-KR": {
        "studio.sim.skip": "건너뛰기",
        "studio.sim.playing": "진행 중",
        "studio.sim.zoneArmed": "보호막 가동: {count}개 노드 보호 중",
        "studio.sim.hud": "시도 {current}/{total} · 차단 {intercepted}건 · 돌파 {breaches}건",
        "studio.sim.outcomeIntercepted": "차단됨",
        "studio.sim.outcomeBreach": "돌파됨",
        "studio.sim.outcomeAllowed": "무사 통과",
        "studio.sim.outcomeOverBlock": "잘못 차단됨",
    },
    "hi-IN": {
        "studio.sim.skip": "छोड़ें",
        "studio.sim.playing": "उड़ान में",
        "studio.sim.zoneArmed": "कवच सक्रिय: {count} नोड सुरक्षित",
        "studio.sim.hud": "प्रयास {current}/{total} · {intercepted} रोके गए · {breaches} सेंध",
        "studio.sim.outcomeIntercepted": "रोका गया",
        "studio.sim.outcomeBreach": "सेंध",
        "studio.sim.outcomeAllowed": "बिना छुए निकला",
        "studio.sim.outcomeOverBlock": "गलती से रोका गया",
    },
    "ar-SA": {
        "studio.sim.skip": "تخطي",
        "studio.sim.playing": "قيد التنفيذ",
        "studio.sim.zoneArmed": "الدرع مرفوع: {count} عقدة تحت الحماية",
        "studio.sim.hud": "محاولة {current}/{total} · {intercepted} تم اعتراضها · {breaches} اختراق",
        "studio.sim.outcomeIntercepted": "تم اعتراضها",
        "studio.sim.outcomeBreach": "اختراق",
        "studio.sim.outcomeAllowed": "مرّت دون مساس",
        "studio.sim.outcomeOverBlock": "حُظرت خطأً",
    },
    "fa-IR": {
        "studio.sim.skip": "رد شدن",
        "studio.sim.playing": "در حال پرواز",
        "studio.sim.zoneArmed": "سپر فعال: {count} گره تحت محافظت",
        "studio.sim.hud": "تلاش {current}/{total} · {intercepted} مهار شد · {breaches} رخنه",
        "studio.sim.outcomeIntercepted": "مهار شد",
        "studio.sim.outcomeBreach": "رخنه",
        "studio.sim.outcomeAllowed": "بدون برخورد عبور کرد",
        "studio.sim.outcomeOverBlock": "به اشتباه مسدود شد",
    },
    "he-IL": {
        "studio.sim.skip": "דלג",
        "studio.sim.playing": "בטיסה",
        "studio.sim.zoneArmed": "המגן פעיל: {count} צמתים מוגנים",
        "studio.sim.hud": "ניסיון {current}/{total} · {intercepted} נחסמו · {breaches} פריצות",
        "studio.sim.outcomeIntercepted": "נחסם",
        "studio.sim.outcomeBreach": "פריצה",
        "studio.sim.outcomeAllowed": "עבר בלי לגעת",
        "studio.sim.outcomeOverBlock": "נחסם בטעות",
    },
    "tr-TR": {
        "studio.sim.skip": "Atla",
        "studio.sim.playing": "Uçuşta",
        "studio.sim.zoneArmed": "Kalkan aktif: {count} düğüm koruma altında",
        "studio.sim.hud": "Deneme {current}/{total} · {intercepted} engellendi · {breaches} gedik",
        "studio.sim.outcomeIntercepted": "Engellendi",
        "studio.sim.outcomeBreach": "Gedik",
        "studio.sim.outcomeAllowed": "Dokunmadan geçti",
        "studio.sim.outcomeOverBlock": "Yanlışlıkla engellendi",
    },
    "vi-VN": {
        "studio.sim.skip": "Bỏ qua",
        "studio.sim.playing": "Đang bay",
        "studio.sim.zoneArmed": "Khiên đã bật: {count} nút được bảo vệ",
        "studio.sim.hud": "Lần thử {current}/{total} · chặn {intercepted} · {breaches} lỗ hổng",
        "studio.sim.outcomeIntercepted": "Đã chặn",
        "studio.sim.outcomeBreach": "Lỗ hổng",
        "studio.sim.outcomeAllowed": "Đi qua an toàn",
        "studio.sim.outcomeOverBlock": "Bị chặn nhầm",
    },
    "id-ID": {
        "studio.sim.skip": "Lewati",
        "studio.sim.playing": "Sedang berlangsung",
        "studio.sim.zoneArmed": "Perisai aktif: {count} simpul terlindungi",
        "studio.sim.hud": "Percobaan {current}/{total} · {intercepted} dicegat · {breaches} celah",
        "studio.sim.outcomeIntercepted": "Dicegat",
        "studio.sim.outcomeBreach": "Celah",
        "studio.sim.outcomeAllowed": "Lewat tanpa menyentuh",
        "studio.sim.outcomeOverBlock": "Terblokir keliru",
    },
    "sv-SE": {
        "studio.sim.skip": "Hoppa över",
        "studio.sim.playing": "I luften",
        "studio.sim.zoneArmed": "Skölden uppe: {count} noder skyddade",
        "studio.sim.hud": "Försök {current}/{total} · {intercepted} stoppade · {breaches} genombrott",
        "studio.sim.outcomeIntercepted": "Stoppad",
        "studio.sim.outcomeBreach": "Genombrott",
        "studio.sim.outcomeAllowed": "Passerade fritt",
        "studio.sim.outcomeOverBlock": "Felaktigt stoppad",
    },
    "el-GR": {
        "studio.sim.skip": "Παράλειψη",
        "studio.sim.playing": "Σε πτήση",
        "studio.sim.zoneArmed": "Ασπίδα ενεργή: {count} κόμβοι υπό προστασία",
        "studio.sim.hud": "Απόπειρα {current}/{total} · {intercepted} αποτράπηκαν · {breaches} ρήγματα",
        "studio.sim.outcomeIntercepted": "Αποτράπηκε",
        "studio.sim.outcomeBreach": "Ρήγμα",
        "studio.sim.outcomeAllowed": "Πέρασε ανέπαφα",
        "studio.sim.outcomeOverBlock": "Μπλοκαρίστηκε κατά λάθος",
    },
    "ro-RO": {
        "studio.sim.skip": "Sari peste",
        "studio.sim.playing": "În zbor",
        "studio.sim.zoneArmed": "Scut activ: {count} noduri protejate",
        "studio.sim.hud": "Tentativa {current}/{total} · {intercepted} interceptate · {breaches} breșe",
        "studio.sim.outcomeIntercepted": "Interceptată",
        "studio.sim.outcomeBreach": "Breșă",
        "studio.sim.outcomeAllowed": "A trecut fără atingere",
        "studio.sim.outcomeOverBlock": "Blocată din greșeală",
    },
    "cs-CZ": {
        "studio.sim.skip": "Přeskočit",
        "studio.sim.playing": "V letu",
        "studio.sim.zoneArmed": "Štít aktivní: {count} uzlů pod ochranou",
        "studio.sim.hud": "Pokus {current}/{total} · {intercepted} zachyceno · {breaches} průlomů",
        "studio.sim.outcomeIntercepted": "Zachycen",
        "studio.sim.outcomeBreach": "Průlom",
        "studio.sim.outcomeAllowed": "Prošel bez dotyku",
        "studio.sim.outcomeOverBlock": "Omylem zablokován",
    },
    "fi-FI": {
        "studio.sim.skip": "Ohita",
        "studio.sim.playing": "Lennossa",
        "studio.sim.zoneArmed": "Kilpi ylhäällä: {count} solmua suojattuna",
        "studio.sim.hud": "Yritys {current}/{total} · {intercepted} torjuttu · {breaches} läpimurtoa",
        "studio.sim.outcomeIntercepted": "Torjuttu",
        "studio.sim.outcomeBreach": "Läpimurto",
        "studio.sim.outcomeAllowed": "Ohitti koskematta",
        "studio.sim.outcomeOverBlock": "Estetty vahingossa",
    },
    "da-DK": {
        "studio.sim.skip": "Spring over",
        "studio.sim.playing": "I luften",
        "studio.sim.zoneArmed": "Skjold oppe: {count} noder beskyttet",
        "studio.sim.hud": "Forsøg {current}/{total} · {intercepted} standset · {breaches} gennembrud",
        "studio.sim.outcomeIntercepted": "Standset",
        "studio.sim.outcomeBreach": "Gennembrud",
        "studio.sim.outcomeAllowed": "Passerede frit",
        "studio.sim.outcomeOverBlock": "Fejlagtigt blokeret",
    },
    "no-NO": {
        "studio.sim.skip": "Hopp over",
        "studio.sim.playing": "I luften",
        "studio.sim.zoneArmed": "Skjold oppe: {count} noder beskyttet",
        "studio.sim.hud": "Forsøk {current}/{total} · {intercepted} stanset · {breaches} gjennombrudd",
        "studio.sim.outcomeIntercepted": "Stanset",
        "studio.sim.outcomeBreach": "Gjennombrudd",
        "studio.sim.outcomeAllowed": "Passerte fritt",
        "studio.sim.outcomeOverBlock": "Feilaktig blokkert",
    },
    "hu-HU": {
        "studio.sim.skip": "Kihagyás",
        "studio.sim.playing": "Repülés közben",
        "studio.sim.zoneArmed": "Pajzs aktív: {count} csomópont védve",
        "studio.sim.hud": "Kísérlet {current}/{total} · {intercepted} elfogva · {breaches} áttörés",
        "studio.sim.outcomeIntercepted": "Elfogva",
        "studio.sim.outcomeBreach": "Áttörés",
        "studio.sim.outcomeAllowed": "Érintés nélkül átjutott",
        "studio.sim.outcomeOverBlock": "Tévedésből blokkolva",
    },
    "th-TH": {
        "studio.sim.skip": "ข้าม",
        "studio.sim.playing": "กำลังบิน",
        "studio.sim.zoneArmed": "โล่เปิดใช้งาน: ปกป้อง {count} โหนด",
        "studio.sim.hud": "ความพยายาม {current}/{total} · สกัด {intercepted} ครั้ง · เจาะทะลุ {breaches} ครั้ง",
        "studio.sim.outcomeIntercepted": "ถูกสกัด",
        "studio.sim.outcomeBreach": "เจาะทะลุ",
        "studio.sim.outcomeAllowed": "ผ่านโดยไม่แตะต้อง",
        "studio.sim.outcomeOverBlock": "ถูกบล็อกโดยผิดพลาด",
    },
    "uz-UZ": {
        "studio.sim.skip": "O'tkazib yuborish",
        "studio.sim.playing": "Parvozda",
        "studio.sim.zoneArmed": "Qalqon ko'tarildi: {count} ta tugun himoyada",
        "studio.sim.hud": "Urinish {current}/{total} · {intercepted} ta to'xtatildi · {breaches} ta yorib o'tish",
        "studio.sim.outcomeIntercepted": "To'xtatildi",
        "studio.sim.outcomeBreach": "Yorib o'tildi",
        "studio.sim.outcomeAllowed": "Tegmasdan o'tdi",
        "studio.sim.outcomeOverBlock": "Xato bloklandi",
    },
    "fil-PH": {
        "studio.sim.skip": "Laktawan",
        "studio.sim.playing": "Lumilipad",
        "studio.sim.zoneArmed": "Aktibo ang kalasag: {count} node ang protektado",
        "studio.sim.hud": "Pagtatangka {current}/{total} · {intercepted} ang naharang · {breaches} ang nakalusot",
        "studio.sim.outcomeIntercepted": "Naharang",
        "studio.sim.outcomeBreach": "Nakalusot",
        "studio.sim.outcomeAllowed": "Dumaan nang hindi tumama",
        "studio.sim.outcomeOverBlock": "Maling naharang",
    },
};
for (const file of readdirSync(localesDir)) {
    if (!file.endsWith(".ts") || file === "en.ts")
        continue;
    const code = file.replace(".ts", "");
    const path = join(localesDir, file);
    let content = readFileSync(path, "utf8");
    if (content.includes('"studio.sim.skip"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const dict = T[code];
    if (!dict) {
        console.error(`missing translations for ${code}`);
        process.exitCode = 1;
        continue;
    }
    const re = /^(\s*"studio\.contract\.title":)/m;
    if (!re.test(content)) {
        console.error(`anchor studio.contract.title not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const block = KEY_ORDER.map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(dict[key])},`).join("\n");
    content = content.replace(re, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
