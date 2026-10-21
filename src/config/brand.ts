/**
 * Onaylı marka varlıkları. Amblem (terazi · sütunlar · hilal · ok) müşterinin verdiği
 * `public/branding/okay-mark-original.png` dosyasıdır; `scripts/branding/prepare-mark.mjs`
 * onu biçimini değiştirmeden vektörleştirir ve aşağıdaki türevleri üretir.
 * Sitede logo <Logo> (amblem + "OKAY HUKUK DANIŞMANLIK" yazısı) ile gösterilir.
 */
export const brandAssets = {
  /** Müşterinin verdiği özgün amblem (864×1184, beyaz zemin). Değiştirilmez. */
  original: {
    src: "/branding/okay-mark-original.png",
    width: 864,
    height: 1184,
  },
  /** Vektör amblem, mürekkep rengi (bağımsız kullanım için). */
  markSvg: { src: "/branding/okay-mark.svg" },
  /** Kırık beyaz zeminli amblem PNG'si — yapılandırılmış veri (JSON-LD) logosu. */
  markPng: { src: "/branding/okay-mark.png" },
} as const

export const logoAlt = "OKAY Hukuk Danışmanlık logosu"
