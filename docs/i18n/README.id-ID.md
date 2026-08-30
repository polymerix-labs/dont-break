<div align="center">

# dont-break

**Lapisan kepercayaan untuk kode yang ditulis AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.hu-HU.md) · **🇮🇩 Bahasa Indonesia** · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/docs/i18n/README.zh-TW.md)

</div>

![Rule Studio: jelaskan apa yang tidak boleh pernah rusak, lihat graph menemukannya dan menguji perlindungannya](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Agen AI mengirimkan kode dengan cepat. Tidak ada yang mengirimkan kepercayaan bersamanya. Setiap tim yang menggunakan Cursor, Claude, atau bot CI berbagi ketakutan yang sama yang tidak terucapkan: hari ketika perbaikan cepat secara diam-diam merusak satu hal yang seharusnya tidak pernah rusak.

`dont-break` mengubah ketakutan itu menjadi kontrak:

1. **Katakan dengan kata-kata sederhana.** "Tidak ada yang boleh merusak perhitungan invoice, bahkan secara tidak langsung." Tanpa path file, tanpa kode.
2. **Saksikan ia ditemukan.** dont-break membaca peta hidup basis kode Anda dan menerangi setiap tempat yang membawa logika itu, termasuk path yang Anda lupa keberadaannya.
3. **Saksikan ia diserang.** Ia menulis aturan perlindungan, lalu memutar ulang perubahan kode terhadapnya untuk membuktikan bahwa perlindungan itu benar-benar bertahan. Uji coba kering: tidak ada yang tersentuh di kode Anda.
4. **Aktifkan.** Sejak saat itu, setiap edit agen diperiksa terhadap aturan sebelum berlaku. Agen Anda mendengar "ini lebih berisiko dari yang terlihat" alih-alih Anda mengetahuinya di produksi.

```text
Anda:    "Ganti nama PokemonService.fetchAll"
Agen:    → get_dependents(PokemonService.fetchAll)   "23 titik panggilan di 4 modul"
         → get_impact(files: [...])                  "radius 3, memengaruhi ui/, cache/, api/"
         → get_do_not_touch()                        "PokemonService adalah zona bahaya: fan-in 23, stabilitas 31"
Agen:    "Ini lebih berisiko dari yang terlihat. Berikut 23 tempat yang akan rusak,
          dan rencana yang lebih aman dalam 2 langkah."
```

Percakapan itu terjadi secara otomatis begitu terhubung. Tanpa rekayasa prompt: skill agen yang mengajarkannya.

## Bahasa dan kapabilitas

Bahasa yang dipetakan dont-break, dan apa yang masing-masing benar-benar bisa, ada di **[dont-break.com/language-support](https://dont-break.com/language-support)**.

## Instalasi

Membutuhkan **Python 3.9+** dan **Node.js** (npm). Ekstraktor graph menginstal dirinya sendiri pada saat dijalankan pertama kali.

```bash
pip install dont-break
dont-break --wake
```

Ini membuka UI lokal di `http://127.0.0.1:4040`, dalam bahasa Anda sendiri (32 tersedia). Masuk, pilih folder proyek, dan peta kode Anda membangun dirinya sendiri: graph 3D hidup dari setiap modul, panggilan, dan dependensi, dengan zona terlindungi Anda diterangi di atasnya.

## Pilih pertarungan Anda

**"Agen saya terus merusak hal-hal yang belum pernah ia buka"**<br>
Hubungkan dont-break ke Cursor atau Claude Desktop. Agen Anda memeriksa dampak dan zona bahaya sebelum mengedit, bukan sesudahnya.<br>
→ [Setup di Cursor / Claude (2 menit)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Saya ingin CI memblokir bencana, bukan berdebat soal gaya"**<br>
Satu job yang menggagalkan merge ketika perubahan menyentuh zona terlindungi atau node rapuh, berdasarkan graph dependensi nyata, bukan firasat.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Saya hanya ingin menanyakan basis kode saya"**<br>
`dbq dependents <id> | jq`: apa yang rusak jika saya mengubah ini? Repo Anda menjadi basis data yang bisa dikueri.<br>
→ [Resep Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Saya sedang membangun agen saya sendiri"**<br>
11 tool yang sama, tersedia sebagai definisi TypeScript bertipe atau spesifikasi OpenAPI 3.1 yang dihasilkan.<br>
→ [LangChain / OpenAPI / agen kustom](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## 11 tool yang didapatkan agen Anda

| Tool | Pertanyaan yang dijawabnya |
|------|----------------------|
| `find_symbol` | "Node mana yang merupakan nama / file ini?" (titik masuk) |
| `get_dependents` | "Apa yang rusak jika saya mengubah ini?" |
| `get_impact` | "Berapa radius dampak dari perubahan ini?" |
| `get_do_not_touch` | "Apa yang harus saya tolak untuk disentuh tanpa bertanya?" |
| `get_dependencies` | "Kode ini bergantung pada apa?" |
| `find_path` | "Mengapa perubahan di A memengaruhi B?" |
| `get_arch_status` | "Seberapa hati-hati saya harus bekerja di repo ini?" |
| `check_change` | "Apakah perubahan ini melanggar aturan tim?" |
| `propose_rule` | "Catat peringatan sekarang, atau blokir untuk persetujuan manusia" |
| `pause_own_rule` | "Jeda aturan yang dibuat oleh token agen ini" |
| `append_rule_reason` | "Tambahkan satu justifikasi, jangan pernah edit atau hapus" |

Tool kueri bersifat read-only, analisis sisi server, respons terbatas: selalu aman untuk dipanggil. Tiga tool aturan menulis aturan tim di bawah batasan ketat: mereka tidak bisa mengaktifkan blokir, menjeda aturan orang lain, atau menulis ulang alasan.

## Ruang kontrol

- **Rule Studio**: jelaskan apa yang tidak boleh pernah rusak, lihat graph menemukannya, uji perlindungan secara langsung sebelum diaktifkan
- **Check**: simulator pra-edit: pilih seed, dapatkan putusan ok/warn/block, animasikan path persis yang akan diambil kerusakan
- **Overview**: putusan dalam satu kalimat, pembacaan stabilitas dan navigabilitas AI, aksi teratas yang akan memperkuat arsitektur Anda
- **Graph**: adegan 3D Nebula, zona terlindungi dan path saksi diterangi sebagai overlay
- **Agents**: hubungkan Cursor, Claude, atau CI dengan satu klik, dengan demo try-to-break langsung

Keyboard-first: `cmd+K` membuka command palette.

## Hubungkan agen Anda dalam 30 detik

1. Buka aplikasi dont-break → **Agents**.
2. Masuk, tautkan folder ke proyek, klik **Connect Cursor**: satu klik menghasilkan token khusus proyek dan mengisi `mcp.json`.
3. Tempelkan ke Cursor (atau klien MCP Anda).
4. Klik **Install agent skill**: ini menulis protokol perubahan aman ke `AGENTS.md` repo Anda, sehingga agen menggunakan tool tanpa perlu diberitahu.

## Lisensi

Apache-2.0. Lihat [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) dan [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
