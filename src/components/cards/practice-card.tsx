import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import type { PracticeArea } from "@/config/site"
import { cn } from "@/lib/utils"

type PracticeCardProps = {
  area: PracticeArea
  /** Listedeki sıra (1'den başlar) — madde numarası olarak gösterilir. */
  index: number
  /** Detay sayfası varsa; tüm kart tıklanabilir olur. */
  href?: string
  headingLevel?: 2 | 3
  className?: string
}

/**
 * Çalışma alanı kartı — kutu değil, hukuki metin maddesi gibi: üstte ince çizgi
 * (üzerine gelince şampanya renginde soldan çizilir), madde numarası, başlık, kısa açıklama.
 * Uzmanlık/üstünlük iddiası içermeyen, bilgilendirici kısa metin beklenir.
 */
export function PracticeCard({
  area,
  index,
  href,
  headingLevel = 3,
  className,
}: PracticeCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border-t border-border pt-6 pb-8 transition-colors duration-500",
        "before:absolute before:-top-px before:left-0 before:h-px before:w-full before:origin-left before:scale-x-0 before:bg-champagne before:transition-transform before:duration-700 before:ease-editorial",
        href && "focus-within:before:scale-x-100 hover:before:scale-x-100",
        // Bağlantı tüm kartı kaplar; odak halkası kartın kendisinde gösterilir.
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-solid",
        className,
      )}
    >
      <p
        aria-hidden="true"
        className="eyebrow text-champagne-deep tabular-nums"
      >
        {String(index).padStart(2, "0")}
      </p>
      <Heading className="mt-5 text-h3 text-balance">
        {href ? (
          <Link
            href={href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {area.title}
          </Link>
        ) : (
          area.title
        )}
      </Heading>
      <p className="mt-3 max-w-measure leading-relaxed text-muted-foreground">
        {area.summary}
      </p>
      {href ? (
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-navy-950"
        >
          Ayrıntılar
          <ArrowUpRight
            strokeWidth={1.5}
            className="size-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      ) : null}
    </article>
  )
}
