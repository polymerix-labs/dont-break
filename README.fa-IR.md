<div align="center">

# dont-break

**لایه اعتماد برای کدهای نوشته‌شده توسط هوش مصنوعی.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · **🇮🇷 فارسی** · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: توصیف کنید چه چیزی هرگز نباید بشکند، ببینید گراف آن را پیدا و محافظت را آزمایش می‌کند](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

عامل‌های هوش مصنوعی کد را سریع تحویل می‌دهند. هیچ‌کس اعتماد را همراه آن تحویل نمی‌دهد. هر تیمی که از Cursor، Claude یا ربات‌های CI استفاده می‌کند، یک ترس ناگفته مشترک دارد: روزی که یک رفع سریع، بی‌سروصدا تنها چیزی را که هرگز نباید می‌شکست، بشکند.

`dont-break` این ترس را به یک قرارداد تبدیل می‌کند:

1. **آن را با کلمات ساده بگویید.** "هیچ‌کس نباید بتواند محاسبه فاکتور را بشکند، حتی به‌طور غیرمستقیم." بدون مسیر فایل، بدون کد.
2. **ببینید پیدا می‌شود.** dont-break نقشه زنده پایگاه کد شما را می‌خواند و هر جایی که آن منطق را حمل می‌کند روشن می‌کند، از جمله مسیرهایی که فراموش کرده بودید وجود دارند.
3. **ببینید مورد حمله قرار می‌گیرد.** یک قانون محافظتی می‌نویسد، سپس تغییرات کد را در برابر آن اجرا می‌کند تا ثابت کند محافظت واقعاً پابرجاست. یک اجرای آزمایشی: هیچ‌چیز در کد شما دست‌نخورده باقی می‌ماند.
4. **آن را فعال کنید.** از آن پس، هر ویرایش عامل قبل از اعمال شدن در برابر قانون بررسی می‌شود. عامل شما می‌شنود "این خطرناک‌تر از چیزی است که به نظر می‌رسد" به‌جای اینکه در تولید متوجه شوید.

```text
شما:    "PokemonService.fetchAll را تغییر نام بده"
عامل:   → get_dependents(PokemonService.fetchAll)   "23 نقطه فراخوانی در 4 ماژول"
        → get_impact(files: [...])                  "شعاع 3، تأثیر بر ui/، cache/، api/"
        → get_do_not_touch()                        "PokemonService یک منطقه خطرناک است: fan-in 23، پایداری 31"
عامل:   "این خطرناک‌تر از چیزی است که به نظر می‌رسد. اینجا 23 مکانی است که خواهند شکست،
         و یک برنامه امن‌تر در 2 مرحله."
```

این گفتگو به‌محض اتصال به‌طور خودکار انجام می‌شود. بدون مهندسی پرامپت: مهارت عامل آن را آموزش می‌دهد.

## زبان‌ها و قابلیت‌ها

زبان‌هایی که dont-break نقشه می‌کشد و هر کدام واقعاً چه می‌تواند، در **[dont-break.com/language-support](https://dont-break.com/language-support)** است.

## نصب

نیازمند **Python 3.9+** و **Node.js** (npm) است. استخراج‌کننده گراف در اولین اجرا خودش را نصب می‌کند.

```bash
pip install dont-break
dont-break --wake
```

این یک رابط کاربری محلی روی `http://127.0.0.1:4040` باز می‌کند، به زبان شما (۳۲ زبان موجود). وارد شوید، یک پوشه پروژه انتخاب کنید، و نقشه کد شما خودش ساخته می‌شود: یک گراف سه‌بعدی زنده از هر ماژول، فراخوانی و وابستگی، با مناطق محافظت‌شده شما که روی آن روشن شده‌اند.

## نبرد خود را انتخاب کنید

**"عامل من مدام چیزهایی را می‌شکند که هرگز باز نکرده"**<br>
dont-break را به Cursor یا Claude Desktop متصل کنید. عامل شما قبل از ویرایش، تأثیر و مناطق خطرناک را بررسی می‌کند، نه بعد از آن.<br>
→ [راه‌اندازی در Cursor / Claude (۲ دقیقه)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"می‌خواهم CI فاجعه‌ها را مسدود کند، نه اینکه درباره سبک بحث کند"**<br>
یک job که وقتی تغییری به یک منطقه محافظت‌شده یا یک گره شکننده برخورد می‌کند، merge را شکست می‌دهد، بر پایه گراف وابستگی واقعی، نه حدس.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [هوک pre-commit](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"فقط می‌خواهم از پایگاه کد خودم بازجویی کنم"**<br>
`dbq dependents <id> | jq`: اگر این را تغییر دهم چه چیزی می‌شکند؟ مخزن شما به یک پایگاه‌داده قابل پرس‌وجو تبدیل می‌شود.<br>
→ [دستورالعمل‌های Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"دارم عامل خودم را می‌سازم"**<br>
همان ۱۱ ابزار، به‌صورت تعاریف تایپ‌شده TypeScript یا مشخصات تولیدشده OpenAPI 3.1 در دسترس هستند.<br>
→ [LangChain / OpenAPI / عامل‌های سفارشی](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## ۱۱ ابزاری که عامل شما دریافت می‌کند

| ابزار | سؤالی که حل می‌کند |
|------|----------------------|
| `find_symbol` | "این نام / فایل کدام گره است؟" (نقطه ورود) |
| `get_dependents` | "اگر این را تغییر دهم چه چیزی می‌شکند؟" |
| `get_impact` | "شعاع تأثیر این ویرایش‌ها چقدر است؟" |
| `get_do_not_touch` | "بدون پرسیدن، از دست زدن به چه چیزی باید خودداری کنم؟" |
| `get_dependencies` | "این کد به چه چیزی وابسته است؟" |
| `find_path` | "چرا تغییر A روی B تأثیر می‌گذارد؟" |
| `get_arch_status` | "با چه احتیاطی باید در این مخزن کار کنم؟" |
| `check_change` | "آیا این ویرایش یک قانون تیمی را نقض می‌کند؟" |
| `propose_rule` | "ثبت یک هشدار همین حالا، یا یک مسدودسازی برای تأیید انسانی" |
| `pause_own_rule` | "توقف موقت قانونی که این توکن عامل ایجاد کرده" |
| `append_rule_reason` | "افزودن یک دلیل، هرگز ویرایش یا حذف نکنید" |

ابزارهای پرس‌وجو فقط‌خواندنی، تحلیل سمت سرور، پاسخ‌های محدود هستند: همیشه فراخوانی‌شان امن است. سه ابزار قانون، قوانین تیمی را تحت محدودیت‌های سخت‌گیرانه می‌نویسند: نمی‌توانند مسدودسازی را فعال کنند، قانون شخص دیگری را متوقف کنند، یا دلایل را بازنویسی کنند.

## اتاق کنترل

- **Rule Studio**: توصیف کنید چه چیزی هرگز نباید بشکند، ببینید گراف آن را پیدا می‌کند، محافظت را زنده قبل از فعال‌سازی آزمایش کنید
- **Check**: شبیه‌ساز پیش از ویرایش: نقاط شروع را انتخاب کنید، یک حکم ok/warn/block دریافت کنید، مسیر دقیقی که یک شکست طی می‌کند را متحرک‌سازی کنید
- **Overview**: یک حکم در یک جمله، شاخص‌های پایداری و قابلیت پیمایش هوش مصنوعی، مهم‌ترین اقدامات برای تقویت معماری شما
- **Graph**: صحنه سه‌بعدی Nebula، مناطق محافظت‌شده و مسیرهای شاهد به‌صورت لایه‌های روکش روشن شده
- **Agents**: با یک کلیک Cursor، Claude یا CI را متصل کنید، همراه با یک نمایش زنده تلاش‌برای‌شکستن

اولویت با صفحه‌کلید: `cmd+K` پالت دستورات را باز می‌کند.

## عامل خود را در ۳۰ ثانیه متصل کنید

1. اپلیکیشن dont-break را باز کنید ← **Agents**.
2. وارد شوید، پوشه را به یک پروژه پیوند دهید، روی **Connect Cursor** کلیک کنید: یک کلیک یک توکن محدود به پروژه صادر می‌کند و `mcp.json` را پر می‌کند.
3. آن را در Cursor (یا کلاینت MCP خود) جای‌گذاری کنید.
4. روی **Install agent skill** کلیک کنید: پروتکل تغییر امن را در `AGENTS.md` مخزن شما می‌نویسد تا عامل‌ها بدون اینکه به آن‌ها گفته شود از ابزارها استفاده کنند.

## مجوز

Apache-2.0. به [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) و [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE) مراجعه کنید.
