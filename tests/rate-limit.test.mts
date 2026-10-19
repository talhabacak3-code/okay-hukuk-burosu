// Çalıştırma: npm test — hız sınırlarının bellek içi geri dönüşü ve paylaşılan sayaç
// (Supabase RPC) istemci tarafı. Gerçek veritabanı GEREKMEZ: paylaşılan sayaç yerel bir
// sahte PostgREST sunucusuyla taklit edilir. Migration'ın SQL'i burada sınanmaz.
import assert from "node:assert/strict"
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http"
import type { AddressInfo } from "node:net"

const root = new URL("../", import.meta.url).href
const contact = await import(root + "src/lib/contact/rate-limit.ts")
const login = await import(root + "src/lib/admin/login-rate-limit.ts")

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

const MIN = 60_000

function setSupabaseEnv(url: string | undefined) {
  if (url === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SECRET_KEY
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test"
  }
}

/** Günlükleri yakalar; geri dönüş uyarısı kişisel veri içermemeli. */
async function captureErrors(fn: () => Promise<void>) {
  const original = console.error
  const lines: string[] = []
  console.error = (...args: unknown[]) => lines.push(args.join(" "))
  try {
    await fn()
  } finally {
    console.error = original
  }
  return lines
}

type Call = { path: string; body: Record<string, unknown>; apikey: string }

