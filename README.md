# OKAY Hukuk Danışmanlık & Arabuluculuk — Web Sitesi

Afyonkarahisar merkezli hukuk bürosunun kurumsal web sitesi.
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Motion · Supabase.

> Durum: **Aşama 10 — teslim hazırlığı.** Site ve yönetim paneli kodu hazır; panel
> veritabanına bağlanıp uçtan uca denenmedi. Yayın adımları: [docs/yayin-kilavuzu.md](docs/yayin-kilavuzu.md),
> panel kullanımı: [docs/yonetim-paneli-kilavuzu.md](docs/yonetim-paneli-kilavuzu.md). Büroya ait doğrulanmamış tüm bilgiler açıkça
> işaretli yer tutucudur; KVKK ve gizlilik metinleri nihai hukuki onay bekleyen taslaktır. Proje kuralları ve tasarım sistemi için
> [CLAUDE.md](CLAUDE.md) dosyasına bakın.

## Kurulum

Gereksinim: Node.js 22+ (geliştirmede 24 kullanıldı), npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Site http://localhost:3000 adresinde açılır.

## Komutlar

| Komut                            | Açıklama                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                    | Geliştirme sunucusu (Turbopack)                                       |
| `npm run build`                  | Üretim derlemesi                                                      |
| `npm run start`                  | Üretim sunucusu                                                       |
| `npm run typecheck`              | Rota tiplerini üretir + `tsc --noEmit`                                |
| `npm run lint`                   | ESLint                                                                |
| `npm run check`                  | typecheck + lint + build                                              |
| `npm run format`                 | Prettier (Tailwind sınıf sıralaması dahil)                            |
| `npm test`                       | Panel mantığı, yetki ve uyum deseni testleri                          |
| `npm run qa:compliance -- <url>` | Çalışan sitede reklam yasağı/uyum taraması                            |
| `npm run brand:logo`             | Logo türevleri ve Open Graph görseli                                  |
| `npm run test:e2e`               | Playwright uçtan uca testleri (önce `npm run build`; sistem Chrome'u) |
| `npm run qa:launch -- <url>`     | Yayın kapısı: yer tutucu, robots, doğrulanmış künye                   |

## Ortam değişkenleri

| Değişken                               | Zorunlu | Açıklama                                                                                                                                    |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Yayında | Kanonik adres (varsayılan `http://localhost:3000`)                                                                                          |
| `NEXT_PUBLIC_SITE_INDEXABLE`           | Hayır   | `true` olana kadar site `noindex` + robots engeli                                                                                           |
| `NEXT_PUBLIC_SUPABASE_URL`             | Sonra   | Supabase proje adresi                                                                                                                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sonra   | Supabase publishable (anon) anahtarı                                                                                                        |
| `SUPABASE_SECRET_KEY`                  | Form    | Yalnızca sunucu; iletişim formu kaydı ve paylaşılan hız sınırı sayaçları. Yoksa form çevrim dışı yanıt verir, hız sınırı bellek içine döner |

Değişkenler `src/lib/env.ts` içinde Zod ile doğrulanır.

## Sayfalar

| Yol                      | Sayfa                          |
| ------------------------ | ------------------------------ |
| `/`                      | Ana sayfa                      |
| `/hakkimizda`            | Hakkımızda                     |
| `/calisma-alanlari`      | Çalışma Alanları               |
| `/arabuluculuk`          | Arabuluculuk                   |
| `/avukatlarimiz`         | Avukatlarımız                  |
| `/avukatlarimiz/[slug]`  | Avukat profili                 |
| `/yayinlar`              | Yayınlar                       |
| `/iletisim`              | İletişim                       |
| `/kvkk-aydinlatma-metni` | KVKK Aydınlatma Metni (taslak) |
| `/gizlilik-politikasi`   | Gizlilik Politikası (taslak)   |
| `/cerez-politikasi`      | Çerez Politikası               |
| `/yasal-uyari`           | Yasal Uyarı                    |

Sayfa listesi `src/config/routes.ts` dosyasından yönetilir; menüler, metadata ve
`sitemap.xml` buradan üretilir.

## Logo

Onaylı kaynak: `public/branding/okay-logo-original.png`. Web sürümleri şu komutla yeniden üretilir:

```bash
node scripts/branding/prepare-logo.mjs
```

Üretilen `okay-logo-transparent.png` yalnızca açık zeminler içindir. Kurallar: CLAUDE.md → Logo kuralları.

## Yer tutucular — büro tarafından sağlanması gerekenler

Tümü `src/config/site.ts` içinde `placeholder("…")` olarak durur ve sitede
"Eklenecek: …" etiketiyle görünür:

- Baro kaydındaki tam unvan
- E-posta, KEP adresi, çalışma saatleri (adres, sabit/mobil telefon ve Google Maps
  arama bağlantısı 17 Ekim 2026'da eklendi; kapı no "5" olarak yazıldı — kaynaklarda
  "5/1" de geçiyor, büroyla teyit edilmeli)
- Kayıtlı olunan baro ve baro sicil numarası
- Arabulucular Sicili numarası ve uzmanlık alanları
- KVKK veri sorumlusu bilgileri ve başvuru e-postası
- Avukat profilleri — `src/content/attorneys.ts` (geçici; yönetim panelinden doldurulacak).
  Av. Mustafa OKAY ve Arb. Av. Fatma OKAY eklendi (ad, unvan, kurucu rolü). Eksik:
  baro, sicil, eğitim, mesleki geçmiş, faaliyet alanları, onaylı fotoğraf ve Fatma OKAY
  için teyitli arabulucu sicil numarası. Eski `/ekip` adresi `/avukatlarimiz`'e yönlenir.
- Büro özgeçmişi: kuruluş yılı, çalışma dilleri (`siteConfig.firm`)
- KVKK/Gizlilik taslaklarındaki "Teyit edilecek" ifadeleri: barındırma ve e-posta
  sağlayıcıları, veri konumları, saklama süreleri, açık rıza ihtiyacı, zorunlu çerezler
- Fiilen çalışılan alanlar ve kısa açıklamaları — `practiceAreas: []`
- Küçük boyutlar için logo varyantı (ör. yalnızca işaret) ve favicon — müşteri onayıyla; favicon şu an geçici monogramdır
- Büro tanıtım metni, arabuluculuk süreç metni
- Ana sayfa için büronun gerçek fotoğrafı (`siteConfig.officePhoto`; dikey, en az 1600 px)
- KVKK aydınlatma metni ve gizlilik politikası için hukuki onay; çerez politikası ve yasal
  uyarı tam metinleri (hukuki inceleme sonrası)

Yayın öncesi tarayıcı konsolunda `document.querySelectorAll("[data-placeholder]").length`
değeri `0` olmalıdır.

## Yönetim paneli kurulumu (Supabase)

Panel `/admin` adresindedir. Supabase bağlanana kadar "bağlantı yok" ekranı gösterir;
hiçbir değişiklik kaydedilmez.

1. Supabase'te proje oluşturun.
2. `supabase/migrations` klasöründeki dosyaları **ad sırasıyla** uygulayın (SQL Editor'e
   yapıştırarak veya `supabase db push` ile):
   `20261016000000_core_auth` → `20261017000000_attorneys` → `20261017010000_contact_messages`
   → `20261018000000_content` → `20261018010000_seed_initial_content` → `20261019000000_rate_limits`.
3. `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`. Ardından `npm run build` (görsel adresi derlemede okunur).
4. Supabase → Authentication → Users'ta panel kullanıcısını oluşturun (kayıt sayfası yoktur),
   sonra SQL Editor'de rol verin:

   ```sql
   insert into public.staff (user_id, role, display_name)
   values ('<kullanıcının id değeri>', 'admin', 'Ad Soyad');
   ```

   Roller: `admin` (her şey) ve `editor` (içerik; iletişim/SEO ayarları, mesajlar ve denetim
   kaydı hariç).

5. Supabase → Authentication → Sign In / Providers'ta "Allow new users to sign up" seçeneğini
   kapatın.

Şifre sıfırlama şimdilik Supabase panelinden yapılır.

## Uyum ve yayın öncesi kontrol

Avukatlık reklam yasağı, arabuluculuk tanıtım kuralları ve KVKK için kontrol listesi:
[docs/uyum-kontrol-listesi.md](docs/uyum-kontrol-listesi.md).

## Yol haritası (sonraki aşamalar)

1. Supabase'in kurulması, migration'ların uygulanması ve panelin uçtan uca testi
2. Şifre sıfırlama akışı
3. Yayın: alan adı (`NEXT_PUBLIC_SITE_URL`), yer tutucuların doldurulması, hukuki onaylar,
   `NEXT_PUBLIC_SITE_INDEXABLE=true`
