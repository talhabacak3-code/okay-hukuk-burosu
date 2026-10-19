"use client"

import * as m from "motion/react-m"

import { cn } from "@/lib/utils"

/**
 * Logodaki akışkan altın çizgiden esinlenen, özgün ve dekoratif ince eğriler.
 * Logodaki kurdelenin kopyası değildir; görünür olduğunda bir kez çizilir.
 * Reduced-motion tercihinde MotionProvider animasyonu atlar ve eğri doğrudan görünür.
 */
const paths = {
  /** Soldan alçak başlayıp yükselen, sağda hafifçe kıvrılan uzun eğri. */
  sweep: "M2 150 C 140 150, 210 18, 330 18 S 520 96, 598 40",
  /** Yatay akışa yakın, iki yumuşak dalgalı uzun çizgi (bölüm altları için). */
  drift: "M0 110 C 120 110, 170 60, 300 60 S 470 112, 600 70",
  /** Tek, geniş yay. */
  arc: "M4 156 C 120 40, 380 4, 596 30",
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
      className={cn("pointer-events-none text-champagne", className)}
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
