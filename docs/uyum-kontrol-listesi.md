# Uyum kontrol listesi — OKAY Hukuk Danışmanlık & Arabuluculuk web sitesi

Son güncelleme: 18 Ekim 2026 (Aşama 10). Bu liste, sitenin teknik olarak nasıl
kurgulandığını belgeler; **hukuki görüş değildir**. Nihai değerlendirme büro ve
hukuki inceleme tarafından yapılır. Madde numarası yalnızca kesin olarak doğrulanmış
yerlerde verilmiştir; diğerleri hukuki incelemede eklenecektir.

Durum: ✅ sitede karşılanıyor ve test/tarama ile doğrulandı · ⚠️ büro/hukuki onay
bekliyor · ⏳ sonraki aşama

## 1. Avukatlık reklam yasağı

Kaynaklar: 1136 s. Avukatlık Kanunu m.55, TBB Meslek Kuralları, TBB Avukatlık Kanununa
Göre Uyulması Gereken Reklam Yasağı Yönetmeliği.

| #    | Kontrol                                                                | Sitedeki karşılığı                                                                                                                                            | Durum |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1.1  | Bilgi verici, ölçülü, ağırbaşlı dil                                    | Metinler büroyu, iletişim bilgilerini ve mevzuat özetlerini tanıtır; tanıtım sloganı yalnızca "Hukuka Saygı. / Mesleğe Özen."                                 | ✅    |
| 1.2  | Üstünlük iddiası yok ("en iyi", "lider", "uzman", "1 numara")          | Otomatik tarama: `npm run qa:compliance` → 13 sayfada incelenmemiş eşleşme 0                                                                                  | ✅    |
| 1.3  | Sonuç/başarı vaadi, garanti, başarı oranı, istatistik yok              | Aynı tarama; sitede sayısal iddia yok. "garanti" geçen tek yer gizlilik politikasındaki olumsuzlama ("garanti edilemez")                                      | ✅    |
| 1.4  | Müvekkil adı/logosu, referans, yorum/testimonial, dava sonucu yok      | Bu alanlar veri modelinde **hiç yoktur** (avukat şeması: biyografi/başarı/referans alanı bulunmaz). JSON-LD'de review/aggregateRating yok                     | ✅    |
| 1.5  | Ücret, indirim, "ücretsiz danışma" gibi iş toplamaya yönelik ifade yok | Tarama; "ücretsiz" yalnızca KVKK m.13 başvuru hükmünün aktarımında geçer                                                                                      | ✅    |
| 1.6  | Agresif çağrı yok ("Hemen arayın!")                                    | Bağlantılar sade: "İletişim", "Büroyu tanıyın", "Haritada aç"                                                                                                 | ✅    |
| 1.7  | Pop-up, otomatik sohbet/WhatsApp balonu, reklam amaçlı izleme yok      | Sitede üçüncü taraf betik yok; CSP `script-src 'self'` dışı kaynakları engeller                                                                               | ✅    |
| 1.8  | Ünvan ve kişisel bilgiler gerçek ve doğrulanmış                        | Yalnızca büronun verdiği adlar/ünvanlar; eksikler açık "Eklenecek" yer tutucusu (130 blok — yayında 0 olmalı)                                                 | ⚠️    |
| 1.9  | Arama motoru: anahtar kelime doldurma ve iş toplama SEO'su yok         | Afyonkarahisar yalnızca konum bilgisi olarak (ana sayfa, Hakkımızda, İletişim açıklamaları); şehir+hizmet kombinasyon sayfaları yok                           | ✅    |
| 1.10 | Yapılandırılmış veri yalnızca doğrulanmış olgularla                    | `LegalService`: ad, site adresi (URL), logo; posta adresi/telefon **yalnızca** `contact.verified = true` iken eklenir (şu an eklenmiyor). `Person`: ad, ünvan | ✅    |

## 2. Arabuluculuk tanıtımı

Kaynaklar: 6325 s. Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu (HUAK), Arabuluculuk
Yönetmeliği, Arabuluculuk Etik Kuralları. (Tanıtım sınırlamalarına ilişkin madde
numaraları hukuki incelemede eklenecek.)

