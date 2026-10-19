"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Handshake,
  History,
  House,
  ImageIcon,
  Inbox,
  Landmark,
  Layers,
  LayoutDashboard,
  Phone,
  Settings,
  Users,
} from "lucide-react"

import type { AdminNavItem } from "@/components/admin/nav-config"
import { cn } from "@/lib/utils"

const icons: Record<
  AdminNavItem["icon"],
  React.ComponentType<{
    className?: string
    strokeWidth?: number
    "aria-hidden"?: boolean
  }>
> = {
  dashboard: LayoutDashboard,
  home: House,
  about: Landmark,
  attorneys: Users,
  areas: Layers,
  mediation: Handshake,
  articles: FileText,
  media: ImageIcon,
  contact: Phone,
  settings: Settings,
  messages: Inbox,
  audit: History,
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Yan menü bağlantıları (lacivert zemin). Görünür öğeler sunucuda role göre süzülür. */
export function AdminNav({
  groups,
  onNavigate,
}: {
  groups: { title: string; items: AdminNavItem[] }[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Panel menüsü" className="space-y-7">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 font-sans text-[0.6875rem] font-medium tracking-[0.16em] text-champagne uppercase">
            {group.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const Icon = icons[item.icon]
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onNavigate={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 px-3 text-sm transition-colors",
                      active
                        ? "bg-paper/10 text-paper before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-champagne"
                        : "text-paper/75 hover:bg-paper/5 hover:text-paper",
                    )}
                  >
                    <Icon
                      aria-hidden
                      className="size-4 shrink-0"
                      strokeWidth={1.5}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
