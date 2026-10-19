import Image from "next/image"

import { brandAssets, logoAlt } from "@/config/brand"
import { basePath } from "@/lib/env"
import { cn } from "@/lib/utils"

type LogoProps = {
  /** Görüntülenecek yükseklik; genişlik oranla hesaplanır. Tailwind sınıfıyla verilir (ör. "h-12 md:h-16"). */
  className?: string
  /** Logo bir bağlantının tek içeriği ise bağlantı adı oradan verilir; burada alt metin boş bırakılır. */
  decorative?: boolean
  /**
   * İlk ekranda görünen logo (header) için: tembel yükleme kapatılır. Öncelik düşük
   * tutulur; böylece React otomatik <link rel="preload"> üretmez (koyu hero'lu sayfalarda
   * header logosu gizlidir ve önyükleme boşa giderdi). Görünürse tarayıcı önceliği yükseltir.
   */
  eager?: boolean
  /** Görüntülenecek en büyük CSS genişliği — srcset seçimi için. */
  sizes?: string
}

/**
 * Onaylı logo (saydam sürüm). Yalnızca açık zeminlerde kullanılır;
 * koyu bölümlerde <LogoPlate> ile açık bir zemin üzerine yerleştirin.
 */
export function Logo({
  className,
  decorative = false,
  eager = false,
  sizes = "240px",
}: LogoProps) {
  const { src, width, height } = brandAssets.transparent
  return (
    <Image
      // next/image, basePath'i public/ yollarına kendisi eklemez (Next basePath rehberi).
      src={basePath + src}
      width={width}
      height={height}
      alt={decorative ? "" : logoAlt}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "low" : undefined}
      className={cn(
        "h-12 w-auto shrink-0 object-contain select-none",
        className,
      )}
      draggable={false}
    />
  )
}
