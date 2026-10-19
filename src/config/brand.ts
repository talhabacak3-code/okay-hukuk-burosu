/**
 * Onaylı logo varlıkları. Dosyalar `scripts/branding/prepare-logo.mjs` ile
 * `public/branding/okay-logo-original.png` kaynağından üretilir; logonun
 * içeriği değiştirilmez, yalnızca boş alan kırpılır ve beyaz zemin saydamlaştırılır.
 */
export const brandAssets = {
  /** Müşterinin onayladığı özgün dosya (1536×1024, beyaz zemin). Değiştirilmez. */
  original: {
    src: "/branding/okay-logo-original.png",
    width: 1536,
    height: 1024,
  },
  /** Boş alanı kırpılmış, orijinal beyaz zeminli sürüm. */
  cropped: { src: "/branding/okay-logo.png", width: 1361, height: 503 },
  /**
   * Beyaz zemini saydamlaştırılmış sürüm — YALNIZCA AÇIK ZEMİNLER İÇİN.
   * Lacivert harfler koyu zeminde okunmaz; vektör (SVG) değildir.
   */
  transparent: {
    src: "/branding/okay-logo-transparent.png",
    width: 1361,
    height: 503,
  },
} as const

export const logoAlt = "OKAY Hukuk Danışmanlık & Arabuluculuk logosu"
