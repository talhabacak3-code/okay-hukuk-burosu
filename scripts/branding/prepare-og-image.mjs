/**
 * Paylaşım görseli (Open Graph, 1200×630): kırık beyaz zemin, ince altın çerçeve ve
 * ortada onaylı logo. Logo yalnızca orantılı ölçeklenir; harfleri, terazisi ve
 * renkleri DEĞİŞTİRİLMEZ. Saydam logo açık zemin üzerinde kullanılır (logo kuralları).
 *
 * Kullanım: node scripts/branding/prepare-og-image.mjs
 */
import { writeFile } from "node:fs/promises"

import sharp from "sharp"

const LOGO = "public/branding/okay-logo-transparent.png"
const OUT = "src/app/opengraph-image.png"
const W = 1200
const H = 630
const PAPER = "#F7F5F0"
const CHAMPAGNE = "#B79B65"
const INSET = 36
const LOGO_WIDTH = 820

const logo = await sharp(LOGO)
  .resize({ width: LOGO_WIDTH, fit: "inside", kernel: "lanczos3" })
  .png()
  .toBuffer({ resolveWithObject: true })

const frame = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${INSET + 0.5}" y="${INSET + 0.5}" width="${W - 2 * INSET - 1}" height="${H - 2 * INSET - 1}"
      fill="none" stroke="${CHAMPAGNE}" stroke-width="1"/>
  </svg>`,
)

const image = await sharp({
  create: { width: W, height: H, channels: 3, background: PAPER },
})
  .composite([
    { input: frame, top: 0, left: 0 },
    {
      input: logo.data,
      left: Math.round((W - logo.info.width) / 2),
      top: Math.round((H - logo.info.height) / 2),
    },
  ])
  .png({ compressionLevel: 9, palette: false })
  .toBuffer()

await writeFile(OUT, image)
const meta = await sharp(image).metadata()
console.log(
  `${OUT}: ${meta.width}×${meta.height}, ${(image.length / 1024).toFixed(0)} KB (logo ${logo.info.width}×${logo.info.height})`,
)
