// Çalıştırma: npm test — supabase/migrations/*.sql dosyalarını gerçek bir PostgreSQL'de
// (PGlite: WebAssembly ile Node içinde çalışan Postgres 18) sırasıyla uygular ve RLS,
// yetki, tetikleyici ve hız sınırı fonksiyonlarını rol bazında sınar.
//
// Kapsam dışı (yalnızca gerçek Supabase'te sınanabilir): PostgREST/Auth/Storage
// servisleri, JWT doğrulaması, Storage kova sınırlarının (boyut/MIME) uygulanması.
import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { PGlite } from "@electric-sql/pglite"

const root = fileURLToPath(new URL("../", import.meta.url))
const migrationsDir = `${root}supabase/migrations/`

let passed = 0
const test = async (name: string, fn: () => unknown) => {
  try {
    await fn()
    passed++
    console.log("✓", name)
  } catch (error) {
    console.log("✗", name, "\n  ", (error as Error).message)
    process.exitCode = 1
  }
}

const db = new PGlite()
await db.exec(readFileSync(`${root}tests/db/supabase-stub.sql`, "utf8"))

const migrations = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()

for (const file of migrations) {
  await test(`migration uygulanır: ${file}`, async () => {
    await db.exec(readFileSync(migrationsDir + file, "utf8"))
  })
}

// ---- kimlikler
const ids = {
  admin: "00000000-0000-4000-8000-000000000001",
  editor: "00000000-0000-4000-8000-000000000002",
  outsider: "00000000-0000-4000-8000-000000000003",
}
await db.exec(`
  insert into auth.users (id, email) values
    ('${ids.admin}', 'admin@test.invalid'),
    ('${ids.editor}', 'editor@test.invalid'),
    ('${ids.outsider}', 'yabanci@test.invalid');
  insert into public.staff (user_id, role, display_name) values
    ('${ids.admin}', 'admin', 'Test Yönetici'),
    ('${ids.editor}', 'editor', 'Test Editör');
`)

type Actor = "anon" | "service_role" | keyof typeof ids

/** PostgREST gibi: işlem içinde rolü ve JWT taleplerini ayarlar; sonunda geri alır. */
async function as<T>(
  actor: Actor,
  fn: (
    q: <R = Record<string, unknown>>(
      sql: string,
      params?: unknown[],
    ) => Promise<R[]>,
  ) => Promise<T>,
  { commit = false } = {},
): Promise<T> {
  const role =
    actor === "anon"
      ? "anon"
      : actor === "service_role"
        ? "service_role"
        : "authenticated"
  const claims =
    actor in ids
      ? JSON.stringify({ sub: ids[actor as keyof typeof ids], role })
      : JSON.stringify({ role })
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
      claims,
    ])
    await tx.exec(`set local role ${role}`)
    const q = async <R,>(sql: string, params: unknown[] = []) =>
      (await tx.query<R>(sql, params)).rows
    const result = await fn(q)
    if (!commit) await tx.rollback()
    return result
  })
}

/** Beklenen bir veritabanı hatası (yetki veya RLS) — SQLSTATE koduyla. */
async function rejects(promise: Promise<unknown>, code: string) {
  try {
    await promise
  } catch (error) {
    assert.equal(
      (error as { code?: string }).code,
      code,
      (error as Error).message,
    )
    return
  }
  assert.fail(`hata bekleniyordu (${code})`)
}

const PERMISSION_DENIED = "42501"

// ---- başlangıç verisi
await test("seed: site ayarları, 3 sayfa ve iki avukat; iletişim doğrulanmamış", async () => {
  const [settings] = (
    await db.query<{ contact_verified: boolean; phone: string }>(
      "select contact_verified, phone from public.site_settings",
    )
  ).rows
  assert.equal(settings?.contact_verified, false)
  assert.equal(settings?.phone, "+90 272 217 59 52")
  assert.equal((await db.query("select * from public.pages")).rows.length, 3)
  const attorneys = (
    await db.query<{ slug: string }>(
      "select slug from public.attorneys order by sort_order",
    )
  ).rows
  assert.deepEqual(
    attorneys.map((a) => a.slug),
    ["mustafa-okay", "fatma-okay"],
  )
})

