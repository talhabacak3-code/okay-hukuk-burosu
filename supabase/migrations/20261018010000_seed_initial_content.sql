-- =====================================================================
-- İlk içerik — TASLAK (henüz uygulanmadı)
-- Yalnızca kullanıcı tarafından sağlanan bilgiler (17 Ekim 2026) girilir; diğer
-- alanlar boş (null) kalır ve sitede "Eklenecek" olarak görünür.
-- İletişim bilgileri büro onayı beklediği için contact_verified = false.
-- Tekrar çalıştırılabilir: mevcut kayıtların üzerine yazmaz.
-- =====================================================================

insert into public.site_settings (id, address, phone, mobile, map_url, contact_verified)
values (
  true,
  'İstiklal Mahallesi, 225. Sokak No: 5, Afyonkarahisar Merkez / Afyonkarahisar',
  '+90 272 217 59 52',
  '+90 542 846 33 47',
  'https://www.google.com/maps/search/?api=1&query=%C4%B0stiklal%20Mahallesi%2C%20225.%20Sokak%20No%3A%205%2C%20Afyonkarahisar%20Merkez%20%2F%20Afyonkarahisar',
  false
)
on conflict (id) do nothing;

insert into public.pages (slug) values ('home'), ('about'), ('mediation')
on conflict (slug) do nothing;

insert into public.attorneys (slug, full_name, title, sort_order, published)
values
  ('mustafa-okay', 'Av. Mustafa OKAY', 'Kurucu Avukat', 1, true),
  ('fatma-okay', 'Arb. Av. Fatma OKAY', 'Kurucu Avukat, Arabulucu', 2, true)
on conflict (slug) do nothing;