async function fakePostgrest(
  respond: (call: Call, res: ServerResponse) => void,
) {
  const calls: Call[] = []
  const server = createServer((req: IncomingMessage, res) => {
    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", () => {
      const call = {
        path: req.url ?? "",
        body: raw ? JSON.parse(raw) : {},
        apikey: String(req.headers.apikey ?? ""),
      }
      calls.push(call)
      respond(call, res)
    })
  })
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok))
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${port}`,
    calls,
    close: () => new Promise<void>((ok) => server.close(() => ok())),
  }
}

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "content-type": "application/json" })
  res.end(JSON.stringify(body))
}

// ---- Supabase yapılandırılmamış → bellek içi
setSupabaseEnv(undefined)

await test("anahtarlar ham IP/e-posta değil, 64 hex SHA-256 özeti", () => {
  const c = contact.clientKey("203.0.113.7")
  const l = login.loginKey("203.0.113.7", "Kisi@Ornek.com")
  assert.match(c, /^[0-9a-f]{64}$/)
  assert.match(l, /^[0-9a-f]{64}$/)
  assert.ok(!c.includes("203") && !l.includes("ornek"))
  assert.equal(l, login.loginKey("203.0.113.7", "kisi@ornek.com"))
  assert.notEqual(c, login.loginKey("203.0.113.7", ""))
})

await test("iletişim (bellek içi): 10 dakikada 3 gönderim, 4. reddedilir", async () => {
  const key = contact.clientKey("mem-contact-1")
  const t0 = 1_000_000
  for (let i = 0; i < 3; i++)
    assert.deepEqual(await contact.consumeRateLimit(key, t0 + i * MIN), {
      allowed: true,
    })
  const blocked = await contact.consumeRateLimit(key, t0 + 3 * MIN)
  assert.equal(blocked.allowed, false)
  // En eski gönderim t0'da: pencere t0 + 10 dk'da açılır.
  assert.equal(blocked.allowed === false && blocked.retryAfterMs, 7 * MIN)
  // Reddedilen deneme sayılmaz; en eski kayıt düşünce yeniden izin verilir.
  assert.equal(
    (await contact.consumeRateLimit(key, t0 + 10 * MIN)).allowed,
    true,
  )
  // Anahtarlar birbirinden bağımsız.
  assert.equal(
    (await contact.consumeRateLimit(contact.clientKey("mem-contact-2"), t0))
      .allowed,
    true,
  )
})

await test("giriş (bellek içi): 5 başarısız denemeden sonra engellenir, 15 dk sonra açılır", async () => {
  const key = login.loginKey("mem-login-1", "a@ornek.com")
  const t0 = 2_000_000
  for (let i = 0; i < 5; i++) {
    assert.equal(await login.isLoginBlocked(key, t0 + i), false)
    await login.recordLoginFailure(key, t0 + i)
  }
  assert.equal(await login.isLoginBlocked(key, t0 + 10), true)
  // Durum kontrolü deneme sayılmaz: tekrar tekrar sorgulamak engeli uzatmaz.
  assert.equal(await login.isLoginBlocked(key, t0 + 15 * MIN - 1), true)
  assert.equal(await login.isLoginBlocked(key, t0 + 15 * MIN), false)
})

await test("giriş (bellek içi): isLoginBlocked deneme tüketmez", async () => {
  const key = login.loginKey("mem-login-2", "b@ornek.com")
  for (let i = 0; i < 20; i++) await login.isLoginBlocked(key, 3_000_000)
  await login.recordLoginFailure(key, 3_000_000)
  assert.equal(await login.isLoginBlocked(key, 3_000_001), false)
})

await test("giriş (bellek içi): başarılı giriş sayacı sıfırlar", async () => {
  const key = login.loginKey("mem-login-3", "c@ornek.com")
  for (let i = 0; i < 5; i++) await login.recordLoginFailure(key, 4_000_000)
  assert.equal(await login.isLoginBlocked(key, 4_000_001), true)
  await login.clearLoginFailures(key)
  assert.equal(await login.isLoginBlocked(key, 4_000_002), false)
})

// ---- Supabase yapılandırılmış → paylaşılan sayaç (RPC)
await test("paylaşılan sayaç: RPC sunucu anahtarıyla, özetle ve doğru pencereyle çağrılır", async () => {
  const api = await fakePostgrest((call, res) =>
    call.path.endsWith("/rpc/consume_rate_limit")
      ? json(res, 200, {
          allowed: false,
          remaining: 0,
          retry_after_ms: 123_000,
        })
      : json(res, 404, {}),
  )
  setSupabaseEnv(api.url)
  try {
    const key = contact.clientKey("shared-1")
    const result = await contact.consumeRateLimit(key, Date.now())
    assert.deepEqual(result, { allowed: false, retryAfterMs: 123_000 })
    assert.equal(api.calls.length, 1)
    const [call] = api.calls
    assert.equal(call!.path, "/rest/v1/rpc/consume_rate_limit")
    assert.equal(call!.apikey, "sb_secret_test")
    assert.deepEqual(call!.body, {
      p_key: key,
      p_window_seconds: 600,
      p_max: 3,
      p_consume: true,
    })
  } finally {
    setSupabaseEnv(undefined)
    await api.close()
  }
})

await test("paylaşılan sayaç: giriş kontrolü tüketmez, sıfırlama clear_rate_limit çağırır", async () => {
  const api = await fakePostgrest((call, res) =>
    call.path.endsWith("/rpc/clear_rate_limit")
      ? (res.writeHead(204), res.end())
      : json(res, 200, { allowed: true, remaining: 4, retry_after_ms: 0 }),
  )
  setSupabaseEnv(api.url)
  try {
    const key = login.loginKey("shared-2", "d@ornek.com")
    assert.equal(await login.isLoginBlocked(key, Date.now()), false)
    await login.recordLoginFailure(key, Date.now())
    await login.clearLoginFailures(key)
    assert.deepEqual(
      api.calls.map((c) => [c.path, c.body.p_consume, c.body.p_window_seconds]),
      [
        ["/rest/v1/rpc/consume_rate_limit", false, 900],
        ["/rest/v1/rpc/consume_rate_limit", true, 900],
        ["/rest/v1/rpc/clear_rate_limit", undefined, undefined],
      ],
    )
    assert.deepEqual(api.calls[2]!.body, { p_key: key })
  } finally {
    setSupabaseEnv(undefined)
    await api.close()
  }
})

await test("paylaşılan sayaç izin verdiğinde bellek içi sayaç devreye girmez", async () => {
  const api = await fakePostgrest((_call, res) =>
    json(res, 200, { allowed: true, remaining: 1, retry_after_ms: 0 }),
  )
  setSupabaseEnv(api.url)
  try {
    const key = contact.clientKey("shared-3")
    for (let i = 0; i < 6; i++)
      assert.equal(
        (await contact.consumeRateLimit(key, 5_000_000)).allowed,
        true,
      )
  } finally {
    setSupabaseEnv(undefined)
    await api.close()
  }
})

await test("geri dönüş: fonksiyon yok (migration uygulanmamış) → bellek içi sınır, günlükte yalnızca kod", async () => {
  const api = await fakePostgrest((_call, res) =>
    json(res, 404, {
      code: "PGRST202",
      message: "Could not find the function public.consume_rate_limit",
    }),
  )
  setSupabaseEnv(api.url)
  const key = contact.clientKey("198.51.100.23")
  try {
    const results: boolean[] = []
    const lines = await captureErrors(async () => {
      for (let i = 0; i < 4; i++)
        results.push(
          (await contact.consumeRateLimit(key, 6_000_000 + i)).allowed,
        )
    })
    assert.deepEqual(results, [true, true, true, false])
    assert.equal(api.calls.length, 4)
    assert.ok(lines.length > 0 && lines.every((l) => l.includes("PGRST202")))
    assert.ok(lines.every((l) => !l.includes(key) && !l.includes("198.51")))
  } finally {
    setSupabaseEnv(undefined)
    await api.close()
  }
})

await test("geri dönüş: beklenmeyen yanıt biçimi → bellek içi sınır", async () => {
  const api = await fakePostgrest((_call, res) => json(res, 200, { ok: 1 }))
  setSupabaseEnv(api.url)
  try {
    const key = login.loginKey("shared-4", "e@ornek.com")
    await captureErrors(async () => {
      for (let i = 0; i < 5; i++) await login.recordLoginFailure(key, 7_000_000)
      assert.equal(await login.isLoginBlocked(key, 7_000_001), true)
    })
  } finally {
    setSupabaseEnv(undefined)
    await api.close()
  }
})

await test("geri dönüş: sunucuya ulaşılamıyor → bellek içi sınır, hata fırlatılmaz", async () => {
  const api = await fakePostgrest((_call, res) => json(res, 200, {}))
  const deadUrl = api.url
  await api.close() // port artık kapalı → bağlantı reddedilir
  setSupabaseEnv(deadUrl)
  try {
    const key = contact.clientKey("shared-5")
    const results: boolean[] = []
    const lines = await captureErrors(async () => {
      for (let i = 0; i < 4; i++)
        results.push((await contact.consumeRateLimit(key, 8_000_000)).allowed)
    })
    assert.deepEqual(results, [true, true, true, false])
    assert.ok(lines.length > 0)
  } finally {
    setSupabaseEnv(undefined)
  }
})

console.log(`\n${passed} hız sınırı testi geçti`)
