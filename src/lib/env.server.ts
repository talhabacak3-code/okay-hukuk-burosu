import "server-only"

import { z } from "zod"

/**
 * Yalnızca sunucu tarafı ortam değişkenleri. Bu dosya istemci paketine giremez
 * (`server-only`). Gizli anahtarlar asla NEXT_PUBLIC_ önekiyle tanımlanmaz.
 */

const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value.trim() === "" ? undefined : value

const supabaseServiceSchema = z.object({
  url: z.url(),
  secretKey: z.string().min(1),
})

/**
 * İletişim formu gönderimleri için Supabase (sunucu) yapılandırması.
 * Değişkenler eksikse `null` döner; form bu durumda "çevrim dışı" yanıtı verir ve
 * hiçbir koşulda başarılı gönderim göstermez.
 */
export function getSupabaseServiceEnv() {
  const result = supabaseServiceSchema.safeParse({
    url: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
    secretKey: emptyToUndefined(process.env.SUPABASE_SECRET_KEY),
  })
  return result.success ? result.data : null
}
