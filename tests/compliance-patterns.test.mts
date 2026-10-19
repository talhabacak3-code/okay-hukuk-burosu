// Çalıştırma: npm test — uyum taraması desenlerinin örnek metinlerle doğrulanması.
// Desenler: scripts/qa/compliance-scan.mjs (çalışan sitede `npm run qa:compliance`).
import assert from "node:assert/strict"

const { findClaims } = await import(
  new URL("../scripts/qa/compliance-scan.mjs", import.meta.url).href
)

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

const violations = [
  "Afyon'un en iyi avukatları",
  "Boşanma davalarında uzman avukat",
  "Alanın uzmanları",
  "%95 başarı oranı",
  "500+ müvekkil",
  "250 davada temsil",
  "Davanızı kazandırıyoruz",
  "Kazandığımız davalar",
  "İlk görüşme ücretsiz",
  "Hemen arayın!",
  "Müvekkil yorumları",
  "Referanslarımız",
  "Ödüllü hukuk bürosu",
  "Sertifikalı arabulucu",
  "Sonuç garantisi",
  "Bölgenin lider bürosu",
  "Arabuluculukta lehinize sonuç",
]

const allowed = [
  "Arabulucu uzmanlık alanları",
  "Sicil kaydındaki uzmanlık alanları",
  "03 Dava şartı arabuluculuk",
  "6325 s. Kanun, m. 4",
  "Bu internet sitesindeki içerikler yalnızca genel bilgilendirme amacı taşır.",
  "Afyonkarahisar'da hukuki danışmanlık ve arabuluculuk.",
  "İletişim",
  "Büroyu tanıyın",
]

for (const text of violations) {
  test(`yakalanır: ${text}`, () => assert.ok(findClaims(text).length > 0))
}
for (const text of allowed) {
  test(`temiz: ${text}`, () =>
    assert.deepEqual(
      findClaims(text).map((hit: { reason: string }) => hit.reason),
      [],
    ))
}

console.log(`\n${passed} uyum deseni testi geçti`)
