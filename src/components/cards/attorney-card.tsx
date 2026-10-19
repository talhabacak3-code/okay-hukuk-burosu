import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { AttorneyPortrait } from "@/components/attorneys/attorney-portrait"
import { FieldValue } from "@/components/primitives/placeholder"
import { verifiedMediator, type Attorney } from "@/lib/content/attorney-schema"
import { cn } from "@/lib/utils"

type AttorneyCardProps = {
  attorney: Attorney
  /** Profil sayfası bağlantısı; verilirse tüm kart tıklanabilir olur. */
  href?: string
  /**
   * "stacked": portre üstte (2–4 kişilik ızgara).
   * "feature": portre solda, bilgiler sağda (tek avukat).
   */
  layout?: "stacked" | "feature"
  headingLevel?: 2 | 3
  className?: string
}

/**
 * Avukat kartı. Yalnızca doğrulanmış mesleki bilgiler: ad, unvan, baro, sicil no ve
 * (teyitliyse) arabulucu sicil no. Biyografi/başarı/referans alanı bilinçli olarak yoktur.
 */
export function AttorneyCard({
  attorney,
  href,
  layout = "stacked",
  headingLevel = 3,
  className,
}: AttorneyCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  const mediator = verifiedMediator(attorney)
  const feature = layout === "feature"

  return (
    <article
      className={cn(
        "group relative grid",
        feature ? "gap-8 md:grid-cols-12 md:items-end md:gap-10" : "gap-6",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-solid",
        className,
      )}
    >
      <AttorneyPortrait
        attorney={attorney}
        className={feature ? "md:col-span-5 lg:col-span-4" : undefined}
        sizes={
          feature
            ? "(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw"
            : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        }
      />

      <div
        className={cn(
          "border-t border-border pt-5",
          feature && "md:col-span-7 md:pb-2 lg:col-span-6 lg:col-start-7",
        )}
      >
        <Heading className={feature ? "text-h2" : "text-h3"}>
          {href ? (
            <Link
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {attorney.fullName}
            </Link>
          ) : (
            attorney.fullName
          )}
        </Heading>
        <p className="mt-1.5 text-sm text-muted-foreground">
          <FieldValue value={attorney.title} label="Unvan" />
        </p>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Baro</dt>
          <dd className="min-w-0">
            <FieldValue value={attorney.barAssociation} label="Baro" />
          </dd>
          <dt className="text-muted-foreground">Sicil no</dt>
          <dd className="min-w-0 tabular-nums">
            <FieldValue value={attorney.barRegistrationNo} label="Sicil no" />
          </dd>
          {mediator ? (
            <>
              <dt className="text-muted-foreground">Arabulucu sicil no</dt>
              <dd className="min-w-0 tabular-nums">{mediator.registryNo}</dd>
            </>
          ) : null}
        </dl>

        {href ? (
          <span
            aria-hidden="true"
            className="mt-6 inline-flex items-center gap-2 border-b border-current/30 pb-1 text-sm font-medium transition-colors group-hover:border-current"
          >
            Profili görüntüle
            <ArrowRight
              strokeWidth={1.5}
              className="size-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5"
            />
          </span>
        ) : null}
      </div>
    </article>
  )
}
