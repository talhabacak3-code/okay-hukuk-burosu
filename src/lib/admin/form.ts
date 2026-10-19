import type { ZodError } from "zod"

/**
 * Panel formlarının ortak durum tipi. `success` yalnızca veritabanı işlemi
 * hatasız tamamlandığında döner; bağlantı veya yetki hatasında asla başarı gösterilmez.
 */
export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error"
      message: string
      fieldErrors?: Record<string, string>
    }

export const idleState: FormState = { status: "idle" }

export function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".")
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}

export function invalid(error: ZodError): FormState {
  return {
    status: "error",
    message: "Lütfen işaretli alanları düzeltin.",
    fieldErrors: fieldErrorsFrom(error),
  }
}

type DbError = { code?: string | null; message?: string | null } | null

/**
 * Veritabanı/Storage hatasını kullanıcıya gösterilecek güvenli metne çevirir.
 * Ayrıntı (SQL, tablo adı) kullanıcıya gösterilmez; yalnızca kod sunucu günlüğüne yazılır.
 */
export function dbFailure(context: string, error: DbError): FormState {
  console.error(`[admin] ${context} başarısız:`, error?.code ?? "bilinmiyor")
  const code = error?.code ?? ""

  if (code === "23505") {
    return {
      status: "error",
      message:
        "Bu bağlantı adı (slug) zaten kullanılıyor. Lütfen farklı bir değer girin.",
      fieldErrors: { slug: "Bu değer zaten kullanılıyor." },
    }
  }
  if (code === "42501" || code === "PGRST301") {
    return { status: "error", message: "Bu işlem için yetkiniz yok." }
  }
  if (code === "23514" || code === "22001") {
    return {
      status: "error",
      message: "Girilen değerlerden biri izin verilen sınırların dışında.",
    }
  }
  if (code === "23503") {
    return {
      status: "error",
      message:
        "Bu kayıt başka bir kayıtla ilişkili olduğu için işlem yapılamadı.",
    }
  }
  return {
    status: "error",
    message:
      "İşlem tamamlanamadı; veritabanına ulaşılamadı veya beklenmeyen bir hata oluştu. Değişiklik kaydedilmedi.",
  }
}

/** FormData'dan metin alanı (yoksa boş dize). */
export function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

/** Boş/boşluk dizeyi null'a çevirir (veritabanında "girilmedi"). */
export function nullable(value: string) {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on"
}

/** Her satır bir öğe; boş satırlar atlanır. */
export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}
