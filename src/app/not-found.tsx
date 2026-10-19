import type { Metadata } from "next"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SkipLink } from "@/components/layout/skip-link"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
}

/** Eşleşmeyen tüm adresler için 404 — site kabuğu burada açıkça eklenir. */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
        <Container className="grid gap-6 py-24 md:grid-cols-12 md:py-36">
          <p className="eyebrow text-champagne-deep md:col-span-3 lg:col-span-2">
            404
          </p>
          <div className="md:col-span-9 lg:col-span-8">
            <h1 className="text-h1">Aradığınız sayfa bulunamadı.</h1>
            <p className="mt-6 max-w-measure text-lede text-muted-foreground">
              Bağlantı değişmiş ya da sayfa kaldırılmış olabilir.
            </p>
            <ArrowLink href="/" className="mt-10">
              Ana sayfaya dön
            </ArrowLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
