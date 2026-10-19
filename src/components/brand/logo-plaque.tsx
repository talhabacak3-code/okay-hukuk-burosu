import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

/**
 * Logo tabelası: onaylı logo, kendi açık zemini üzerinde ve ince altın çerçeve içinde —
 * bir büro kapısındaki isim levhası gibi. Koyu zeminlerde logoyu göstermenin tek yolu
 * budur; logo yeniden renklendirilmez (lacivert harfler koyu zeminde okunmaz).
 */
export function LogoPlaque({
  className,
  logoClassName,
  sizes,
  eager = false,
}: {
  className?: string
  logoClassName?: string
  sizes: string
  eager?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-block bg-paper p-1.5 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)]",
        className,
      )}
    >
      <div className="border border-champagne/70 px-5 py-4 sm:px-8 sm:py-6">
        <Logo
          eager={eager}
          sizes={sizes}
          className={cn("h-20 sm:h-24 lg:h-28", logoClassName)}
        />
      </div>
    </div>
  )
}
