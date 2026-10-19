// Çalıştırma: npm test (veritabanı gerektirmeyen güvenlik/doğrulama mantığı)
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const root = new URL("../", import.meta.url).href
const schemas = await import(root + "src/lib/admin/schemas.ts")
const media = await import(root + "src/lib/admin/media.ts")
const require = createRequire(root + "package.json")
const sharp = require("sharp")

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

// ---- slugify
await test("slugify Türkçe karakterleri dönüştürür", () => {
  assert.equal(
    schemas.slugify("İş Hukuku & Kıdem Tazminatı"),
    "is-hukuku-kidem-tazminati",
  )
  assert.equal(schemas.slugify("  Çağrı ŞÜKRÜ Öz  "), "cagri-sukru-oz")
})

// ---- faaliyet alanı
await test("faaliyet alanı: boş slug başlıktan üretilir", () => {
  const r = schemas.practiceAreaSchema.parse({
    title: "Kira Hukuku",
    slug: "",
    summary: "Kira ilişkilerine dair bilgilendirme.",
    sortOrder: "2",
    published: true,
  })
  assert.equal(r.slug, "kira-hukuku")
  assert.equal(r.sort_order, 2)
})
await test("faaliyet alanı: geçersiz slug reddedilir", () => {
  const r = schemas.practiceAreaSchema.safeParse({
    title: "Kira",
    slug: "Kira Hukuku!",
    summary: "Yeterince uzun açıklama.",
    sortOrder: "0",
    published: false,
  })
  assert.equal(r.success, false)
})

// ---- avukat
const attorneyBase = {
  fullName: "Av. Ad Soyad",
  slug: "",
  title: "",
  summary: "",
  barAssociation: "",
  barRegistrationNo: "",
  photoPath: "",
  education: "",
  experience: "",
  practiceAreas: "",
  mediatorRegistryNo: "",
  mediatorSpecializations: "",
  mediatorVerified: false,
  sortOrder: "0",
  published: false,
}
await test("avukat: slug unvan önekleri atılarak üretilir, boşlar null olur", () => {
  const r = schemas.attorneyFormSchema.parse(attorneyBase)
  assert.equal(r.slug, "ad-soyad")
  assert.equal(r.bar_association, null)
})
await test("avukat: eğitim/deneyim satırları ayrıştırılır", () => {
  const r = schemas.attorneyFormSchema.parse({
    ...attorneyBase,
    education:
      "2010 | Hukuk Fakültesi | Örnek Üniversitesi\nYüksek Lisans | Örnek Üniversitesi",
    experience:
      "2018 – günümüz | Avukat\n2016 – 2018 | Stajyer | Büro | Açıklama",
  })
  assert.deepEqual(r.education[0], {
    year: "2010",
    degree: "Hukuk Fakültesi",
    institution: "Örnek Üniversitesi",
  })
  assert.deepEqual(r.education[1], {
    year: null,
    degree: "Yüksek Lisans",
    institution: "Örnek Üniversitesi",
  })
  assert.deepEqual(r.experience[0], {
    period: "2018 – günümüz",
    role: "Avukat",
    organization: null,
    description: null,
  })
})
await test("avukat: hatalı satır biçimi reddedilir", () => {
  const r = schemas.attorneyFormSchema.safeParse({
    ...attorneyBase,
    education: "yalnızca tek parça",
  })
  assert.equal(r.success, false)
})
await test("avukat: sicil numarası olmadan 'teyitli' işaretlenemez", () => {
  const r = schemas.attorneyFormSchema.safeParse({
    ...attorneyBase,
    mediatorVerified: true,
  })
  assert.equal(r.success, false)
})
await test("avukat: medya yolu dışarıdan keyfi yol olamaz", () => {
  const r = schemas.attorneyFormSchema.safeParse({
    ...attorneyBase,
    photoPath: "../../etc/passwd",
  })
  assert.equal(r.success, false)
})

// ---- iletişim
await test("iletişim: harita bağlantısı yalnızca Google/Yandex https", () => {
  const ok = schemas.contactSettingsSchema.safeParse({
    address: "",
    phone: "",
    mobile: "",
    email: "",
    kep: "",
    workingHours: "",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=x",
    contactVerified: false,
  })
  const bad = schemas.contactSettingsSchema.safeParse({
    address: "",
    phone: "",
    mobile: "",
    email: "",
    kep: "",
    workingHours: "",
    mapUrl: "javascript:alert(1)",
    contactVerified: false,
  })
  assert.equal(ok.success, true)
  assert.equal(bad.success, false)
})

// ---- yayın
await test("yayın: yayımlanan ve tarihsiz yazıya kayıt anı atanır; taslağa null", () => {
  const base = {
    title: "Örnek başlık",
    slug: "",
    excerpt: "Yirmi karakterden uzun özet.",
    body: "x".repeat(60),
    category: "",
    authorAttorneyId: "",
    coverPath: "",
    publishedDate: "",
  }
  assert.ok(
    schemas.articleFormSchema.parse({ ...base, status: "published" })
      .published_at,
  )
  assert.equal(
    schemas.articleFormSchema.parse({ ...base, status: "draft" }).published_at,
    null,
  )
})

// ---- medya
const png = await sharp({
  create: { width: 40, height: 30, channels: 3, background: "#101c30" },
})
  .png()
  .toBuffer()
const jpegWithExif = await sharp({
  create: { width: 40, height: 30, channels: 3, background: "#b79b65" },
})
  .jpeg()
  .withExif({ IFD0: { Copyright: "TEST-EXIF" }, IFD3: { GPSLatitudeRef: "N" } })
  .toBuffer()
const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
)
const asFile = (buf: Buffer, name: string, type: string) =>
  new File([new Uint8Array(buf)], name, { type })

await test("medya: imza baytları tanınır", () => {
  assert.equal(media.sniffImageType(png), "image/png")
  assert.equal(media.sniffImageType(jpegWithExif), "image/jpeg")
  assert.equal(media.sniffImageType(svg), null)
})
await test("medya: SVG reddedilir", async () => {
  const r = await media.prepareImageUpload(
    asFile(svg, "x.svg", "image/svg+xml"),
    new Date(),
  )
  assert.equal(r.ok, false)
})
await test("medya: uzantısı/türü sahte dosya reddedilir (PNG içerik, JPEG beyanı)", async () => {
  const r = await media.prepareImageUpload(
    asFile(png, "x.jpg", "image/jpeg"),
    new Date(),
  )
  assert.equal(r.ok, false)
})
await test("medya: 5 MB üstü reddedilir", async () => {
  const big = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)])
  const r = await media.prepareImageUpload(
    asFile(big, "x.png", "image/png"),
    new Date(),
  )
  assert.equal(r.ok, false)
})
await test("medya: EXIF temizlenir, yol rastgele UUID", async () => {
  const before = await sharp(jpegWithExif).metadata()
  assert.ok(before.exif, "test görselinde EXIF olmalı")
  const r = await media.prepareImageUpload(
    asFile(jpegWithExif, "../../kötü adı.jpg", "image/jpeg"),
    new Date("2026-10-18"),
  )
  assert.equal(r.ok, true)
  if (!r.ok) return
  const after = await sharp(r.upload.body).metadata()
  assert.equal(after.exif, undefined)
  assert.match(r.upload.path, /^2026\/[0-9a-f-]{36}\.jpg$/)
})

console.log(`\n${passed} test geçti`)
