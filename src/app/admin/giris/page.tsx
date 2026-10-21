import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { LoginForm } from "@/app/admin/giris/login-form"
import { Logo } from "@/components/brand/logo"
import { isSupabaseConfigured } from "@/lib/env"

export const metadata: Metadata = { title: "Giriş" }

/**
 * Panel girişi. Kayıt (sign-up) yoktur: panel kullanıcıları yalnızca Supabase'te
 * oluşturulur ve staff tablosuna rolüyle eklenir.
 */
export default function LoginPage() {
  const configured = isSupabaseConfigured()

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="surface-ink flex flex-col justify-between gap-12 px-6 py-10 sm:px-12 lg:py-16">
        <Logo className="self-start text-[17px] text-paper sm:text-[19px]" />
        <div>
          <p className="tagline-rule-start eyebrow text-stone">
            Yönetim paneli
          </p>
          <p className="mt-5 max-w-sm text-h3 text-paper">
            İçerik, avukat profilleri ve iletişim bilgilerini buradan
            güncelleyin.
          </p>
        </div>
        <p className="text-xs text-paper/60">
          Yalnızca yetkilendirilmiş büro personeli içindir.
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <h1 className="text-h2">Giriş</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Panel hesabınızın e-posta adresi ve şifresiyle giriş yapın.
          </p>
          <div className="mt-10">
            <Suspense fallback={null}>
              <LoginForm configured={configured} />
            </Suspense>
          </div>
          <p className="mt-10 text-sm">
            <Link
              href="/"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ← Siteye dön
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
