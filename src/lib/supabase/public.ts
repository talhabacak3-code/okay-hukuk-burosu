import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { getSupabasePublicEnvOrNull } from "@/lib/env"

/**
 * Oturumsuz (anon) okuma istemcisi — sitenin "use cache" kapsamındaki içerik okumaları
 * içindir. Çerez okumaz; yalnızca RLS'nin herkese açtığı (yayımlanmış) veriyi görür.
 */
export function createPublicClient() {
  const env = getSupabasePublicEnvOrNull()
  if (!env) return null
  return createSupabaseClient(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Storage 'media' kovasındaki bir dosyanın herkese açık adresi. */
export function mediaPublicUrl(path: string) {
  const env = getSupabasePublicEnvOrNull()
  if (!env) return null
  return `${env.url}/storage/v1/object/public/media/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`
}
