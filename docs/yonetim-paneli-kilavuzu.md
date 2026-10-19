# Yönetim paneli kullanım kılavuzu

OKAY Hukuk Danışmanlık & Arabuluculuk web sitesinin içeriği, kod bilgisi gerektirmeden
`https://<alan-adı>/admin` adresindeki panelden yönetilir.

> Durum (18 Ekim 2026): Panel kodu hazırdır ancak **gerçek bir veritabanına bağlanıp
> uçtan uca denenmemiştir**. Kurulum: README → "Yönetim paneli kurulumu". İlk
> kullanımdan önce teknik sorumlu, staging ortamında yetkili giriş ve CRUD testlerini
> (`npm run test:e2e`, bkz. `docs/yayin-kilavuzu.md`) çalıştırmalıdır.

## 1. Giriş ve hesaplar

- Adres: `/admin` → giriş sayfasına yönlendirilirsiniz. E-posta ve şifrenizle girin.
- Sitede kayıt (üye olma) yoktur. Hesapları teknik sorumlu oluşturur ve rol verir.
- 15 dakika içinde 5 hatalı denemeden sonra giriş geçici olarak kilitlenir.
- Hata mesajı bilerek geneldir ("E-posta veya şifre hatalı"): hesabın var olup olmadığı
  açığa çıkmaz.
- İşiniz bitince sol menünün altındaki **Çıkış yap** ile çıkın; ortak bilgisayarda
  tarayıcıya şifre kaydettirmeyin.
- Şifre sıfırlama şimdilik teknik sorumlu tarafından Supabase panelinden yapılır.

### Roller

| Rol      | Görebildiği / değiştirebildiği                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Editör   | Genel bakış, Ana sayfa, Hakkımızda, Avukat profilleri, Faaliyet alanları, Arabuluculuk, Hukuki yayınlar, Medya kütüphanesi |
| Yönetici | Editörün tümü + İletişim bilgileri, SEO ve site ayarları, Gelen mesajlar, Denetim kaydı                                    |

Yetkiniz olmayan bir sayfaya girerseniz "Yetkiniz yok" sayfası görünür.

## 2. Genel kurallar (her modül için)

- **Kaydet** düğmesine bastıktan sonra yeşil/altın çizgili "kaydedildi" bildirimi
  görmeden değişikliğin kaydedildiğini varsaymayın. Hata olursa kırmızı mesaj çıkar ve
  hiçbir şey kaydedilmez.
- Değişiklikler sitede birkaç saniye içinde görünür.
- **Sitede yayımla** işareti kaldırılmış kayıtlar sitede görünmez (taslak).
- Boş bıraktığınız alanlar sitede "Eklenecek" etiketiyle görünür. Yayından önce sitede
  hiçbir "Eklenecek" etiketi kalmamalıdır.
- Silme işlemleri onay ister ve geri alınamaz.

### İçerik yazarken (meslek kuralları)

Avukatlık Kanunu m.55 ve TBB reklam yasağı gereği metinler bilgi verici ve ölçülü olmalıdır.
Aşağıdakiler **yazılmaz**:

- "En iyi", "lider", "uzman", "alanında öncü", "1 numara" gibi üstünlük ifadeleri
- Başarı oranı, kazanılan dava sayısı, yüzdeler, "garanti", "kesin sonuç"
- Müvekkil adı/logosu, referans, yorum, teşekkür mektubu, dava sonucu
- Ücret, indirim, "ücretsiz ön görüşme", "hemen arayın" gibi iş toplamaya yönelik ifadeler
- Arabuluculuk metinlerinde taraflardan birine "kazandırma" vaadi

Yayından önce teknik sorumlu `npm run qa:compliance` taramasını çalıştırır; ancak tarama
yardımcıdır, her metin yayından önce bir avukat tarafından okunmalıdır.

## 3. Modüller

### Genel bakış

Kayıt sayıları ve (yöneticiler için) son değişiklikler.

### Ana sayfa

- **Başlık — 1. satır / 2. satır (altın renkli):** hero başlığı (şu an "Hukuka Saygı." /
  "Mesleğe Özen.").
- **Alt açıklama:** hero başlığının altındaki kısa paragraf.
- **Tanıtım metni:** "Büro" (künye) bölümündeki metin.
- **Ofis fotoğrafı** ("Medya kütüphanesinden seçin"): önce Medya kütüphanesine yükleyin. Yalnızca büroya ait gerçek fotoğraf
  kullanın; hazır (stok) görsel kullanmayın.

### Hakkımızda

**Giriş** ve **Çalışma yaklaşımı** metinleri. Metinde ara başlık için satırı `## ` ile
başlatın; boş satır yeni paragraf açar. Kuruluş yılı ve çalışma dilleri "SEO ve site
ayarları" modülündedir.

### Avukat profilleri

| Alan                            | Not                                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Ad soyad, Unvan                 | Baro kaydındaki biçimiyle                                                                                                                |
| Kayıtlı olduğu baro, sicil no   | Baro kaydından                                                                                                                           |
| Kısa mesleki özet               | Başarı/üstünlük iddiası içermez                                                                                                          |
| Fotoğraf                        | Yalnızca kişinin onayıyla; yoksa sitede baş harfler gösterilir                                                                           |
| Eğitim                          | Her satır bir kayıt: `Yıl \| Derece \| Kurum` (ör. `2010 \| Hukuk Fakültesi \| … Üniversitesi`)                                          |
| Mesleki geçmiş                  | Her satır: `Dönem \| Görev \| Kurum \| Açıklama` (son ikisi isteğe bağlı)                                                                |
| Faaliyet alanları               | Her satır bir alan                                                                                                                       |
| Arabulucular Sicili numarası    | Yalnızca sicil kaydından                                                                                                                 |
| Uzmanlık alanları (sicile göre) | Yalnızca sicil kaydındaki uzmanlık alanları                                                                                              |
| Sicil kaydı teyit edildi        | Sicil numarası Arabulucular Sicili'nden kontrol edildikten sonra işaretlenir. İşaretlenmeden arabuluculuk bilgisi sitede **gösterilmez** |

