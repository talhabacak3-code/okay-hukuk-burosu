/**
 * GitHub Pages: `next build` (output: "export") sonrası out/ klasörünü düzenler.
 *
 * 1. Önyükleme (prefetch) parçaları: dışa aktarım parçaları iç içe klasörlere yazar
 *    (out/hakkimizda/__next.<id>/hakkimizda/__PAGE__.txt), istemci ise düz adla ister
 *    (out/hakkimizda/__next.<id>.hakkimizda.__PAGE__.txt). Statik barındırmada bunu
 *    yeniden yazacak sunucu olmadığından düz adlı kopyalar üretilir; aksi halde her
 *    bağlantı önyüklemesi konsolda 404 bırakır (sayfalar yine çalışır).
 * 2. .nojekyll: "_" ile başlayan klasörlerin (_next) Jekyll tarafından atlanmasını önler.
 * 3. Kayıt yokken üretilen yer tutucu yayın yolu (yayin-hazirlaniyor) yayına çıkarılmaz.
 *
 * Kullanım: node scripts/pages/finalize.mjs [out]
 */
import {
  copyFileSync,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { join, relative, sep } from "node:path"

const out = process.argv[2] ?? "out"
if (!existsSync(join(out, "index.html"))) {
  console.error(`${out}/index.html yok — önce GITHUB_PAGES=true ile derleyin.`)
  process.exit(1)
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

let flattened = 0
for (const file of walk(out)) {
  const parts = relative(out, file).split(sep)
  const index = parts.findIndex(
    (part, i) => part.startsWith("__next.") && i < parts.length - 1,
  )
  if (index === -1) continue
  const flatName = parts.slice(index).join(".")
  const target = join(out, ...parts.slice(0, index), flatName)
  if (!existsSync(target)) {
    copyFileSync(file, target)
    flattened++
  }
}
console.log(`önyükleme parçası düzleştirildi: ${flattened}`)

writeFileSync(join(out, ".nojekyll"), "")
console.log(".nojekyll yazıldı")

const placeholderArticle = join(out, "yayinlar", "yayin-hazirlaniyor")
if (existsSync(placeholderArticle)) {
  rmSync(placeholderArticle, { recursive: true, force: true })
  console.log(
    "çıkarıldı: yayinlar/yayin-hazirlaniyor (kayıt yokken üretilen yer tutucu yol)",
  )
}
