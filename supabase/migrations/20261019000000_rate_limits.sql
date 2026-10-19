-- =====================================================================
-- Paylaşılan hız sınırı sayaçları — TASLAK MIGRATION (henüz hiçbir veritabanına
-- uygulanmadı; gerçek bir Postgres/Supabase üzerinde DENENMEDİ)
-- Önkoşul: yok (bağımsız). Ad sırasıyla diğerlerinden sonra uygulanır.
--
-- İletişim formu (10 dk / 3 gönderim) ve panel girişi (15 dk / 5 başarısız deneme)
-- sayaçları sunucusuz ortamda tüm örnekler arasında paylaşılsın diye burada tutulur.
-- Çağıran: src/lib/rate-limit.ts (server-only) — yalnızca SUPABASE_SECRET_KEY
-- (service_role) ile. Ziyaretçilere (anon) ve panel kullanıcılarına (authenticated)
-- tabloya veya fonksiyonlara hiçbir yetki verilmez.
--
-- Veri minimizasyonu (KVKK m.4): ham IP adresi veya e-posta SAKLANMAZ. Anahtar,
-- uygulamanın ürettiği tek yönlü SHA-256 özetidir (64 hex karakter; check kısıtı başka
-- biçimi reddeder). Satırlar yalnızca pencere süresince gereklidir; süresi dolanlar her
-- çağrıda temizlenir, hiçbir satır 1 günden uzun kalmaz.
-- =====================================================================

create table if not exists public.rate_limit_hits (
  id     bigint generated always as identity primary key,
  key    text not null check (key ~ '^[0-9a-f]{64}$'),
  hit_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_hit_at_idx
  on public.rate_limit_hits (key, hit_at);
create index if not exists rate_limit_hits_hit_at_idx
  on public.rate_limit_hits (hit_at);

-- RLS açık, politika YOK: API üzerinden hiçbir rol satır göremez/yazamaz.
-- Supabase varsayılan yetkileri (default privileges) de geri alınır.
alter table public.rate_limit_hits enable row level security;
revoke all on table public.rate_limit_hits from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- consume_rate_limit: kayan pencereli sayaç, anahtar başına atomik.
--   p_consume = true  → sınır dolmamışsa bir deneme kaydeder (iletişim gönderimi,
--                       başarısız giriş)
--   p_consume = false → yalnızca durumu okur (giriş öncesi "engelli mi?" kontrolü)
-- Dönüş: { "allowed": bool, "remaining": int, "retry_after_ms": int }
-- Aynı anahtar için eşzamanlı çağrılar işlem düzeyinde danışma kilidiyle sıralanır;
-- böylece iki örnek aynı anda son hakkı kullanamaz.
-- ---------------------------------------------------------------------
create or replace function public.consume_rate_limit(
  p_key            text,
  p_window_seconds integer,
  p_max            integer,
  p_consume        boolean default true
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now    timestamptz := clock_timestamp();
  v_window interval;
  v_count  integer;
  v_oldest timestamptz;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' then
    raise exception 'rate limit: invalid key' using errcode = '22023';
  end if;
  if p_window_seconds is null or p_window_seconds not between 1 and 86400
     or p_max is null or p_max not between 1 and 1000 then
    raise exception 'rate limit: invalid window or max' using errcode = '22023';
  end if;

  v_window := make_interval(secs => p_window_seconds);

  perform pg_advisory_xact_lock(hashtextextended('rate_limit:' || p_key, 0));

  delete from public.rate_limit_hits
   where key = p_key and hit_at <= v_now - v_window;

  select count(*), min(hit_at)
    into v_count, v_oldest
    from public.rate_limit_hits
   where key = p_key;

  if v_count >= p_max then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_ms',
        greatest(0, ceil(extract(epoch from (v_oldest + v_window - v_now)) * 1000))::bigint
    );
  end if;

  if p_consume then
    insert into public.rate_limit_hits (key, hit_at) values (p_key, v_now);
    v_count := v_count + 1;

    -- Genel temizlik: en uzun izinli pencereyi (1 gün) aşmış tüm satırlar.
    delete from public.rate_limit_hits where hit_at < v_now - interval '1 day';
  end if;

  return jsonb_build_object(
    'allowed', true,
    'remaining', p_max - v_count,
    'retry_after_ms', 0
  );
end;
$$;

-- clear_rate_limit: başarılı girişten sonra o anahtarın sayacını sıfırlar.
create or replace function public.clear_rate_limit(p_key text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' then
    raise exception 'rate limit: invalid key' using errcode = '22023';
  end if;
  delete from public.rate_limit_hits where key = p_key;
end;
$$;

-- Yalnızca sunucu anahtarı (service_role). Supabase public şemadaki yeni fonksiyonlara
-- varsayılan olarak anon/authenticated'a EXECUTE verdiği için açıkça geri alınır.
revoke all on function public.consume_rate_limit(text, integer, integer, boolean)
  from public, anon, authenticated;
revoke all on function public.clear_rate_limit(text)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer, boolean)
  to service_role;
grant execute on function public.clear_rate_limit(text)
  to service_role;
