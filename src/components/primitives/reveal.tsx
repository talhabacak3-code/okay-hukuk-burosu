"use client"

import type { Variants } from "motion/react"
import * as m from "motion/react-m"

import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const
const viewport = { once: true, margin: "0px 0px -10% 0px" } as const

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** "rise": hafif yukarı kayarak belirme · "fade": yalnızca opaklık · "line": soldan sağa çizilen çizgi */
  variant?: "rise" | "fade" | "line"
  delay?: number
}

/**
 * Kaydırma ile görünür olduğunda bir kez oynayan, ölçülü giriş hareketi.
 * İlk ekrandaki kritik içerik için kullanılmaz (orada CSS `animate-rise` var).
 * prefers-reduced-motion: MotionProvider (reducedMotion="user") dönüşümleri kapatır.
 */
export function Reveal({
  children,
  className,
  variant = "rise",
  delay = 0,
}: RevealProps) {
  if (variant === "line") {
    return (
      <m.div
        className={cn("origin-left", className)}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewport}
        transition={{ duration: 1.1, ease, delay }}
      >
        {children}
      </m.div>
    )
  }

  return (
    <m.div
      className={className}
      initial={variant === "fade" ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={variant === "fade" ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: variant === "fade" ? 1 : 0.8, ease, delay }}
    >
      {children}
    </m.div>
  )
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

type GroupProps = {
  children: React.ReactNode
  className?: string
  as?: "div" | "ul" | "ol"
}

/** Çocuk öğeleri sırayla (stagger) gösteren kapsayıcı. Öğeler <RevealItem> olmalıdır. */
export function RevealGroup({ children, className, as = "div" }: GroupProps) {
  const Component = m[as]
  return (
    <Component
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </Component>
  )
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  as?: "div" | "li"
}) {
  const Component = m[as]
  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  )
}
