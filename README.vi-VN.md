<div align="center">

# dont-break

**Lớp tin cậy cho mã do AI viết.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · **🇻🇳 Tiếng Việt** · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: mô tả những gì không bao giờ được phép hỏng, xem đồ thị tìm ra nó và kiểm tra lớp bảo vệ](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Các tác nhân AI giao mã nhanh chóng. Không ai giao kèm theo sự tin cậy. Mọi nhóm sử dụng Cursor, Claude hoặc bot CI đều chia sẻ cùng một nỗi sợ không nói ra: cái ngày mà một bản sửa lỗi nhanh sẽ âm thầm phá vỡ điều duy nhất không bao giờ được phép hỏng.

`dont-break` biến nỗi sợ đó thành một hợp đồng:

1. **Diễn đạt bằng những từ đơn giản.** "Không ai được phép phá vỡ tính toán hóa đơn, kể cả gián tiếp." Không cần đường dẫn tệp, không cần mã.
2. **Xem nó được tìm thấy.** dont-break đọc bản đồ sống của codebase của bạn và soi sáng mọi nơi mang logic đó, kể cả những đường dẫn mà bạn đã quên là tồn tại.
3. **Xem nó bị tấn công.** Nó viết một quy tắc bảo vệ, sau đó phát lại các thay đổi mã chống lại quy tắc đó để chứng minh rằng lớp bảo vệ thực sự đứng vững. Một lần chạy thử: không có gì trong mã của bạn bị chạm vào.
4. **Kích hoạt nó.** Từ đó trở đi, mọi chỉnh sửa của tác nhân đều được kiểm tra với quy tắc trước khi có hiệu lực. Tác nhân của bạn nghe thấy "điều này rủi ro hơn vẻ ngoài của nó" thay vì để bạn phát hiện ra nó trong môi trường sản xuất.

```text
Bạn:        "Đổi tên PokemonService.fetchAll"
Tác nhân:   → get_dependents(PokemonService.fetchAll)   "23 điểm gọi trong 4 module"
            → get_impact(files: [...])                  "bán kính 3, ảnh hưởng ui/, cache/, api/"
            → get_do_not_touch()                        "PokemonService là vùng nguy hiểm: fan-in 23, độ ổn định 31"
Tác nhân:   "Điều này rủi ro hơn vẻ ngoài của nó. Đây là 23 nơi sẽ bị hỏng,
             và một kế hoạch an toàn hơn trong 2 bước."
```

Cuộc trò chuyện đó diễn ra tự động ngay khi bạn kết nối. Không cần kỹ thuật prompt: kỹ năng của tác nhân sẽ dạy nó.

## Ngôn ngữ và khả năng

Những ngôn ngữ dont-break ánh xạ, và mỗi ngôn ngữ thực sự làm được gì, ở **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Cài đặt

Yêu cầu **Python 3.9+** và **Node.js** (npm). Bộ trích xuất đồ thị tự cài đặt trong lần chạy đầu tiên.

```bash
pip install dont-break
dont-break --wake
```

Thao tác này mở giao diện cục bộ tại `http://127.0.0.1:4040`, bằng ngôn ngữ của riêng bạn (32 ngôn ngữ khả dụng). Đăng nhập, chọn một thư mục dự án, và bản đồ mã của bạn sẽ tự xây dựng: một đồ thị 3D sống động của mọi module, lệnh gọi và phụ thuộc, với các vùng được bảo vệ của bạn được soi sáng bên trên.

## Chọn trận chiến của bạn

**"Tác nhân của tôi liên tục phá vỡ những thứ mà nó chưa từng mở"**<br>
Kết nối dont-break với Cursor hoặc Claude Desktop. Tác nhân của bạn kiểm tra tác động và vùng nguy hiểm trước khi chỉnh sửa, không phải sau đó.<br>
→ [Thiết lập trong Cursor / Claude (2 phút)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Tôi muốn CI chặn thảm họa, không tranh cãi về phong cách"**<br>
Một công việc duy nhất khiến việc gộp nhánh thất bại khi thay đổi chạm vào vùng được bảo vệ hoặc nút dễ vỡ, dựa trên đồ thị phụ thuộc thực tế, không phải trực giác.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Tôi chỉ muốn truy vấn codebase của mình"**<br>
`dbq dependents <id> | jq`: điều gì sẽ hỏng nếu tôi thay đổi cái này? Repo của bạn trở thành một cơ sở dữ liệu có thể truy vấn.<br>
→ [Công thức Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Tôi đang xây dựng tác nhân riêng của mình"**<br>
Cùng 11 công cụ, khả dụng dưới dạng định nghĩa TypeScript có kiểu hoặc đặc tả OpenAPI 3.1 được tạo tự động.<br>
→ [LangChain / OpenAPI / tác nhân tùy chỉnh](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 công cụ mà tác nhân của bạn nhận được

| Công cụ | Câu hỏi mà nó giải quyết |
|------|----------------------|
| `find_symbol` | "Tên / tệp này là nút nào?" (điểm vào) |
| `get_dependents` | "Điều gì sẽ hỏng nếu tôi thay đổi cái này?" |
| `get_impact` | "Bán kính tác động của những thay đổi này là gì?" |
| `get_do_not_touch` | "Tôi nên từ chối chạm vào điều gì mà không hỏi?" |
| `get_dependencies` | "Mã này phụ thuộc vào điều gì?" |
| `find_path` | "Tại sao một thay đổi ở A ảnh hưởng đến B?" |
| `get_arch_status` | "Tôi nên làm việc thận trọng đến mức nào trong repo này?" |
| `check_change` | "Thay đổi này có vi phạm quy tắc của nhóm không?" |
| `propose_rule` | "Ghi lại một cảnh báo ngay bây giờ, hoặc chặn để con người phê duyệt" |
| `pause_own_rule` | "Tạm dừng một quy tắc được tạo bởi token tác nhân này" |
| `append_rule_reason` | "Thêm một lý do biện minh, không bao giờ chỉnh sửa hoặc xóa" |

Các công cụ truy vấn chỉ đọc, phân tích phía máy chủ, phản hồi giới hạn: luôn an toàn để gọi. Ba công cụ quy tắc ghi các quy tắc của nhóm dưới các giới hạn nghiêm ngặt: chúng không thể kích hoạt việc chặn, tạm dừng quy tắc của người khác, hoặc viết lại lý do.

## Phòng điều khiển

- **Rule Studio**: mô tả những gì không bao giờ được phép hỏng, xem đồ thị tìm ra nó, kiểm tra lớp bảo vệ trực tiếp trước khi kích hoạt
- **Check**: trình mô phỏng trước khi chỉnh sửa: chọn hạt giống, nhận phán quyết ok/warn/block, hoạt hình hóa đường đi chính xác mà sự cố hỏng hóc sẽ đi theo
- **Overview**: một phán quyết trong một câu, các chỉ số về độ ổn định và khả năng điều hướng của AI, các hành động hàng đầu sẽ củng cố kiến trúc của bạn
- **Graph**: cảnh 3D Nebula, các vùng được bảo vệ và đường dẫn nhân chứng được soi sáng dưới dạng lớp phủ
- **Agents**: kết nối Cursor, Claude hoặc CI chỉ với một cú nhấp chuột, kèm bản demo try-to-break trực tiếp

Ưu tiên bàn phím: `cmd+K` mở bảng lệnh.

## Kết nối tác nhân của bạn trong 30 giây

1. Mở ứng dụng dont-break → **Agents**.
2. Đăng nhập, liên kết thư mục với một dự án, nhấp vào **Connect Cursor**: một cú nhấp tạo ra token giới hạn theo dự án và điền vào `mcp.json`.
3. Dán nó vào Cursor (hoặc client MCP của bạn).
4. Nhấp vào **Install agent skill**: thao tác này ghi giao thức thay đổi an toàn vào `AGENTS.md` của repo bạn, để các tác nhân sử dụng công cụ mà không cần được chỉ dẫn.

## Giấy phép

Apache-2.0. Xem [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) và [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
