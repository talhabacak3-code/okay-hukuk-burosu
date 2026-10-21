/**
 * Onaylı amblemden (terazi · sütunlar · hilal · ok — "OK" + "AY") web varlıklarını üretir.
 * Kaynak: public/branding/okay-mark-original.png (müşterinin verdiği dosya, DEĞİŞTİRİLMEZ).
 *
 * Amblem tek renkli (siyah) düz bir işarettir. Bu yüzden şekli yeniden çizilmeden
 * potrace ile otomatik vektörleştirilir:
 *   1. boş alan kırpılır, 3× büyütülüp eşiklenir (kenarlar yumuşak izlensin diye)
 *   2. potrace ile tek bir SVG yoluna çevrilir
 *   3. DOĞRULAMA: yol yeniden rasterleştirilir ve kaynakla piksel örtüşmesi (IoU)
 *      ölçülür; MIN_IOU altında kalırsa script hata verir, hiçbir dosya yazılmaz.
 *
 * Çıktılar:
 *   src/components/brand/okay-mark-path.ts  — <OkayMark> bileşeninin yolu (currentColor)
 *   public/branding/okay-mark.svg           — mürekkep renkli bağımsız SVG
 *   public/branding/okay-mark.png           — kırık beyaz zeminli PNG (JSON-LD logosu)
 *   src/app/icon.svg                        — favicon (mürekkep zemin, kırık beyaz amblem)
 *   src/app/apple-icon.png                  — 180×180 dokunmatik simge
 *
 * Tek renk olduğu için koyu zeminde amblem kırık beyaza çevrilerek kullanılabilir
 * (tek renkli işaretin ters/negatif kullanımı); biçimi değiştirilmez.
 *
 * Kullanım: node scripts/branding/prepare-mark.mjs
 */
import { writeFile } from "node:fs/promises"
import { promisify } from "node:util"

import potrace from "potrace"
import sharp from "sharp"

const SRC = "public/branding/okay-mark-original.png"
const INK = "#131210"
const PAPER = "#F6F4EF"
const SCALE = 3
const THRESHOLD = 128
const MIN_IOU = 0.985

const trace = promisify(potrace.trace)

// 1) Kırp + büyüt + eşikle
const gray = sharp(SRC).flatten({ background: "#ffffff" }).greyscale()
const { data, info } = await gray
  .clone()
  .raw()
  .toBuffer({ resolveWithObject: true })
let x0 = info.width,
  y0 = info.height,
  x1 = 0,
  y1 = 0
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[y * info.width + x] < THRESHOLD) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
}
const pad = 4
const box = {
  left: Math.max(0, x0 - pad),
  top: Math.max(0, y0 - pad),
  width: Math.min(info.width, x1 + pad + 1) - Math.max(0, x0 - pad),
  height: Math.min(info.height, y1 + pad + 1) - Math.max(0, y0 - pad),
}
const W = box.width * SCALE
const H = box.height * SCALE
const bitmap = await gray
  .clone()
  .extract(box)
  .resize(W, H, { kernel: "lanczos3" })
  .threshold(THRESHOLD)
  .png()
  .toBuffer()

// 2) Vektörleştir
const svg = await trace(bitmap, {
  threshold: THRESHOLD,
  turdSize: 40,
  optTolerance: 0.3,
  alphaMax: 1,
  color: "#000000",
  background: "transparent",
})
const rawD = svg.match(/ d="([^"]+)"/)?.[1]
if (!rawD) throw new Error("potrace çıktısında yol bulunamadı")
// Sıkıştırma: koordinatlar tam sayıya yuvarlanır (viewBox ~1700 birim → en çok %0,03
// sapma; doğrulama aşağıda yuvarlanmış yol üzerinde yapılır) ve ayraçlar teke indirilir.
const d = rawD
  .replace(/-?\d+(\.\d+)?/g, (n) => String(Math.round(Number(n))))
  .replace(/,\s*/g, " ")
  .replace(/\s*([MCLZ])\s*/g, "$1")
  .replace(/\s+/g, " ")
  .trim()

// 3) Doğrula: yeniden rasterleştir, kaynakla karşılaştır
const pathSvg = (fill, bg = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg}<path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`
const rendered = await sharp(
  Buffer.from(
    pathSvg("#000", `<rect width="${W}" height="${H}" fill="#fff"/>`),
  ),
)
  .greyscale()
  .raw()
  .toBuffer()
const source = await sharp(bitmap).greyscale().raw().toBuffer()
let inter = 0,
  union = 0
for (let i = 0; i < W * H; i++) {
  const a = source[i] < THRESHOLD
  const b = rendered[i] < THRESHOLD
  if (a && b) inter++
  if (a || b) union++
}
const iou = inter / union
if (iou < MIN_IOU) {
  throw new Error(
    `Vektör kaynağa yeterince benzemiyor: IoU ${iou.toFixed(4)} < ${MIN_IOU}`,
  )
}

// 4) Çıktılar
const banner = `// OTOMATİK ÜRETİLDİ — scripts/branding/prepare-mark.mjs. Elle düzenlemeyin.
// Kaynak: public/branding/okay-mark-original.png (potrace, IoU ${iou.toFixed(4)}).
`
await writeFile(
  "src/components/brand/okay-mark-path.ts",
  `${banner}export const okayMark = {
  width: ${W},
  height: ${H},
  d: "${d}",
} as const
`,
)
await writeFile("public/branding/okay-mark.svg", pathSvg(INK) + "\n")

const PNG_H = 600
const pngPad = 60
const markPng = await sharp(Buffer.from(pathSvg(INK)))
  .resize({ height: PNG_H - 2 * pngPad })
  .png()
  .toBuffer({ resolveWithObject: true })
const pngW = markPng.info.width + 2 * pngPad
await sharp({
  create: { width: pngW, height: PNG_H, channels: 3, background: PAPER },
})
  .composite([{ input: markPng.data, left: pngPad, top: pngPad }])
  .png({ compressionLevel: 9 })
  .toFile("public/branding/okay-mark.png")

// Favicon: kare mürekkep zemin, ortada kırık beyaz amblem (yüksekliğin %72'si).
const S = Math.max(W, H) / 0.72
const fx = (S - W) / 2
const fy = (S - H) / 2
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S.toFixed(0)} ${S.toFixed(0)}"><rect width="100%" height="100%" fill="${INK}"/><path transform="translate(${fx.toFixed(1)} ${fy.toFixed(1)})" fill="${PAPER}" fill-rule="evenodd" d="${d}"/></svg>\n`
await writeFile("src/app/icon.svg", icon)
await sharp(Buffer.from(icon))
  .resize(180, 180)
  .png()
  .toFile("src/app/apple-icon.png")

console.log(
  `amblem: ${W}×${H} (kaynak kutu ${box.width}×${box.height}), IoU ${iou.toFixed(4)}, yol ${(d.length / 1024).toFixed(1)} KB`,
)
