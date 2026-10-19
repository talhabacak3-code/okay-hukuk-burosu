"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { isActivePath, legalNavigation, mainNavigation } from "@/config/routes"
import { cn } from "@/lib/utils"

/**
 * Mobil/tablet menü — Radix Dialog tabanlı Sheet: odak tuzağı, Esc ile kapanma ve
 * kapanınca odağın tetikleyici düğmeye dönmesi yerleşik gelir. Panel açık zeminlidir;
 * böylece logo kendi renkleriyle okunur.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="-mr-2 inline-flex h-11 items-center gap-2 px-2 text-sm font-medium lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
          Menü
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-full gap-0 border-none bg-paper p-0 data-[side=right]:w-full sm:data-[side=right]:max-w-md sm:data-[side=right]:border-l sm:data-[side=right]:border-border"
      >
        <SheetTitle className="sr-only">Menü</SheetTitle>
        <div className="flex h-[4.5rem] items-center justify-between border-b border-border px-5 sm:px-8 md:h-20">
          <Logo decorative sizes="119px" className="h-11" />
          <SheetClose asChild>
            <button
              type="button"
              className="-mr-2 inline-flex h-11 items-center gap-2 px-2 text-sm font-medium"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
              Kapat
            </button>
          </SheetClose>
        </div>

        <nav
          aria-label="Mobil ana menü"
          className="flex-1 overflow-y-auto px-5 pt-6 sm:px-8"
        >
          <ol>
            {mainNavigation.map((item, index) => {
              const active = isActivePath(pathname, item.href)
              return (
                <li key={item.href} className="border-b border-border">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onNavigate={() => setOpen(false)}
                    className="group flex min-h-16 items-baseline gap-5 py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="w-6 shrink-0 eyebrow text-champagne-deep tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-serif text-[1.75rem] leading-tight transition-transform duration-500 ease-editorial group-hover:translate-x-1",
                        active && "text-champagne-deep italic",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border bg-paper-deep px-5 py-5 text-sm text-muted-foreground sm:px-8">
          {legalNavigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onNavigate={() => setOpen(false)}
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-navy-950 hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
