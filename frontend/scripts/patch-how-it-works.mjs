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
    "studio.howItWorks.title.tech": "Run pipeline",
    "studio.howItWorks.step1.tech": "Your prompt is parsed into a structured intent.",
    "studio.howItWorks.step2.tech": "Semantic retrieval over the code graph selects candidate nodes.",
    "studio.howItWorks.step3.tech": "The draft is simulated: probes (expect block / expect pass) evaluate against the graph only, no writes.",
    "studio.howItWorks.step4.tech": "The final contract ships with the verdict; save it, adjust it, or iterate.",
};
const T = {
    "fr-FR": {
        button: "Comment ça marche ?",
        title: "Ce qui se passe quand tu lances l'analyse",
        step1: "Tu décris, avec tes mots, ce qui ne doit jamais casser.",
        step2: "L'assistant lit la carte de ton code et trouve les endroits qui portent cette logique.",
        step3: "Il écrit une règle de protection, puis répète des changements de code contre elle pour vérifier que la protection tient. C'est un test à blanc : rien dans ton code n'est jamais modifié.",
        step4: "Tu reçois le verdict et tu décides : activer la protection, l'ajuster ou reformuler.",
    },
    "de-DE": {
        button: "Wie funktioniert das?",
        title: "Was passiert, wenn du auf Analysieren drückst",
        step1: "Du beschreibst in einfachen Worten, was niemals kaputtgehen darf.",
        step2: "Der Assistent liest die Karte deines Codes und findet die Stellen, die diese Logik tragen.",
        step3: "Er schreibt eine Schutzregel und probt dann Codeänderungen dagegen, um zu prüfen, ob der Schutz hält. Das ist ein Trockentest: An deinem Code wird nie etwas geändert.",
        step4: "Du bekommst das Urteil und entscheidest: Schutz aktivieren, anpassen oder neu formulieren.",
    },
    "es-ES": {
        button: "¿Cómo funciona?",
        title: "Qué ocurre cuando pulsas Analizar",
        step1: "Describes, con tus palabras, lo que nunca debe romperse.",
        step2: "El asistente lee el mapa de tu código y encuentra los lugares que llevan esa lógica.",
        step3: "Escribe una regla de protección y luego ensaya cambios de código contra ella para comprobar que la protección aguanta. Es una prueba en seco: nada en tu código se modifica jamás.",
        step4: "Recibes el veredicto y decides: activar la protección, ajustarla o reformular.",
    },
    "it-IT": {
        button: "Come funziona?",
        title: "Cosa succede quando premi Analizza",
        step1: "Descrivi, con parole tue, ciò che non deve mai rompersi.",
        step2: "L'assistente legge la mappa del tuo codice e trova i punti che portano quella logica.",
        step3: "Scrive una regola di protezione, poi prova delle modifiche di codice contro di essa per verificare che la protezione regga. È un test a vuoto: nulla nel tuo codice viene mai modificato.",
        step4: "Ricevi il verdetto e decidi: attivare la protezione, modificarla o riformulare.",
    },
    "pt-BR": {
        button: "Como funciona?",
        title: "O que acontece quando você aperta Analisar",
        step1: "Você descreve, com suas palavras, o que nunca deve quebrar.",
        step2: "O assistente lê o mapa do seu código e encontra os lugares que carregam essa lógica.",
        step3: "Ele escreve uma regra de proteção e depois ensaia mudanças de código contra ela para verificar se a proteção aguenta. É um teste a seco: nada no seu código é modificado.",
        step4: "Você recebe o veredicto e decide: ativar a proteção, ajustá-la ou reformular.",
    },
    "nl-NL": {
        button: "Hoe werkt het?",
        title: "Wat er gebeurt als je op Analyseren drukt",
        step1: "Je beschrijft in gewone woorden wat nooit mag breken.",
        step2: "De assistent leest de kaart van je code en vindt de plekken die deze logica dragen.",
        step3: "Hij schrijft een beschermingsregel en oefent er vervolgens codewijzigingen tegen om te controleren of de bescherming standhoudt. Dit is een testrun: er wordt nooit iets in je code gewijzigd.",
        step4: "Je krijgt het oordeel en beslist: de bescherming activeren, aanpassen of herformuleren.",
    },
    "pl-PL": {
        button: "Jak to działa?",
        title: "Co się dzieje, gdy naciśniesz Analizuj",
        step1: "Opisujesz własnymi słowami, co nigdy nie może się zepsuć.",
        step2: "Asystent czyta mapę twojego kodu i znajduje miejsca, które niosą tę logikę.",
        step3: "Pisze regułę ochrony, a potem próbuje przeciwko niej zmian w kodzie, by sprawdzić, czy ochrona wytrzyma. To test na sucho: nic w twoim kodzie nie jest nigdy modyfikowane.",
        step4: "Dostajesz werdykt i decydujesz: aktywować ochronę, dostosować ją lub przeformułować.",
    },
    "ru-RU": {
        button: "Как это работает?",
        title: "Что происходит после нажатия «Анализ»",
        step1: "Вы своими словами описываете, что никогда не должно ломаться.",
        step2: "Ассистент читает карту вашего кода и находит места, где живёт эта логика.",
        step3: "Он пишет правило защиты, а затем репетирует изменения кода против него, чтобы проверить, выдержит ли защита. Это пробный прогон: в вашем коде ничего не меняется.",
        step4: "Вы получаете вердикт и решаете: активировать защиту, скорректировать её или переформулировать.",
    },
    "uk-UA": {
        button: "Як це працює?",
        title: "Що відбувається після натискання «Аналіз»",
        step1: "Ви своїми словами описуєте, що ніколи не повинно ламатися.",
        step2: "Асистент читає карту вашого коду та знаходить місця, де живе ця логіка.",
        step3: "Він пише правило захисту, а потім репетирує зміни коду проти нього, щоб перевірити, чи витримає захист. Це пробний прогін: у вашому коді нічого не змінюється.",
        step4: "Ви отримуєте вердикт і вирішуєте: активувати захист, скоригувати його чи переформулювати.",
    },
    "zh-CN": {
        button: "它是如何工作的？",
        title: "点击“分析”后会发生什么",
        step1: "你用自己的话描述什么绝对不能被破坏。",
        step2: "助手阅读你的代码地图，找到承载这段逻辑的位置。",
        step3: "它编写一条保护规则，然后用模拟的代码改动来演练，检验保护是否有效。这是试运行：你的代码永远不会被修改。",
        step4: "你收到结论并做决定：启用保护、调整它，或重新描述。",
    },
    "zh-TW": {
        button: "它是如何運作的？",
        title: "按下「分析」後會發生什麼",
        step1: "你用自己的話描述什麼絕對不能被破壞。",
        step2: "助手閱讀你的程式碼地圖，找到承載這段邏輯的位置。",
        step3: "它編寫一條保護規則，然後用模擬的程式碼變更來演練，檢驗保護是否有效。這是試執行：你的程式碼永遠不會被修改。",
        step4: "你收到結論並做決定：啟用保護、調整它，或重新描述。",
    },
    "ja-JP": {
        button: "どう動くの？",
        title: "「分析」を押すと何が起きるか",
        step1: "壊れてはいけないものを、自分の言葉で説明します。",
        step2: "アシスタントがコードの地図を読み、そのロジックを担う場所を見つけます。",
        step3: "保護ルールを書き、それに対して模擬のコード変更をリハーサルして、保護が守れるかを確認します。これはお試し実行で、あなたのコードは一切変更されません。",
        step4: "判定を受け取り、あなたが決めます。保護を有効化するか、調整するか、言い直すか。",
    },
    "ko-KR": {
        button: "어떻게 작동하나요?",
        title: "분석을 누르면 일어나는 일",
        step1: "절대 깨지면 안 되는 것을 자신의 말로 설명합니다.",
        step2: "어시스턴트가 코드 지도를 읽고 그 로직을 담고 있는 위치를 찾습니다.",
        step3: "보호 규칙을 작성한 뒤, 모의 코드 변경으로 리허설을 해서 보호가 지켜지는지 확인합니다. 모의 실행이므로 당신의 코드는 전혀 수정되지 않습니다.",
        step4: "판정을 받고 결정합니다: 보호를 활성화하거나, 조정하거나, 다시 작성합니다.",
    },
    "hi-IN": {
        button: "यह कैसे काम करता है?",
        title: "विश्लेषण दबाने पर क्या होता है",
        step1: "आप अपने शब्दों में बताते हैं कि क्या कभी नहीं टूटना चाहिए।",
        step2: "सहायक आपके कोड का नक्शा पढ़ता है और उन जगहों को ढूँढता है जहाँ यह लॉजिक है।",
        step3: "वह एक सुरक्षा नियम लिखता है, फिर उसके विरुद्ध कोड बदलावों का पूर्वाभ्यास करता है ताकि जाँच हो कि सुरक्षा टिकती है। यह ड्राई टेस्ट है: आपके कोड में कभी कुछ नहीं बदला जाता।",
        step4: "आपको नतीजा मिलता है और आप तय करते हैं: सुरक्षा सक्रिय करें, समायोजित करें या दोबारा लिखें।",
    },
    "ar-SA": {
        button: "كيف يعمل؟",
        title: "ما الذي يحدث عند الضغط على تحليل",
        step1: "تصف بكلماتك ما الذي لا يجب أن ينكسر أبدًا.",
        step2: "يقرأ المساعد خريطة شفرتك ويجد الأماكن التي تحمل هذا المنطق.",
        step3: "يكتب قاعدة حماية ثم يجري بروفة لتغييرات شفرة ضدها للتحقق من صمود الحماية. إنه اختبار تجريبي: لا يُعدَّل أي شيء في شفرتك أبدًا.",
        step4: "تتلقى الحكم وتقرر: تفعيل الحماية أو تعديلها أو إعادة الصياغة.",
    },
    "fa-IR": {
        button: "چطور کار می‌کند؟",
        title: "با زدن «تحلیل» چه اتفاقی می‌افتد",
        step1: "با کلمات خودت توضیح می‌دهی چه چیزی هرگز نباید خراب شود.",
        step2: "دستیار نقشه کد تو را می‌خواند و جاهایی را که این منطق را دارند پیدا می‌کند.",
        step3: "یک قانون محافظت می‌نویسد و سپس تغییرات کد را در برابر آن تمرین می‌کند تا مطمئن شود محافظت دوام می‌آورد. این یک اجرای آزمایشی است: هیچ چیزی در کد تو هرگز تغییر نمی‌کند.",
        step4: "حکم را می‌گیری و تصمیم می‌گیری: محافظت را فعال کنی، تنظیمش کنی یا دوباره بنویسی.",
    },
    "he-IL": {
        button: "איך זה עובד?",
        title: "מה קורה כשלוחצים על ניתוח",
        step1: "אתה מתאר במילים שלך מה אסור שיישבר לעולם.",
        step2: "העוזר קורא את מפת הקוד שלך ומוצא את המקומות שנושאים את הלוגיקה הזו.",
        step3: "הוא כותב כלל הגנה ואז עורך חזרה של שינויי קוד מולו כדי לוודא שההגנה מחזיקה. זו הרצת ניסיון: שום דבר בקוד שלך לא משתנה לעולם.",
        step4: "אתה מקבל את הפסיקה ומחליט: להפעיל את ההגנה, להתאים אותה או לנסח מחדש.",
    },
    "tr-TR": {
        button: "Nasıl çalışır?",
        title: "Analiz'e bastığında ne olur",
        step1: "Asla bozulmaması gerekeni kendi kelimelerinle anlatırsın.",
        step2: "Asistan kodunun haritasını okur ve bu mantığı taşıyan yerleri bulur.",
        step3: "Bir koruma kuralı yazar, sonra korumanın dayanıp dayanmadığını görmek için ona karşı kod değişikliklerinin provasını yapar. Bu bir kuru testtir: kodunda hiçbir şey asla değiştirilmez.",
        step4: "Kararı alırsın ve seçersin: korumayı etkinleştir, ayarla veya yeniden yaz.",
    },
    "vi-VN": {
        button: "Nó hoạt động thế nào?",
        title: "Điều gì xảy ra khi bạn nhấn Phân tích",
        step1: "Bạn mô tả, bằng lời của mình, điều gì không bao giờ được hỏng.",
        step2: "Trợ lý đọc bản đồ mã của bạn và tìm những nơi chứa logic đó.",
        step3: "Nó viết một quy tắc bảo vệ, rồi diễn tập các thay đổi mã với quy tắc đó để kiểm tra lớp bảo vệ có trụ vững không. Đây là chạy thử: không có gì trong mã của bạn bị sửa đổi.",
        step4: "Bạn nhận phán quyết và quyết định: kích hoạt bảo vệ, điều chỉnh hoặc viết lại.",
    },
    "id-ID": {
        button: "Bagaimana cara kerjanya?",
        title: "Apa yang terjadi saat kamu menekan Analisis",
        step1: "Kamu menjelaskan, dengan kata-katamu sendiri, apa yang tidak boleh rusak.",
        step2: "Asisten membaca peta kodemu dan menemukan tempat-tempat yang membawa logika itu.",
        step3: "Ia menulis aturan perlindungan, lalu melatih perubahan kode terhadapnya untuk memastikan perlindungan bertahan. Ini uji coba: tidak ada yang pernah diubah di kodemu.",
        step4: "Kamu menerima putusan dan memutuskan: aktifkan perlindungan, sesuaikan, atau tulis ulang.",
    },
    "sv-SE": {
        button: "Hur fungerar det?",
        title: "Vad som händer när du trycker på Analysera",
        step1: "Du beskriver med egna ord vad som aldrig får gå sönder.",
        step2: "Assistenten läser kartan över din kod och hittar platserna som bär den logiken.",
        step3: "Den skriver en skyddsregel och repeterar sedan kodändringar mot den för att kontrollera att skyddet håller. Det är en torrkörning: inget i din kod ändras någonsin.",
        step4: "Du får domen och bestämmer: aktivera skyddet, justera det eller formulera om.",
    },
    "el-GR": {
        button: "Πώς λειτουργεί;",
        title: "Τι συμβαίνει όταν πατάς Ανάλυση",
        step1: "Περιγράφεις, με δικά σου λόγια, τι δεν πρέπει ποτέ να σπάσει.",
        step2: "Ο βοηθός διαβάζει τον χάρτη του κώδικά σου και βρίσκει τα σημεία που φέρουν αυτή τη λογική.",
        step3: "Γράφει έναν κανόνα προστασίας και μετά κάνει πρόβα αλλαγών κώδικα απέναντί του για να ελέγξει ότι η προστασία αντέχει. Είναι δοκιμαστική εκτέλεση: τίποτα στον κώδικά σου δεν τροποποιείται ποτέ.",
        step4: "Παίρνεις την ετυμηγορία και αποφασίζεις: ενεργοποίηση της προστασίας, προσαρμογή ή αναδιατύπωση.",
    },
    "ro-RO": {
        button: "Cum funcționează?",
        title: "Ce se întâmplă când apeși Analizează",
        step1: "Descrii, cu vorbele tale, ce nu trebuie să se strice niciodată.",
        step2: "Asistentul citește harta codului tău și găsește locurile care poartă acea logică.",
        step3: "Scrie o regulă de protecție, apoi repetă schimbări de cod împotriva ei pentru a verifica dacă protecția rezistă. E un test în gol: nimic din codul tău nu este modificat vreodată.",
        step4: "Primești verdictul și decizi: activezi protecția, o ajustezi sau reformulezi.",
    },
    "cs-CZ": {
        button: "Jak to funguje?",
        title: "Co se stane, když stiskneš Analyzovat",
        step1: "Vlastními slovy popíšeš, co se nikdy nesmí rozbít.",
        step2: "Asistent přečte mapu tvého kódu a najde místa, která tuto logiku nesou.",
        step3: "Napíše ochranné pravidlo a pak proti němu nacvičí změny kódu, aby ověřil, že ochrana vydrží. Je to zkušební běh: v tvém kódu se nikdy nic nemění.",
        step4: "Dostaneš verdikt a rozhodneš: ochranu aktivovat, upravit, nebo přeformulovat.",
    },
    "fi-FI": {
        button: "Miten se toimii?",
        title: "Mitä tapahtuu, kun painat Analysoi",
        step1: "Kuvailet omin sanoin, mikä ei saa koskaan rikkoutua.",
        step2: "Avustaja lukee koodisi kartan ja löytää paikat, jotka kantavat tätä logiikkaa.",
        step3: "Se kirjoittaa suojaussäännön ja harjoittelee sitten koodimuutoksia sitä vastaan varmistaakseen, että suojaus kestää. Tämä on kuivaharjoitus: koodiisi ei koskaan tehdä muutoksia.",
        step4: "Saat tuomion ja päätät: aktivoi suojaus, säädä sitä tai muotoile uudelleen.",
    },
    "da-DK": {
        button: "Hvordan virker det?",
        title: "Hvad der sker, når du trykker på Analysér",
        step1: "Du beskriver med egne ord, hvad der aldrig må gå i stykker.",
        step2: "Assistenten læser kortet over din kode og finder de steder, der bærer den logik.",
        step3: "Den skriver en beskyttelsesregel og øver derefter kodeændringer mod den for at tjekke, at beskyttelsen holder. Det er en tørtest: intet i din kode ændres nogensinde.",
        step4: "Du får dommen og beslutter: aktivér beskyttelsen, justér den eller omformulér.",
    },
    "no-NO": {
        button: "Hvordan virker det?",
        title: "Hva som skjer når du trykker på Analyser",
        step1: "Du beskriver med egne ord hva som aldri må gå i stykker.",
        step2: "Assistenten leser kartet over koden din og finner stedene som bærer den logikken.",
        step3: "Den skriver en beskyttelsesregel og øver deretter kodeendringer mot den for å sjekke at beskyttelsen holder. Det er en tørrkjøring: ingenting i koden din endres noensinne.",
        step4: "Du får dommen og bestemmer: aktiver beskyttelsen, juster den eller omformuler.",
    },
    "hu-HU": {
        button: "Hogyan működik?",
        title: "Mi történik, ha megnyomod az Elemzést",
        step1: "Saját szavaiddal leírod, minek nem szabad soha elromlania.",
        step2: "Az asszisztens elolvassa a kódod térképét, és megtalálja a helyeket, amelyek ezt a logikát hordozzák.",
        step3: "Ír egy védelmi szabályt, majd kódmódosításokat próbál ellene, hogy ellenőrizze, kitart-e a védelem. Ez próbafuttatás: a kódodban soha semmi nem módosul.",
        step4: "Megkapod az ítéletet, és te döntesz: aktiválod a védelmet, kiigazítod vagy újrafogalmazod.",
    },
    "th-TH": {
        button: "มันทำงานอย่างไร?",
        title: "จะเกิดอะไรขึ้นเมื่อคุณกดวิเคราะห์",
        step1: "คุณอธิบายด้วยคำพูดของคุณเองว่าอะไรห้ามพังเด็ดขาด",
        step2: "ผู้ช่วยอ่านแผนที่ของโค้ดคุณและหาตำแหน่งที่มีตรรกะนั้นอยู่",
        step3: "มันเขียนกฎป้องกัน จากนั้นซ้อมการเปลี่ยนแปลงโค้ดกับกฎนั้นเพื่อตรวจว่าการป้องกันยังยืนหยัด นี่คือการทดสอบเปล่า: ไม่มีอะไรในโค้ดของคุณถูกแก้ไขเลย",
        step4: "คุณได้รับคำตัดสินและตัดสินใจ: เปิดใช้การป้องกัน ปรับแต่ง หรือเขียนใหม่",
    },
    "uz-UZ": {
        button: "Bu qanday ishlaydi?",
        title: "Tahlil tugmasini bosganingizda nima bo'ladi",
        step1: "Hech qachon buzilmasligi kerak bo'lgan narsani o'z so'zlaringiz bilan tasvirlaysiz.",
        step2: "Yordamchi kodingiz xaritasini o'qiydi va shu mantiqni tashuvchi joylarni topadi.",
        step3: "U himoya qoidasini yozadi, so'ng himoya chidashini tekshirish uchun unga qarshi kod o'zgarishlarini mashq qiladi. Bu sinov ijrosi: kodingizda hech qachon hech narsa o'zgartirilmaydi.",
        step4: "Hukmni olasiz va qaror qilasiz: himoyani faollashtirish, sozlash yoki qayta yozish.",
    },
    "fil-PH": {
        button: "Paano ito gumagana?",
        title: "Ano ang nangyayari kapag pinindot mo ang Analyze",
        step1: "Inilalarawan mo, sa sarili mong mga salita, kung ano ang hindi dapat masira kailanman.",
        step2: "Binabasa ng assistant ang mapa ng code mo at hinahanap ang mga lugar na may dalang lohikang iyon.",
        step3: "Sumusulat ito ng panuntunan sa proteksyon, pagkatapos ay nag-eensayo ng mga pagbabago sa code laban dito para tiyaking tumatagal ang proteksyon. Dry run ito: walang binabago sa code mo kailanman.",
        step4: "Matatanggap mo ang hatol at magpapasya ka: i-activate ang proteksyon, i-adjust, o isulat muli.",
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
    if (content.includes('"studio.howItWorks.button"')) {
        console.log(`skip ${code}`);
        continue;
    }
    const anchor = entryRegex("studio.mission.title");
    if (!anchor.test(content)) {
        console.error(`anchor studio.mission.title not found in ${code}`);
        process.exitCode = 1;
        continue;
    }
    const entries = {
        "studio.howItWorks.button": dict.button,
        "studio.howItWorks.title": dict.title,
        "studio.howItWorks.title.tech": TECH["studio.howItWorks.title.tech"],
        "studio.howItWorks.step1": dict.step1,
        "studio.howItWorks.step1.tech": TECH["studio.howItWorks.step1.tech"],
        "studio.howItWorks.step2": dict.step2,
        "studio.howItWorks.step2.tech": TECH["studio.howItWorks.step2.tech"],
        "studio.howItWorks.step3": dict.step3,
        "studio.howItWorks.step3.tech": TECH["studio.howItWorks.step3.tech"],
        "studio.howItWorks.step4": dict.step4,
        "studio.howItWorks.step4.tech": TECH["studio.howItWorks.step4.tech"],
    };
    const block = Object.entries(entries)
        .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
        .join("\n");
    content = content.replace(anchor, (m) => `${block}\n${m}`);
    writeFileSync(path, content);
    console.log(`patched ${code}`);
}