await test("seed: storage 'media' kovası JPEG/PNG/WebP ve 5 MB ile sınırlı", async () => {
  const [bucket] = (
    await db.query<{
      public: boolean
      file_size_limit: number
      allowed_mime_types: string[]
    }>(
      "select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media'",
    )
  ).rows
  assert.equal(bucket?.public, true)
  assert.equal(Number(bucket?.file_size_limit), 5 * 1024 * 1024)
  assert.deepEqual(bucket?.allowed_mime_types, [
    "image/jpeg",
    "image/png",
    "image/webp",
  ])
})

// ---- ziyaretçi (anon)
await test("anon: site ayarlarını ve yayımlanmış avukatları okur", () =>
  as("anon", async (q) => {
    assert.equal((await q("select * from public.site_settings")).length, 1)
    assert.equal((await q("select * from public.attorneys")).length, 2)
  }))

await test("anon: yayımlanmamış avukat, taslak ve ileri tarihli yazı görünmez", async () => {
  await db.exec(`
    insert into public.attorneys (slug, full_name, published) values ('taslak-avukat', 'Taslak Kişi', false);
    insert into public.articles (slug, title, excerpt, body, status, published_at) values
      ('taslak-yazi', 'Taslak yazı başlığı', 'Yirmi karakterden uzun bir özet.', repeat('x', 60), 'draft', null),
      ('ileri-tarihli', 'İleri tarihli yazı', 'Yirmi karakterden uzun bir özet.', repeat('x', 60), 'published', now() + interval '2 days'),
      ('yayimlanmis', 'Yayımlanmış yazı', 'Yirmi karakterden uzun bir özet.', repeat('x', 60), 'published', now() - interval '1 day');
  `)
  await as("anon", async (q) => {
    const slugs = (
      await q<{ slug: string }>("select slug from public.attorneys")
    ).map((r) => r.slug)
    assert.ok(!slugs.includes("taslak-avukat"))
    const articles = (
      await q<{ slug: string }>("select slug from public.articles")
    ).map((r) => r.slug)
    assert.deepEqual(articles, ["yayimlanmis"])
  })
  await as("editor", async (q) => {
    assert.equal(
      (await q("select * from public.articles")).length,
      3,
      "panel taslakları görür",
    )
  })
})

await test("anon: mesajları, denetim kaydını ve personel listesini göremez", () =>
  as("anon", async (q) => {
    assert.equal((await q("select * from public.contact_messages")).length, 0)
    assert.equal((await q("select * from public.audit_log")).length, 0)
    assert.equal((await q("select * from public.staff")).length, 0)
  }))

await test("anon: hiçbir içeriğe yazamaz (RLS)", async () => {
  await as("anon", (q) =>
    rejects(
      q(
        "insert into public.practice_areas (slug, title, summary) values ('x', 'Başlık', 'Yeterince uzun açıklama')",
      ),
      PERMISSION_DENIED,
    ),
  )
  await as("anon", (q) =>
    rejects(
      q(
        "insert into public.contact_messages (full_name, email, message, kvkk_acknowledged_at) values ('Ad', 'a@b.c', repeat('m', 30), now())",
      ),
      PERMISSION_DENIED,
    ),
  )
  await as("anon", async (q) => {
    const rows = await q(
      "update public.site_settings set phone = '000' returning id",
    )
    assert.equal(rows.length, 0)
  })
  await as("anon", (q) =>
    rejects(
      q("insert into public.staff (user_id, role) values ($1, 'admin')", [
        ids.outsider,
      ]),
      PERMISSION_DENIED,
    ),
  )
})

