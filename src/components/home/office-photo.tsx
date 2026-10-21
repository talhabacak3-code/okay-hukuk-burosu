import Image from "next/image"

import { Placeholder } from "@/components/primitives/placeholder"
import { getOfficePhoto } from "@/lib/content/pages"
import { cn } from "@/lib/utils"

/**
 * Büro fotoğrafı alanı. YALNIZCA büronun gerçek fotoğrafı kullanılır (stok veya üretilmiş
 * görsel yok). Fotoğraf sağlanana kadar çerçeve, açıkça "Eklenecek" etiketli boş alan
 * olarak görünür. Arkadaki kaydırılmış ince çerçeve paspartu etkisi verir.
 * `tone`: "dark" mürekkep zemin (hero), "light" krem zemin (Hakkımızda).
 */
export async function OfficePhoto({
  className,
  tone = "dark",
  aspect = "aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/5]",
  preload = false,
}: {
  className?: string
  tone?: "dark" | "light"
  aspect?: string
  preload?: boolean
}) {
  // Fotoğraf panelden (Ana sayfa → büro fotoğrafı) medya kütüphanesinden seçilir.
  const photo = await getOfficePhoto()
  const dark = tone === "dark"

  return (
    <figure className={cn("relative", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 translate-x-3 translate-y-3 border md:translate-x-5 md:translate-y-5",
          dark ? "border-stone/35" : "border-stone/60",
        )}
      />
      <div
        className={cn(
          "relative animate-unveil overflow-hidden [animation-delay:200ms]",
          aspect,
          dark ? "bg-ink-900" : "bg-paper-deep",
        )}
      >
        {!photo ? (
          <div
            className={cn(
              "absolute inset-3 flex flex-col items-center justify-center gap-4 border p-6 text-center md:inset-4",
              dark ? "border-paper/10" : "border-ink-950/10",
            )}
          >
            <span aria-hidden="true" className="h-px w-10 bg-stone/70" />
            <p
              className={cn(
                "eyebrow",
                dark ? "text-paper/60" : "text-muted-foreground",
              )}
            >
              Fotoğraf alanı
            </p>
            <Placeholder label="Büronun gerçek fotoğrafı" />
            <p
              className={cn(
                "max-w-[26ch] text-xs leading-relaxed",
                dark ? "text-paper/55" : "text-muted-foreground",
              )}
            >
              Dikey kadraj önerilir; en az 1600 px yükseklik. Stok veya yapay
              zekâ ile üretilmiş görsel kullanılmaz.
            </p>
          </div>
        ) : (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            preload={preload}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </figure>
  )
}
