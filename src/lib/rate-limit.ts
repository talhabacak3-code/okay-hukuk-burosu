import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import { getSupabaseServiceEnv } from "@/lib/env.server"

/**
 * Kayan pencereli hız sınırı. Sayaçlar Supabase Postgres'te paylaşılır
 * (`public.consume_rate_limit` — bkz. supabase/migrations/20261019000000_rate_limits.sql),
 * böylece sunucusuz dağıtımda tüm örnekler aynı sınırı görür.
 *
 * Geri dönüş: SUPABASE_SECRET_KEY / URL tanımlı değilse veya paylaşılan sayaca
 * ulaşılamazsa (ağ hatası, migration uygulanmamış, zaman aşımı) bellek içi sayaç
 * kullanılır — tek süreçte geçerlidir. Günlüğe yalnızca hata kodu yazılır.
 *
 * Anahtar her zaman çağıranın ürettiği SHA-256 özetidir (64 hex); ham IP veya e-posta
 * ne bellekte ne veritabanında tutulur.
 */

export type RateLimitDecision =
  { allowed: true } | { allowed: false; retryAfterMs: number }

type Policy = {
  /** Günlüklerde görünen ad (kişisel veri içermez). */
  name: string
  windowMs: number
  max: number
}

const MAX_MEMORY_KEYS = 5_000
const RPC_TIMEOUT_MS = 3_000

function createMemoryCounter({ windowMs, max }: Policy) {
  const hits = new Map<string, number[]>()

  return {
    check(key: string, now: number, consume: boolean): RateLimitDecision {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

      if (recent.length >= max) {
        hits.set(key, recent)
        return { allowed: false, retryAfterMs: windowMs - (now - recent[0]!) }
      }

      if (consume) recent.push(now)
      if (recent.length > 0) hits.set(key, recent)
      else hits.delete(key)

      // Bellek koruması: en eski anahtarları at.
      if (hits.size > MAX_MEMORY_KEYS) {
        const oldest = hits.keys().next().value
        if (oldest) hits.delete(oldest)
      }

      return { allowed: true }
    },
    clear(key: string) {
      hits.delete(key)
    },
  }
}

const rpcResultSchema = z.object({
  allowed: z.boolean(),
  retry_after_ms: z.number().nonnegative(),
})

let cachedClient: { url: string; key: string; client: SupabaseClient } | null =
  null

/** Paylaşılan sayaç için sunucu istemcisi; yapılandırma yoksa `null`. */
function sharedClient() {
  const env = getSupabaseServiceEnv()
  if (!env) return null
  if (cachedClient?.url !== env.url || cachedClient.key !== env.secretKey) {
    cachedClient = {
      url: env.url,
      key: env.secretKey,
      client: createClient(env.url, env.secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    }
  }
  return cachedClient.client
}

export function createRateLimiter(policy: Policy) {
  const memory = createMemoryCounter(policy)
  const windowSeconds = Math.ceil(policy.windowMs / 1000)

  const warn = (code: string) =>
    console.error(
      `[hiz-siniri] ${policy.name}: paylaşılan sayaç kullanılamadı (${code}); bellek içi sayaca dönüldü`,
    )

  async function check(
    key: string,
    now: number,
    consume: boolean,
  ): Promise<RateLimitDecision> {
    const client = sharedClient()
    if (!client) return memory.check(key, now, consume)

    try {
      const { data, error } = await client
        .rpc("consume_rate_limit", {
          p_key: key,
          p_window_seconds: windowSeconds,
          p_max: policy.max,
          p_consume: consume,
        })
        .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS))
      if (error) {
        warn(error.code || "rpc")
        return memory.check(key, now, consume)
      }
      const parsed = rpcResultSchema.safeParse(data)
      if (!parsed.success) {
        warn("yanit")
        return memory.check(key, now, consume)
      }
      return parsed.data.allowed
        ? { allowed: true }
        : { allowed: false, retryAfterMs: parsed.data.retry_after_ms }
    } catch {
      warn("ag")
      return memory.check(key, now, consume)
    }
  }

  return {
    /** Sınır dolmamışsa bir deneme kaydeder. */
    consume: (key: string, now: number) => check(key, now, true),
    /** Yalnızca durumu okur; deneme kaydetmez. */
    peek: (key: string, now: number) => check(key, now, false),
    /** Anahtarın sayacını sıfırlar (paylaşılan ve bellek içi). */
    async clear(key: string) {
      memory.clear(key)
      const client = sharedClient()
      if (!client) return
      try {
        const { error } = await client
          .rpc("clear_rate_limit", { p_key: key })
          .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS))
        if (error) warn(error.code || "rpc")
      } catch {
        warn("ag")
      }
    },
  }
}
