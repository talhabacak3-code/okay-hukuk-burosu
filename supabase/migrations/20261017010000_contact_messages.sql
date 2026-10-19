-- =====================================================================
-- İletişim formu mesajları — TASLAK MIGRATION (henüz hiçbir veritabanına uygulanmadı)
-- Önkoşul: 20261016000000_core_auth.sql
--
-- Kayıt yalnızca sunucu tarafındaki Server Action üzerinden, sunucu anahtarıyla
-- yapılır (src/lib/contact/delivery.ts). Ziyaretçilere (anon) hiçbir yetki verilmez.
-- Veri minimizasyonu: IP adresi veya tarayıcı bilgisi saklanmaz.
-- Saklama süresi büronun saklama ve imha politikasına göre belirlenecek; süre dolan
-- kayıtlar periyodik olarak silinmelidir (KVKK m. 7).
-- =====================================================================

create table if not exists public.contact_messages (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null check (char_length(full_name) between 2 and 100),
  email                text not null check (char_length(email) <= 254),
  phone                text check (phone is null or char_length(phone) <= 20),
  message              text not null check (char_length(message) between 20 and 2000),
  kvkk_acknowledged_at timestamptz not null,
  status               text not null default 'new'
                         check (status in ('new', 'read', 'archived')),
  created_at           timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

drop trigger if exists contact_messages_audit on public.contact_messages;
create trigger contact_messages_audit
  after update or delete on public.contact_messages
  for each row execute function public.audit_trigger();

alter table public.contact_messages enable row level security;

-- Yalnızca yöneticiler okuyabilir, durum güncelleyebilir ve silebilir.
create policy "contact_messages_admin_select"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages_admin_update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

grant select, update, delete on public.contact_messages to authenticated;
