"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { DARK_HERO_ID, DARK_HERO_PATHS } from "@/config/header"
import { cn } from "@/lib/utils"

type FrameProps = {
  children: React.ReactNode
  scrolled?: boolean
  overDarkHero?: boolean
  ref?: React.Ref<HTMLElement>
}

/**
 * Başlık çerçevesi. Kaydırıldığında ince çizgi + hafif gölge alır; logo `[data-scrolled]`
 * üzerinden biraz küçülür. Yükseklik sabit kalır (layout kayması yok).
 * `data-theme="dark"`: koyu hero üzerindeyken renkler tersine döner (bkz. globals.css).
 */
export function HeaderFrame({
  children,
  scrolled = false,
  overDarkHero = false,
  ref,
}: FrameProps) {
  return (
    <header
      ref={ref}
      data-scrolled={scrolled ? "" : undefined}
      data-theme={overDarkHero ? "dark" : undefined}
      className={cn(
        "site-header sticky top-0 z-40 border-b bg-paper text-foreground transition-[background-color,color,border-color,box-shadow] duration-500 ease-editorial",
        scrolled
          ? "border-border shadow-[0_1px_0_0_rgb(16_28_48/0.02),0_8px_24px_-16px_rgb(16_28_48/0.25)]"
          : "border-transparent",
      )}
    >
      {children}
    </header>
  )
}

/** Yol ve kaydırma durumunu izleyen başlık. Layout içinde <Suspense> ile sarılır. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hasDarkHero = DARK_HERO_PATHS.has(pathname)
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8)
      if (!hasDarkHero) return
      const hero = document.getElementById(DARK_HERO_ID)
      const headerHeight = headerRef.current?.offsetHeight ?? 0
      setPastHero(
        hero ? hero.getBoundingClientRect().bottom <= headerHeight : true,
      )
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [hasDarkHero, pathname])

  const overDarkHero = hasDarkHero && !pastHero

  return (
    <HeaderFrame
      ref={headerRef}
      scrolled={scrolled && !overDarkHero}
      overDarkHero={overDarkHero}
    >
      {children}
    </HeaderFrame>
  )
}
