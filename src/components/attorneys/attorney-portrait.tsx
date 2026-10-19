import Image from "next/image"

import type { Attorney } from "@/lib/content/attorney-schema"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Avukat portresi: yalnızca kişinin onayladığı gerçek fotoğraf. Fotoğraf yoksa baş
 * harflerden oluşan monogram gösterilir — monogram bir portre izlenimi vermez.
 * `framed`: arkada kaydırılmış ince altın çerçeve (profil sayfası).
 */
export function AttorneyPortrait({
  attorney,
  sizes,
  framed = false,
  preload = false,
  className,
}: {
  attorney: Attorney
  sizes: string
  framed?: boolean
  preload?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      {framed ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 translate-y-3 border border-champagne/50 md:translate-x-4 md:translate-y-4"
        />
      ) : null}
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
        {attorney.photo ? (
          <Image
            src={attorney.photo.src}
            alt={attorney.photo.alt}
            fill
            sizes={sizes}
            preload={preload}
            className="object-cover grayscale-[35%] transition-[transform,filter] duration-700 ease-editorial group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-4 flex flex-col items-center justify-center gap-4 border border-champagne/60 transition-[inset] duration-700 ease-editorial group-hover:inset-3"
          >
            <span className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-[0.06em] text-navy-950/85">
              {initials(attorney.fullName)}
            </span>
            <span className="eyebrow text-[0.625rem] text-muted-foreground">
              Fotoğraf eklenecek
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