### Faaliyet alanları

**Başlık**, **Kısa açıklama** (bilgilendirici; "uzman olduğumuz" vb. yazılmaz), **Sıra**
(küçük sayı önce), **Sitede yayımla**. "Bağlantı adı" boş bırakılırsa başlıktan üretilir.
Yalnızca büronun fiilen çalıştığı alanları ekleyin.

### Arabuluculuk

**Giriş**, **Arabuluculuk süreci** ve **Tarafsızlık ve görev ayrılığı** metinleri.
Kanuna atıf yapan cümleler 6325 sayılı Kanun metniyle karşılaştırılarak yazılmalıdır;
avukatlık–arabuluculuk görev ayrılığı metni hukuki incelemeden geçmelidir.

### Hukuki yayınlar

- **Başlık, Özet** (liste ve arama sonuçlarında görünür, en az 20 karakter), **Metin**
  (en az 60 karakter; `## ` ara başlık, boş satır paragraf).
- **Durum:** Taslak / Yayımlandı. **Yayın tarihi** boşsa yayımlandığı an atanır.
- **Yazar, Kategori, Kapak görseli** isteğe bağlıdır.
- Her yazının altında "genel bilgilendirme amaçlıdır, hukuki danışmanlık değildir" uyarısı
  otomatik görünür. Somut dava/müvekkil bilgisi yazılmaz.

### Medya kütüphanesi

- Yalnızca **JPEG, PNG veya WebP**, en fazla **5 MB**. SVG ve diğer türler reddedilir.
- Yüklenen görselin konum (GPS) ve kamera bilgileri otomatik silinir, en fazla 2400 px'e
  küçültülür.
- **Alt metin** zorunludur: görme engelli ziyaretçiler için görselde ne olduğunu kısaca
  yazın (ör. "Büronun bekleme salonu").
- Bir sayfada kullanılan görsel silinemez; önce o sayfadan kaldırın.

### İletişim bilgileri (yönetici)

Açık adres, sabit ve mobil telefon, e-posta, KEP, çalışma saatleri, harita bağlantısı
(yalnızca Google veya Yandex Haritalar `https` bağlantısı kabul edilir).

**Bu bilgiler büro tarafından doğrulandı** kutusu:

- İşaretli değilken sitede "doğrulama bekliyor" notu görünür ve arama motorlarına adres /
  telefon bildirilmez.
- Bilgiler kontrol edildikten sonra işaretleyin.

### SEO ve site ayarları (yönetici)

- **Site başlığı / Site açıklaması:** arama sonuçlarında görünen metin. Doğal ve kısa
  tutun; anahtar kelime doldurmayın ("Afyon avukat, Afyon en iyi avukat…" gibi).
- **Baro kaydındaki tam unvan, Kayıtlı olunan baro, Baro sicil numarası.**
- **Kuruluş yılı, Çalışma dilleri** (Hakkımızda sayfasında görünür).
- **Arabulucular Sicili numarası, Uzmanlık alanları** (büro düzeyi; yalnızca sicil kaydından).
- **Veri sorumlusu, Veri sorumlusu adresi, Başvuru e-postası:** KVKK aydınlatma metninde
  kullanılır.

### Gelen mesajlar (yönetici)

İletişim formundan gelen mesajlar. **Okundu işaretle**, **Arşivle** ve **Kalıcı olarak sil**
düğmeleri vardır (silme onay ister, geri alınamaz; denetim kaydına yalnızca silme olayı yazılır).

- Mesajlar kişisel veridir: ekran görüntüsü alıp paylaşmayın, panel dışına aktarmayın.
- Büronun saklama ve imha politikasında belirlenen süre dolunca mesajı silin.
- Formda dava ayrıntısı ve T.C. kimlik numarası istenmez; yine de gelirse mesajı
  yanıtladıktan sonra silin.

### Denetim kaydı (yönetici)

Kim, ne zaman, hangi kaydı değiştirdi. Değerler değil, yalnızca değişen alan adları
tutulur. Kayıtlar panelden silinemez.

## 4. Sorun olursa

| Belirti                                          | Yapılacak                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| "Veritabanı bağlantısı yapılandırılmadı"         | Teknik sorumluya bildirin (ortam değişkenleri eksik)                  |
| "Kimlik doğrulama sunucusuna ulaşılamadı"        | Birkaç dakika sonra tekrar deneyin; sürerse teknik sorumluya bildirin |
| "Bu hesabın yönetim paneline erişim yetkisi yok" | Hesaba rol verilmemiş; teknik sorumlu `staff` kaydını eklemeli        |
| Kaydettim ama sitede görünmüyor                  | "Sitede yayımla" işaretli mi kontrol edin; sayfayı yenileyin          |
| Görsel yüklenmiyor                               | Tür (JPEG/PNG/WebP) ve boyutu (≤ 5 MB) kontrol edin                   |
