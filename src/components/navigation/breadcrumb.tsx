import Link from "next/link"

import { JsonLd } from "@/components/seo/json-ld"
import { absoluteUrl } from "@/lib/env"
import { cn } from "@/lib/utils"

export type BreadcrumbItem = {
  label: string
  /** Son öğe (geçerli sayfa) için de verilir; yapılandırılmış veride kullanılır. */
  href: string
}

/**
 * Sayfa yolu. Son öğe geçerli sayfadır (`aria-current="page"`, bağlantı değildir).
 * Site yapısı doğrulanmış bir olgu olduğu için BreadcrumbList yapılandırılmış verisi eklenir.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  if (items.length === 0) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  }

  return (
    <nav aria-label="Sayfa yolu" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.href} className="inline-flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline md:min-h-6"
                  >
                    {item.label}
                  </Link>
                  <span aria-hidden="true" className="h-px w-4 bg-stone" />
                </>
              )}
            </li>
          )
        })}
      </ol>
      <JsonLd data={jsonLd} />
    </nav>
  )
}

/** Ana sayfa → geçerli sayfa şeklindeki standart yol. */
export function rootBreadcrumb(current: BreadcrumbItem): BreadcrumbItem[] {
  return [{ label: "Ana sayfa", href: "/" }, current]
}
