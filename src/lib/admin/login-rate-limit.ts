import "server-only"

import { createHash } from "node:crypto"

import { createRateLimiter } from "@/lib/rate-limit"

/**
 * Giriş denemesi sınırı: aynı IP + e-posta için 15 dakikada en fazla 5 başarısız deneme.
 * Supabase Auth'un kendi sınırlarına ek bir katmandır. Yalnızca IP + e-posta özeti saklanır.
 *
 * Sayaç Supabase'te paylaşılır (sunucu anahtarıyla, yalnızca bu server-only modülden;
 * panelin geri kalanı kullanıcının kendi oturumuyla çalışır). Supabase yapılandırılmamışsa
 * veya ulaşılamazsa bellek içi sayaca döner (bkz. lib/rate-limit.ts).
 */
const limiter = createRateLimiter({
  name: "giris",
  windowMs: 15 * 60 * 1000,
  max: 5,
})

export function loginKey(ip: string, email: string) {
  return createHash("sha256")
    .update(`okay-login:${ip}:${email.toLowerCase()}`)
    .digest("hex")
}

export async function isLoginBlocked(key: string, now: number) {
  return !(await limiter.peek(key, now)).allowed
}

export async function recordLoginFailure(key: string, now: number) {
  await limiter.consume(key, now)
}

export function clearLoginFailures(key: string) {
  return limiter.clear(key)
}
