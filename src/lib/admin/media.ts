import "server-only"

import { randomUUID } from "node:crypto"
import sharp from "sharp"

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_DIMENSION = 2400

type AllowedMime = "image/jpeg" | "image/png" | "image/webp"

const EXTENSIONS: Record<AllowedMime, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

/** Dosya türünü içerikten (imza baytları) belirler; uzantıya veya tarayıcı beyanına güvenmez. */
export function sniffImageType(bytes: Uint8Array): AllowedMime | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg"
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b))
    return "image/png"
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp"
  }
  return null
}

export type PreparedUpload = {
  path: string
  body: Buffer
  mime: AllowedMime
  width: number
  height: number
}

export type UploadCheck =
  { ok: true; upload: PreparedUpload } | { ok: false; message: string }

/**
 * Yüklenen dosyayı doğrular ve hazırlar:
 * - boyut (≤ 5 MB), tür (JPEG/PNG/WebP — imza baytlarıyla; SVG/GIF/PDF reddedilir),
 * - beyan edilen MIME türü ile gerçek türün uyuşması,
 * - görüntü olarak çözümlenebilirlik ve piksel sınırı,
 * - yeniden kodlama: EXIF/GPS dahil tüm üst veri silinir, yön düzeltilir, en uzun kenar 2400 px.
 * Dosya adı kullanıcıdan alınmaz; rastgele UUID ile üretilir.
 */
export async function prepareImageUpload(
  file: File,
  now: Date,
): Promise<UploadCheck> {
  if (file.size === 0) return { ok: false, message: "Dosya boş." }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "Dosya en fazla 5 MB olabilir." }
  }

  const input = Buffer.from(await file.arrayBuffer())
  const sniffed = sniffImageType(input)
  if (!sniffed) {
    return {
      ok: false,
      message: "Yalnızca JPEG, PNG veya WebP görseller yüklenebilir.",
    }
  }
  if (file.type && file.type !== sniffed) {
    return {
      ok: false,
      message: "Dosya türü ile içeriği uyuşmuyor. Lütfen dosyayı kontrol edin.",
    }
  }

  try {
    const pipeline = sharp(input, {
      limitInputPixels: 50_000_000,
      failOn: "error",
    })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
    const encoded =
      sniffed === "image/png"
        ? pipeline.png({ compressionLevel: 9 })
        : sniffed === "image/webp"
          ? pipeline.webp({ quality: 85 })
          : pipeline.jpeg({ quality: 85, mozjpeg: true })

    const { data, info } = await encoded.toBuffer({ resolveWithObject: true })
    if (data.length > MAX_UPLOAD_BYTES) {
      return { ok: false, message: "İşlenen görsel 5 MB sınırını aşıyor." }
    }

    const year = now.getUTCFullYear()
    return {
      ok: true,
      upload: {
        path: `${year}/${randomUUID()}.${EXTENSIONS[sniffed]}`,
        body: data,
        mime: sniffed,
        width: info.width,
        height: info.height,
      },
    }
  } catch {
    return { ok: false, message: "Görsel okunamadı; dosya bozuk olabilir." }
  }
}