| #   | Kontrol                                                                 | Sitedeki karşılığı                                                                                                           | Durum |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----- |
| 2.1 | Arabulucu sicil no ve uzmanlık alanı yalnızca sicil kaydına göre        | Profilde yalnızca `mediator.verified === true` iken gösterilir; panelde sicil no girilmeden "teyitli" işaretlenemez (testli) | ✅    |
| 2.2 | Tarafsızlık/bağımsızlık dili; taraflardan birine "kazandırma" vaadi yok | Arabuluculuk metinleri HUAK m.3 (iradi olma, eşitlik) ve m.4 (gizlilik) özetleri; tarama "lehinize sonuç" vb. arar           | ✅    |
| 2.3 | Fatma OKAY'ın arabulucu sicil numarası                                  | Henüz doğrulanmadı → "Arabulucu" ünvanı ad/ünvan olarak gösteriliyor, sicil bilgisi gösterilmiyor                            | ⚠️    |
| 2.4 | Avukatlık–arabuluculuk görev ayrılığı açıklaması                        | Metin mevzuat doğrulanarak eklenecek (yer tutucu)                                                                            | ⚠️    |

## 3. KVKK (6698 s. Kanun) ve çerezler

| #   | Kontrol                                                               | Sitedeki karşılığı                                                                                                                               | Durum |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| 3.1 | Aydınlatma yükümlülüğü (m.10)                                         | `/kvkk-aydinlatma-metni` — **taslak**, `DraftNotice` ile işaretli; büroya özgü ifadeler `<Verify>` ile                                           | ⚠️    |
| 3.2 | Aydınlatma ile açık rıza ayrı; rıza hizmet şartına bağlanmaz          | İletişim formundaki kutu "aydınlatma metnini okudum" beyanıdır, açık rıza değildir; önceden işaretli değildir                                    | ✅    |
| 3.3 | Veri minimizasyonu                                                    | Form: ad, e-posta, isteğe bağlı telefon, mesaj. T.C. kimlik no, dava ayrıntısı, sağlık bilgisi istenmez ve gönderilmemesi uyarılır. IP saklanmaz | ✅    |
| 3.4 | İlgili kişi hakları ve başvuru (m.11, m.13)                           | Taslak metinde kanundan aktarıldı; başvuru e-postası yer tutucu                                                                                  | ⚠️    |
| 3.5 | Zorunlu olmayan çerez/analitik yok → çerez bandı gerekmez             | Sitede analitik, reklam veya üçüncü taraf çerez yok; panel yalnızca oturum çerezi (httpOnly) kullanır. Harita gömülmez, harici bağlantı verilir  | ✅    |
| 3.6 | Saklama süresi, aktarım, sağlayıcılar (barındırma, e-posta, Supabase) | Hukuki incelemede eklenecek; mesajlar için saklama/imha süresi büronun politikasına göre belirlenecek                                            | ⚠️    |
| 3.7 | Çerez Politikası ve Yasal Uyarı tam metinleri                         | Henüz yazılmadı (yer tutucu); uydurulmadı                                                                                                        | ⚠️    |
| 3.8 | Teknik güvenlik tedbirleri                                            | CSP ve güvenlik başlıkları, rol bazlı erişim + RLS, denetim kaydı, oturum çerezi httpOnly/SameSite, form hız sınırı ve spam koruması             | ✅    |
| 3.9 | İletişim mesajlarının imhası                                          | Panelde yönetici "Kalıcı olarak sil" ile siler (onaylı; denetim kaydında yalnızca silme olayı). Süre büronun imha politikasına göre              | ⚠️    |

## 4. Yayın öncesi zorunlu adımlar

1. Büro, iletişim bilgilerini doğrular → panelde "doğrulandı" işaretlenir (JSON-LD adres/telefon o zaman eklenir).
2. Tüm yer tutucular doldurulur: tarayıcıda `document.querySelectorAll("[data-placeholder]").length === 0`
   ve `npm run qa:compliance` çıktısında "Toplam yer tutucu blok: 0".
3. KVKK aydınlatma metni, gizlilik politikası, çerez politikası ve yasal uyarı hukuki onaydan geçer;
   `DraftNotice` kaldırılır.
4. Arabulucu sicil numarası Arabulucular Sicili'nden teyit edilir.
5. `npm run qa:launch -- https://<alan-adı>` çalışan üretim sitesinde geçer: 0 incelenmemiş
   eşleşme, 0 yer tutucu, robots açık, büro künyesi doğrulanmış.
6. `NEXT_PUBLIC_SITE_URL` gerçek alan adına, `NEXT_PUBLIC_SITE_INDEXABLE=true` yapılır.

Not: Otomatik tarama yardımcı bir araçtır; anlam bakımından örtük üstünlük veya iş
toplama çağrısı içeren ifadeleri kaçırabilir. Panelden eklenen her metin yayından önce
insan gözüyle de okunmalıdır.
