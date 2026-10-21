import { okayMark } from "@/components/brand/okay-mark-path"
import { cn } from "@/lib/utils"

/**
 * Onaylı amblem: terazi, sütunlar, hilal ve ok ("OK" + "AY"). Kaynak PNG'den otomatik
 * vektörleştirilmiştir (scripts/branding/prepare-mark.mjs); biçimi değiştirilmez.
 * Rengi `currentColor`'dan alır: açık zeminde mürekkep, koyu zeminde kırık beyaz.
 * Yükseklik sınıfla verilir (ör. "h-12"); genişlik orandan hesaplanır.
 */
export function OkayMark({
  className,
  title,
}: {
  className?: string
  /** Verilirse amblem tek başına anlam taşır (role="img"); yoksa dekoratiftir. */
  title?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${okayMark.width} ${okayMark.height}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-okay-mark=""
      className={cn("h-12 w-auto shrink-0", className)}
    >
      <path fill="currentColor" fillRule="evenodd" d={okayMark.d} />
    </svg>
  )
}
