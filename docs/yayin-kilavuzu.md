# Yayın kılavuzu — barındırma, alan adı, SSL, ortam değişkenleri, yedekleme, izleme

Bu belge teknik sorumlu içindir. Henüz hiçbir ortama yayın yapılmadı; aşağıdaki adımlar
uygulanırken her biri doğrulanmalıdır. Panel kullanımı için: `docs/yonetim-paneli-kilavuzu.md`.

## 0. Önerilen mimari

| Katman                   | Öneri                                                                       | Not                                                                                             |
| ------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Uygulama                 | **Vercel** (Next.js 16'nın üreticisi; Cache Components, PPR, Proxy desteği) | Bölge: Frankfurt (`fra1`) — Türkiye'ye yakın, Supabase ile aynı bölge                           |
| Veritabanı/Auth/Depolama | **Supabase** (Postgres + Auth + Storage), bölge `eu-central-1` (Frankfurt)  | Ücretsiz plan hareketsizlikte duraklatılabilir ve otomatik yedek sunmaz → **Pro plan önerilir** |
| Alan adı                 | Büronun kendi adına tescilli alan adı (ör. `.com.tr`, `.av.tr`)             | Tescil kuralları TRABIS'e göre; alan adı büro hesabında olmalı                                  |

**KVKK — yurt dışına aktarım:** Vercel ve Supabase sunucuları Türkiye dışındadır. İletişim
formu mesajları ve panel kullanıcı bilgileri yurt dışında işlenir. KVKK m.9 kapsamındaki
yükümlülükler (ör. standart sözleşme ve Kurul'a bildirim) yayından **önce hukuki olarak
değerlendirilmeli** ve aydınlatma metnine yansıtılmalıdır. Türkiye'de barındırma tercih
edilirse uygulama Node.js 22+ çalıştırabilen herhangi bir sunucuda `npm run build && npm run start`
ile çalışır (bkz. §8 "Vercel dışı barındırma").

## 1. Supabase kurulumu

1. Supabase'te proje oluşturun (bölge: Frankfurt). Veritabanı şifresini büronun şifre
   yöneticisinde saklayın.
2. Migration'ları **ad sırasıyla** uygulayın: `supabase/migrations/*` (README → "Yönetim paneli kurulumu").
3. Authentication → Sign In / Providers: **"Allow new users to sign up" kapalı**.
4. Authentication → URL Configuration: Site URL = `https://<alan-adı>`.
5. Authentication → Users: panel kullanıcılarını oluşturun; SQL ile `staff` tablosuna rol
   verin (README). Güçlü şifre; mümkünse en az iki yönetici (biri yedek).
6. Önerilen: Auth'ta asgari şifre uzunluğu ≥ 12; Pro planda sızdırılmış şifre koruması.
7. Storage → `media` kovası migration ile gelir (JPEG/PNG/WebP, 5 MB). Elle değiştirmeyin.

## 2. Ortam değişkenleri (Vercel → Project → Settings → Environment Variables)

| Değişken                               | Production                                 | Preview (staging) | Gizli mi?                                                                     |
| -------------------------------------- | ------------------------------------------ | ----------------- | ----------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | `https://<alan-adı>`                       | staging adresi    | Hayır                                                                         |
| `NEXT_PUBLIC_SITE_INDEXABLE`           | `true` (**yalnızca yayın kapısı geçince**) | `false`           | Hayır                                                                         |
| `NEXT_PUBLIC_SUPABASE_URL`             | üretim projesi                             | staging projesi   | Hayır                                                                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | üretim anon/publishable                    | staging           | Hayır (RLS korur)                                                             |
| `SUPABASE_SECRET_KEY`                  | üretim secret                              | staging           | **Evet** — "Sensitive" işaretleyin; asla `NEXT_PUBLIC_` önekiyle tanımlamayın |

- Değişken değişince **yeniden derleyin** (görsel alan adı ve CSP derleme anında okunur).
- Staging ve üretim için **ayrı Supabase projeleri** kullanın; E2E CRUD testleri staging'e yazar.

## 3. Alan adı, DNS ve SSL

1. Vercel → Project → Settings → Domains → alan adını ve `www` alt alanını ekleyin.
2. DNS sağlayıcısında Vercel'in o ekranda gösterdiği kayıtları girin (genellikle kök alan
   için `A` kaydı, `www` için `CNAME`). **Değerler için Vercel panelindeki güncel bilgiyi
   esas alın.**
3. Birini ana adres seçin, diğerini kalıcı (308) yönlendirin; `NEXT_PUBLIC_SITE_URL` ana adresle aynı olmalı.
4. SSL sertifikası Vercel tarafından otomatik verilir ve yenilenir. Doğrulama:
   `https://` açılıyor, `http://` → `https://` yönleniyor.
5. HSTS başlığı (`max-age=31536000`) zaten gönderiliyor. Tüm alt alan adları HTTPS olduğu
   doğrulandıktan sonra `includeSubDomains` eklenmesi değerlendirilebilir (`next.config.ts`).
6. Google Search Console: alan adını DNS `TXT` kaydıyla doğrulayın, `https://<alan-adı>/sitemap.xml`
   gönderin (yalnızca `NEXT_PUBLIC_SITE_INDEXABLE=true` olduktan sonra).

## 4. Kötüye kullanım koruması (önemli)

İletişim formu (10 dk / 3 gönderim) ve panel girişi (15 dk / 5 hata) hız sınırlarının
sayaçları **Supabase Postgres'te paylaşılır** (migration `20261019000000_rate_limits.sql`:
`rate_limit_hits` tablosu + `consume_rate_limit` / `clear_rate_limit` fonksiyonları). Böylece
sunucusuz ortamda tüm örnekler aynı sınırı görür.