await test("anon ve panel kullanıcısı hız sınırı fonksiyonlarını çağıramaz", async () => {
  const key = "a".repeat(64)
  for (const actor of ["anon", "editor", "admin"] as const) {
    await as(actor, (q) =>
      rejects(
        q("select public.consume_rate_limit($1, 600, 3)", [key]),
        PERMISSION_DENIED,
      ),
    )
    await as(actor, (q) =>
      rejects(
        q("select public.clear_rate_limit($1)", [key]),
        PERMISSION_DENIED,
      ),
    )
    await as(actor, (q) =>
      rejects(q("select * from public.rate_limit_hits"), PERMISSION_DENIED),
    )
  }
})

// ---- panel dışı oturum açmış kullanıcı
await test("personel olmayan oturum: içerik yazamaz, is_staff() false", () =>
  as("outsider", async (q) => {
    const [flags] = await q<{ s: boolean; a: boolean }>(
      "select public.is_staff() s, public.is_admin() a",
    )
    assert.deepEqual(flags, { s: false, a: false })
    await rejects(
      q(
        "insert into public.practice_areas (slug, title, summary) values ('x', 'Başlık', 'Yeterince uzun açıklama')",
      ),
      PERMISSION_DENIED,
    )
  }))

// ---- editör
await test("editör: faaliyet alanı ekler, günceller, siler", () =>
  as("editor", async (q) => {
    const [row] = await q<{ id: string }>(
      "insert into public.practice_areas (slug, title, summary, published) values ('kira-hukuku', 'Kira Hukuku', 'Kira ilişkilerine dair bilgilendirme.', true) returning id",
    )
    assert.ok(row?.id)
    assert.equal(
      (
        await q(
          "update public.practice_areas set title = 'Kira Hukuku (güncel)' where id = $1 returning id",
          [row!.id],
        )
      ).length,
      1,
    )
    assert.equal(
      (
        await q(
          "delete from public.practice_areas where id = $1 returning id",
          [row!.id],
        )
      ).length,
      1,
    )
  }))

await test("editör: avukat, sayfa, yayın ve medya kaydı yazar", () =>
  as("editor", async (q) => {
    await q(
      "insert into public.attorneys (slug, full_name) values ('yeni-avukat', 'Yeni Kişi')",
    )
    assert.equal(
      (
        await q(
          "update public.pages set content = '{\"intro\":\"Metin\"}' where slug = 'about' returning slug",
        )
      ).length,
      1,
    )
    await q(
      "insert into public.articles (slug, title, excerpt, body) values ('yeni-yazi', 'Yeni yazı başlığı', 'Yirmi karakterden uzun bir özet.', repeat('y', 60))",
    )
    const [media] = await q<{ uploaded_by: string }>(
      "insert into public.media (path, mime_type, size_bytes, alt) values ('2026/11111111-1111-4111-8111-111111111111.jpg', 'image/jpeg', 1000, 'Bekleme salonu') returning uploaded_by",
    )
    assert.equal(
      media?.uploaded_by,
      ids.editor,
      "uploaded_by oturum sahibine atanır",
    )
  }))

await test("editör: medya kaydını başkası adına yazamaz", () =>
  as("editor", (q) =>
    rejects(
      q(
        "insert into public.media (path, mime_type, size_bytes, alt, uploaded_by) values ('2026/22222222-2222-4222-8222-222222222222.png', 'image/png', 10, 'Alt metin', $1)",
        [ids.admin],
      ),
      PERMISSION_DENIED,
    ),
  ))

await test("editör: storage 'media' kovasına yazar; başka kovaya yazamaz", async () => {
  await db.exec(
    "insert into storage.buckets (id, name) values ('baska', 'baska') on conflict do nothing",
  )
  await as("editor", async (q) => {
    await q(
      "insert into storage.objects (bucket_id, name) values ('media', '2026/x.jpg')",
    )
    await rejects(
      q(
        "insert into storage.objects (bucket_id, name) values ('baska', 'x.jpg')",
      ),
      PERMISSION_DENIED,
    )
  })
  await as("anon", (q) =>
    rejects(
      q(
        "insert into storage.objects (bucket_id, name) values ('media', 'x.jpg')",
      ),
      PERMISSION_DENIED,
    ),
  )
})

