import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  /** Başlığın id'si — bölümün `aria-labelledby` hedefi. */
  id: string
  title: React.ReactNode
  /** Madde numarası (§ 01) ya da kısa üst etiket. */
  marker?: string
  lede?: React.ReactNode
  align?: "start" | "center"
  /** Belge hiyerarşisine göre başlık seviyesi. */
  level?: 2 | 3
  className?: string
}

/**
 * Bölüm başlığı. Üst etiket, logo alt yazısını çevreleyen taş rengi kılçıklı satırdan
 * türetilmiştir (sola hizalıda tek, ortalıda iki yanlı). Koyu yüzeylerde
 * (`surface-ink`) renkler otomatik uyarlanır.
 */
export function SectionHeading({
  id,
  title,
  marker,
  lede,
  align = "start",
  level = 2,
  className,
}: SectionHeadingProps) {
  const Heading = level === 2 ? "h2" : "h3"
  const centered = align === "center"

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {marker ? (
        <p
          className={cn(
            "eyebrow text-stone-deep [.surface-ink_&]:text-stone",
            centered ? "tagline-rule" : "tagline-rule-start",
          )}
        >
          {marker}
        </p>
      ) : null}
      <Heading id={id} className={level === 2 ? "text-h2" : "text-h3"}>
        {title}
      </Heading>
      {lede ? (
        <div
          className={cn(
            "max-w-measure text-lede text-muted-foreground",
            centered && "mx-auto",
          )}
        >
          {lede}
        </div>
      ) : null}
    </div>
  )
}
