const tables: Record<string, string> = {
  attorneys: "Avukat profili",
  articles: "Yayın",
  practice_areas: "Faaliyet alanı",
  pages: "Sayfa metni",
  site_settings: "Site ayarları",
  media: "Medya",
  contact_messages: "İletişim mesajı",
}

export function tableLabel(table: string) {
  return tables[table] ?? table
}

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
})

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso))
}

/** "2026-10-18T00:00:00+03:00" → "2026-10-18" (Türkiye saatiyle; date input için). */
export function toDateInput(iso: string | null) {
  if (!iso) return ""
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso))
  return parts
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