await test("editör: site ayarlarını değiştiremez, mesajları ve denetim kaydını göremez", () =>
  as("editor", async (q) => {
    assert.equal(
      (await q("update public.site_settings set phone = '000' returning id"))
        .length,
      0,
    )
    assert.equal((await q("select * from public.contact_messages")).length, 0)
    assert.equal((await q("select * from public.audit_log")).length, 0)
  }))

await test("editör: yalnızca kendi personel kaydını görür, rolünü yükseltemez", () =>
  as("editor", async (q) => {
    const rows = await q<{ user_id: string }>(
      "select user_id from public.staff",
    )
    assert.deepEqual(
      rows.map((r) => r.user_id),
      [ids.editor],
    )
    assert.equal(
      (
        await q(
          "update public.staff set role = 'admin' where user_id = $1 returning user_id",
          [ids.editor],
        )
      ).length,
      0,
    )
    await rejects(
      q("insert into public.staff (user_id, role) values ($1, 'admin')", [
        ids.outsider,
      ]),
      PERMISSION_DENIED,
    )
  }))

// ---- yönetici
await test("yönetici: site ayarlarını günceller, mesajları okur/işaretler/siler", async () => {
  await as(
    "service_role",
    (q) =>
      q(
        "insert into public.contact_messages (full_name, email, message, kvkk_acknowledged_at) values ('Deneme Kişi', 'deneme@example.com', repeat('m', 30), now())",
      ),
    { commit: true },
  )
  await as("admin", async (q) => {
    assert.equal(
      (
        await q(
          "update public.site_settings set working_hours = 'Hafta içi' returning id",
        )
      ).length,
      1,
    )
    const messages = await q<{ id: string }>(
      "select id from public.contact_messages",
    )
    assert.equal(messages.length, 1)
    assert.equal(
      (
        await q(
          "update public.contact_messages set status = 'read' where id = $1 returning id",
          [messages[0]!.id],
        )
      ).length,
      1,
    )
    assert.equal(
      (
        await q(
          "delete from public.contact_messages where id = $1 returning id",
          [messages[0]!.id],
        )
      ).length,
      1,
    )
  })
})

await test("denetim kaydı: aktör, rol ve yalnızca değişen ALAN ADLARI (değer yok)", async () => {
  await as(
    "editor",
    async (q) => {
      await q(
        "update public.attorneys set summary = 'Gizli olabilecek bir değer' where slug = 'mustafa-okay'",
      )
    },
    { commit: true },
  )
  await as("admin", async (q) => {
    const [entry] = await q<{
      actor_id: string
      actor_role: string
      action: string
      table_name: string
      changed_fields: string[]
    }>(
      "select actor_id, actor_role, action, table_name, changed_fields from public.audit_log where table_name = 'attorneys' and action = 'UPDATE' order by id desc limit 1",
    )
    assert.equal(entry?.actor_id, ids.editor)
    assert.equal(entry?.actor_role, "editor")
    assert.deepEqual(entry?.changed_fields, ["summary"])
    const all = JSON.stringify(await q("select * from public.audit_log"))
    assert.ok(
      !all.includes("Gizli olabilecek"),
      "değerler denetim kaydına yazılmaz",
    )
  })
})

await test("denetim kaydı: mesaj silme iz bırakır; kimse denetim kaydını silemez", async () => {
  await as(
    "service_role",
    (q) =>
      q(
        "insert into public.contact_messages (full_name, email, message, kvkk_acknowledged_at) values ('Silinecek Kişi', 'sil@example.com', repeat('m', 30), now())",
      ),
    { commit: true },
  )
  await as("admin", (q) => q("delete from public.contact_messages"), {
    commit: true,
  })
  await as("admin", async (q) => {
    const rows = await q<{ action: string }>(
      "select action from public.audit_log where table_name = 'contact_messages'",
    )
    assert.ok(rows.some((r) => r.action === "DELETE"))
    assert.ok(
      !JSON.stringify(rows).includes("Silinecek"),
      "kişisel veri yazılmaz",
    )
    assert.equal(
      (await q("delete from public.audit_log returning id")).length,
      0,
    )
  })
})

