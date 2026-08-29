<div align="center">

# dont-break

**เลเยอร์แห่งความไว้วางใจสำหรับโค้ดที่เขียนโดย AI**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · **🇹🇭 ไทย** · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: อธิบายสิ่งที่ห้ามพังเด็ดขาด ดูกราฟค้นหามันและทดสอบการป้องกัน](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

เอเจนต์ AI ส่งมอบโค้ดได้อย่างรวดเร็ว แต่ไม่มีใครส่งมอบความไว้วางใจไปพร้อมกับมัน ทุกทีมที่ใช้ Cursor, Claude หรือบอท CI ต่างมีความกลัวที่ไม่ได้พูดออกมาเหมือนกัน นั่นคือวันที่การแก้ไขอย่างเร่งด่วนจะทำลายสิ่งเดียวที่ไม่ควรพังลงอย่างเงียบๆ

`dont-break` เปลี่ยนความกลัวนั้นให้เป็นสัญญา:

1. **พูดมันด้วยคำพูดง่ายๆ** "ไม่มีใครควรทำลายการคำนวณใบแจ้งหนี้ได้ แม้ทางอ้อมก็ตาม" ไม่ต้องมีพาธไฟล์ ไม่ต้องมีโค้ด
2. **ดูมันถูกค้นพบ** dont-break อ่านแผนที่ที่มีชีวิตของโค้ดเบสของคุณ และส่องสว่างทุกที่ที่มีตรรกะนั้นอยู่ รวมถึงเส้นทางที่คุณลืมไปแล้วว่ามีอยู่
3. **ดูมันถูกโจมตี** มันเขียนกฎการป้องกัน จากนั้นเล่นการเปลี่ยนแปลงโค้ดซ้ำกับมันเพื่อพิสูจน์ว่าการป้องกันนั้นยึดอยู่ได้จริง การซ้อมแบบแห้ง: ไม่มีอะไรในโค้ดของคุณถูกแตะต้อง
4. **เปิดใช้งานมัน** จากนั้นไป การแก้ไขของเอเจนต์ทุกครั้งจะถูกตรวจสอบกับกฎก่อนที่จะมีผล เอเจนต์ของคุณจะได้ยินว่า "นี่เสี่ยงกว่าที่เห็น" แทนที่คุณจะไปพบมันในโปรดักชัน

```text
คุณ:      "เปลี่ยนชื่อ PokemonService.fetchAll"
เอเจนต์:  → get_dependents(PokemonService.fetchAll)   "23 จุดเรียกใช้ใน 4 โมดูล"
          → get_impact(files: [...])                  "รัศมี 3 ส่งผลกระทบต่อ ui/, cache/, api/"
          → get_do_not_touch()                        "PokemonService เป็นโซนอันตราย: fan-in 23, ความเสถียร 31"
เอเจนต์:  "นี่เสี่ยงกว่าที่เห็น นี่คือ 23 จุดที่จะพัง
           และแผนที่ปลอดภัยกว่าใน 2 ขั้นตอน"
```

บทสนทนานั้นเกิดขึ้นโดยอัตโนมัติทันทีที่เชื่อมต่อ ไม่ต้องทำ prompt engineering: สกิลของเอเจนต์สอนมันเอง

## ภาษาและความสามารถ

ภาษาที่ dont-break แผนที่ และแต่ละภาษาทำอะไรได้จริง อยู่ที่ **[dont-break.com/language-support](https://dont-break.com/language-support)**

## การติดตั้ง

ต้องการ **Python 3.9+** และ **Node.js** (npm) ตัวสกัดกราฟจะติดตั้งตัวเองในการรันครั้งแรก

```bash
pip install dont-break
dont-break --wake
```

การกระทำนี้จะเปิด UI ในเครื่องที่ `http://127.0.0.1:4040` ในภาษาของคุณเอง (มีให้เลือก 32 ภาษา) เข้าสู่ระบบ เลือกโฟลเดอร์โปรเจกต์ และแผนที่โค้ดของคุณจะสร้างขึ้นเอง: กราฟ 3D ที่มีชีวิตของทุกโมดูล การเรียกใช้ และการพึ่งพา พร้อมโซนที่ได้รับการป้องกันของคุณส่องสว่างอยู่ด้านบน

## เลือกการต่อสู้ของคุณ

**"เอเจนต์ของฉันยังคงทำลายสิ่งที่มันไม่เคยเปิดมาก่อน"**<br>
เชื่อมต่อ dont-break กับ Cursor หรือ Claude Desktop เอเจนต์ของคุณจะตรวจสอบผลกระทบและโซนอันตรายก่อนแก้ไข ไม่ใช่หลังจากนั้น<br>
→ [ตั้งค่าใน Cursor / Claude (2 นาที)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"ฉันต้องการให้ CI บล็อกหายนะ ไม่ใช่ถกเถียงเรื่องสไตล์"**<br>
งานเดียวที่ทำให้การ merge ล้มเหลวเมื่อการเปลี่ยนแปลงกระทบกับโซนที่ได้รับการป้องกันหรือโหนดที่เปราะบาง โดยอิงจากกราฟการพึ่งพาจริง ไม่ใช่การเดา<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"ฉันแค่ต้องการสอบถามโค้ดเบสของฉัน"**<br>
`dbq dependents <id> | jq`: อะไรจะพังถ้าฉันเปลี่ยนสิ่งนี้? repo ของคุณจะกลายเป็นฐานข้อมูลที่สอบถามได้<br>
→ [สูตร Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"ฉันกำลังสร้างเอเจนต์ของตัวเอง"**<br>
เครื่องมือ 11 อย่างเดียวกัน มีให้ใช้เป็นนิยาม TypeScript ที่มีชนิดข้อมูล หรือสเปก OpenAPI 3.1 ที่สร้างขึ้น<br>
→ [LangChain / OpenAPI / เอเจนต์แบบกำหนดเอง](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 เครื่องมือที่เอเจนต์ของคุณจะได้รับ

| เครื่องมือ | คำถามที่มันตอบ |
|------|----------------------|
| `find_symbol` | "ชื่อ / ไฟล์นี้คือโหนดไหน?" (จุดเริ่มต้น) |
| `get_dependents` | "อะไรจะพังถ้าฉันเปลี่ยนสิ่งนี้?" |
| `get_impact` | "รัศมีผลกระทบของการเปลี่ยนแปลงเหล่านี้คืออะไร?" |
| `get_do_not_touch` | "ฉันควรปฏิเสธที่จะแตะอะไรโดยไม่ถาม?" |
| `get_dependencies` | "โค้ดนี้พึ่งพาอะไรบ้าง?" |
| `find_path` | "ทำไมการเปลี่ยนแปลงใน A ถึงส่งผลต่อ B?" |
| `get_arch_status` | "ฉันควรทำงานใน repo นี้ด้วยความระมัดระวังแค่ไหน?" |
| `check_change` | "การเปลี่ยนแปลงนี้ละเมิดกฎของทีมหรือไม่?" |
| `propose_rule` | "บันทึกคำเตือนตอนนี้ หรือบล็อกเพื่อรอการอนุมัติจากมนุษย์" |
| `pause_own_rule` | "หยุดกฎที่สร้างโดยโทเคนเอเจนต์นี้ชั่วคราว" |
| `append_rule_reason` | "เพิ่มเหตุผลหนึ่งข้อ ห้ามแก้ไขหรือลบเด็ดขาด" |

เครื่องมือคิวรีเป็นแบบอ่านอย่างเดียว การวิเคราะห์ฝั่งเซิร์ฟเวอร์ การตอบสนองที่จำกัด: ปลอดภัยที่จะเรียกใช้เสมอ เครื่องมือกฎทั้งสามเขียนกฎของทีมภายใต้ขอบเขตที่เข้มงวด: ไม่สามารถเปิดใช้งานการบล็อก หยุดกฎของคนอื่นชั่วคราว หรือเขียนเหตุผลใหม่ได้

## ห้องควบคุม

- **Rule Studio**: อธิบายสิ่งที่ห้ามพังเด็ดขาด ดูกราฟค้นหามัน ทดสอบการป้องกันแบบสดก่อนเปิดใช้งาน
- **Check**: ตัวจำลองก่อนการแก้ไข: เลือก seed รับคำตัดสิน ok/warn/block แสดงแอนิเมชันเส้นทางที่แม่นยำที่ความเสียหายจะเดินตาม
- **Overview**: คำตัดสินในหนึ่งประโยค ค่าความเสถียรและความสามารถในการนำทางของ AI การกระทำอันดับต้นๆ ที่จะเสริมความแข็งแกร่งให้สถาปัตยกรรมของคุณ
- **Graph**: ฉาก Nebula 3D โซนที่ได้รับการป้องกันและเส้นทางพยานส่องสว่างเป็นเลเยอร์ซ้อนทับ
- **Agents**: เชื่อมต่อ Cursor, Claude หรือ CI ด้วยคลิกเดียว พร้อมเดโม try-to-break แบบสด

เน้นคีย์บอร์ดเป็นหลัก: `cmd+K` เปิด command palette

## เชื่อมต่อเอเจนต์ของคุณใน 30 วินาที

1. เปิดแอป dont-break → **Agents**
2. เข้าสู่ระบบ เชื่อมโยงโฟลเดอร์กับโปรเจกต์ คลิก **Connect Cursor**: คลิกเดียวสร้างโทเคนที่จำกัดขอบเขตโปรเจกต์และกรอก `mcp.json`
3. วางลงใน Cursor (หรือไคลเอนต์ MCP ของคุณ)
4. คลิก **Install agent skill**: การกระทำนี้จะเขียนโปรโตคอลการเปลี่ยนแปลงที่ปลอดภัยลงใน `AGENTS.md` ของ repo คุณ เพื่อให้เอเจนต์ใช้เครื่องมือโดยไม่ต้องบอก

## ใบอนุญาต

Apache-2.0 ดู [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) และ [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE)
