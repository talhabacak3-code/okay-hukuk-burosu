import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { ContactFormData } from "@/lib/contact/schema"
import { getSupabaseServiceEnv } from "@/lib/env.server"

export type DeliveryResult =
  { ok: true } | { ok: false; reason: "not-configured" | "failed" }

/** Gönderim altyapısı yapılandırılmış mı (sayfada "önizleme" uyarısı için). */
export function isContactDeliveryConfigured() {
  return getSupabaseServiceEnv() !== null
}

/**
 * Mesajı kalıcı olarak kaydeder. Yapılandırma yoksa veya kayıt başarısızsa `ok: false`
 * döner — çağıran taraf bu durumda kesinlikle başarı mesajı göstermez.
 *
 * Hedef: `public.contact_messages` (bkz. supabase/migrations — TASLAK, henüz uygulanmadı).
 * Sunucu anahtarı RLS'yi atlar; anahtar yalnızca sunucuda bulunur.
 * Günlüklere kişisel veri yazılmaz.
 */
export async function deliverContactMessage(
  data: ContactFormData,
): Promise<DeliveryResult> {
  const env = getSupabaseServiceEnv()
  if (!env) return { ok: false, reason: "not-configured" }

  try {
    const supabase = createClient(env.url, env.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await supabase.from("contact_messages").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone === "" ? null : data.phone,
      message: data.message,
      kvkk_acknowledged_at: new Date().toISOString(),
    })
    if (error) {
      console.error("[iletisim] kayıt başarısız:", error.code)
      return { ok: false, reason: "failed" }
    }
    return { ok: true }
  } catch {
    console.error("[iletisim] gönderim altyapısına ulaşılamadı")
    return { ok: false, reason: "failed" }
  }
}
