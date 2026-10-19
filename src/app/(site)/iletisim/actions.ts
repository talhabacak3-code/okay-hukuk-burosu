"use server"

import { headers } from "next/headers"

import { deliverContactMessage } from "@/lib/contact/delivery"
import { clientKey, consumeRateLimit } from "@/lib/contact/rate-limit"
import {
  contactFormSchema,
  type ContactActionState,
  type ContactField,
} from "@/lib/contact/schema"
import { checkSpam, HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/contact/spam"

const text = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

/**
 * Genel iletişim formu. Sıra: hız sınırı → spam kontrolü → Zod doğrulaması → gönderim.
 * Başarı yalnızca mesaj kalıcı olarak kaydedildiğinde döner; altyapı yapılandırılmamışsa
 * "unavailable" döner ve istemci hiçbir koşulda başarı göstermez.
 */
export async function submitContactForm(
  _previous: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const now = Date.now()
  const requestHeaders = await headers()
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"

  const limit = await consumeRateLimit(clientKey(ip), now)
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000))
    return {
      status: "rate-limited",
      message: `Kısa sürede çok fazla gönderim yapıldı. Lütfen yaklaşık ${minutes} dakika sonra tekrar deneyin veya telefonla ulaşın.`,
    }
  }

  // Eylem doğrudan (form dışından) bozuk gövdeyle çağrılırsa 500 yerine reddedilir.
  if (!(formData instanceof FormData)) {
    return {
      status: "rejected",
      message:
        "Gönderiminiz işlenemedi. Lütfen sayfayı yenileyip tekrar deneyin veya telefonla ulaşın.",
    }
  }

  const spam = checkSpam({
    honeypot: text(formData, HONEYPOT_FIELD),
    startedAt: text(formData, STARTED_AT_FIELD),
    message: text(formData, "message"),
    now,
  })
  if (spam.spam) {
    // Kişisel veri içermeyen kayıt: yalnızca ret nedeni.
    console.warn(`[iletisim] gönderim reddedildi: ${spam.reason}`)
    return {
      status: "rejected",
      message:
        "Gönderiminiz işlenemedi. Lütfen sayfayı yenileyip tekrar deneyin veya telefonla ulaşın.",
    }
  }

  const parsed = contactFormSchema.safeParse({
    fullName: text(formData, "fullName"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    message: text(formData, "message"),
    kvkkAcknowledged: formData.get("kvkkAcknowledged") === "on",
  })

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField | undefined
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return {
      status: "invalid",
      message: "Lütfen işaretli alanları düzeltin.",
      fieldErrors,
    }
  }

  const result = await deliverContactMessage(parsed.data)
  if (result.ok) return { status: "success" }

  if (result.reason === "not-configured") {
    return {
      status: "unavailable",
      message:
        "Çevrim içi form henüz etkin değil; mesajınız iletilmedi. Lütfen telefonla ulaşın.",
    }
  }

  return {
    status: "error",
    message:
      "Mesajınız şu anda iletilemedi. Lütfen daha sonra tekrar deneyin veya telefonla ulaşın.",
  }
}
