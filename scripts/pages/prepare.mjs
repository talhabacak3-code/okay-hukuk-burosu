/**
 * GitHub Pages için statik dışa aktarım hazırlığı — YALNIZCA CI'daki geçici kopyada çalışır.
 *
 * Statik barındırmada çalışmayan parçalar derlemeden çıkarılır (Next.js statik dışa
 * aktarım rehberi: Server Actions, Proxy, cookies, headers, redirects desteklenmez):
 *   - src/app/admin            yönetim paneli (oturum, Server Actions)
 *   - src/proxy.ts             panel oturum kontrolü
 *   - src/app/(site)/iletisim/actions.ts   iletişim formu Server Action'ı
 *   - src/app/(site)/bilesenler            yalnızca geliştirme galerisi
 *   - src/app/robots.ts, src/app/sitemap.ts  Cache Components açıkken bu rotalar
 *     "force-static" ile işaretlenemez (Next 16'da dynamic ayarı kaldırıldı), statik
 *     dışa aktarım ise bunu ister. Önizleme sürümü taramaya kapalı olduğundan yerine
 *     tüm siteyi kapatan statik public/robots.txt yazılır; sitemap üretilmez.
 * İletişim formu, telefona yönlendiren statik bilgi kutusuyla değiştirilir.
 *
 * Kaynak dosyaları SİLDİĞİ için yerelde yanlışlıkla çalışmaz: GITHUB_ACTIONS=true
 * olmalı (veya bilinçli olarak --geçici-kopya bayrağı verilmeli).
 */
import { copyFileSync, existsSync, rmSync, writeFileSync } from "node:fs"

const allowed =
  process.env.GITHUB_ACTIONS === "true" ||
  process.argv.includes("--geçici-kopya")
if (!allowed) {
  console.error(
    "Bu betik kaynak dosyaları siler; yalnızca CI'da veya geçici bir kopyada çalıştırın.",
  )
  process.exit(1)
}

const remove = [
  "src/app/admin",
  "src/proxy.ts",
  "src/app/(site)/iletisim/actions.ts",
  "src/app/(site)/bilesenler",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
]
for (const path of remove) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true })
    console.log(`çıkarıldı: ${path}`)
  }
}

copyFileSync(
  "scripts/pages/contact-form.static.tsx",
  "src/components/contact/contact-form.tsx",
)
console.log("iletişim formu statik bilgi kutusuyla değiştirildi")

writeFileSync(
  "public/robots.txt",
  ["User-agent: *", "Disallow: /", ""].join("\n"),
)
console.log("public/robots.txt: önizleme sürümü taramaya kapalı")
