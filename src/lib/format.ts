const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
})

/** "2026-01-15" → "15 Ocak 2026". Verilen tarihten üretilir; anlık saat kullanılmaz. */
export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate))
}

/** "Av. Ad İkinci Soyad" → "AS": ilk ve son ismin baş harfleri (Türkçe büyük harf kurallarıyla). */
export function initials(fullName: string) {
  const parts = fullName
    .replace(/^((Av|Arb|Dr|Prof)\.\s*)+/giu, "")
    .split(/\s+/)
    .filter(Boolean)
  const picked = parts.length > 1 ? [parts[0], parts.at(-1)] : parts
  return picked
    .map((part) => (part ?? "").charAt(0).toLocaleUpperCase("tr-TR"))
    .join("")
}
