-- =====================================================================
-- Panelden düzenlenen içerik: site ayarları, sayfa metinleri, faaliyet alanları,
-- yayınlar, medya kütüphanesi ve Storage kovası — TASLAK (henüz uygulanmadı)
-- Önkoşul: 20261016000000_core_auth.sql, 20261017000000_attorneys.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Site ayarları (tek satır): iletişim, mesleki bilgiler, KVKK veri sorumlusu, SEO
-- Okuma herkese açık (sitede gösterilen bilgiler); yazma yalnızca admin.
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id                       boolean primary key default true check (id),
  legal_name               text check (char_length(legal_name) <= 200),
  address                  text check (char_length(address) <= 300),
  phone                    text check (char_length(phone) <= 30),
  mobile                   text check (char_length(mobile) <= 30),
  email                    text check (char_length(email) <= 254),
  kep                      text check (char_length(kep) <= 254),
  working_hours            text check (char_length(working_hours) <= 200),
  map_url                  text check (map_url is null or map_url ~ '^https://'),
  contact_verified         boolean not null default false,
  bar_association          text check (char_length(bar_association) <= 120),
  bar_registration_no      text check (char_length(bar_registration_no) <= 40),
  mediator_registry_no     text check (char_length(mediator_registry_no) <= 40),
  mediator_specializations text check (char_length(mediator_specializations) <= 300),
  founded_year             text check (char_length(founded_year) <= 20),
  working_languages        text check (char_length(working_languages) <= 200),
  data_controller_name     text check (char_length(data_controller_name) <= 200),
  data_controller_address  text check (char_length(data_controller_address) <= 300),
  data_controller_email    text check (char_length(data_controller_email) <= 254),
  seo_title                text check (char_length(seo_title) <= 70),
  seo_description          text check (char_length(seo_description) <= 200),
  updated_at               timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Sayfa metinleri: alanlar uygulamadaki Zod şemalarıyla doğrulanır (jsonb).
-- ---------------------------------------------------------------------
create table if not exists public.pages (
  slug       text primary key check (slug in ('home', 'about', 'mediation')),
  content    jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Faaliyet alanları
-- ---------------------------------------------------------------------
create table if not exists public.practice_areas (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title      text not null check (char_length(title) between 2 and 120),
  summary    text not null check (char_length(summary) between 10 and 400),
  sort_order integer not null default 0,
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Hukuki yayınlar
-- ---------------------------------------------------------------------
create table if not exists public.articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text not null check (char_length(title) between 5 and 200),
  excerpt            text not null check (char_length(excerpt) between 20 and 500),
  body               text not null check (char_length(body) between 50 and 50000),
  category           text check (char_length(category) <= 60),
  author_attorney_id uuid references public.attorneys (id) on delete set null,
  cover_path         text,
  cover_alt          text,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint published_requires_date check (status <> 'published' or published_at is not null),
  constraint cover_requires_alt check (cover_path is null or cover_alt is not null)
);

create index if not exists articles_published_idx
  on public.articles (status, published_at desc);

-- ---------------------------------------------------------------------
-- Medya kütüphanesi (Storage nesnelerinin üst verisi)
-- ---------------------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,
  mime_type   text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes  integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  width       integer check (width > 0),
  height      integer check (height > 0),
  alt         text not null check (char_length(alt) between 3 and 200),
  uploaded_by uuid default auth.uid(),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tetikleyiciler: updated_at + denetim kaydı
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['site_settings', 'pages', 'practice_areas', 'articles'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
  end loop;

  foreach t in array array['site_settings', 'pages', 'practice_areas', 'articles', 'media'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_trigger()',
      t || '_audit', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.site_settings  enable row level security;
alter table public.pages          enable row level security;
alter table public.practice_areas enable row level security;
alter table public.articles       enable row level security;
alter table public.media          enable row level security;

-- site_settings: herkes okur, yalnızca admin günceller (satır seed ile oluşturulur)
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- pages: herkes okur, panel kullanıcıları yazar
create policy "pages_public_read" on public.pages
  for select to anon, authenticated using (true);
create policy "pages_staff_insert" on public.pages
  for insert to authenticated with check (public.is_staff());
create policy "pages_staff_update" on public.pages
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- practice_areas: yayımlananları herkes, tümünü panel kullanıcıları okur
create policy "practice_areas_read" on public.practice_areas
  for select to anon, authenticated using (published or public.is_staff());
create policy "practice_areas_staff_insert" on public.practice_areas
  for insert to authenticated with check (public.is_staff());
create policy "practice_areas_staff_update" on public.practice_areas
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "practice_areas_staff_delete" on public.practice_areas
  for delete to authenticated using (public.is_staff());

-- articles: yayımlanmış ve tarihi gelmiş yazılar herkese açık
create policy "articles_read" on public.articles
  for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_staff());
create policy "articles_staff_insert" on public.articles
  for insert to authenticated with check (public.is_staff());
create policy "articles_staff_update" on public.articles
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "articles_staff_delete" on public.articles
  for delete to authenticated using (public.is_staff());

-- media: üst veri herkese açık (dosyalar zaten herkese açık kovada)
create policy "media_public_read" on public.media
  for select to anon, authenticated using (true);
create policy "media_staff_insert" on public.media
  for insert to authenticated with check (public.is_staff() and uploaded_by = auth.uid());
create policy "media_staff_update" on public.media
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "media_staff_delete" on public.media
  for delete to authenticated using (public.is_staff());

grant select on public.site_settings, public.pages, public.practice_areas, public.articles, public.media
  to anon, authenticated;
grant update on public.site_settings to authenticated;
grant insert, update on public.pages to authenticated;
grant insert, update, delete on public.practice_areas, public.articles, public.media to authenticated;

-- ---------------------------------------------------------------------
-- Storage: 'media' kovası — yalnızca JPEG/PNG/WebP, en fazla 5 MB.
-- SVG bilinçli olarak kapalı (betik içerebilir). Dosyalar herkese açık URL ile sunulur.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media_objects_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "media_objects_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy "media_objects_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());
create policy "media_objects_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
