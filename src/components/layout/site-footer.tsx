import { cacheLife } from "next/cache"
import Link from "next/link"

import { FlowLine } from "@/components/brand/flow-line"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { EmailValue, PhoneValue } from "@/components/primitives/contact-links"
import { Container } from "@/components/primitives/container"
import { MaybeValue } from "@/components/primitives/placeholder"
import { legalNavigation, mainNavigation, routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { getSiteSettings } from "@/lib/content/settings"
import { legalDisclaimer } from "@/content/legal/disclaimer"

/** Telif yılı — Cache Components altında `new Date()` yalnızca önbellekli kapsamda çağrılabilir. */
async function CopyrightYear() {
  "use cache"
  cacheLife("days")
  return <>{new Date().getFullYear()}</>
}

export async function SiteFooter() {
  const { contact, professional } = await getSiteSettings()

  return (
    <footer>
      <div className="relative isolate overflow-hidden border-t border-border bg-paper-deep">
        <FlowLine
          variant="drift"
          className="absolute inset-x-0 bottom-0 -z-10 h-20 w-full opacity-60"
        />
        <Container className="flex flex-col items-start gap-8 py-12 md:flex-row md:items-center md:justify-between md:py-14">
          <Logo className="text-[17px] text-ink-950 md:text-[19px] lg:text-[21px]" />
          <div className="flex flex-col items-start gap-5 md:items-end">
            <p className="tagline-rule-start eyebrow text-stone-deep">
              {siteConfig.location.city} · {siteConfig.location.country}
            </p>
            <Button asChild variant="outline">
              <Link href={routes.contact.href}>İletişim bilgileri</Link>
            </Button>
          </div>
        </Container>
      </div>

      <div className="surface-ink">
        <Container className="pt-14 pb-10 md:pt-20">
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <nav aria-label="Alt menü" className="md:col-span-4 lg:col-span-3">
              <h2 className="eyebrow text-stone">Büro</h2>
              <ul className="mt-5 space-y-1">
                {mainNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center text-[0.9375rem] text-paper/85 underline-offset-4 hover:text-paper hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-8 md:grid md:grid-cols-2 md:gap-8 lg:col-span-8 lg:col-start-5">
              <div>
                <h2 className="eyebrow text-stone">İletişim</h2>
                <dl className="mt-5 space-y-4 text-[0.9375rem]">
                  <FooterFact term="Adres">
                    <MaybeValue value={contact.address} />
                  </FooterFact>
                  <FooterFact term="Telefon">
                    <PhoneValue value={contact.phone} />
                  </FooterFact>
                  <FooterFact term="Mobil">
                    <PhoneValue value={contact.mobile} />
                  </FooterFact>
                  <FooterFact term="E-posta">
                    <EmailValue value={contact.email} />
                  </FooterFact>
                  <FooterFact term="KEP">
                    <MaybeValue value={contact.kep} />
                  </FooterFact>
                </dl>
              </div>

              <div className="mt-12 md:mt-0">
                <h2 className="eyebrow text-stone">Mesleki bilgiler</h2>
                <dl className="mt-5 space-y-4 text-[0.9375rem]">
                  <FooterFact term="Baro">
                    <MaybeValue value={professional.barAssociation} />
                  </FooterFact>
                  <FooterFact term="Baro sicil no">
                    <MaybeValue value={professional.barRegistrationNo} />
                  </FooterFact>
                  <FooterFact term="Arabulucu sicil no">
                    <MaybeValue value={professional.mediatorRegistryNo} />
                  </FooterFact>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {legalDisclaimer}
            </p>
            <div className="mt-6 flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span>
                  © <CopyrightYear /> {siteConfig.name}
                </span>
                <a
                  href="#icerik"
                  className="inline-flex min-h-10 items-center gap-2 underline-offset-4 hover:text-paper hover:underline"
                >
                  Başa dön
                  <span aria-hidden="true">↑</span>
                </a>
              </p>
              <ul className="flex flex-wrap gap-x-6 gap-y-1">
                {legalNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center underline-offset-4 hover:text-paper hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}

function FooterFact({
  term,
  children,
}: {
  term: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-4 md:grid-cols-1 md:gap-1 xl:grid-cols-[7.5rem_1fr] xl:gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}
