import { z } from "zod"

/**
 * Yönetim paneli form şemaları. Her şema FormData'dan okunan ham değerleri doğrular ve
 * veritabanı sütunlarına (snake_case) çevrilecek temiz değerler üretir.
 */

const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  Ö: "o",
  Ş: "s",
  Ü: "u",
  â: "a",
  î: "i",
  û: "u",
}

/** "Kira Hukuku & Tahliye" → "kira-hukuku-tahliye" */
export function slugify(value: string) {
  return value
    .replace(/[çğıİöşüÇĞÖŞÜâîû]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

const slugField = z
  .string()
  .trim()
  .max(80, "En fazla 80 karakter.")
  .refine(
    (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Yalnızca küçük harf (a-z), rakam ve tire kullanın.",
  )

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter.`)
    .transform((value) => (value === "" ? null : value))

const required = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} en az ${min} karakter olmalı.`)
    .max(max, `${label} en fazla ${max} karakter olabilir.`)

const sortOrder = z.coerce
  .number({ error: "Sayı girin." })
  .int("Tam sayı girin.")
  .min(0, "0 veya daha büyük olmalı.")
  .max(999, "En fazla 999.")

const mediaPath = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) =>
      value === "" || /^[0-9]{4}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value),
    "Geçersiz medya seçimi.",
  )
  .transform((value) => (value === "" ? null : value))

// ---------------------------------------------------------------------------
// Faaliyet alanı
// ---------------------------------------------------------------------------
export const practiceAreaSchema = z
  .object({
    title: required(2, 120, "Başlık"),
    slug: slugField,
    summary: required(10, 400, "Kısa açıklama"),
    sortOrder,
    published: z.boolean(),
  })
  .transform((v) => ({
    title: v.title,
    slug: v.slug || slugify(v.title),
    summary: v.summary,
    sort_order: v.sortOrder,
    published: v.published,
  }))

// ---------------------------------------------------------------------------
// Avukat profili — eğitim ve mesleki geçmiş "|" ile ayrılmış satırlarla girilir
// ---------------------------------------------------------------------------
function parseRows(
  value: string,
  min: number,
  max: number,
  label: string,
  ctx: z.RefinementCtx,
) {
  const rows: string[][] = []
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line, index) => {
      const parts = line.split("|").map((part) => part.trim())
      if (
        parts.length < min ||
        parts.length > max ||
        parts.some((p, i) => i < min && !p)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `${label}: ${index + 1}. satır biçime uymuyor.`,
        })
        return
      }
      if (parts.some((p) => p.length > 300)) {
        ctx.addIssue({
          code: "custom",
          message: `${label}: ${index + 1}. satır çok uzun.`,
        })
        return
      }
      rows.push(parts)
    })
  return rows
}

export const attorneyFormSchema = z
  .object({
    fullName: required(2, 120, "Ad soyad"),
    slug: slugField,
    title: optional(120),
    summary: optional(1200),
    barAssociation: optional(120),
    barRegistrationNo: optional(40),
    photoPath: mediaPath,
    education: z.string().max(5000),
    experience: z.string().max(8000),
    practiceAreas: z.string().max(3000),
    mediatorRegistryNo: optional(40),
    mediatorSpecializations: z.string().max(1000),
    mediatorVerified: z.boolean(),
    sortOrder,
    published: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.mediatorVerified && !v.mediatorRegistryNo) {
      ctx.addIssue({
        code: "custom",
        path: ["mediatorRegistryNo"],
        message: "Teyitli işaretlemek için sicil numarası gerekir.",
      })
    }
  })
  .transform((v, ctx) => {
    const education = parseRows(v.education, 2, 3, "Eğitim", ctx).map((p) =>
      p.length === 3
        ? { year: p[0] || null, degree: p[1]!, institution: p[2]! }
        : { year: null, degree: p[0]!, institution: p[1]! },
    )
    const experience = parseRows(v.experience, 2, 4, "Mesleki geçmiş", ctx).map(
      (p) => ({
        period: p[0]!,
        role: p[1]!,
        organization: p[2] || null,
        description: p[3] || null,
      }),
    )
    const list = (value: string) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    return {
      full_name: v.fullName,
      slug:
        v.slug ||
        slugify(v.fullName.replace(/^((Av|Arb|Dr|Prof)\.\s*)+/giu, "")),
      title: v.title,
      summary: v.summary,
      bar_association: v.barAssociation,
      bar_registration_no: v.barRegistrationNo,
      photo_path: v.photoPath,
      education,
      experience,
      practice_areas: list(v.practiceAreas).slice(0, 30),
      mediator_registry_no: v.mediatorRegistryNo,
      mediator_specializations: list(v.mediatorSpecializations).slice(0, 20),
      mediator_verified: v.mediatorVerified,
      sort_order: v.sortOrder,
      published: v.published,
    }
  })