> **Durum:** Bu migration henüz **hiçbir gerçek veritabanında çalıştırılmadı/denenmedi**.
> Uygulama tarafı yalnızca sahte bir PostgREST sunucusuyla sınandı (`tests/rate-limit.test.mts`).
> Staging'de aşağıdaki doğrulama yapılmadan paylaşılan sayaç çalışıyor sayılmaz.

- **Ön koşul:** migration uygulanmış ve `SUPABASE_SECRET_KEY` tanımlı olmalı. Biri eksikse
  sayaç **bellek içine döner** (tek süreçte geçerli; sunucusuzda sınır gevşer), site çalışmaya
  devam eder. RPC başarısız olursa günlükte `[hiz-siniri] iletisim: paylaşılan sayaç
kullanılamadı (PGRST202)` gibi bir satır görünür — yayında görülürse migration'ı ve anahtarı
  kontrol edin.
- **Staging doğrulaması:** iletişim formundan aynı istemciyle 4 gönderim → 4.'sü "Kısa sürede
  çok fazla gönderim" vermeli. SQL Editor'de `select key, hit_at from public.rate_limit_hits;`
  yalnızca 64 karakterlik özetler göstermeli (IP/e-posta yok). Publishable (anon) anahtarla
  `rpc/consume_rate_limit` çağrısı ve tabloya `select` **izin hatasıyla reddedilmeli**.
- Veri minimizasyonu: yalnızca özet saklanır; süresi dolan satırlar çağrılarda silinir,
  hiçbir satır 1 günden uzun kalmaz. Yedeklerde de yalnızca özetler bulunur.
- Ek katman olarak Vercel → Firewall → **Rate limiting kuralı** önerilir: `POST` istekleri
  için `/iletisim` ve `/admin/giris` yollarına IP başına dakikada makul bir sınır (ör. 10).
  Kaba kötüye kullanımı veritabanına ulaşmadan keser.
- Supabase Auth'un kendi giriş hız sınırları açıktır (varsayılan).

## 5. Yedekleme ve geri dönüş

