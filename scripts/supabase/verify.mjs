/**
 * Canlı Supabase projesinin uygulamayla uyumunu denetler (migration'lar uygulandıktan sonra).
 *
 * Kullanım: npm run db:verify   (.env.local'deki değişkenleri okur)
 *
 * Yalnızca uygulamanın kendi anahtarlarını kullanır:
 *   - publishable (anon) anahtar → ziyaretçinin görebildikleri ve RLS engelleri
 *   - secret (service_role) anahtar → hız sınırı fonksiyonu ve form kaydı yolu
 * Kalıcı iz bırakmaz: test amaçlı yazılan satırlar aynı çalıştırmada silinir.
 * Panel kullanıcısıyla giriş ve CRUD testleri ayrıdır: npm run test:e2e (E2E_ADMIN_*).
 */
import { createHash, randomUUID } from "node:crypto"

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!url || !publishableKey || !secretKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ve SUPABASE_SECRET_KEY .env.local'de tanımlı olmalı.",
  )
  process.exit(1)
}

const options = { auth: { persistSession: false, autoRefreshToken: false } }
const anon = createClient(url, publishableKey, options)
const service = createClient(url, secretKey, options)

let passed = 0
let failed = 0
async function check(name, fn) {
  try {
    await fn()
    passed++
    console.log("✓", name)
  } catch (error) {
    failed++
    console.log(
      "✗",
      name,
      "\n   ",
      error instanceof Error ? error.message : error,
    )
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// ---- şema ve başlangıç verisi
const tables = [
  "staff",
  "audit_log",
  "attorneys",
  "contact_messages",
  "site_settings",
  "pages",
  "practice_areas",
  "articles",
  "media",
  "rate_limit_hits",
]
await check("tüm tablolar mevcut (service_role)", async () => {
  for (const table of tables) {
    const { error } = await service
      .from(table)
      .select("*", { head: true, count: "exact" })
    assert(
      !error,
      `${table}: ${error?.message} (${error?.code}) — migration uygulanmamış olabilir`,
    )
  }
})

await check("başlangıç verisi: site ayarları, 3 sayfa, 2 avukat", async () => {
  const { data: settings, error } = await service
    .from("site_settings")
    .select("contact_verified")
  assert(
    !error && settings?.length === 1,
    `site_settings satırı yok (${error?.message ?? 0})`,
  )
  const { count: pages } = await service
    .from("pages")
    .select("*", { head: true, count: "exact" })
  assert(pages === 3, `pages: ${pages}`)
  const { count: attorneys } = await service
    .from("attorneys")
    .select("*", { head: true, count: "exact" })
  assert((attorneys ?? 0) >= 2, `attorneys: ${attorneys}`)
})

await check(
  "panel kullanıcısı tanımlı (staff tablosunda en az bir admin)",
  async () => {
    const { data, error } = await service.from("staff").select("role")
    assert(!error, error?.message)
    assert(
      data.some((row) => row.role === "admin"),
      "staff tablosunda admin yok — README → 'Yönetim paneli kurulumu' 4. adım",
    )
  },
)

// ---- ziyaretçi (anon) — RLS
await check(
  "ziyaretçi: site ayarlarını ve yayımlanmış avukatları okur",
  async () => {
    const { data: settings, error } = await anon
      .from("site_settings")
      .select("phone")
    assert(
      !error && settings?.length === 1,
      error?.message ?? "site ayarları okunamadı",
    )
    const { data: attorneys } = await anon
      .from("attorneys")
      .select("slug, published")
    assert(
      attorneys?.length >= 1 && attorneys.every((a) => a.published),
      "yayımlanmamış kayıt görünüyor",
    )
  },
)

await check(
  "ziyaretçi: mesajları, denetim kaydını, personeli ve sayaçları göremez",
  async () => {
    for (const table of ["contact_messages", "audit_log", "staff"]) {
      const { data, error } = await anon.from(table).select("*").limit(1)
      assert(!error ? data.length === 0 : true, `${table} ziyaretçiye açık`)
    }
    const { data, error } = await anon
      .from("rate_limit_hits")
      .select("*")
      .limit(1)
    assert(error || data.length === 0, "rate_limit_hits ziyaretçiye açık")
  },
)

await check(
  "ziyaretçi: içerik yazamaz, mesaj ekleyemez, ayarları değiştiremez",
  async () => {
    const insert = await anon.from("practice_areas").insert({
      slug: "rls-deneme",
      title: "RLS deneme",
      summary: "Yazılmaması gereken satır.",
    })
    assert(insert.error, "faaliyet alanı eklenebildi!")
    const message = await anon.from("contact_messages").insert({
      full_name: "RLS Deneme",
      email: "rls@example.com",
      message: "Bu satırın yazılmaması gerekir; ziyaretçi doğrudan ekleyemez.",
      kvkk_acknowledged_at: new Date().toISOString(),
    })
    assert(message.error, "ziyaretçi doğrudan mesaj ekleyebildi!")
    const update = await anon
      .from("site_settings")
      .update({ phone: "000" })
      .eq("id", true)
      .select("id")
    assert(
      update.error || update.data.length === 0,
      "ziyaretçi site ayarlarını değiştirebildi!",
    )
  },
)

await check("ziyaretçi: hız sınırı fonksiyonlarını çağıramaz", async () => {
  const key = createHash("sha256")
    .update("dogrulama-" + randomUUID())
    .digest("hex")
  const { error } = await anon.rpc("consume_rate_limit", {
    p_key: key,
    p_window_seconds: 60,
    p_max: 3,
  })
  assert(error, "anon consume_rate_limit çağırabildi!")
})

// ---- sunucu yolu (service_role)
await check("hız sınırı: 3 hak, sonra engel; temizleme sıfırlar", async () => {
  const key = createHash("sha256")
    .update("dogrulama-" + randomUUID())
    .digest("hex")
  const call = async () => {
    const { data, error } = await service.rpc("consume_rate_limit", {
      p_key: key,
      p_window_seconds: 60,
      p_max: 3,
    })
    assert(!error, `${error?.message} (${error?.code})`)
    return data
  }
  for (const remaining of [2, 1, 0])
    assert((await call()).remaining === remaining, "sayaç hatalı")
  const blocked = await call()
  assert(
    blocked.allowed === false && blocked.retry_after_ms > 0,
    "engellenmedi",
  )
  const { error } = await service.rpc("clear_rate_limit", { p_key: key })
  assert(!error, error?.message)
})

await check(
  "iletişim formu kayıt yolu: service_role ekler, kayıt silinir",
  async () => {
    const { data, error } = await service
      .from("contact_messages")
      .insert({
        full_name: "Doğrulama Betiği",
        email: "dogrulama@example.com",
        message:
          "db:verify tarafından eklendi ve hemen silinir; yanıt gerekmez.",
        kvkk_acknowledged_at: new Date().toISOString(),
      })
      .select("id")
      .single()
    assert(!error, `${error?.message} (${error?.code})`)
    const removed = await service
      .from("contact_messages")
      .delete()
      .eq("id", data.id)
    assert(!removed.error, removed.error?.message)
  },
)

await check(
  "storage: 'media' kovası herkese açık, 5 MB, JPEG/PNG/WebP",
  async () => {
    const { data, error } = await service.storage.getBucket("media")
    assert(!error, error?.message)
    assert(data.public === true, "kova herkese açık değil")
    assert(
      Number(data.file_size_limit) === 5 * 1024 * 1024,
      `boyut sınırı: ${data.file_size_limit}`,
    )
    const types = [...(data.allowed_mime_types ?? [])].sort().join(",")
    assert(types === "image/jpeg,image/png,image/webp", `türler: ${types}`)
  },
)

await check("storage: ziyaretçi kovaya dosya yükleyemez", async () => {
  const { error } = await anon.storage
    .from("media")
    .upload(
      `dogrulama/${randomUUID()}.png`,
      new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
    )
  assert(error, "ziyaretçi dosya yükleyebildi!")
})

console.log(`\n${passed} denetim geçti, ${failed} başarısız`)
if (failed) process.exitCode = 1
