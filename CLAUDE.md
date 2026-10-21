@AGENTS.md

# CLAUDE.md — OKAY Hukuk Danışmanlık & Arabuluculuk

Afyonkarahisar'daki butik bir hukuk bürosunun kurumsal web sitesi. Amaç: büyüklük veya
başarı iddiası kullanmadan, uluslararası standartta, ağırbaşlı bir dijital kimlik.

## Aşama durumu

- **Aşama 1 — Temel (tamamlandı):** proje yapısı, tasarım tokenları, global layout,
  Header/Footer, sayfa iskeletleri, siteConfig, SEO temeli, dokümantasyon.
- **Aşama 2 — Marka ve bileşenler (tamamlandı; 2026-10-21'de yeni amblemle yenilendi):**
  onaylı amblem (terazi · sütunlar · hilal · ok) vektörleştirildi, "OKAY HUKUK DANIŞMANLIK"
  logo düzeni, amblemden türeyen mürekkep/kâğıt/taş renk sistemi, Header/Footer, Button, SectionHeading,
  PracticeCard, AttorneyCard, ArticleCard, Breadcrumb, hover/fade/scroll hareketleri.
- **Aşama 3 — Ana sayfa (tamamlandı):** `components/home/*` — mürekkep hero (kırık beyaz logo,
  "Hukuka Saygı. / Mesleğe Özen.", gerçek büro fotoğrafı alanı), büro künyesi, faaliyet
  alanları, arabuluculuk bilgilendirmesi (6325 s. Kanun m.3–4 özetleri), avukatlar,
  yayınlar, iletişim ve konum. Veri yoksa bölümler açık yer tutucu gösterir.
- **Aşama 4 — Kurumsal sayfalar (tamamlandı):** Hakkımızda (krem zemin, büro özgeçmişi,
  ofis fotoğrafı alanı, Av.K. m.34/36 yükümlülükleri), `/avukatlarimiz` + `/avukatlarimiz/[slug]`
  (özgeçmiş düzenli profil; 1 kişi → yatay öne çıkan kart, 2/4 → iki sütun, 3+ → üç sütun),
  avukat veri modeli (Zod) + Supabase migration taslağı, KVKK Aydınlatma Metni ve Gizlilik
  Politikası **taslakları** (nihai hukuki onay bekliyor). `/ekip` → `/avukatlarimiz` (308).
- **Aşama 7 — İletişim ve mobil (tamamlandı):** `/iletisim` koyu girişli (logo hero'da,
  navbar koyu tema), hızlı arama/harita erişimi, büro bilgileri kartı, genel iletişim formu
  (RHF + Zod, Server Action, bal küpü + süre kontrolü, hız sınırı, T.C. kimlik no
  engeli). Form yalnızca Supabase kaydı başarılı olursa başarı gösterir; altyapı yoksa
  "çevrim dışı" yanıtı verir. İletişim bilgileri `contact.verified: false` iken
  "doğrulama bekliyor" notu taşır.
- **Aşama 8 — Yönetim paneli (kod tamam, veritabanında test EDİLMEDİ):** `/admin` —
  Supabase Auth girişi, rol bazlı erişim (admin/editor), 10 modül (genel bakış, ana sayfa,
  hakkımızda, avukatlar, faaliyet alanları, arabuluculuk, yayınlar, medya, iletişim, SEO
  ve site ayarları) + gelen mesajlar ve denetim kaydı. Site içeriği Supabase yapılandırılmışsa
  veritabanından ("use cache" + `updateTag`), değilse yerel varsayılanlardan okunur.
  Yeni sayfa: `/yayinlar/[slug]`. Migration'lar henüz hiçbir veritabanına uygulanmadı.
- **Aşama 9 — SEO, performans, güvenlik, uyum (tamamlandı; veritabanlı test hariç):**
  JSON-LD (`LegalService` ana sayfada, `Person` avukat profillerinde, `BreadcrumbList`),
  Open Graph görseli (`app/opengraph-image.png`), Motion `LazyMotion` + `m`, italik font
  önyüklenmez, CSP + güvenlik başlıkları (`next.config.ts`), panel yetki testi, uyum
  taraması (`npm run qa:compliance`) ve `docs/uyum-kontrol-listesi.md`.
- **Aşama 10 — Teslim hazırlığı (kod tamam; veritabanlı testler bekliyor):** Playwright
  uçtan uca testleri (`tests/e2e`, `npm run test:e2e`; sistem Chrome'u), yayın kapısı
  (`npm run qa:launch -- <url>`), panelde mesaj silme (KVKK imha), robots.txt'de `/admin`
  engeli, `docs/yayin-kilavuzu.md` ve `docs/yonetim-paneli-kilavuzu.md`. Yetkili giriş
  ve CRUD testleri yazıldı ancak Supabase bağlanmadığı için ÇALIŞTIRILMADI.
- **Sonraki aşamalar (henüz yapılmadı — istenmeden başlanmaz):** Supabase projesinin
  kurulup migration'ların uygulanması ve panelin uçtan uca testi, şifre sıfırlama akışı.
- **Paylaşılan hız sınırı (kod tamam, veritabanında test EDİLMEDİ):** iletişim formu ve
  panel girişi sayaçları Supabase Postgres'te (`20261019000000_rate_limits.sql` →
  `rate_limit_hits` + `consume_rate_limit` / `clear_rate_limit`); Supabase yoksa veya
  ulaşılamazsa bellek içine döner. Migration gerçek bir veritabanında hiç çalıştırılmadı.

## Yönetim paneli (/admin)

- Erişim üç katmanlı: `src/proxy.ts` (oturum yoksa girişe yönlendirir, JWT `getClaims` ile
  doğrulanır, güvenlik başlıkları) → `requireStaff(rol)` (her sayfa ve Server Action'ın
  başında; `lib/admin/auth.ts`) → veritabanında RLS (`is_staff()` / `is_admin()`).
- Panel her zaman kullanıcının kendi oturumuyla çalışır. `SUPABASE_SECRET_KEY` yalnızca
  `server-only` modüllerde kullanılır: iletişim formu kaydı ve hız sınırı sayaçları
  (`lib/rate-limit.ts` — giriş denemesi sayacı dahil). Panel sayfaları/eylemleri ve istemci
  bu anahtarı kullanmaz.
- Oturum çerezleri httpOnly + SameSite=Lax (+ üretimde Secure). Kayıt (sign-up) yok; panel
  kullanıcısı Supabase Auth'ta oluşturulur ve `staff` tablosuna SQL ile rolüyle eklenir.
  `staff` tablosuna istemciden yazma politikası yoktur (yetki yükseltme engeli).
- Roller: `editor` içerik modülleri; `admin` ek olarak iletişim bilgileri, SEO/site ayarları,
  gelen mesajlar, denetim kaydı. Rolü yetmeyen `/admin/yetkisiz`'e yönlenir.
- Denetim kaydı veritabanı tetikleyicisiyle tutulur (`audit_trigger`); yalnızca değişen alan
  adları saklanır, değerler (kişisel veri) saklanmaz; panelden silinemez.
- Formlar: Zod (`lib/admin/schemas.ts`) → Server Action (`lib/admin/actions/*`) → RLS altında
  yazım → `updateTag`. Başarı yalnızca veritabanı onayıyla döner; hata kodları kullanıcıya
  genel mesajla, sunucu günlüğüne yalnızca kodla yazılır (`lib/admin/form.ts`).
- Medya: yalnızca JPEG/PNG/WebP, ≤5 MB; tür imza baytlarından belirlenir (beyan/uzantıya
  güvenilmez), SVG kapalı; sharp ile yeniden kodlanır (EXIF/GPS silinir, ≤2400 px), dosya adı
  rastgele UUID. Kullanımdaki görsel silinemez. Storage kovası da aynı sınırları zorlar.
- Giriş: 15 dakikada 5 başarısız deneme sınırı (IP + e-posta özetiyle, paylaşılan sayaç;
  bkz. "Hız sınırları"), hesap var/yok bilgisi sızmaz,
  `next` yönlendirmesi yalnızca `/admin` altına izinli.
- Veritabanı yokken panel "bağlantı yok" ekranı gösterir; kök layout veritabanına bağlı
  değildir (panel girişi, site içeriği okunamasa da açılır).
- `npm test`: veritabanı gerektirmeyen doğrulama ve medya güvenliği testleri (`tests/`).

## Stack ve komutlar

Next.js 16 (App Router, Turbopack, `cacheComponents` + `partialPrefetching` açık) ·
React 19 · TypeScript strict (`noUncheckedIndexedAccess`) · Tailwind CSS v4 ·
shadcn/ui (radix-nova, yalnızca `button`, `sheet`, `separator`) · Motion (`motion/react-m` + LazyMotion) ·
Lucide · Supabase (`@supabase/ssr`) · Zod 4 · React Hook Form.

```bash
npm run dev          # geliştirme sunucusu
npm run typecheck    # next typegen + tsc --noEmit
npm run lint         # eslint .
npm run build        # üretim derlemesi
npm run check        # typecheck + lint + build
npm run format       # prettier (tailwind sınıf sıralaması dahil)
npm test             # panel mantığı + yetki statik testi + uyum desenleri + hız sınırı (DB gerekmez)
npm run qa:compliance -- http://localhost:3000   # çalışan sitede reklam yasağı taraması
npm run qa:launch -- https://alanadi             # yayın kapısı: yer tutucu 0, robots açık, künye doğrulanmış
npm run test:e2e     # Playwright (önce npm run build); E2E_BASE_URL, E2E_ADMIN_EMAIL/PASSWORD
npm run brand:logo   # amblem vektörü, favicon, JSON-LD görseli (kaynakla örtüşme denetlenir)
npm run brand:og -- http://localhost:3000   # Open Graph görseli (dev sunucusu açıkken)
```

Bu Next.js sürümü eğitim verisinden farklıdır: kod yazmadan önce
`node_modules/next/dist/docs/` altındaki ilgili rehberi okuyun.

### Cache Components kuralları

- Sayfalar statik prerender edilir. `new Date()`, `Math.random()` vb. prerender sırasında
  hata verir → `"use cache"` kapsamında (bkz. `CopyrightYear`) veya `connection()` +
  `<Suspense>` ile kullanın.
- `cookies()`/`headers()` okuyan bileşenler (ör. `lib/supabase/server.ts`) `<Suspense>`
  içinde olmalı.
- Rotalar Activity ile gizlenip korunur; geçici açık/kapalı UI durumu navigasyonda
  sıfırlanmalı (mobil menü `Link onNavigate` ile kapanır).
- `usePathname` kullanan istemci bileşenleri layout içinde `<Suspense>` ile sarılır.

## Klasör mimarisi

```
src/
  app/
    layout.tsx          kök: <html lang="tr">, fontlar, metadata, MotionProvider
    globals.css         tasarım tokenları (@theme) + shadcn değişkenleri
    (site)/             kamuya açık sayfalar; layout = SkipLink + Header + main + Footer
    not-found.tsx       404 (site kabuğunu kendisi ekler)
    robots.ts, sitemap.ts, icon.svg
  components/
    brand/              logo (amblem + OKAY HUKUK DANIŞMANLIK), okay-mark (+ üretilmiş
                        okay-mark-path), flow-line (hilalden türeyen dekoratif yay)
    attorneys/          attorney-portrait, attorney-grid (1–4+ kişiye göre yerleşim),
                        attorney-profile (özgeçmiş düzeni)
    cards/              practice-card, attorney-card, article-card
    contact/            contact-form (istemci; RHF + useActionState)
    forms/              fields (Field, inputClass, describedBy)
    legal/              legal-document (içindekiler + Madde n), draft-notice (+ Verify)
    home/               ana sayfa bölümleri: hero, office-photo, about-intro,
                        practice-areas-section, mediation-section, team-section,
                        publications-section, contact-section
    layout/             site-header, header-shell, nav-list, active-nav-list, mobile-nav,
                        site-footer, skip-link
    navigation/         breadcrumb (+ BreadcrumbList JSON-LD)
    primitives/         container, section, section-heading, page-header, placeholder,
                        reveal (Reveal, RevealGroup, RevealItem), rule, arrow-link
    providers/          motion-provider (LazyMotion + MotionConfig), motion-features
    seo/                json-ld (güvenli JSON-LD çıktısı)
    ui/                 shadcn bileşenleri (elle düzenlenebilir)
  config/
    site.ts             siteConfig — tüm kurumsal bilgilerin TEK kaynağı
    routes.ts           sayfa kayıtları → navigasyon, metadata, sitemap
    brand.ts            amblem varlıkları + logo erişilebilir adı
    header.ts           koyu hero'lu sayfalar (navbar teması)
  content/
    attorneys.ts        yerel avukat kayıtları — yalnızca Supabase yapılandırılmamışken kullanılır
    legal/              disclaimer.ts, kvkk-notice.tsx, privacy-policy.tsx (taslaklar)
  lib/
    env.ts              zod ile doğrulanan ortam değişkenleri (genel)
    env.server.ts       yalnızca sunucu: SUPABASE_SECRET_KEY (server-only)
    contact/            schema (istemci+sunucu), spam, rate-limit, delivery (server-only)
    rate-limit.ts       paylaşılan hız sınırı (Supabase RPC) + bellek içi geri dönüş (server-only)
    metadata.ts         buildMetadata(route) — title, description, canonical, OG
    structured-data.ts  LegalService / Person JSON-LD — yalnızca doğrulanmış olgular
    placeholder.ts      placeholder()/isPlaceholder()/resolve()
    format.ts           formatDate (tr-TR), initials
    content/types.ts    ArticleSummary (ileride Supabase)
    content/attorney-schema.ts  Avukat modeli (Zod) — panel formu da bunu kullanacak
    content/attorneys.ts        getAttorneys / getAttorney / attorneyHref
    supabase/           server.ts (oturumlu), public.ts (anon, önbellekli okuma), cookies.ts
supabase/migrations/    core_auth, attorneys, contact_messages, content (+ Storage), seed, rate_limits — TASLAK, uygulanmadı
scripts/branding/       prepare-mark.mjs (amblem vektörü + favicon + doğrulama), prepare-og-image.mjs (OG görseli)
scripts/qa/             compliance-scan.mjs — yayımlanan sayfalarda reklam yasağı/uyum taraması
docs/                   uyum-kontrol-listesi.md, yayin-kilavuzu.md, yonetim-paneli-kilavuzu.md
tests/                  admin-logic, admin-authz (yetki statik denetimi), compliance-patterns,
                        rate-limit (geri dönüş + sahte PostgREST)
tests/e2e/              Playwright: public, contact, admin (+ helpers); playwright.config.ts kökte
```

`/bilesenler` yalnızca `npm run dev` altında açılan bileşen galerisidir (üretimde 404,
sitemap dışı); içindeki tüm veriler "örnek" etiketlidir.

Yeni sayfa: `config/routes.ts`'e kayıt ekle → `app/(site)/<slug>/page.tsx` oluştur →
`buildMetadata(routes.x)` kullan → `PageHeader` + içerik. URL'ler Türkçe ve ASCII
(ç→c, ş→s, ı→i, ğ→g, ö→o, ü→u), tire ile ayrılır.

## Tasarım sistemi — "Mütalaa"

Hukuki metin dizgisinden türeyen editoryal sistem: ince kural çizgileri, madde
numaraları (§ 01, yasal metinlerde Ek 1), asimetrik 12 kolon ızgara, bol beyaz alan.
Renk sistemi onaylı amblemden türer: amblem tek renkli düz siyah bir işarettir →
mürekkep ve kâğıt, aradaki tek vurgu sıcak "taş" grisi (mühür / taş baskı). Altın,
lacivert, gradyan yoktur. Amblemden alınan işaretler: yüksek kontrastlı serif başlıklar
(sütunlu, klasik amblemle uyumlu), taş rengi kılçıklı etiket satırı (`tagline-rule`,
`tagline-rule-start` — logo alt yazısını çevreleyen çizgiler), sütunları yansıtan ince
dikey ayırıcı (logo düzeninde) ve hilalden türeyen ince daire yayları (`FlowLine` —
`sweep` | `drift` | `arc`; hilalin kopyası değildir. Bölüm başına en fazla bir, hero'da en
fazla iki; metnin arkasında ve düşük opaklıkta). Terazi, hilal veya ok ikonu ayrıca
kullanılmaz — yalnızca amblemin içinde görünür.

### Logo kuralları

- Amblem kaynağı: `public/branding/okay-mark-original.png` (müşterinin verdiği dosya,
  değiştirilmez): terazi, sütunlar, hilal ve ok — "OK" + "AY" = OKAY.
- `npm run brand:logo` (`scripts/branding/prepare-mark.mjs`) amblemi potrace ile
  **otomatik vektörleştirir** (yeniden çizilmez) ve kaynakla piksel örtüşmesini denetler
  (IoU ≥ 0,985; şu an 0,996). Çıktılar: `components/brand/okay-mark-path.ts` (elle
  düzenlenmez), `public/branding/okay-mark.svg`, `okay-mark.png` (JSON-LD logosu),
  `app/icon.svg`, `app/apple-icon.png`.
- Logo = amblem + **"OKAY"** (Bodoni Moda, yarı kalın, geniş aralık) + **"HUKUK
  DANIŞMANLIK"** (Instrument Sans). `<Logo layout="horizontal" | "stacked">`; boyut
  `font-size` ile verilir (ör. `text-[17px] lg:text-[22px]`), her şey em ile orantılıdır.
  Yazılar gerçek metindir; erişilebilir ad `logoAlt` (`config/brand.ts`).
- Amblem `currentColor` ile çizilir: açık zeminde `ink-950`, koyu zeminde `paper`
  (tek renkli işaretin negatif kullanımı). Başka renge boyanmaz, filtre/gölge/gradyan
  uygulanmaz, oranı ve parçaları değiştirilmez. Ayırıcı ve kılçıklar `stone`.
- Ana sayfada ve `/iletisim`'de başlık (navbar) koyu hero üzerindeyken logosuzdur (logo
  hero'da büyük boyutta); hero geçilince açık temaya ve logoya döner. Koyu hero'lu sayfalar
  `config/header.ts` → `DARK_HERO_PATHS`, hero öğesinin id'si `DARK_HERO_ID`.
- Header'da amblem ~47–60px; alt yazı en az ~9,5px. Daha küçük kullanım (favicon) yalnızca
  amblemdir. Paylaşım görseli: `npm run brand:og -- <dev adresi>` (galerideki `#og-frame`).

- **Renkler** (`globals.css`): `ink-950 #131210`, `ink-900/800/700`, `paper #F6F4EF`,
  `paper-deep #ECE8E0`, `stone #A69E90`, `stone-deep #6B6458`, `ink-muted #57534B`,
  `line #D7D1C5`.
  - `stone` kırık beyaz üzerinde ~2.4:1 → **açık zeminde metin rengi olarak kullanılmaz**;
    açık zeminde vurgu metni = `stone-deep` (~5.3:1). Mürekkep üzerinde `stone` (~7.1:1).
  - Koyu bölümler için `surface-ink` sınıfı (veya `<Section surface="ink">`): metin,
    çizgi ve odak rengi otomatik tersine döner.
- **Tipografi:** başlıklar Bodoni Moda (logodaki yüksek kontrastlı harflerle akraba);
  `opsz 28` + 500 ağırlık sabitlenmiştir — otomatik optik boyut büyük puntoda kılcal
  çizgileri yok eder. Metin Instrument Sans. İkisi de `latin-ext` (Türkçe karakterler).
  Ölçek: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lede`, `eyebrow`.
  Inter/Roboto kullanılmaz.
- **Izgara:** `Container` (max 1320px; 20/32/48px kenar), 12 kolon; metin genişliği
  `max-w-measure` (40rem).
- **Köşeler:** neredeyse keskin (`--radius: 0.125rem`). Yuvarlak kart dizileri yok.
- **Ritim:** ardışık bölümler aynı yerleşimi tekrarlamaz (tam genişlik / asimetrik split /
  mürekkep bant / liste / bilgi şeridi). 3'lü özellik kartı, gradyan, glassmorphism,
  dekoratif blob, uydurma metrik yasak.
- **Motion:** ölçülü. İlk ekran: CSS `animate-rise` (JS'siz çalışır, reduced-motion'da
  tamamen kapanır). Kaydırma: `Reveal` (`rise` | `fade` | `line`), listelerde
  `RevealGroup` + `RevealItem` (stagger), `FlowLine` (bir kez çizilir).
  Hover: kart üst çizgisinin taş renginde çizilmesi, yayın başlığının altının çizilmesi,
  ok ikonlarının kayması, ekip fotoğrafında hafif yakınlaşma. Header kaydırınca ince çizgi
  ve gölge alır, logo hafif küçülür (yükseklik sabit, layout kayması yok).
  `MotionConfig reducedMotion="user"` + CSS reduced-motion kuralı. Parallax,
  scroll-jacking, imleç efekti yok. Bileşenler `import * as m from "motion/react-m"`
  kullanır; `motion.*` kullanılmaz (`LazyMotion strict` hata verir), özellikler
  (`domAnimation`) ayrı parçada sonradan yüklenir.
- **Fontlar:** Bodoni Moda normal kesim ve Instrument Sans önyüklenir; Bodoni italik ayrı
  örnek (`preload: false`) — iki örnek aynı "Bodoni Moda" ailesine düştüğü için `italic`
  sınıfı otomatik eşleşir.
- **Bileşenler:** `Button` (primary | outline | quiet | onDark; bağlantı için `asChild`),
  `SectionHeading` (marker, lede, start/center, h2/h3), `PracticeCard`, `AttorneyCard`
  (yalnızca doğrulanmış mesleki bilgiler; fotoğraf yoksa monogram), `ArticleCard`
  (default/featured), `Breadcrumb` (`PageHeader` içinde otomatik). Kart bağlantıları
  tüm kartı kaplar; odak halkası kartın kendisinde gösterilir.
- **Erişilebilirlik:** skip link (`#icerik`), görünür `:focus-visible` halkası,
  `aria-current="page"`, en az 44px dokunma hedefi, tek `h1`, anlamlı başlık sırası,
  mobil menü Radix Dialog (odak tuzağı, Esc, odak dönüşü).

## Avukat profilleri

- Veri modeli: `lib/content/attorney-schema.ts`. Ad soyad dışındaki tüm alanlar boş
  (null / []) olabilir; boş alan sitede "Eklenecek" olarak görünür. Kayıtlar yalnızca
  `published: true` iken listelenir.
- Arabuluculuk bilgisi yalnızca `mediator.verified === true` (Arabulucular Sicili'nden teyit)
  iken gösterilir (`verifiedMediator()`).
- Fotoğraf yalnızca kişinin onayıyla gerçek fotoğraf; yoksa monogram + "Fotoğraf eklenecek".
- `/avukatlarimiz/[slug]`: Cache Components boş `generateStaticParams` kabul etmez; kayıt
  yokken tek yer tutucu yol (`profil-hazirlaniyor`) üretilir ve 404 döner. `dynamicParams`
  Cache Components ile kullanılamaz; bilinmeyen slug istek anında `notFound()` döner.
  Akış başladıktan sonra çağrıldığı için ilk yanıt 200 + `noindex` + bulunamadı sayfasıdır,
  sonraki istekler 404 (Next.js belgelenmiş davranışı; e2e `expectNotFound` bunu kabul eder).
  İstemci tarafı gezinmede önceki rota Activity ile DOM'da gizli kalır → testlerde `h1:visible`.

## Yasal metinler

- KVKK Aydınlatma Metni ve Gizlilik Politikası **taslaktır**; `DraftNotice` ile işaretlidir ve
  nihai hukuki onay olmadan yayına alınmaz. Büroya özgü, doğrulanması gereken ifadeler
  `<Verify>` ile, eksik değerler `<MaybeValue>` ile işaretlidir (ikisi de `data-placeholder`).
- Taslaklar yalnızca kanundan doğrulanabilir hükümleri içerir (KVKK m.5/2, 9, 10, 11, 13;
  Başvuru Tebliği). Saklama süreleri, sağlayıcılar, açık rıza ihtiyacı hukuki incelemede eklenir.
- Çerez Politikası ve Yasal Uyarı tam metinleri henüz yazılmadı (yer tutucu).

## İletişim formu

- Alanlar: ad soyad, e-posta, isteğe bağlı telefon, genel mesaj, KVKK aydınlatma onay kutusu
  (açık rıza DEĞİLDİR; yalnızca okunduğunu belirtir). Kimlik no, dava ayrıntısı, özel nitelikli
  veri istenmez; mesajda T.C. kimlik numarası (algoritma kontrolüyle) reddedilir.
- Sunucu sırası: hız sınırı (10 dk / 3 gönderim, IP özetiyle; bkz. "Hız sınırları") → bal küpü + süre
  (≥3 sn, ≤2 sa) + bağlantı sınırı → Zod → `deliverContactMessage`.
- Başarı yalnızca `contact_messages` tablosuna kayıt onaylanınca gösterilir. Supabase
  değişkenleri yoksa form "Önizleme" uyarısıyla görünür ve "çevrim dışı" yanıtı verir.
- Harita sayfaya gömülmez; yalnızca Google Haritalar arama bağlantısı (yeni sekme).

## Hız sınırları

- İletişim formu (10 dk / 3 gönderim, `lib/contact/rate-limit.ts`) ve panel girişi
  (15 dk / 5 başarısız deneme, `lib/admin/login-rate-limit.ts`) ortak `lib/rate-limit.ts`
  (server-only) üzerinden çalışır; fonksiyonlar async'tir (`await consumeRateLimit(...)`).
- Sayaçlar Supabase Postgres'te paylaşılır: `public.rate_limit_hits` + `consume_rate_limit`
  (kayan pencere; anahtar başına danışma kilidiyle atomik; `p_consume=false` yalnızca okur)
  ve `clear_rate_limit`. Tablo RLS'li ve politikasız; tabloya ve fonksiyonlara anon/authenticated
  yetkisi yoktur, yalnızca `service_role` (SUPABASE_SECRET_KEY) çağırır.
- Anahtar ham IP/e-posta değil, uygulamanın ürettiği SHA-256 özetidir (veritabanında 64 hex
  check kısıtı). Süresi dolan satırlar çağrılarda silinir; hiçbir satır 1 günden uzun kalmaz.
- Geri dönüş: Supabase sunucu değişkenleri yoksa, RPC hata verirse (ör. migration
  uygulanmamış), yanıt beklenmeyen biçimdeyse veya 3 sn'de dönmezse bellek içi sayaç
  kullanılır (tek süreçte geçerli). Günlüğe yalnızca `[hiz-siniri] <ad>: … (<kod>)` yazılır.
  Testler: `tests/rate-limit.test.mts` (sahte PostgREST sunucusuyla; SQL burada sınanmaz).
- **Migration (`20261019000000_rate_limits.sql`) gerçek bir veritabanında denenmedi.**

## İçerik bütünlüğü (zorunlu)

- Avukat adı, sicil no, adres, telefon, e-posta, referans, müvekkil, başarı oranı,
  sertifika, ödül, istatistik **uydurulmaz**.
- Bilinmeyen her değer `placeholder("…")` ile tutulur ve arayüzde `<MaybeValue>` /
  `<Placeholder>` / `<PendingBlock>` ile açıkça "Eklenecek" olarak görünür
  (`data-placeholder` niteliği taşır). Yayın öncesi kontrol:
  `document.querySelectorAll("[data-placeholder]")` boş olmalı.
- Yer tutucular metadata'ya, sitemap'e veya yapılandırılmış veriye girmez.
  Yapılandırılmış veri (JSON-LD) yalnızca doğrulanmış olgularla eklenir.

## Mevzuat gözetimi

**Avukatlık reklam yasağı** — 1136 s. Avukatlık Kanunu m.55, TBB Meslek Kuralları,
TBB Reklam Yasağı Yönetmeliği:

- Bilgi verici, ölçülü, ağırbaşlı dil. "En iyi", "lider", "uzman", "garanti", "kazanma
  oranı" gibi üstünlük/sonuç ifadeleri yok.
- Müvekkil adı/logosu, referans, yorum/testimonial, dava sonucu, karşılaştırma yok.
- Ücret, indirim, "ücretsiz danışma" gibi iş toplamaya yönelik ifadeler ve agresif CTA
  ("Hemen arayın!") yok. Bağlantılar sade: "İletişim", "Büroyu tanıyın".
- Pop-up, otomatik sohbet/WhatsApp balonu, reklam amaçlı izleme eklenmez.

**Arabuluculuk** — 6325 s. HUAK, Arabuluculuk Yönetmeliği, Arabuluculuk Etik Kuralları:

- Arabulucu sicil numarası ve uzmanlık alanı yalnızca sicil kaydına göre yazılır.
- Tarafsızlık ve bağımsızlık dili; arabuluculuk hizmeti taraflardan birine "kazandırma"
  vaadiyle sunulmaz. Avukatlık–arabuluculuk görev ayrılığına ilişkin metin, mevzuat
  doğrulanarak eklenir.

**KVKK** — 6698 s. Kanun, Aydınlatma Tebliği, Kurul'un çerez rehberi:

- Aydınlatma metni ile açık rıza ayrı tutulur; açık rıza hizmet şartına bağlanmaz.
- Formlar: yalnızca gerekli alanlar, aydınlatma bağlantısı, ayrı ve önceden
  işaretlenmemiş onay kutusu.
- Zorunlu olmayan çerez/analitik varsayılan kapalı; eklenirse önceden onay alınır.
  Şu anda sitede zorunlu olmayan çerez yoktur → çerez bandı yoktur.
- Yasal metinler (KVKK, çerez, yasal uyarı) uydurulmaz; hukuki inceleme sonrası eklenir.

## Yayın / SEO

- `NEXT_PUBLIC_SITE_INDEXABLE=true` olana kadar `robots.txt` tüm siteyi engeller ve
  sayfalar `noindex` döner.
- Her sayfa `buildMetadata` ile title, description, canonical, Open Graph ve Twitter
  (`summary_large_image`) üretir; paylaşım görseli `/opengraph-image.png` açıkça eklenir
  (sayfa düzeyindeki openGraph nesnesi üst segmentin dosya tabanlı görselini devralmaz).
- Afyonkarahisar yalnızca konum bilgisi olarak doğal biçimde geçer; şehir+hizmet
  anahtar kelime sayfaları, gizli metin veya iş toplamaya yönelik SEO yapılmaz.
- JSON-LD yalnızca `lib/structured-data.ts` + `components/seo/json-ld.tsx` ile (`<` kaçışlı).
  Posta adresi/telefon/e-posta yalnızca `contact.verified === true` iken eklenir.
  Değerlendirme, puan, ödül, fiyat alanları hiç eklenmez.

## GitHub Pages önizlemesi (statik)

- `GITHUB_PAGES=true` → `next.config.ts`: `output: "export"`, `basePath` (NEXT_PUBLIC_BASE_PATH),
  `trailingSlash`, `images.unoptimized`; Cache Components/PPR kapalı (dışa aktarım PPR'ı
  desteklemez), `"use cache"` için `experimental.useCache`; headers/redirects yok.
- `scripts/pages/prepare.mjs` (yalnızca CI'da; kaynak siler): admin, proxy, iletişim
  eylemi, bilesenler, robots/sitemap çıkarılır; form → `contact-form.static.tsx`.
  `scripts/pages/finalize.mjs`: önyükleme parçalarını düz adla kopyalar (aksi halde
  prefetch 404), `.nojekyll`, yer tutucu yayın yolunu siler.
- Alt yol: `next/image` basePath eklemez → `public/` görselleri `basePath + src` ile
  verilmeli (logo satır içi SVG olduğu için etkilenmez); mutlak URL'ler
  `absoluteUrl()` ile (site adresi alt yol içerebilir). Yol karşılaştırmalarında
  `normalizePath()` (sondaki "/").

## Güvenlik

- `next.config.ts` → tüm yanıtlara CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`, HSTS; `X-Powered-By` kapalı. Panelde
  proxy ayrıca `noindex`, `no-store`, `Referrer-Policy: same-origin` ekler.
- CSP nonce'suzdur: sayfalar statik/PPR ve nonce PPR ile uyumsuz (Next CSP rehberi). Bu
  yüzden `script-src 'self' 'unsafe-inline'`; harici betik, iframe, `object`, `base`
  yasak, `form-action 'self'`. XSS savunması: React kaçışı, `RichText` düz metin,
  JSON-LD `<` kaçışı, `dangerouslySetInnerHTML` yalnızca `JsonLd` içinde.
- CSRF: Server Actions Next'in Origin/Host karşılaştırmasıyla korunur (`allowedOrigins`
  tanımlı değil → yalnızca aynı köken); oturum çerezi `httpOnly` + `SameSite=Lax`.
- Yeni panel sayfası/eylemi: `requireStaff`/`requireStaffClient` veya `lib/admin/data.ts`
  fonksiyonu kullanmalı — `tests/admin-authz.test.mts` bunu her dosya için denetler.

## QA kapısı

Bir iş "tamamlandı" sayılmadan önce: `npm run check` hatasız; tarayıcıda masaüstü
(1440px) ve mobil (375px) kontrol; konsol hatası yok; yatay taşma yok; klavye ile
gezinme ve odak görünür; mobil menü Esc/odak dönüşü; `prefers-reduced-motion` testi;
`npm test`; `npm run test:e2e`; içerik değiştiyse `npm run qa:compliance` (bkz.
`docs/uyum-kontrol-listesi.md`). Yayından önce `npm run qa:launch -- <üretim adresi>` geçmeli.
Doğrulanamayan iş tamamlandı olarak raporlanmaz.
