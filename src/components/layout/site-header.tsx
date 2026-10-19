import Link from "next/link"
import { Suspense } from "react"

import { Logo } from "@/components/brand/logo"
import { ActiveNavList } from "@/components/layout/active-nav-list"
import { HeaderFrame, HeaderShell } from "@/components/layout/header-shell"
import { MobileNav } from "@/components/layout/mobile-nav"
import { NavList } from "@/components/layout/nav-list"
import { Container } from "@/components/primitives/container"
import { siteConfig } from "@/config/site"

export function SiteHeader() {
  const content = (
    <Container className="flex h-[4.5rem] items-center justify-between gap-6 md:h-20 lg:h-24">
      <Link
        href="/"
        aria-label={`${siteConfig.name} — Ana sayfa`}
        className="site-header-logo -ml-1 inline-flex shrink-0 items-center p-1"
      >
        {/* Oran 1361×503: 44px → ~119px, 52px → ~141px, 64px → ~173px genişlik */}
        <Logo
          decorative
          eager
          sizes="(min-width: 1024px) 173px, (min-width: 768px) 141px, 119px"
          className="h-11 transition-transform duration-500 ease-editorial md:h-[3.25rem] lg:h-16 [[data-scrolled]_&]:scale-[0.92]"
        />
      </Link>

      <nav aria-label="Ana menü" className="hidden lg:block">
        {/* usePathname, dinamik parametreli rotalarda askıya alınabilir; geri dönüş aktif durumsuz menüdür. */}
        <Suspense fallback={<NavList pathname={null} />}>
          <ActiveNavList />
        </Suspense>
      </nav>

      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </Container>
  )

  return (
    // Yol bilinmeden (askıya alma) render edilirse açık temalı statik çerçeve gösterilir.
    <Suspense fallback={<HeaderFrame>{content}</HeaderFrame>}>
      <HeaderShell>{content}</HeaderShell>
    </Suspense>
  )
}
