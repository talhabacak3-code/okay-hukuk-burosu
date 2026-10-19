import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabasePublicEnvOrNull } from "@/lib/env"
import { authCookieOptions } from "@/lib/supabase/cookies"

/**
 * Oturumlu sunucu istemcisi (Server Component / Server Action). Kullanıcının kendi
 * oturumuyla çalışır; tüm yetkilendirme RLS ile veritabanında uygulanır.
 * Supabase yapılandırılmamışsa `null` döner.
 * Not: cookies() okuduğu için çağıran bileşen istek anında render edilir (<Suspense> içinde).
 */
export async function createClient() {
  const env = getSupabasePublicEnvOrNull()
  if (!env) return null
  const cookieStore = await cookies()

  return createServerClient(env.url, env.publishableKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, { ...options, ...authCookieOptions })
          }
        } catch {
          // Server Component içinden çağrıldığında cookie yazılamaz;
          // oturum yenileme proxy.ts üzerinden yapılır.
        }
      },
    },
  })
}
