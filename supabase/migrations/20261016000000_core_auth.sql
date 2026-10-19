-- =====================================================================
-- Çekirdek: yönetim paneli rolleri, yardımcı fonksiyonlar ve denetim kaydı.
-- Diğer tüm migration'lardan ÖNCE uygulanır.
--
-- Roller (public.staff):
--   admin  — tüm içerik + iletişim bilgileri, site ayarları, mesajlar, denetim kaydı
--   editor — içerik (sayfalar, avukatlar, faaliyet alanları, yayınlar, medya)
-- Panel kullanıcısı Supabase Auth'ta oluşturulur ve staff tablosuna SQL ile eklenir:
--   insert into public.staff (user_id, role, display_name)
--   values ('<auth.users.id>', 'admin', 'Ad Soyad');
-- staff tablosuna istemciden yazma yetkisi YOKTUR (yetki yükseltme engeli).
-- =====================================================================

create table if not exists public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null check (role in ('admin', 'editor')),
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.staff enable row level security;

-- Geçerli kullanıcının rolü (yoksa null). security definer: staff RLS'sine takılmadan okur.
create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role from public.staff s where s.user_id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.staff_role() is not null;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.staff_role() = 'admin', false);
$$;

revoke all on function public.staff_role() from public;
grant execute on function public.staff_role(), public.is_staff(), public.is_admin()
  to anon, authenticated;

-- Kullanıcı kendi kaydını, yönetici tüm kayıtları görebilir. Yazma politikası yok.
create policy "staff_read_self_or_admin"
  on public.staff for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

grant select on public.staff to authenticated;

-- updated_at alanını güncel tutan ortak tetikleyici
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Denetim kaydı (audit log): içerik tablolarındaki her değişiklik veritabanı
-- tetikleyicisiyle yazılır; uygulama tarafından atlanamaz. Kişisel veri sızmaması
-- için yalnızca değişen ALAN ADLARI tutulur, değerler tutulmaz.
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id             bigint generated always as identity primary key,
  occurred_at    timestamptz not null default now(),
  actor_id       uuid,
  actor_role     text,
  action         text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name     text not null,
  record_id      text,
  changed_fields text[]
);

create index if not exists audit_log_occurred_at_idx
  on public.audit_log (occurred_at desc);

alter table public.audit_log enable row level security;

create policy "audit_log_admin_read"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

grant select on public.audit_log to authenticated;

create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  old_data jsonb;
  changed  text[];
begin
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
  else
    row_data := to_jsonb(new);
  end if;

  if tg_op = 'UPDATE' then
    old_data := to_jsonb(old);
    select array_agg(n.key order by n.key)
      into changed
      from jsonb_each(row_data) as n
     where n.value is distinct from old_data -> n.key
       and n.key <> 'updated_at';
    if changed is null then
      return null; -- değişiklik yoksa kayıt düşme
    end if;
  end if;

  insert into public.audit_log (actor_id, actor_role, action, table_name, record_id, changed_fields)
  values (
    auth.uid(),
    public.staff_role(),
    tg_op,
    tg_table_name,
    coalesce(row_data ->> 'id', row_data ->> 'slug', row_data ->> 'user_id'),
    changed
  );
  return null;
end;
$$;
