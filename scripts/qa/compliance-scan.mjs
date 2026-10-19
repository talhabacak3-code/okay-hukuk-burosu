/**
 * Yayın öncesi içerik uyum taraması (avukatlık reklam yasağı, arabuluculuk tanıtımı).
 *
 * Çalışan sitenin sitemap'teki tüm sayfalarını indirir, ziyaretçinin gördüğü metni çıkarır
 * ve üstünlük/sonuç/iş toplama ifadelerini arar. Panelden girilen içerik de böylece
 * yakalanır. Yer tutucu blokları ([data-placeholder]) ayrıca sayılır; yayında 0 olmalıdır.
 *
 * Kullanım:  npm run start  →  node scripts/qa/compliance-scan.mjs [http://localhost:3000]
 * Yayın kapısı: npm run qa:launch -- https://alanadi   (--yayin bayrağı)
 *   Ek olarak başarısız olur: yer tutucu/taslak blok > 0, sitemap'te localhost veya http
 *   adresi, robots.txt'nin tüm siteyi kapatması, ana sayfanın noindex dönmesi, büro
 *   künyesinde (JSON-LD) doğrulanmış adres/telefon olmaması.
 * Çıkış kodu 1: incelenmemiş bir eşleşme var. Eşleşme hukuken sorunsuzsa (ör. kanundan
 * alıntı, olumsuzlama) gerekçesiyle REVIEWED listesine eklenir.
 *
 * Bu tarama bir yardımcıdır; nihai değerlendirme büro/hukuki inceleme tarafından yapılır.
 */

import { pathToFileURL } from "node:url"

/**
 * Kelime sınırlı desen. JS'te \b yalnızca ASCII harfleri tanır (ö, ı, ş, ü kaçar);
 * bu yüzden sınır Unicode harf/rakam sınıfıyla kurulur.
 */
const word = (source) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "iu")

/** [desen, gerekçe] — Avukatlık K. m.55, TBB Reklam Yasağı Yönetmeliği, Meslek Kuralları. */
export const PATTERNS = [
  [
    word(
      "en (iyi|güvenilir|deneyimli|başarılı|uzman|tecrübeli|kapsamlı|hızlı)",
    ),
    "üstünlük iddiası",
  ],
  [
    word("lider|öncü|bir numara|1 numara|tek adres|ayrıcalıklı"),
    "üstünlük iddiası",
  ],
  // Arabulucular Sicili'ndeki resmî terim ("uzmanlık alanları") hariç.
  [word("uzman(ı|lar|ları|larımız|ımız)?"), "uzmanlık iddiası"],
  [/garanti/iu, "sonuç garantisi"],
  [word("(kesin|mutlak) (sonuç|çözüm|kazanç)"), "sonuç vaadi"],
  [/(başarı|kazanma|kazanım) oran/iu, "başarı oranı"],
  [/%\s?\d|\d\s?%/u, "yüzde/istatistik"],
  // "03 Dava şartı" gibi madde numaraları eşleşmesin: yalnızca sayı + iddia kalıpları.
  [
    word(
      "\\d+\\+?\\s*(davada|davayı|dava kazan\\p{L}*|başarılı dava|müvekkil\\p{L}*|dosyada|yıllık (deneyim|tecrübe)|yılı aşkın)",
    ),
    "sayısal iddia",
  ],
  [/kazan(dık|dığımız|ılan|dır)/iu, "dava sonucu"],
  [
    /ücretsiz|bedava|indirim|kampanya|uygun fiyat|ücret(ler)?imiz/iu,
    "ücret/iş toplama",
  ],
  [
    word("hemen (ara|arayın|ulaşın|başvurun)|şimdi (ara|arayın)"),
    "agresif çağrı",
  ],
  [
    /(müvekkil|müşteri) (yorum|görüş|memnuniyet)|referans(lar|larımız)|testimonial|★/iu,
    "referans/yorum",
  ],
  [word("ödül\\p{L}*|sertifikalı"), "ödül/sertifika"],
  [/whatsapp/iu, "anlık mesaj balonu"],
  [
    /taraf(ınız)?a kazandır|lehinize sonuç/iu,
    "arabuluculukta tarafsızlık ihlali",
  ],
]

/** İncelenmiş, mevzuata uygun eşleşmeler: [sayfa yolu, metin parçası, gerekçe]. */
const REVIEWED = [
  [
    "/gizlilik-politikasi",
    "tamamen güvenli olduğu garanti edilemez",
    "olumsuzlama; sonuç vaadi değil, güvenlik uyarısı",
  ],
  [
    "/kvkk-aydinlatma-metni",
    "ücretsiz olarak sonuçlandırılır",
    "KVKK m.13/2 hükmünün aktarımı",
  ],
]

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))

