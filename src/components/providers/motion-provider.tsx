"use client"

import { LazyMotion, MotionConfig } from "motion/react"

const loadFeatures = () =>
  import("./motion-features").then((module) => module.default)

/**
 * İşletim sistemi "hareketi azalt" tercihini tüm Motion animasyonlarına uygular.
 * Bileşenler `motion/react-m` (`m.div`) kullanır; animasyon özellikleri LazyMotion ile
 * ayrı parçadan gelir (`strict`: tam `motion.*` bileşeni yanlışlıkla eklenirse hata verir).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
