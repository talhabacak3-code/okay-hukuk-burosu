import type { Metadata, Viewport } from "next"
import { Bodoni_Moda, Instrument_Sans } from "next/font/google"

import { MotionProvider } from "@/components/providers/motion-provider"
import { siteConfig } from "@/config/site"
import { publicEnv } from "@/lib/env"

import "./globals.css"

// Logodaki yüksek kontrastlı serif harflerle akraba başlık fontu (optik boyutlu).
const bodoniModa = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: "normal",
  variable: "--font-bodoni-moda",
  display: "swap",
})

// İtalik kesim yalnızca birkaç vurgu satırında kullanılır: önceden yüklenmez
// (ilk ekranda öncelikli indirilen font miktarını ~80 KB azaltır).
const bodoniModaItalic = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: "italic",
  variable: "--font-bodoni-moda-italic",
  display: "swap",
  preload: false,
})

const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-sans",
  display: "swap",
})

/**
 * Kök metadata statiktir ve veritabanına bağlı değildir: yönetim paneli, veritabanına
 * ulaşılamadığında da açılabilmelidir. Panelden yönetilen SEO başlığı ve açıklaması
 * kamuya açık sitenin layout dosyasında, (site)/layout.tsx içinde uygulanır.
 */
export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  formatDetection: { telephone: false, email: false, address: false },
  // Yayın onayı verilene kadar (NEXT_PUBLIC_SITE_INDEXABLE=true) site indekslenmez.
  robots: publicEnv.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: siteConfig.ogLocale,
    siteName: siteConfig.name,
  },
}

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${bodoniModa.variable} ${bodoniModaItalic.variable} ${instrumentSans.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
