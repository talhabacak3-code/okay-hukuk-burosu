import Link from "next/link"
import { Suspense } from "react"
import { ExternalLink, LogOut } from "lucide-react"

import { signOut } from "@/app/admin/giris/actions"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"
import { AdminNav } from "@/components/admin/admin-nav"
import { ConfigMissing } from "@/components/admin/config-missing"
import { visibleNavigation } from "@/components/admin/nav-config"
import { LogoPlaque } from "@/components/brand/logo-plaque"
import { requireStaff, type StaffUser } from "@/lib/admin/auth"
import { isSupabaseConfigured } from "@/lib/env"

/**
 * Panel kabuğu. Oturum isteğe özgü olduğundan tüm kabuk <Suspense> içinde, istek anında
 * render edilir. Erişim: proxy (oturum) → requireStaff (rol) → RLS (veritabanı).
 */
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured()) return <ConfigMissing />

  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PanelFrame>{children}</PanelFrame>
    </Suspense>
  )
}

async function PanelFrame({ children }: { children: React.ReactNode }) {
  const user = await requireStaff()
  const groups = visibleNavigation(user.role)

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <a
        href="#panel-icerik"
        className="fixed top-3 left-3 z-[60] -translate-y-24 bg-navy-950 px-4 py-3 text-sm font-medium text-paper transition-transform focus-visible:translate-y-0"
      >
        İçeriğe geç
      </a>

      {/* Mobil üst çubuk */}
      <header className="surface-navy sticky top-0 z-30 flex h-16 items-center justify-between px-5 lg:hidden">
        <span className="font-sans text-xs font-medium tracking-[0.16em] uppercase">
          OKAY · Yönetim paneli
        </span>
        <AdminMobileNav groups={groups} footer={<UserBlock user={user} />} />
      </header>

      {/* Masaüstü yan menü */}
      <aside className="surface-navy hidden w-72 shrink-0 flex-col lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="px-5 pt-6 pb-4">
          <LogoPlaque
            sizes="160px"
            logoClassName="h-12 sm:h-12 lg:h-12"
            className="p-1"
          />
          <p className="mt-4 font-sans text-[0.6875rem] font-medium tracking-[0.16em] text-paper/60 uppercase">
            Yönetim paneli
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <AdminNav groups={groups} />
        </div>
        <div className="border-t border-border p-4">
          <UserBlock user={user} />
        </div>
      </aside>

      <main
        id="panel-icerik"
        tabIndex={-1}
        className="min-w-0 flex-1 outline-none"
      >
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          {children}
        </div>
      </main>
    </div>
  )
}

function UserBlock({ user }: { user: StaffUser }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="truncate font-medium text-paper">
          {user.displayName ?? user.email ?? "Panel kullanıcısı"}
        </p>
        <p className="mt-0.5 text-xs text-paper/60">
          {user.role === "admin" ? "Yönetici" : "Editör"}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link
          href="/"
          target="_blank"
          className="inline-flex min-h-11 items-center gap-1.5 text-paper/75 hover:text-paper"
        >
          <ExternalLink
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.5}
          />
          Siteyi aç
          <span className="sr-only">(yeni sekmede)</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 text-paper/75 hover:text-paper"
          >
            <LogOut aria-hidden="true" className="size-4" strokeWidth={1.5} />
            Çıkış yap
          </button>
        </form>
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="flex flex-1" aria-busy="true" aria-live="polite">
      <div className="surface-navy hidden w-72 lg:block" />
      <div className="flex-1 p-12">
        <p className="text-sm text-muted-foreground">Oturum doğrulanıyor…</p>
      </div>
    </div>
  )
}