/** data-placeholder taşıyan öğeleri (iç içe aynı etiketleri sayarak) çıkarır. */
function stripPlaceholders(html) {
  let count = 0
  const open = /<([a-z0-9]+)\b[^>]*\bdata-placeholder\b[^>]*>/i
  for (;;) {
    const match = open.exec(html)
    if (!match) return { html, count }
    count++
    const tag = match[1]
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi")
    re.lastIndex = match.index + match[0].length
    let depth = 1
    let end = html.length
    for (let m; (m = re.exec(html));) {
      depth += m[1] ? -1 : m[0].endsWith("/>") ? 0 : 1
      if (depth === 0) {
        end = m.index + m[0].length
        break
      }
    }
    html = html.slice(0, match.index) + " " + html.slice(end)
  }
}

function visibleText(html) {
  const body = html.slice(html.indexOf("<body"))
  const cleaned = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<div hidden=""[\s\S]*?<\/div>/gi, " ")
  const { html: withoutPlaceholders, count } = stripPlaceholders(cleaned)
  const text = decode(withoutPlaceholders.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
  return { text, placeholders: count }
}

/** Eşleşmeleri döndürür; ayrı test dosyası desenleri örnek metinlerle doğrular. */
export function findClaims(text) {
  return PATTERNS.flatMap(([pattern, reason]) =>
    [...text.matchAll(new RegExp(pattern.source, pattern.flags + "g"))].map(
      (m) => ({
        reason,
        index: m.index,
        match: m[0],
      }),
    ),
  )
}

/** Yayın kapısı (yalnızca --yayin): sorun listesini döndürür. */
async function launchProblems(base, sitemap) {
  const problems = []
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (
    locs.some((loc) => !loc.startsWith("https://") || loc.includes("localhost"))
  ) {
    problems.push(
      "sitemap adresleri https alan adı değil (NEXT_PUBLIC_SITE_URL)",
    )
  }
  const robots = await (await fetch(`${base}/robots.txt`)).text()
  if (/^Disallow: \/\s*$/m.test(robots)) {
    problems.push(
      "robots.txt tüm siteyi kapatıyor (NEXT_PUBLIC_SITE_INDEXABLE=true değil)",
    )
  }
  const home = await (await fetch(`${base}/`)).text()
  if (/noindex/.test(home.match(/<meta name="robots"[^>]*>/)?.[0] ?? "")) {
    problems.push("ana sayfa noindex dönüyor")
  }
  const org = [
    ...home.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ]
    .map((m) => {
      try {
        return JSON.parse(m[1])
      } catch {
        return null
      }
    })
    .find((block) => block?.["@type"] === "LegalService")
  if (!org?.address || !org?.telephone) {
    problems.push(
      "büro künyesinde adres/telefon yok → iletişim bilgileri panelde 'doğrulandı' işaretlenmemiş",
    )
  }
  return problems
}

async function main(base, { launch = false } = {}) {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  )

  let unreviewed = 0
  let totalPlaceholders = 0
  console.log(`Taranan site: ${base} — ${paths.length} sayfa\n`)

  for (const path of paths) {
    const response = await fetch(base + path)
    if (!response.ok) {
      console.log(`! ${path}: HTTP ${response.status}`)
      unreviewed++
      continue
    }
    const { text, placeholders } = visibleText(await response.text())
    totalPlaceholders += placeholders
    const hits = findClaims(text).map(({ reason, index, match }) => {
      const context = text.slice(
        Math.max(0, index - 50),
        index + match.length + 50,
      )
      const reviewed = REVIEWED.find(
        ([p, snippet]) => p === path && context.includes(snippet),
      )
      return { reason, context, reviewed: reviewed?.[2] }
    })
    const open = hits.filter((h) => !h.reviewed)
    unreviewed += open.length
    console.log(
      `${open.length ? "✗" : "✓"} ${path}  (yer tutucu: ${placeholders}, incelenmiş eşleşme: ${hits.length - open.length})`,
    )
    for (const hit of hits) {
      console.log(
        `    ${hit.reviewed ? "· incelendi" : "✗ İNCELE"} [${hit.reason}] …${hit.context}…${hit.reviewed ? ` — ${hit.reviewed}` : ""}`,
      )
    }
  }

  console.log(
    `\nİncelenmemiş eşleşme: ${unreviewed} · Toplam yer tutucu blok: ${totalPlaceholders} (yayında 0 olmalı)`,
  )
  if (unreviewed > 0) process.exitCode = 1

  if (launch) {
    const problems = await launchProblems(base, sitemap)
    if (totalPlaceholders > 0) {
      problems.unshift(
        `${totalPlaceholders} yer tutucu/taslak blok yayında görünüyor`,
      )
    }
    console.log(`\nYayın kapısı: ${problems.length ? "GEÇMEDİ" : "geçti"}`)
    for (const problem of problems) console.log(`  ✗ ${problem}`)
    if (problems.length) process.exitCode = 1
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2)
  const url =
    args.find((arg) => !arg.startsWith("--")) ?? "http://localhost:3000"
  await main(url.replace(/\/$/, ""), { launch: args.includes("--yayin") })
}
