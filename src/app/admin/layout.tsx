import type { Metadata } from "next"

/**
 * Yönetim paneli kökü. Arama motorlarına kapalıdır (ayrıca proxy X-Robots-Tag ekler).
 * Kamuya açık sitenin üst/alt bilgisi burada kullanılmaz.
 */
export const metadata: Metadata = {
  title: { default: "Yönetim paneli", template: "%s · Panel · OKAY Hukuk" },
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">{children}</div>
  )
}
