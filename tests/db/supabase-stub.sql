-- =====================================================================
-- Supabase ortamının test için en küçük taklidi (yalnızca tests/db-migrations.test.mts).
-- Gerçek Supabase'te bunlar zaten vardır; bu dosya hiçbir veritabanına UYGULANMAZ.
--
-- Taklit edilenler:
--   roller        anon, authenticated, service_role (BYPASSRLS — Supabase'teki gibi)
--   auth          auth.users, auth.uid() (JWT 'sub' talebinden; PostgREST bunu
--                 request.jwt.claims ayarıyla iletir)
--   storage       storage.buckets, storage.objects (RLS açık)
--   varsayılan    Supabase, public şemasındaki YENİ tablo/fonksiyon/dizilere anon,
--   yetkiler      authenticated ve service_role'e tüm yetkileri verir. Bu yüzden asıl
--                 koruma RLS'tir; testler bu varsayımla yazılır.
-- =====================================================================

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema auth;
create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

create function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

create schema storage;
create table storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name      text not null,
  owner     uuid default auth.uid()
);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.objects, storage.buckets to anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
