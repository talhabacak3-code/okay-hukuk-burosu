import { z } from "zod"

// CSP 'unsafe-eval' içermez: Zod'un JIT derlemesi (new Function) kapatılır. Aksi halde
// Zod eval desteğini denerken tarayıcı CSP ihlali raporlar. Şemalar oluşturulmadan
// önce çalışmalıdır; bu modül tarayıcıda Zod kullanan tek giriş noktasıdır.
z.config({ jitless: true })

/**
 * Genel iletişim formu — istemci (React Hook Form) ve sunucu (Server Action) aynı şemayı
 * kullanır. Veri minimizasyonu: yalnızca ad soyad, e-posta, isteğe bağlı telefon ve
 * genel mesaj. Kimlik numarası, dava ayrıntısı veya özel nitelikli veri istenmez.
 */

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 2000

/** T.C. kimlik numarası algoritmasına uyan 11 haneli dizi. */
function containsTurkishId(text: string) {
  const candidates = text.match(/(?<!\d)[1-9]\d{10}(?!\d)/g) ?? []
  return candidates.some((value) => {
    const d = value.split("").map(Number)
    const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!
    const even = d[1]! + d[3]! + d[5]! + d[7]!
    const tenth = (((odd * 7 - even) % 10) + 10) % 10
    const eleventh = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10
    return tenth === d[9] && eleventh === d[10]
  })
}

const phonePattern = /^[+\d][\d\s()-]{8,19}$/

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Lütfen adınızı ve soyadınızı yazın.")
    .max(100, "Ad soyad en fazla 100 karakter olabilir."),
  email: z
    .string()
    .trim()
    .min(1, "Lütfen e-posta adresinizi yazın.")
    .pipe(z.email("Geçerli bir e-posta adresi yazın.")),
  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (phonePattern.test(value) &&
          value.replace(/\D/g, "").length >= 10 &&
          value.replace(/\D/g, "").length <= 15),
      "Geçerli bir telefon numarası yazın veya alanı boş bırakın.",
    ),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Mesajınız en az ${MESSAGE_MIN} karakter olmalıdır.`)
    .max(MESSAGE_MAX, `Mesajınız en fazla ${MESSAGE_MAX} karakter olabilir.`)
    .refine(
      (value) => !containsTurkishId(value),
      "Lütfen mesajınıza T.C. kimlik numarası yazmayın.",
    ),
  /** Açık rıza değildir; yalnızca aydınlatma metninin okunduğunu belirtir. */
  kvkkAcknowledged: z
    .boolean()
    .refine(
      (value) => value,
      "Devam etmek için aydınlatma metnini okuduğunuzu işaretleyin.",
    ),
})

export type ContactFormValues = z.input<typeof contactFormSchema>
export type ContactFormData = z.output<typeof contactFormSchema>
export type ContactField = keyof ContactFormValues

/** Sunucu yanıtı — istemci yalnızca `success` durumunda başarı gösterir. */
export type ContactActionState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "invalid"
      message: string
      fieldErrors: Partial<Record<ContactField, string>>
    }
  | { status: "rate-limited"; message: string }
  | { status: "rejected"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string }
