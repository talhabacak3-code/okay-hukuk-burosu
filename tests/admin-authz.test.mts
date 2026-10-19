// Çalıştırma: npm test — yönetim paneli yetkilendirmesinin statik denetimi.
//
// Kural (savunma katmanları: proxy → layout → sayfa/eylem → RLS):
// 1. "use server" eylem modüllerindeki her dışa açık fonksiyon, doğrudan ya da aynı
//    dosyadaki bir yardımcı üzerinden requireStaffClient(...) çağırır.
// 2. Panel sayfaları yalnızca layout'a güvenmez: her sayfa ya requireStaff çağırır ya da
//    korumalı veri katmanı (src/lib/admin/data.ts) fonksiyonu kullanır.
// 3. Veri katmanının her dışa açık fonksiyonu requireStaffClient ile başlar.
// 4. Yalnızca yöneticiye açık modüller (ayarlar, iletişim, mesajlar, denetim kaydı)
//    "admin" rolünü ister.
// 5. İstemci tarafına gizli anahtar sızmaz.
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const read = (path: string) => readFileSync(join(root, path), "utf8")

function walk(dir: string, match: (file: string) => boolean): string[] {
  const out: string[] = []
  for (const entry of readdirSync(join(root, dir))) {
    const path = join(dir, entry)
    if (statSync(join(root, path)).isDirectory()) out.push(...walk(path, match))
    else if (match(path)) out.push(path)
  }
  return out
}

/** Dosyadaki üst düzey fonksiyonları gövdeleriyle birlikte döndürür. */
function functions(source: string) {
  const re = /^(export )?async function (\w+)/gm
  const starts = [...source.matchAll(re)]
  return starts.map((match, index) => ({
    exported: Boolean(match[1]),
    name: match[2]!,
    body: source.slice(match.index, starts[index + 1]?.index ?? source.length),
  }))
}

let passed = 0
const test = (name: string, fn: () => void) => {
  try {
    fn()
    passed++
    console.log("✓", name)
  } catch (error) {
    console.log("✗", name, "\n  ", (error as Error).message)
    process.exitCode = 1
  }
}

const GUARD = /requireStaffClient\(\s*("admin")?\s*\)/

// ---- 1. Server Actions
const actionFiles = walk("src/lib/admin/actions", (f) => f.endsWith(".ts"))
test("yönetim eylemleri bulundu", () => assert.ok(actionFiles.length >= 7))

for (const file of actionFiles) {
  const source = read(file)
  test(`${relative(root, join(root, file))}: "use server" ve her eylem korumalı`, () => {
    assert.match(source, /^"use server"/)
    const fns = functions(source)
    const guarded = new Set(
      fns.filter((fn) => GUARD.test(fn.body)).map((fn) => fn.name),
    )
    const exported = fns.filter((fn) => fn.exported)
    assert.ok(exported.length > 0)
    for (const fn of exported) {
      const viaHelper = [...guarded].some((helper) =>
        new RegExp(`\\b${helper}\\(`).test(fn.body),
      )
      assert.ok(
        guarded.has(fn.name) || viaHelper,
        `${fn.name} yetki kontrolü yapmıyor`,
      )
    }
  })
}

test("ayar eylemleri yalnızca yönetici rolüne açık", () => {
  assert.match(
    read("src/lib/admin/actions/settings.ts"),
    /requireStaffClient\("admin"\)/,
  )
})

// ---- 3. Veri katmanı
const data = read("src/lib/admin/data.ts")
const dalFns = functions(data).filter((fn) => fn.exported)
test("veri katmanının her fonksiyonu requireStaffClient ile başlar", () => {
  for (const fn of dalFns) assert.match(fn.body, GUARD, `${fn.name} korumasız`)
})
const adminOnly = [
  "getSiteSettingsAdmin",
  "listContactMessages",
  "listAuditLog",
]
test("yönetici verileri (ayarlar, mesajlar, denetim) admin rolü ister", () => {
  for (const name of adminOnly) {
    const fn = dalFns.find((f) => f.name === name)
    assert.ok(fn, `${name} bulunamadı`)
    assert.match(
      fn.body,
      /requireStaffClient\("admin"\)/,
      `${name} admin istemiyor`,
    )
  }
})

// ---- 2. Panel sayfaları
const dalNames = dalFns.map((fn) => fn.name)
const pages = walk("src/app/admin/(panel)", (f) => /page\.tsx$/.test(f))
test("panel sayfaları bulundu", () => assert.ok(pages.length >= 15))
for (const page of pages) {
  test(`${page.replaceAll("\\", "/")}: kendi yetki kontrolü var`, () => {
    const source = read(page)
    const direct = /requireStaff(Client)?\(/.test(source)
    const viaDal = dalNames.some((name) =>
      new RegExp(`\\b${name}\\(`).test(source),
    )
    assert.ok(direct || viaDal, "sayfa yalnızca layout korumasına güveniyor")
  })
}

test("panel layout'u requireStaff çağırır; proxy /admin'i kapsar", () => {
  assert.match(
    read("src/app/admin/(panel)/layout.tsx"),
    /await requireStaff\(\)/,
  )
  const proxy = read("src/proxy.ts")
  assert.match(proxy, /"\/admin"/)
  assert.match(proxy, /"\/admin\/:path\*"/)
  assert.match(proxy, /getClaims\(\)/)
})

// ---- 5. Gizli anahtar sızıntısı
test("gizli anahtar yalnızca server-only modülde ve NEXT_PUBLIC_ önekisiz", () => {
  const files = walk("src", (f) => /\.(ts|tsx)$/.test(f))
  for (const file of files) {
    const source = read(file)
    assert.doesNotMatch(source, /NEXT_PUBLIC_[A-Z_]*SECRET/, file)
    // Yalnızca değişkeni OKUYAN dosyalar (adını metin olarak gösteren yardım ekranı değil).
    const readsSecret = /process\.env\.SUPABASE_SECRET_KEY/.test(source)
    if (readsSecret) {
      assert.match(source, /import "server-only"/, `${file} server-only değil`)
    }
    if (/^"use client"/.test(source)) {
      assert.ok(!readsSecret && !/env\.server/.test(source), file)
    }
  }
})

console.log(`\n${passed} yetki testi geçti`)
