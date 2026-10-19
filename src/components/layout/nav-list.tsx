import Link from "next/link"

import { isActivePath, mainNavigation, routes } from "@/config/routes"
import { cn } from "@/lib/utils"

/** Masaüstü ana menü. Hook içermez; aktif yol dışarıdan verilir. */
export function NavList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1 xl:gap-2">
      {mainNavigation.map((item) => {
        const active = isActivePath(pathname, item.href)
        const isContact = item.href === routes.contact.href
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative inline-flex h-11 items-center px-3 text-[0.9375rem] transition-colors",
                isContact
                  ? "ml-2 border border-foreground/80 px-5 hover:bg-foreground hover:text-background"
                  : "text-foreground/80 hover:text-foreground",
                active && !isContact && "text-foreground",
                active && isContact && "bg-foreground text-background",
              )}
            >
              {item.label}
              {!isContact ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-2 h-px origin-left bg-champagne transition-transform duration-500 ease-editorial",
                    active
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
