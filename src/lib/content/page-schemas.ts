import { z } from "zod"

/**
 * Panelden düzenlenen sayfa metinleri (public.pages.content, jsonb). Hem panel formu
 * hem site okuması bu şemaları kullanır. Boş alan = sitede varsayılan metin veya
 * "İçerik bekleniyor" yer tutucusu. Metinler bilgilendirici olmalı; başarı, müvekkil,
 * karşılaştırma veya üstünlük iddiası içermemelidir (Av.K. m.55, TBB Reklam Yasağı).
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter olabilir.`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null)

export const homeContentSchema = z.object({
  heroLine1: optionalText(60),
  heroLine2: optionalText(60),
  heroLede: optionalText(300),
  introText: optionalText(1200),
  officePhotoPath: optionalText(300),
  officePhotoAlt: optionalText(200),
})

export const aboutContentSchema = z.object({
  intro: optionalText(2000),
  approach: optionalText(3000),
})

export const mediationContentSchema = z.object({
  intro: optionalText(600),
  process: optionalText(4000),
  roleSeparation: optionalText(2000),
})

export type HomeContent = z.output<typeof homeContentSchema>
export type AboutContent = z.output<typeof aboutContentSchema>
export type MediationContent = z.output<typeof mediationContentSchema>

export const pageSchemas = {
  home: homeContentSchema,
  about: aboutContentSchema,
  mediation: mediationContentSchema,
} as const

export type PageSlug = keyof typeof pageSchemas

export type PageContentMap = {
  home: HomeContent
  about: AboutContent
  mediation: MediationContent
}

/** Panelde boş bırakılırsa sitede kullanılan varsayılanlar. */
export const pageDefaults = {
  heroLine1: "Hukuka Saygı.",
  heroLine2: "Mesleğe Özen.",
  mediationIntro:
    "Arabuluculuk; tarafların, tarafsız ve bağımsız bir arabulucunun katılımıyla uyuşmazlıklarını müzakere yoluyla çözmeyi amaçladığı bir yöntemdir. Türkiye'de 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu ile düzenlenmiştir.",
} as const

/**
 * Düz metni paragraflara ayırır: boş satır = yeni paragraf, "## " ile başlayan satır =
 * ara başlık. HTML yorumlanmaz (XSS yok).
 */
export type TextBlock = { type: "heading" | "paragraph"; text: string }

export function toBlocks(value: string | null | undefined): TextBlock[] {
  if (!value) return []
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) =>
      chunk.startsWith("## ")
        ? { type: "heading" as const, text: chunk.slice(3).trim() }
        : {
            type: "paragraph" as const,
            text: chunk.replace(/\s*\r?\n\s*/g, " "),
          },
    )
}
