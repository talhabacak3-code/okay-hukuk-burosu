/**
 * Basit, çerezsiz spam önlemleri (ziyaretçiye ek adım yüklemez):
 * - Bal küpü (honeypot): görünmeyen "website" alanı doluysa bot kabul edilir.
 * - Süre kontrolü: form, açıldıktan çok kısa süre sonra gönderilemez.
 * - Bağlantı sınırı: mesajda çok sayıda URL varsa reddedilir.
 * Reddedilen gönderimlerde bota ayrıntı verilmez.
 */

export const HONEYPOT_FIELD = "website"
export const STARTED_AT_FIELD = "startedAt"

const MIN_FILL_MS = 3_000
const MAX_FILL_MS = 2 * 60 * 60 * 1000
const MAX_LINKS = 2

export type SpamVerdict = { spam: false } | { spam: true; reason: string }

export function checkSpam(input: {
  honeypot: string
  startedAt: string
  message: string
  now: number
}): SpamVerdict {
  if (input.honeypot.trim() !== "") return { spam: true, reason: "honeypot" }

  const started = Number(input.startedAt)
  if (!Number.isFinite(started) || started <= 0) {
    return { spam: true, reason: "missing-timestamp" }
  }
  const elapsed = input.now - started
  if (elapsed < MIN_FILL_MS) return { spam: true, reason: "too-fast" }
  if (elapsed > MAX_FILL_MS) return { spam: true, reason: "stale" }

  const links = input.message.match(/https?:\/\/|www\./gi)?.length ?? 0
  if (links > MAX_LINKS) return { spam: true, reason: "links" }

  return { spam: false }
}
