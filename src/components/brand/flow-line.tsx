"use client"

import * as m from "motion/react-m"

import { cn } from "@/lib/utils"

/**
 * Amblemdeki hilalden türeyen ince, dekoratif daire yayları (taş rengi). Hilalin kopyası
 * değildir; yalnızca yayın geometrisini ödünç alır. Görünür olduğunda bir kez çizilir.
 * Reduced-motion tercihinde MotionProvider animasyonu atlar ve yay doğrudan görünür.
 */
const paths = {
  /** Soldan alçak başlayıp sağa doğru yükselen geniş yay. */
  sweep: "M0 156 A 640 640 0 0 0 600 18",
  /** Yatay akışa yakın, sığ bir hilal tabanı (bölüm altları için). */
  drift: "M0 40 A 820 820 0 0 0 600 40",
  /** Hilalin iç kavsine yakın, derin yay. */
  arc: "M36 6 A 300 300 0 0 0 564 6",
} as const

export function FlowLine({
  className,
  delay = 0.2,
  variant = "sweep",
  duration = 1.8,
}: {
  className?: string
  delay?: number
  variant?: keyof typeof paths
  duration?: number
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 600 160"
      fill="none"
      preserveAspectRatio="none"
      className={cn("pointer-events-none text-stone", className)}
    >
      <m.path
        d={paths[variant]}
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          pathLength: { duration, ease: [0.22, 1, 0.36, 1], delay },
          opacity: { duration: 0.3, delay },
        }}
      />
    </svg>
  )
}
