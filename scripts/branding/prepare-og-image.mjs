/**
 * Paylaşım görseli (Open Graph, 1200×630): kırık beyaz zemin, ince taş rengi çerçeve ve
 * ortada logo (amblem + "OKAY / HUKUK DANIŞMANLIK"). Yazı gerçek web fontlarıyla
 * (Bodoni Moda, Instrument Sans) çizilsin diye görsel, geliştirme galerisindeki
 * `#og-frame` öğesinin tarayıcı ekran görüntüsüdür (sistem Chrome'u, Playwright).
 *
 * Önce geliştirme sunucusunu başlatın (galeri yalnızca `npm run dev` altında açılır):
 *   npm run dev
 *   node scripts/branding/prepare-og-image.mjs [http://localhost:3000]
 */
import { writeFile } from "node:fs/promises"

import { chromium } from "@playwright/test"
import sharp from "sharp"

const BASE = process.argv[2] ?? "http://localhost:3000"
const OUT = "src/app/opengraph-image.png"

const browser = await chromium.launch({ channel: "chrome" })
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  })
  await page.goto(`${BASE}/bilesenler`, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  const frame = page.locator("#og-frame")
  await frame.scrollIntoViewIfNeeded()
  // Öğe kesirli bir konumda olabilir; tam 1200×630 için yuvarlanmış kırpma kullanılır.
  const box = await frame.boundingBox()
  if (!box) throw new Error("#og-frame görünür değil")
  const shot = await page.screenshot({
    animations: "disabled",
    clip: {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: 1200,
      height: 630,
    },
  })

  const image = await sharp(shot)
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
  const meta = await sharp(image).metadata()
  if (meta.width !== 1200 || meta.height !== 630) {
    throw new Error(`Beklenmeyen boyut: ${meta.width}×${meta.height}`)
  }
  await writeFile(OUT, image)
  console.log(`${OUT}: 1200×630, ${(image.length / 1024).toFixed(0)} KB`)
} finally {
  await browser.close()
}
