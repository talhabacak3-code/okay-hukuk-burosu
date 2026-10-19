import { z } from "zod"

/**
 * Ortam değişkenleri tek noktadan, zod ile doğrulanır.
 * NEXT_PUBLIC_* değişkenleri derleme sırasında gömülebilmesi için
 * `process.env.X` biçiminde açıkça okunur.
 */

const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value.trim() === "" ? undefined : value

const publicEnvSchema = z.object({
  siteUrl: z.url().default("http://localhost:3000"),
  indexable: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
})

/** Statik dışa aktarımda alt yol (GitHub Pages: /depo-adi); normal yayında boş. */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "")
  .trim()
  .replace(/\/$/, "")

export const publicEnv = publicEnvSchema.parse({
  siteUrl: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  indexable: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_INDEXABLE),
})

/**
 * Site içi yolu mutlak adrese çevirir. NEXT_PUBLIC_SITE_URL bir alt yol içerebilir
 * (ör. https://kullanici.github.io/depo); new URL("/x", taban) bu yolu silerdi.
 */
export function absoluteUrl(path: string) {
  const base = publicEnv.siteUrl.replace(/\/$/, "")
  return base + (path.startsWith("/") ? path : `/${path}`)
}

const supabasePublicSchema = z.object({
  url: z.url(),
  publishableKey: z.string().min(1),
})

/**
 * Supabase bu aşamada kullanılmıyor; değişkenler yalnızca bir client
 * oluşturulduğunda doğrulanır. Böylece build, Supabase yapılandırılmadan da geçer.
 */
export function getSupabasePublicEnv() {
  const result = supabasePublicSchema.safeParse({
    url: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  })

  if (!result.success) {
    throw new Error(
      "Supabase ortam değişkenleri eksik veya hatalı: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY değerlerini .env.local dosyasına ekleyin (.env.example'a bakın).",
    )
  }

  return result.data
}

/**
 * Supabase yapılandırılmamışsa `null`. Yönetim paneli ve içerik okuma bu sürümü kullanır:
 * yapılandırma yoksa panel "bağlantı yok" ekranı gösterir, site yerel varsayılanlara döner.
 */
export function getSupabasePublicEnvOrNull() {
  const result = supabasePublicSchema.safeParse({
    url: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  })
  return result.success ? result.data : null
}

export function isSupabaseConfigured() {
  return getSupabasePublicEnvOrNull() !== null
}
