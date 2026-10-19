"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { FormState } from "@/lib/admin/form"
import { fieldErrorsFrom } from "@/lib/admin/form"
import {
  clearLoginFailures,
  isLoginBlocked,
  loginKey,
  recordLoginFailure,
} from "@/lib/admin/login-rate-limit"
import { createClient } from "@/lib/supabase/server"

const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifrenizi girin.").max(200),
})

/** Yalnızca /admin altındaki göreli yollara dönülür (açık yönlendirme engeli). */
function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/admin"
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin"
  if (value.startsWith("/admin/giris")) return "/admin"
  return value
}

const GENERIC_FAILURE = "E-posta veya şifre hatalı."

export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Eylem doğrudan bozuk gövdeyle çağrılırsa 500 yerine doğrulama hatası döner.
  if (!(formData instanceof FormData)) {
    return { status: "error", message: "Lütfen alanları kontrol edin." }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Lütfen alanları kontrol edin.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "error",
      message:
        "Kimlik doğrulama yapılandırılmadı (Supabase bağlantısı yok). Giriş yapılamaz.",
    }
  }

  const requestHeaders = await headers()
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  const key = loginKey(ip, parsed.data.email)
  const now = Date.now()

  if (await isLoginBlocked(key, now)) {
    return {
      status: "error",
      message:
        "Çok sayıda başarısız deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
    }
  }

  let signInError: { status?: number; code?: string; name?: string } | null =
    null
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data)
    signInError = error
  } catch {
    console.error("[admin] giriş: kimlik doğrulama sunucusuna ulaşılamadı")
    return {
      status: "error",
      message:
        "Kimlik doğrulama sunucusuna ulaşılamadı. Lütfen daha sonra tekrar deneyin.",
    }
  }

  if (signInError) {
    // Hesap var/yok bilgisi sızdırılmaz: tüm kimlik hataları aynı mesajı alır.
    // Ağ hatasında Supabase durum kodu 0 (AuthRetryableFetchError) döndürür.
    if (
      !signInError.status ||
      signInError.status >= 500 ||
      signInError.name === "AuthRetryableFetchError"
    ) {
      console.error("[admin] giriş: sunucu hatası", signInError.code ?? "")
      return {
        status: "error",
        message:
          "Kimlik doğrulama sunucusuna ulaşılamadı. Lütfen daha sonra tekrar deneyin.",
      }
    }
    await recordLoginFailure(key, now)
    return { status: "error", message: GENERIC_FAILURE }
  }

  // Kimlik doğru; panel personeli mi?
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const { data: staff } = userId
    ? await supabase
        .from("staff")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null }

  if (!staff) {
    await supabase.auth.signOut()
    await recordLoginFailure(key, now)
    return {
      status: "error",
      message: "Bu hesabın yönetim paneline erişim yetkisi yok.",
    }
  }

  await clearLoginFailures(key)
  redirect(safeNext(formData.get("next")))
}

export async function signOut() {
  const supabase = await createClient()
  if (supabase) await supabase.auth.signOut()
  redirect("/admin/giris")
}
