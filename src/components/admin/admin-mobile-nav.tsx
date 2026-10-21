"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

import { AdminNav } from "@/components/admin/admin-nav"
import type { AdminNavItem } from "@/components/admin/nav-config"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** Mobil/tablet panel menüsü (Radix Dialog: odak tuzağı, Esc, odak dönüşü). */
export function AdminMobileNav({
  groups,
  footer,
}: {
  groups: { title: string; items: AdminNavItem[] }[]
  footer: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="-mr-2 inline-flex h-11 items-center gap-2 px-2 text-sm font-medium text-paper lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
          Menü
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        aria-describedby={undefined}
        className="surface-ink w-[85vw] max-w-xs gap-0 border-none p-0"
      >
        <SheetTitle className="sr-only">Panel menüsü</SheetTitle>
        <div className="flex h-16 items-center justify-end px-4">
          <SheetClose asChild>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 px-2 text-sm font-medium"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
              Kapat
            </button>
          </SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <AdminNav groups={groups} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-border p-4">{footer}</div>
      </SheetContent>
    </Sheet>
  )
}
