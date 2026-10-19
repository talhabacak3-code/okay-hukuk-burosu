import Link from "next/link"

import type { ArticleSummary } from "@/lib/content/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type ArticleCardProps = {
  article: ArticleSummary
  /** Yazı detay sayfası varsa; tüm kart tıklanabilir olur. */
  href?: string
  /** "featured": listenin başındaki yazı için daha büyük başlık. */
  layout?: "default" | "featured"
  headingLevel?: 2 | 3
  className?: string
}

/**
 * Yayın kartı. Tarih, kategori, başlık ve kısa özet. Başlığın altı, üzerine
 * gelindiğinde şampanya renginde çizilir (background-size geçişi).
 */
export function ArticleCard({
  article,
  href,
  layout = "default",
  headingLevel = 3,
  className,
}: ArticleCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  const featured = layout === "featured"

  const titleClass = cn(
    "bg-[linear-gradient(var(--color-champagne),var(--color-champagne))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5",
    "transition-[background-size] duration-700 ease-editorial",
    href &&
      "group-hover:bg-[length:100%_1px] group-focus-within:bg-[length:100%_1px]",
  )

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border-t border-navy-950/80 pt-5",
        // Bağlantı tüm kartı kaplar; odak halkası kartın kendisinde gösterilir.
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-solid",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <time dateTime={article.publishedAt} className="tabular-nums">
          {formatDate(article.publishedAt)}
        </time>
        {article.category ? (
          <>
            <span aria-hidden="true" className="h-px w-4 bg-champagne" />
            <span className="eyebrow text-champagne-deep">
              {article.category}
            </span>
          </>
        ) : null}
      </div>

      <Heading
        className={cn("mt-4 text-balance", featured ? "text-h2" : "text-h3")}
      >
        {href ? (
          <Link
            href={href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            <span className={titleClass}>{article.title}</span>
          </Link>
        ) : (
          article.title
        )}
      </Heading>

      <p
        className={cn(
          "mt-3 line-clamp-3 leading-relaxed text-muted-foreground",
          featured && "line-clamp-4 max-w-measure text-lede",
        )}
      >
        {article.excerpt}
      </p>

      {article.author ? (
        <p className="mt-auto pt-5 text-sm">{article.author}</p>
      ) : null}
    </article>
  )
}