| Ne                        | Nasıl                                                                                                                             | Sıklık                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Veritabanı                | Supabase Pro günlük otomatik yedek (+ isteğe bağlı PITR)                                                                          | Günlük (otomatik)           |
| Veritabanı (büroda kopya) | `supabase db dump --db-url "<bağlantı>" -f yedek-YYYYMMDD.sql` → şifreli, büroya ait depolama                                     | Haftalık                    |
| Medya dosyaları           | Supabase veritabanı yedekleri Storage dosyalarını **kapsamaz**; `media` kovasını ayrıca indirin (Supabase CLI / S3 uyumlu erişim) | Haftalık / yüklemeden sonra |
| Kod                       | Git deposu (GitHub vb., büro/teknik sorumlu hesabında)                                                                            | Her değişiklik              |
| Uygulama sürümü           | Vercel → Deployments → önceki sürümü **Instant Rollback**                                                                         | Gerektiğinde                |

- Yedekler kişisel veri içerir (iletişim mesajları): şifreli saklayın, erişimi sınırlayın,
  saklama süresi büronun imha politikasına uysun.
- **Geri yükleme provası:** yayından önce ve yılda en az bir kez, yedeği staging
  projesine geri yükleyip panelin açıldığını doğrulayın.

## 6. Hata ve erişilebilirlik izleme

- **Vercel → Logs / Observability:** sunucu hataları. Uygulama günlüklere kişisel veri
  yazmaz; yalnızca hata kodu/nedeni (ör. `[iletisim] gönderim reddedildi: too-fast`,
  `[admin] … 42501`).
- **Kesinti izleme:** harici bir uptime servisiyle `https://<alan-adı>/` ve `/admin/giris`
  5 dakikada bir kontrol edilsin; uyarı büroya ve teknik sorumluya gitsin.
- **Supabase → Reports / Logs:** veritabanı ve Auth hataları, disk kullanımı.
- Sentry gibi bir hata izleme aracı **eklenmedi**. Eklenecekse: kişisel veri temizleme
  (form alanları, e-posta, IP), CSP `connect-src` güncellemesi ve KVKK aydınlatma
  metnine sağlayıcının eklenmesi gerekir.

## 7. Yayın sırası (kontrol listesi)

1. `npm ci && npm run check && npm test` — hatasız.
2. Staging'e yayın (Preview), staging Supabase bağlı.
3. Staging'de uçtan uca testler (yetkili giriş + CRUD dahil):
   ```bash
   E2E_BASE_URL=https://<staging> E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_EXPECT_CONTACT_SUCCESS=1 npm run test:e2e
   ```
   Editör rolünü de denemek için ikinci bir hesapla `E2E_ADMIN_ROLE=editor` ile tekrar çalıştırın.
4. İletişim formundan staging'e gerçek bir test mesajı gönderin → panelde görün → silin.
5. Büro içeriği panelden girer; iletişim bilgilerini doğrular ("doğrulandı" kutusu).
6. Hukuki onaylar alınır (KVKK, gizlilik, çerez, yasal uyarı metinleri) ve taslak notları kaldırılır.
7. Üretim ortam değişkenleri, alan adı ve SSL hazır; `NEXT_PUBLIC_SITE_INDEXABLE=true`, yeniden derleme.
8. **Yayın kapısı** (çalışan üretim sitesine karşı):
   ```bash
   npm run qa:launch -- https://<alan-adı>
   ```
   Yer tutucu blok 0, reklam yasağı taramasında incelenmemiş eşleşme 0, robots açık,
   künye doğrulanmış olmalı. Geçmezse yayın duyurulmaz.
9. Lighthouse (mobil + masaüstü) ve Search Console sitemap gönderimi.

## 8. Vercel dışı barındırma

- Node.js 22+; `npm ci && npm run build && npm run start` (varsayılan port 3000), önünde
  HTTPS sonlandıran bir ters vekil (Nginx/Caddy).
- Ters vekil `X-Forwarded-For` ve `X-Forwarded-Host` başlıklarını doğru iletmeli (hız
  sınırı ve Server Actions köken denetimi bunlara bakar).
- Hız sınırı sayaçları Supabase'te paylaşılır (§4); Supabase bağlı değilse bellek içi sayaç
  yalnızca tek süreçte geçerlidir — birden çok örnek çalıştırılacaksa §4'teki ön koşul şarttır.
- Süreç yöneticisi (systemd/PM2), günlük döndürme ve sunucu yedeği ayrıca planlanmalıdır.
