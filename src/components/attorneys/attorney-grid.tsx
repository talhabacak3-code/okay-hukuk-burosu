import { AttorneyCard } from "@/components/cards/attorney-card"
import { RevealGroup, RevealItem } from "@/components/primitives/reveal"
import type { Attorney } from "@/lib/content/attorney-schema"
import { attorneyHref } from "@/lib/content/attorneys"
import { cn } from "@/lib/utils"

/**
 * Ekip büyüklüğüne göre yerleşim:
 * - 1 kişi: yatay "öne çıkan" kart (portre solda) — tek avukatlı büro boş görünmez.
 * - 2 kişi: iki sütun, sınırlı genişlik.
 * - 4 kişi: tablette 2×2, geniş ekranda tek satır dört sütun.
 * - 3 kişi: geniş ekranda üç sütun.
 * - 5+ kişi: üç sütunlu düzen sürer.
 */
export function AttorneyGrid({
  attorneys,
  headingLevel = 2,
  className,
}: {
  attorneys: Attorney[]
  headingLevel?: 2 | 3
  className?: string
}) {
  const count = attorneys.length
  if (count === 0) return null

  const only = attorneys[0]
  if (count === 1 && only) {
    return (
      <AttorneyCard
        attorney={only}
        href={attorneyHref(only.slug)}
        layout="feature"
        headingLevel={headingLevel}
        className={className}
      />
    )
  }

  const columns =
    count === 2
      ? "sm:grid-cols-2 lg:max-w-4xl"
      : count === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3"

  return (
    <RevealGroup
      as="ul"
      className={cn("grid gap-x-8 gap-y-14", columns, className)}
    >
      {attorneys.map((attorney) => (
        <RevealItem as="li" key={attorney.slug}>
          <AttorneyCard
            attorney={attorney}
            href={attorneyHref(attorney.slug)}
            headingLevel={headingLevel}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
