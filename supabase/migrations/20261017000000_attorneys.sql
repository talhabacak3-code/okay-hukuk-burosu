-- =====================================================================
-- Avukat profilleri — TASLAK MIGRATION (henüz hiçbir veritabanına uygulanmadı)
-- Önkoşul: 20261016000000_core_auth.sql (staff rolleri, set_updated_at, audit_trigger)
--
-- Alanlar src/lib/content/attorney-schema.ts ile eşleşir.
-- İçerik bütünlüğü: ad soyad dışındaki alanlar boş bırakılabilir; boş alanlar
-- sitede "Eklenecek" olarak gösterilir. Arabuluculuk bilgisi yalnızca
-- mediator_verified = true iken yayımlanır.
-- =====================================================================

create table if not exists public.attorneys (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique
                             check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  full_name                text not null check (char_length(full_name) between 2 and 120),
  title                    text check (char_length(title) <= 120),
  summary                  text check (char_length(summary) <= 1200),
  bar_association          text check (char_length(bar_association) <= 120),
  bar_registration_no      text check (char_length(bar_registration_no) <= 40),
  photo_path               text,          -- Storage 'media' yolu (gerçek fotoğraf, kişinin onayıyla)
  photo_alt                text,
  education                jsonb not null default '[]'::jsonb,  -- [{degree, institution, year}]
  experience               jsonb not null default '[]'::jsonb,  -- [{period, role, organization, description}]
  practice_areas           text[] not null default '{}',
  mediator_registry_no     text check (char_length(mediator_registry_no) <= 40),
  mediator_specializations text[] not null default '{}',
  mediator_verified        boolean not null default false,
  sort_order               integer not null default 0,
  published                boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint photo_requires_alt check (photo_path is null or photo_alt is not null),
  constraint verified_mediator_requires_no
    check (not mediator_verified or mediator_registry_no is not null),
  constraint education_is_array check (jsonb_typeof(education) = 'array'),
  constraint experience_is_array check (jsonb_typeof(experience) = 'array')
);

drop trigger if exists attorneys_set_updated_at on public.attorneys;
create trigger attorneys_set_updated_at
  before update on public.attorneys
  for each row execute function public.set_updated_at();

drop trigger if exists attorneys_audit on public.attorneys;
create trigger attorneys_audit
  after insert or update or delete on public.attorneys
  for each row execute function public.audit_trigger();

alter table public.attorneys enable row level security;

-- Ziyaretçiler yalnızca yayımlanmış profilleri okuyabilir.
create policy "attorneys_public_read_published"
  on public.attorneys for select
  to anon, authenticated
  using (published = true or public.is_staff());

-- Panel kullanıcıları (admin + editor) yönetebilir.
create policy "attorneys_staff_write"
  on public.attorneys for insert
  to authenticated
  with check (public.is_staff());

create policy "attorneys_staff_update"
  on public.attorneys for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "attorneys_staff_delete"
  on public.attorneys for delete
  to authenticated
  using (public.is_staff());

grant select on public.attorneys to anon, authenticated;
grant insert, update, delete on public.attorneys to authenticated;
