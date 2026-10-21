import { OkayMark } from "@/components/brand/okay-mark"
import { logoAlt } from "@/config/brand"
import { cn } from "@/lib/utils"

type LogoProps = {
  /**
   * `horizontal`: amblem | OKAY / HUKUK DANIŞMANLIK (başlık, mobil menü).
   * `stacked`: amblem üstte, yazı altta ortalı (hero, footer, giriş ekranı).
   */
  layout?: "horizontal" | "stacked"
  /**
   * Boyut yazı tipi boyutuyla verilir (ör. "text-[18px] lg:text-[22px]"); amblem ve yazı
   * em cinsinden orantılı ölçeklenir, böylece logo düzeni her boyutta aynı kalır.
   */
  className?: string
  /** Logo bir bağlantının tek içeriği ise bağlantı adı oradan verilir; logo gizlenir. */
  decorative?: boolean
}

/**
 * Logo düzeni (lockup): onaylı amblem + "OKAY" (Bodoni Moda, geniş aralıklı büyük harf) +
 * "HUKUK DANIŞMANLIK" (Instrument Sans). Renk `currentColor`'dan gelir: açık zeminde
 * mürekkep, koyu zeminde kırık beyaz; ayırıcı çizgiler taş rengidir. Yazılar gerçek
 * metindir (keskin, ölçeklenebilir) ve erişilebilir ad tek parça verilir.
 */
export function Logo({
  layout = "horizontal",
  className,
  decorative = false,
}: LogoProps) {
  const stacked = layout === "stacked"

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : logoAlt}
      aria-hidden={decorative ? true : undefined}
      data-okay-logo=""
      className={cn(
        "inline-flex shrink-0 select-none",
        stacked ? "flex-col items-center text-center" : "items-center",
        className,
      )}
    >
      <OkayMark className={stacked ? "h-[5em]" : "h-[2.75em]"} />

      {/* Ayırıcı: amblemin sütunlarını yansıtan ince dikey çizgi (yatay düzen). */}
      {!stacked && (
        <span className="mx-[0.85em] block h-[2.2em] w-px bg-stone" />
      )}

      {/* "OKAY" ve alt yazı aynı genişliğe yakın tutulur; son harfin aralığı ortalamayı
          bozmasın diye eksi sağ boşlukla dengelenir. */}
      <span
        className={cn(
          "flex flex-col leading-none",
          stacked ? "mt-[1.1em] items-center" : "items-start",
        )}
      >
        <span className="mr-[-0.32em] font-serif text-[1.9em] font-semibold tracking-[0.32em]">
          OKAY
        </span>
        <span
          className={cn(
            "flex items-center font-sans text-[0.56em] font-medium tracking-[0.14em]",
            stacked ? "mt-[1.1em] gap-[1em]" : "mt-[0.85em]",
          )}
        >
          {stacked && <span className="block h-px w-[2.4em] bg-stone" />}
          <span className="mr-[-0.14em]">HUKUK DANIŞMANLIK</span>
          {stacked && <span className="block h-px w-[2.4em] bg-stone" />}
        </span>
      </span>
    </span>
  )
}
