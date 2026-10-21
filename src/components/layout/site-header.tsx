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
        {/* Boyut font-size ile: amblem 2.75em → ~47 / 52 / 60px yükseklik. */}
        <Logo
          decorative
          className="origin-left text-[17px] transition-transform duration-500 ease-editorial md:text-[19px] lg:text-[22px] [[data-scrolled]_&]:scale-[0.92]"
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
