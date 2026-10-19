import "server-only"

import { createHash } from "node:crypto"

import { createRateLimiter } from "@/lib/rate-limit"

/**
 * İletişim formu hız sınırı: aynı istemciden 10 dakikada en fazla 3 gönderim.
 * IP adresi saklanmaz; yalnızca tek yönlü özeti pencere süresince tutulur.
 *
 * Sayaç Supabase'te paylaşılır (tüm sunucu örnekleri aynı sınırı görür); Supabase
 * yapılandırılmamışsa veya ulaşılamazsa bellek içi sayaca döner (bkz. lib/rate-limit.ts).
 */
const limiter = createRateLimiter({
  name: "iletisim",
  windowMs: 10 * 60 * 1000,
  max: 3,
})

export function clientKey(ip: string) {
  return createHash("sha256").update(`okay-contact:${ip}`).digest("hex")
}

export function consumeRateLimit(key: string, now: number) {
  return limiter.consume(key, now)
}
