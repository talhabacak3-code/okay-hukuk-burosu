import { z } from "zod"

/**
 * Avukat profili veri modeli. Yönetim panelinden (sonraki aşama, Supabase) doldurulacak
 * alanların tek kaynağıdır; panel formu da bu şemayla doğrulanacaktır.
 *
 * İÇERİK BÜTÜNLÜĞÜ: Ad soyad dışındaki tüm alanlar boş bırakılabilir. Boş (null / [])
 * alanlar sitede açıkça "Eklenecek" olarak gösterilir; hiçbir alan tahminle doldurulmaz.
 * Arabuluculuk bilgisi yalnızca `verified: true` ise (Arabulucular Sicili'nden teyit
 * edilmişse) yayımlanır.
 */

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .default(null)

export const educationSchema = z.object({
  /** Ör. "Hukuk Fakültesi (Lisans)" */
  degree: z.string().trim().min(1),
  institution: z.string().trim().min(1),
  /** Mezuniyet yılı veya dönem; bilinmiyorsa boş. */
  year: nullableText,
})

export const experienceSchema = z.object({
  /** Ör. "2018 – günümüz" */
  period: z.string().trim().min(1),
  role: z.string().trim().min(1),
  organization: nullableText,
  description: nullableText,
})

export const mediatorSchema = z.object({
  registryNo: z.string().trim().min(1),
  specializations: z.array(z.string().trim().min(1)).default([]),
  /** Sicil kaydı teyit edilmeden bilgi yayımlanmaz. */
  verified: z.boolean().default(false),
})

export const attorneySchema = z.object({
  /** URL kısmı: küçük harf, ASCII, tire (ör. "ad-soyad"). */
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug yalnızca a-z, 0-9 ve tire içerebilir.",
    ),
  fullName: z.string().trim().min(2),
  /** Mesleki unvan, ör. "Avukat" veya "Avukat, Arabulucu". */
  title: nullableText,
  /** Kısa mesleki özet; başarı/üstünlük iddiası içermez. */
  summary: nullableText,
  barAssociation: nullableText,
  barRegistrationNo: nullableText,
  photo: z
    .object({
      src: z.string().min(1),
      alt: z.string().trim().min(1),
    })
    .nullable()
    .default(null),
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  practiceAreas: z.array(z.string().trim().min(1)).default([]),
  mediator: mediatorSchema.nullable().default(null),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(false),
})

export type AttorneyInput = z.input<typeof attorneySchema>
export type Attorney = z.output<typeof attorneySchema>
export type Education = z.output<typeof educationSchema>
export type Experience = z.output<typeof experienceSchema>

/** Yayımlanabilir arabuluculuk bilgisi: yalnızca teyitli sicil kaydı. */
export function verifiedMediator(attorney: Attorney) {
  return attorney.mediator?.verified ? attorney.mediator : null
}