// ---------------------------------------------------------------------------
// Hukuki yayın
// ---------------------------------------------------------------------------
export const articleFormSchema = z
  .object({
    title: required(5, 200, "Başlık"),
    slug: slugField,
    excerpt: required(20, 500, "Özet"),
    body: required(50, 50000, "Metin"),
    category: optional(60),
    authorAttorneyId: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || z.uuid().safeParse(value).success,
        "Geçersiz yazar.",
      )
      .transform((value) => (value === "" ? null : value)),
    coverPath: mediaPath,
    status: z.enum(["draft", "published"], { error: "Durum seçin." }),
    publishedDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
        "Geçerli bir tarih girin.",
      ),
  })
  .transform((v) => ({
    title: v.title,
    slug: v.slug || slugify(v.title),
    excerpt: v.excerpt,
    body: v.body,
    category: v.category,
    author_attorney_id: v.authorAttorneyId,
    cover_path: v.coverPath,
    status: v.status,
    // Tarih Türkiye saatiyle gün başı; yayımlanıp tarih boşsa kayıt anı kullanılır.
    published_at: v.publishedDate
      ? `${v.publishedDate}T00:00:00+03:00`
      : v.status === "published"
        ? new Date().toISOString()
        : null,
  }))

// ---------------------------------------------------------------------------
// İletişim bilgileri (admin)
// ---------------------------------------------------------------------------
const phone = optional(30).refine(
  (value) => value === null || /^[+\d][\d\s()-]{6,29}$/.test(value),
  "Geçerli bir telefon numarası girin.",
)

export const contactSettingsSchema = z
  .object({
    address: optional(300),
    phone,
    mobile: phone,
    email: optional(254).refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Geçerli bir e-posta girin.",
    ),
    kep: optional(254),
    workingHours: optional(200),
    mapUrl: optional(2000).refine(
      (value) =>
        value === null ||
        /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|yandex\.com(\.tr)?\/maps|yandex\.com(\.tr)?\/harita)/.test(
          value,
        ),
      "Google Haritalar veya Yandex Haritalar bağlantısı (https) girin.",
    ),
    contactVerified: z.boolean(),
  })
  .transform((v) => ({
    address: v.address,
    phone: v.phone,
    mobile: v.mobile,
    email: v.email,
    kep: v.kep,
    working_hours: v.workingHours,
    map_url: v.mapUrl,
    contact_verified: v.contactVerified,
  }))

// ---------------------------------------------------------------------------
// SEO ve site ayarları (admin)
// ---------------------------------------------------------------------------
export const siteSettingsSchema = z
  .object({
    seoTitle: optional(70),
    seoDescription: optional(200),
    legalName: optional(200),
    barAssociation: optional(120),
    barRegistrationNo: optional(40),
    mediatorRegistryNo: optional(40),
    mediatorSpecializations: optional(300),
    foundedYear: optional(20),
    workingLanguages: optional(200),
    dataControllerName: optional(200),
    dataControllerAddress: optional(300),
    dataControllerEmail: optional(254).refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Geçerli bir e-posta girin.",
    ),
  })
  .transform((v) => ({
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
    legal_name: v.legalName,
    bar_association: v.barAssociation,
    bar_registration_no: v.barRegistrationNo,
    mediator_registry_no: v.mediatorRegistryNo,
    mediator_specializations: v.mediatorSpecializations,
    founded_year: v.foundedYear,
    working_languages: v.workingLanguages,
    data_controller_name: v.dataControllerName,
    data_controller_address: v.dataControllerAddress,
    data_controller_email: v.dataControllerEmail,
  }))

// ---------------------------------------------------------------------------
// Medya
// ---------------------------------------------------------------------------
export const mediaAltSchema = z.object({
  alt: required(3, 200, "Açıklama (alt metin)"),
})

export const uuidSchema = z.uuid()
