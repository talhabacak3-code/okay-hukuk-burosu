import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FlowLine } from "@/components/brand/flow-line"
import { Logo } from "@/components/brand/logo"
import { OfficePhoto } from "@/components/home/office-photo"
import { Container } from "@/components/primitives/container"
import { Button } from "@/components/ui/button"
import { DARK_HERO_ID } from "@/config/header"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { pageDefaults } from "@/lib/content/page-schemas"
import { getPageContent } from "@/lib/content/pages"

/**
 * Ana sayfa girişi — mürekkep zemin, üstte kırık beyaz logo (amblem + yazı), büyük serif
 * başlık, ince taş rengi çizgiler ve gerçek büro fotoğrafı için alan.
 * Başlık ilk ekranda koyu temada durur (bkz. HeaderShell, DARK_HERO_ID).
 */
export async function Hero() {
  const home = await getPageContent("home")

  return (
    <section
      id={DARK_HERO_ID}
      aria-labelledby="giris-baslik"
      className="surface-ink relative isolate overflow-hidden"
    >
      {/* Amblemdeki hilalden türeyen iki ince yay — metnin arkasında, dekoratif. */}
      <FlowLine
        variant="arc"
        delay={0.6}
        duration={2.2}
        className="absolute top-[9%] left-[36%] -z-10 hidden h-40 w-[46%] opacity-50 lg:block"
      />
      <FlowLine
        variant="drift"
        delay={0.9}
        duration={2.4}
        className="absolute bottom-24 left-0 -z-10 h-24 w-full opacity-40 md:bottom-28 md:h-32"
      />

      <Container className="grid gap-14 pt-8 pb-14 md:pt-12 md:pb-20 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-6 lg:pb-16">
        <div className="lg:col-span-7">
          <Logo className="animate-rise text-[19px] text-paper sm:text-[23px] lg:text-[27px]" />

          <h1
            id="giris-baslik"
            className="mt-10 animate-rise text-[clamp(2.25rem,1.5rem+4.4vw,5.25rem)] leading-[1.04] tracking-[-0.015em] text-paper [animation-delay:120ms] md:mt-14"
          >
            <span className="sr-only">{siteConfig.name} — </span>
            {home.heroLine1 ?? pageDefaults.heroLine1}
            <span className="block text-stone italic">
              {home.heroLine2 ?? pageDefaults.heroLine2}
            </span>
          </h1>

          <span
            aria-hidden="true"
            className="mt-8 block h-px w-24 animate-rise bg-stone [animation-delay:220ms] md:mt-10"
          />

          <p className="mt-8 max-w-measure animate-rise text-lede text-paper/80 [animation-delay:300ms]">
            {home.heroLede ?? (
              <>
                {siteConfig.name}, {siteConfig.location.city}&apos;da faaliyet
                gösteren hukuk bürosudur.
              </>
            )}
          </p>

          <div className="mt-10 flex animate-rise flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:380ms]">
            <Button asChild variant="onDark">
              <Link href={routes.about.href}>
                Büroyu tanıyın
                <ArrowRight aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="quiet">
              <Link href={routes.contact.href}>İletişim bilgileri</Link>
            </Button>
          </div>
        </div>

        <OfficePhoto
          preload
          className="lg:col-span-5 lg:col-start-8 xl:col-span-5 xl:col-start-8"
        />
      </Container>

      <Container>
        <div className="flex flex-col gap-4 border-t border-border py-6 text-paper/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="tagline-rule-start eyebrow text-stone">
            {siteConfig.location.city} · {siteConfig.location.country}
          </p>
          <p className="eyebrow">Hukuki danışmanlık — Arabuluculuk</p>
          <a
            href="#buro"
            className="group hidden min-h-11 items-center gap-3 text-sm transition-colors hover:text-paper sm:inline-flex"
          >
            Büro hakkında
            <span
              aria-hidden="true"
              className="relative block h-8 w-px overflow-hidden bg-paper/20"
            >
              <span className="absolute inset-x-0 top-0 block h-1/3 animate-scroll-cue bg-stone" />
            </span>
          </a>
        </div>
      </Container>
    </section>
  )
}
