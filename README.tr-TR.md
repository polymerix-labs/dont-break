<div align="center">

# dont-break

**Yapay zeka tarafından yazılan kod için güven katmanı.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Languages](https://img.shields.io/badge/43%20languages-full%20graph-2ea44f)](https://dont-break.com/language-support)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · [🇬🇷 Ελληνικά](https://github.com/polymerix-labs/dont-break/blob/main/README.el-GR.md) · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · **🇹🇷 Türkçe** · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: asla bozulmaması gerekeni tanımlayın, grafiğin onu bulmasını ve korumayı test etmesini izleyin](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Yapay zeka ajanları kodu hızlıca teslim eder. Kimse onunla birlikte güven teslim etmez. Cursor, Claude veya CI botları kullanan her ekip aynı dile getirilmemiş korkuyu paylaşır: hızlı bir düzeltmenin, asla bozulmaması gereken tek şeyi sessizce bozacağı gün.

`dont-break` bu korkuyu bir sözleşmeye dönüştürür:

1. **Basit kelimelerle söyleyin.** "Fatura hesaplamasını hiç kimse, dolaylı olarak bile, bozamamalı." Dosya yolu yok, kod yok.
2. **Bulunmasını izleyin.** dont-break, kod tabanınızın canlı haritasını okur ve o mantığı taşıyan her yeri, varlığını unuttuğunuz yollar dahil, aydınlatır.
3. **Saldırıya uğramasını izleyin.** Bir koruma kuralı yazar, ardından korumanın gerçekten tuttuğunu kanıtlamak için kod değişikliklerini ona karşı yeniden oynatır. Kuru bir deneme: kodunuzda hiçbir şeye dokunulmaz.
4. **Etkinleştirin.** O andan itibaren, her ajan düzenlemesi yürürlüğe girmeden önce kurala göre kontrol edilir. Ajanınız, bunu üretimde keşfetmeniz yerine "bu göründüğünden daha riskli" der.

```text
Siz:     "PokemonService.fetchAll'ı yeniden adlandır"
Ajan:    → get_dependents(PokemonService.fetchAll)   "4 modülde 23 çağrı noktası"
         → get_impact(files: [...])                  "yarıçap 3, ui/, cache/, api/'yi etkiliyor"
         → get_do_not_touch()                        "PokemonService bir tehlike bölgesi: fan-in 23, kararlılık 31"
Ajan:    "Bu göründüğünden daha riskli. İşte bozulacak 23 yer,
          ve 2 adımda daha güvenli bir plan."
```

Bu konuşma, bağlandığınız anda otomatik olarak gerçekleşir. Prompt mühendisliği yok: ajan becerisi bunu öğretir.

## Diller ve yetenekler

dont-break’in haritaladığı diller ve her birinin gerçekten ne yapabildiği **[dont-break.com/language-support](https://dont-break.com/language-support)** adresinde.

## Kurulum

**Python 3.9+** ve **Node.js** (npm) gerektirir. Grafik çıkarıcı ilk çalıştırmada kendini kurar.

```bash
pip install dont-break
dont-break --wake
```

Bu, `http://127.0.0.1:4040` adresinde, kendi dilinizde (32 dil mevcut) yerel bir arayüz açar. Oturum açın, bir proje klasörü seçin ve kodunuzun haritası kendini oluştursun: her modülün, çağrının ve bağımlılığın canlı 3D grafiği, üzerinde aydınlatılmış korumalı bölgelerinizle birlikte.

## Kavganızı seçin

**"Ajanım hiç açmadığı şeyleri sürekli bozuyor"**<br>
dont-break'i Cursor veya Claude Desktop'a bağlayın. Ajanınız düzenlemeden önce etkiyi ve tehlike bölgelerini kontrol eder, sonra değil.<br>
→ [Cursor / Claude'da kurulum (2 dk)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"CI'ın felaketleri engellemesini istiyorum, stil hakkında tartışmasını değil"**<br>
Bir değişiklik korumalı bir bölgeye veya kırılgan bir düğüme çarptığında birleştirmeyi başarısız kılan tek bir iş, gerçek bir bağımlılık grafiğine dayalı, önseziye değil.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit kancası](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Sadece kod tabanıma sorgu yapmak istiyorum"**<br>
`dbq dependents <id> | jq`: bunu değiştirirsem ne bozulur? Repo'nuz sorgulanabilir bir veritabanına dönüşür.<br>
→ [Shell + jq tarifleri](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Kendi ajanımı inşa ediyorum"**<br>
Aynı 11 araç, tip belirtilmiş TypeScript tanımları veya oluşturulmuş bir OpenAPI 3.1 spesifikasyonu olarak mevcut.<br>
→ [LangChain / OpenAPI / özel ajanlar](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Ajanınızın aldığı 11 araç

| Araç | Cevapladığı soru |
|------|----------------------|
| `find_symbol` | "Bu isim / dosya hangi düğüm?" (giriş noktası) |
| `get_dependents` | "Bunu değiştirirsem ne bozulur?" |
| `get_impact` | "Bu değişikliklerin etki yarıçapı nedir?" |
| `get_do_not_touch` | "Sormadan neye dokunmayı reddetmeliyim?" |
| `get_dependencies` | "Bu kod neye bağımlı?" |
| `find_path` | "A'daki bir değişiklik neden B'yi etkiliyor?" |
| `get_arch_status` | "Bu repoda ne kadar dikkatli çalışmalıyım?" |
| `check_change` | "Bu değişiklik bir ekip kuralını ihlal ediyor mu?" |
| `propose_rule` | "Şimdi bir uyarı kaydet, ya da insan onayı için engelle" |
| `pause_own_rule` | "Bu ajan token'ının oluşturduğu bir kuralı duraklat" |
| `append_rule_reason` | "Bir gerekçe ekle, asla düzenleme veya silme" |

Sorgu araçları salt okunurdur, sunucu tarafı analiz yapar, sınırlı yanıtlar verir: her zaman çağrılması güvenlidir. Üç kural aracı, katı sınırlar altında ekip kuralları yazar: engellemeyi etkinleştiremezler, başkasının kuralını duraklatamazlar veya nedenleri yeniden yazamazlar.

## Kontrol odası

- **Rule Studio**: asla bozulmaması gerekeni tanımlayın, grafiğin onu bulmasını izleyin, etkinleştirmeden önce korumayı canlı test edin
- **Check**: düzenleme öncesi simülatör: tohumlar seçin, ok/warn/block kararı alın, bir bozulmanın izleyeceği kesin yolu animasyonla gösterin
- **Overview**: tek cümlelik bir karar, kararlılık ve AI navigasyon edilebilirlik göstergeleri, mimarinizi güçlendirecek en önemli eylemler
- **Graph**: 3D Nebula sahnesi, korumalı bölgeler ve tanık yollar bindirme olarak aydınlatılmış
- **Agents**: Cursor, Claude veya CI'ı tek tıklamayla bağlayın, canlı bir try-to-break demosuyla

Klavye öncelikli: `cmd+K` komut paletini açar.

## Ajanınızı 30 saniyede bağlayın

1. dont-break uygulamasını açın → **Agents**.
2. Oturum açın, klasörü bir projeye bağlayın, **Connect Cursor**'a tıklayın: tek tıklama proje kapsamlı bir token oluşturur ve `mcp.json`'ı doldurur.
3. Cursor'a (veya MCP istemcinize) yapıştırın.
4. **Install agent skill**'e tıklayın: bu, güvenli değişiklik protokolünü repo'nuzun `AGENTS.md` dosyasına yazar, böylece ajanlar araçları söylenmeden kullanır.

## Lisans

Apache-2.0. [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) ve [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE) dosyalarına bakın.
