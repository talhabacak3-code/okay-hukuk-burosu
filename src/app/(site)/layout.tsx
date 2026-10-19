import type { Metadata } from "next"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SkipLink } from "@/components/layout/skip-link"
import { siteConfig } from "@/config/site"
import { getSiteSettings } from "@/lib/content/settings"

/** Varsayılan başlık ve açıklama panelden ("SEO ve site ayarları") yönetilir. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings()
  return {
    title: { default: seo.title, template: `%s · ${siteConfig.shortName}` },
    description: seo.description,
  }
}

/** Kamuya açık site kabuğu. Yönetim paneli ayrı bir kabukla /admin altındadır. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