// ---- veri bütünlüğü
await test("kısıtlar: geçersiz slug, teyitsiz arabulucu, alt metinsiz kapak reddedilir", async () => {
  await rejects(
    db.query(
      "insert into public.practice_areas (slug, title, summary) values ('Kötü Slug', 'Başlık', 'Yeterince uzun açıklama')",
    ),
    "23514",
  )
  await rejects(
    db.query(
      "insert into public.attorneys (slug, full_name, mediator_verified) values ('teyitsiz', 'Ad Soyad', true)",
    ),
    "23514",
  )
  await rejects(
    db.query(
      "insert into public.articles (slug, title, excerpt, body, cover_path) values ('kapak', 'Kapaklı yazı', 'Yirmi karakterden uzun bir özet.', repeat('z', 60), '2026/a.jpg')",
    ),
    "23514",
  )
  await rejects(
    db.query(
      "insert into public.articles (slug, title, excerpt, body, status) values ('tarihsiz', 'Tarihsiz yazı', 'Yirmi karakterden uzun bir özet.', repeat('z', 60), 'published')",
    ),
    "23514",
  )
  await rejects(
    db.query(
      "insert into public.media (path, mime_type, size_bytes, alt) values ('2026/a.svg', 'image/svg+xml', 10, 'Alt metin')",
    ),
    "23514",
  )
  await rejects(
    db.query("update public.site_settings set map_url = 'javascript:alert(1)'"),
    "23514",
  )
})

// ---- hız sınırı (service_role)
await test("consume_rate_limit: 3 hak, sonra engel ve bekleme süresi; okuma hak tüketmez", () =>
  as("service_role", async (q) => {
    const key = "b".repeat(64)
    const call = async (consume = true) =>
      (
        await q<{
          r: { allowed: boolean; remaining: number; retry_after_ms: number }
        }>("select public.consume_rate_limit($1, 600, 3, $2) r", [key, consume])
      )[0]!.r
    assert.equal((await call(false)).remaining, 3)
    assert.equal((await call()).remaining, 2)
    assert.equal((await call()).remaining, 1)
    assert.equal((await call()).remaining, 0)
    const blocked = await call()
    assert.equal(blocked.allowed, false)
    assert.ok(
      blocked.retry_after_ms > 590_000 && blocked.retry_after_ms <= 600_000,
    )
    assert.equal((await call(false)).allowed, false)
    await q("select public.clear_rate_limit($1)", [key])
    assert.equal((await call(false)).remaining, 3)
  }))

await test("consume_rate_limit: ham IP/e-posta anahtar olarak kabul edilmez", async () => {
  // Her hata işlemi iptal ettiği için kontroller ayrı işlemlerde.
  await as("service_role", (q) =>
    rejects(
      q("select public.consume_rate_limit('192.168.1.1', 600, 3)"),
      "22023",
    ),
  )
  await as("service_role", (q) =>
    rejects(
      q("select public.consume_rate_limit($1, 0, 3)", ["c".repeat(64)]),
      "22023",
    ),
  )
})

await test("consume_rate_limit: pencere dışındaki eski kayıtlar sayılmaz ve silinir", () =>
  as("service_role", async (q) => {
    const key = "d".repeat(64)
    await q(
      "insert into public.rate_limit_hits (key, hit_at) values ($1, now() - interval '20 minutes'), ($1, now() - interval '2 days')",
      [key],
    )
    const [{ r }] = (await q<{ r: { remaining: number } }>(
      "select public.consume_rate_limit($1, 600, 3) r",
      [key],
    )) as [{ r: { remaining: number } }]
    assert.equal(r.remaining, 2)
    const [{ n }] = (await q<{ n: number }>(
      "select count(*)::int n from public.rate_limit_hits where key = $1",
      [key],
    )) as [{ n: number }]
    assert.equal(n, 1)
  }))

await db.close()
console.log(`\n${passed} veritabanı testi geçti`)
