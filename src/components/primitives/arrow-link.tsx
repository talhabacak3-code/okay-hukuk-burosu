import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Metin bağlantısı: alt çizgi + ok. Agresif CTA yerine sade yönlendirme. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-11 items-center gap-3 border-b border-current/30 text-[0.9375rem] font-medium transition-colors hover:border-current",
        className,
      )}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1"
      />
    </Link>
  )
}
