import type { StaffRole } from "@/lib/admin/auth"

export type AdminNavItem = {
  href: string
  label: string
  icon:
    | "dashboard"
    | "home"
    | "about"
    | "attorneys"
    | "areas"
    | "mediation"
    | "articles"
    | "media"
    | "contact"
    | "settings"
    | "messages"
    | "audit"
  /** Bu bağlantıyı görebilecek en düşük rol. */
  minRole: StaffRole
}

export const adminNavigation: { title: string; items: AdminNavItem[] }[] = [
  {
    title: "Genel",
    items: [
      {
        href: "/admin",
        label: "Genel bakış",
        icon: "dashboard",
        minRole: "editor",
      },
    ],
  },
  {
    title: "İçerik",
    items: [
      {
        href: "/admin/ana-sayfa",
        label: "Ana sayfa",
        icon: "home",
        minRole: "editor",
      },
      {
        href: "/admin/hakkimizda",
        label: "Hakkımızda",
        icon: "about",
        minRole: "editor",
      },
      {
        href: "/admin/avukatlar",
        label: "Avukat profilleri",
        icon: "attorneys",
        minRole: "editor",
      },
      {
        href: "/admin/faaliyet-alanlari",
        label: "Faaliyet alanları",
        icon: "areas",
        minRole: "editor",
      },
      {
        href: "/admin/arabuluculuk",
        label: "Arabuluculuk",
        icon: "mediation",
        minRole: "editor",
      },
      {
        href: "/admin/yayinlar",
        label: "Hukuki yayınlar",
        icon: "articles",
        minRole: "editor",
      },
      {
        href: "/admin/medya",
        label: "Medya kütüphanesi",
        icon: "media",
        minRole: "editor",
      },
    ],
  },
  {
    title: "Yönetim",
    items: [
      {
        href: "/admin/iletisim",
        label: "İletişim bilgileri",
        icon: "contact",
        minRole: "admin",
      },
      {
        href: "/admin/ayarlar",
        label: "SEO ve site ayarları",
        icon: "settings",
        minRole: "admin",
      },
      {
        href: "/admin/mesajlar",
        label: "Gelen mesajlar",
        icon: "messages",
        minRole: "admin",
      },
      {
        href: "/admin/denetim",
        label: "Denetim kaydı",
        icon: "audit",
        minRole: "admin",
      },
    ],
  },
]

export function visibleNavigation(role: StaffRole) {
  return adminNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => role === "admin" || item.minRole === "editor",
      ),
    }))
    .filter((group) => group.items.length > 0)
}
