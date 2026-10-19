import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabasePublicEnvOrNull } from "@/lib/env"
import { authCookieOptions } from "@/lib/supabase/cookies"

const LOGIN_PATH = "/admin/giris"

/**
 * Yalnızca /admin altında çalışır:
 * 1. Supabase oturum çerezlerini yeniler (Server Component'ler çerez yazamaz).
 * 2. Oturumu olmayan isteği giriş sayfasına yönlendirir (ilk savunma hattı).
 * 3. Panel yanıtlarına güvenlik başlıkları ekler.
 * Rol kontrolü burada DEĞİL, sunucu tarafında (requireStaff) ve veritabanında (RLS) yapılır.
 */
export async function proxy(request: NextRequest) {
  const env = getSupabasePublicEnvOrNull()
  let response = NextResponse.next({ request })

  if (env) {
    const supabase = createServerClient(env.url, env.publishableKey, {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, {
              ...options,
              ...authCookieOptions,
            })
          }
        },
      },
    })

    // getClaims: JWT imzasını doğrular (yalnızca çerezdeki veriye güvenmez).
    let authenticated = false
    try {
      const { data } = await supabase.auth.getClaims()
      authenticated = Boolean(data?.claims?.sub)
    } catch {
      authenticated = false
    }

    const path = request.nextUrl.pathname
    const isLogin = path === LOGIN_PATH

    if (!authenticated && !isLogin) {
      const url = request.nextUrl.clone()
      url.pathname = LOGIN_PATH
      url.search = ""
      if (path !== "/admin") url.searchParams.set("next", path)
      response = NextResponse.redirect(url)
    }
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "same-origin")
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
