/**
 * Onaylı logodan web varlıklarını üretir. Logonun içeriği (harfler, terazi, çizgi,
 * renkler) DEĞİŞTİRİLMEZ; yalnızca:
 *   1. çevredeki boş alan kırpılır  → okay-logo.png (orijinal zemin korunur)
 *   2. beyaz zemin "color-to-alpha" ile saydamlaştırılır → okay-logo-transparent.png
 *
 * Saydam sürüm, beyaz zemin üzerinde orijinalle birebir aynı görünecek şekilde
 * matematiksel olarak ters çevrilebilir üretilir ve script bunu doğrular.
 * YALNIZCA AÇIK ZEMİNLER içindir: lacivert harfler koyu zeminde okunmaz.
 * Vektör (SVG) değildir.
 *
 * Kullanım: node scripts/branding/prepare-logo.mjs
 */
import sharp from "sharp"

const SRC = "public/branding/okay-logo-original.png"
const OUT_CROPPED = "public/branding/okay-logo.png"
const OUT_TRANSPARENT = "public/branding/okay-logo-transparent.png"

/** Zemin sayılacak en düşük kanal değeri (gölgeler bunun altında kalır). */
const CONTENT_THRESHOLD = 246
/** İçerik kutusunun çevresine eklenecek nefes payı (içerik yüksekliğine oran). */
const PADDING_RATIO = 0.035
/** Bu değerin altındaki alfa, zemin gürültüsü kabul edilip sıfırlanır. */
const ALPHA_NOISE_FLOOR = 0.02

const { data, info } = await sharp(SRC)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: C } = info

// 1) Zemin rengi: 40px kenar bandının ortalaması
const bg = [0, 0, 0]
let n = 0
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (x > 40 && x < W - 40 && y > 40 && y < H - 40) continue
    const i = (y * W + x) * C
    for (let k = 0; k < 3; k++) bg[k] += data[i + k]
    n++
  }
}
for (let k = 0; k < 3; k++) bg[k] /= n

// 2) İçerik kutusu
let x0 = W,
  y0 = H,
  x1 = 0,
  y1 = 0
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C
    if (Math.min(data[i], data[i + 1], data[i + 2]) < CONTENT_THRESHOLD) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
}
const pad = Math.round((y1 - y0 + 1) * PADDING_RATIO)
const left = Math.max(0, x0 - pad)
const top = Math.max(0, y0 - pad)
const cw = Math.min(W, x1 + pad + 1) - left
const ch = Math.min(H, y1 + pad + 1) - top

await sharp(SRC)
  .extract({ left, top, width: cw, height: ch })
  .png({ compressionLevel: 9 })
  .toFile(OUT_CROPPED)

// 3) Color-to-alpha (zemin rengine göre). Ön plan zeminden koyu olduğu için
//    hedef renk siyaha doğru çözülür: p = c·a + bg·(1 − a)
const crop = await sharp(OUT_CROPPED).removeAlpha().raw().toBuffer()
const rgba = Buffer.alloc(cw * ch * 4)
for (let p = 0; p < cw * ch; p++) {
  const src = [crop[p * 3], crop[p * 3 + 1], crop[p * 3 + 2]]
  let a = 0
  for (let k = 0; k < 3; k++) a = Math.max(a, (bg[k] - src[k]) / bg[k])
  if (a < ALPHA_NOISE_FLOOR) a = 0
  const o = p * 4
  if (a === 0) {
    rgba[o] = rgba[o + 1] = rgba[o + 2] = rgba[o + 3] = 0
    continue
  }
  for (let k = 0; k < 3; k++) {
    const c = bg[k] + (src[k] - bg[k]) / a
    rgba[o + k] = Math.round(Math.min(255, Math.max(0, c)))
  }
  rgba[o + 3] = Math.round(a * 255)
}
await sharp(rgba, { raw: { width: cw, height: ch, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT_TRANSPARENT)

// 4) Doğrulama: saydam sürüm orijinal zemine yerleştirildiğinde kırpılmış orijinali vermeli
const bgHex = bg.map((v) => Math.round(v))
const recomposed = await sharp({
  create: {
    width: cw,
    height: ch,
    channels: 3,
    background: { r: bgHex[0], g: bgHex[1], b: bgHex[2] },
  },
})
  .composite([{ input: OUT_TRANSPARENT }])
  .removeAlpha()
  .raw()
  .toBuffer()
let maxDiff = 0
let sumDiff = 0
for (let i = 0; i < crop.length; i++) {
  const d = Math.abs(crop[i] - recomposed[i])
  maxDiff = Math.max(maxDiff, d)
  sumDiff += d
}

console.log(
  JSON.stringify(
    {
      source: `${W}x${H}`,
      background: bg.map((v) => +v.toFixed(1)),
      contentBox: { x0, y0, x1, y1 },
      crop: { left, top, width: cw, height: ch },
      verification: {
        meanAbsDiff: +(sumDiff / crop.length).toFixed(3),
        maxAbsDiff: maxDiff,
        note: "Zemin gürültüsü (alfa < %2) sıfırlandığı için maks. fark birkaç birim olabilir.",
      },
    },
    null,
    2,
  ),
)
