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
    "studio.sim.groupAttacks.tech": "Expected: block",
    "studio.sim.groupControls.tech": "Expected: pass",
    "studio.sim.roundNext.tech": "Iteration: tightening the draft and re-running the probes.",
};
const T = {
    "fr-FR": { attacks: "Attaques", controls: "Changements normaux", attempt: "Tentative {n}", roundNext: "Round {round} : je renforce la règle et je réattaque." },
    "de-DE": { attacks: "Angriffe", controls: "Normale Änderungen", attempt: "Versuch {n}", roundNext: "Runde {round}: Ich verstärke die Regel und greife erneut an." },
    "es-ES": { attacks: "Ataques", controls: "Cambios normales", attempt: "Intento {n}", roundNext: "Ronda {round}: refuerzo la regla y vuelvo a atacar." },
    "it-IT": { attacks: "Attacchi", controls: "Modifiche normali", attempt: "Tentativo {n}", roundNext: "Round {round}: rinforzo la regola e attacco di nuovo." },
    "pt-BR": { attacks: "Ataques", controls: "Mudanças normais", attempt: "Tentativa {n}", roundNext: "Rodada {round}: reforço a regra e ataco de novo." },
    "nl-NL": { attacks: "Aanvallen", controls: "Normale wijzigingen", attempt: "Poging {n}", roundNext: "Ronde {round}: ik versterk de regel en val opnieuw aan." },
    "pl-PL": { attacks: "Ataki", controls: "Normalne zmiany", attempt: "Próba {n}", roundNext: "Runda {round}: wzmacniam regułę i atakuję ponownie." },
    "ru-RU": { attacks: "Атаки", controls: "Обычные изменения", attempt: "Попытка {n}", roundNext: "Раунд {round}: усиливаю правило и атакую снова." },
    "uk-UA": { attacks: "Атаки", controls: "Звичайні зміни", attempt: "Спроба {n}", roundNext: "Раунд {round}: посилюю правило й атакую знову." },
    "zh-CN": { attacks: "攻击", controls: "正常改动", attempt: "尝试 {n}", roundNext: "第 {round} 轮：我正在加固规则并再次进攻。" },
    "zh-TW": { attacks: "攻擊", controls: "正常變更", attempt: "嘗試 {n}", roundNext: "第 {round} 輪：我正在加固規則並再次進攻。" },
    "ja-JP": { attacks: "攻撃", controls: "通常の変更", attempt: "試行 {n}", roundNext: "ラウンド {round}：ルールを強化して再攻撃します。" },
    "ko-KR": { attacks: "공격", controls: "일반 변경", attempt: "시도 {n}", roundNext: "라운드 {round}: 규칙을 강화하고 다시 공격합니다." },
    "hi-IN": { attacks: "हमले", controls: "सामान्य बदलाव", attempt: "प्रयास {n}", roundNext: "राउंड {round}: मैं नियम को मज़बूत कर फिर से हमला कर रहा हूँ।" },
    "ar-SA": { attacks: "الهجمات", controls: "التغييرات العادية", attempt: "المحاولة {n}", roundNext: "الجولة {round}: أعزّز القاعدة وأهاجم من جديد." },
    "fa-IR": { attacks: "حمله‌ها", controls: "تغییرات عادی", attempt: "تلاش {n}", roundNext: "دور {round}: قانون را تقویت می‌کنم و دوباره حمله می‌کنم." },
    "he-IL": { attacks: "התקפות", controls: "שינויים רגילים", attempt: "ניסיון {n}", roundNext: "סבב {round}: אני מחזק את הכלל ותוקף שוב." },
    "tr-TR": { attacks: "Saldırılar", controls: "Normal değişiklikler", attempt: "Deneme {n}", roundNext: "Tur {round}: kuralı güçlendirip yeniden saldırıyorum." },
    "vi-VN": { attacks: "Tấn công", controls: "Thay đổi bình thường", attempt: "Lần thử {n}", roundNext: "Vòng {round}: tôi gia cố quy tắc và tấn công lại." },
    "id-ID": { attacks: "Serangan", controls: "Perubahan normal", attempt: "Percobaan {n}", roundNext: "Ronde {round}: saya memperkuat aturan dan menyerang lagi." },
    "sv-SE": { attacks: "Attacker", controls: "Normala ändringar", attempt: "Försök {n}", roundNext: "Runda {round}: jag förstärker regeln och attackerar igen." },
    "el-GR": { attacks: "Επιθέσεις", controls: "Κανονικές αλλαγές", attempt: "Απόπειρα {n}", roundNext: "Γύρος {round}: ενισχύω τον κανόνα και επιτίθεμαι ξανά." },
    "ro-RO": { attacks: "Atacuri", controls: "Schimbări normale", attempt: "Încercarea {n}", roundNext: "Runda {round}: întăresc regula și atac din nou." },
    "cs-CZ": { attacks: "Útoky", controls: "Běžné změny", attempt: "Pokus {n}", roundNext: "Kolo {round}: posiluji pravidlo a útočím znovu." },
    "fi-FI": { attacks: "Hyökkäykset", controls: "Tavalliset muutokset", attempt: "Yritys {n}", roundNext: "Kierros {round}: vahvistan sääntöä ja hyökkään uudelleen." },
    "da-DK": { attacks: "Angreb", controls: "Normale ændringer", attempt: "Forsøg {n}", roundNext: "Runde {round}: jeg forstærker reglen og angriber igen." },
    "no-NO": { attacks: "Angrep", controls: "Normale endringer", attempt: "Forsøk {n}", roundNext: "Runde {round}: jeg forsterker regelen og angriper igjen." },
    "hu-HU": { attacks: "Támadások", controls: "Normál módosítások", attempt: "Kísérlet {n}", roundNext: "{round}. kör: megerősítem a szabályt és újra támadok." },
    "th-TH": { attacks: "การโจมตี", controls: "การเปลี่ยนแปลงปกติ", attempt: "ความพยายามที่ {n}", roundNext: "รอบ {round}: ฉันกำลังเสริมกฎและโจมตีอีกครั้ง" },
    "uz-UZ": { attacks: "Hujumlar", controls: "Oddiy o'zgarishlar", attempt: "Urinish {n}", roundNext: "{round}-raund: qoidani kuchaytirib, yana hujum qilaman." },
    "fil-PH": { attacks: "Mga atake", controls: "Normal na pagbabago", attempt: "Pagtatangka {n}", roundNext: "Round {round}: pinapalakas ko ang panuntunan at aatake muli." },
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
    if (content.includes('"studio.sim.groupAttacks"')) {
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
        "studio.sim.groupAttacks": dict.attacks,
        "studio.sim.groupAttacks.tech": TECH["studio.sim.groupAttacks.tech"],
        "studio.sim.groupControls": dict.controls,
        "studio.sim.groupControls.tech": TECH["studio.sim.groupControls.tech"],
        "studio.sim.attempt": dict.attempt,
        "studio.sim.roundNext": dict.roundNext,
        "studio.sim.roundNext.tech": TECH["studio.sim.roundNext.tech"],
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, `${block}\n$1`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
