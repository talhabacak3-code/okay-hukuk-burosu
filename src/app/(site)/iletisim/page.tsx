import Link from "next/link"
import { ArrowUpRight, MapPin, Phone } from "lucide-react"

import { FlowLine } from "@/components/brand/flow-line"
import { Logo } from "@/components/brand/logo"
import { ContactForm } from "@/components/contact/contact-form"
import { Breadcrumb, rootBreadcrumb } from "@/components/navigation/breadcrumb"
import {
  EmailValue,
  PhoneValue,
  telHref,
} from "@/components/primitives/contact-links"
import { Container } from "@/components/primitives/container"
import { MaybeValue } from "@/components/primitives/placeholder"
import { SectionHeading } from "@/components/primitives/section-heading"
import { Button } from "@/components/ui/button"
import { DARK_HERO_ID } from "@/config/header"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { isContactDeliveryConfigured } from "@/lib/contact/delivery"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"
import { isPlaceholder, resolve } from "@/lib/placeholder"

const route = routes.contact

export const metadata = buildMetadata(route)

/** Adres/telefon/harita büro tarafından doğrulanana kadar gösterilen not. */
function VerificationNote({
  verified,
  className,
}: {
  verified: boolean
  className?: string
}) {
  if (verified) return null
  return (
    <p
      data-placeholder=""
      className={
        "border-l-2 border-stone pl-3 text-xs leading-relaxed text-muted-foreground " +
        (className ?? "")
      }
    >
      Adres, telefon ve harita konumu büro tarafından doğrulanmayı bekliyor.
    </p>
  )
}

export default async function ContactPage() {
  const { location } = siteConfig
  const { contact } = await getSiteSettings()
  const phone = resolve(contact.phone)
  const mobile = resolve(contact.mobile)
  const mapUrl = resolve(contact.mapUrl)
  const deliveryConfigured = isContactDeliveryConfigured()

  const facts: { term: string; node: React.ReactNode }[] = [
    { term: "Adres", node: <MaybeValue value={contact.address} /> },
    { term: "Telefon", node: <PhoneValue value={contact.phone} /> },
    { term: "Mobil", node: <PhoneValue value={contact.mobile} /> },
    { term: "E-posta", node: <EmailValue value={contact.email} /> },
    { term: "KEP", node: <MaybeValue value={contact.kep} /> },
    {
      term: "Çalışma saatleri",
      node: <MaybeValue value={contact.workingHours} />,
    },
  ]

  return (
    <>
      {/* Koyu giriş — logo açık zeminli tabelada; navbar bu bölüm üzerinde koyu temadadır. */}
      <section
        id={DARK_HERO_ID}
        aria-labelledby="iletisim-baslik"
        className="surface-ink relative isolate overflow-hidden"
      >
        <FlowLine
          variant="drift"
          delay={0.5}
          className="absolute bottom-0 left-0 -z-10 h-24 w-full opacity-40"
        />
        <Container className="pt-6 pb-16 md:pt-10 md:pb-20">
          <Breadcrumb
            className="animate-rise"
            items={rootBreadcrumb({ label: route.title, href: route.href })}
          />
          <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              {/* Blok kapsayıcı: logo (inline-flex) ile etiket aynı satıra düşmesin. */}
              <div>
                <Logo className="animate-rise text-[17px] text-paper sm:text-[19px]" />
              </div>
              <p className="mt-10 tagline-rule-start animate-rise eyebrow text-stone [animation-delay:80ms]">
                {route.marker}
              </p>
              <h1
                id="iletisim-baslik"
                className="mt-4 animate-rise text-h1 [animation-delay:120ms]"
              >
                İletişim
              </h1>
              <p className="mt-6 max-w-measure animate-rise text-lede text-paper/80 [animation-delay:160ms]">
                {siteConfig.name} iletişim bilgileri ve genel iletişim formu —{" "}
                {location.city}, {location.country}.
              </p>
            </div>

            {/* Mobilde ilk ekranda görünen hızlı erişim */}
            <div className="animate-rise space-y-3 [animation-delay:220ms] lg:col-span-5 lg:col-start-8">
              {phone ? (
                <Button
                  asChild
                  variant="onDark"
                  className="w-full justify-between"
                >
                  <a href={telHref(phone)}>
                    <span className="flex items-center gap-3">
                      <Phone aria-hidden="true" strokeWidth={1.5} />
                      Sabit hat
                    </span>
                    <span className="tabular-nums">{phone}</span>
                  </a>
                </Button>
              ) : null}
              {mobile ? (
                <Button
                  asChild
                  variant="onDark"
                  className="w-full justify-between"
                >
                  <a href={telHref(mobile)}>
                    <span className="flex items-center gap-3">
                      <Phone aria-hidden="true" strokeWidth={1.5} />
                      Mobil
                    </span>
                    <span className="tabular-nums">{mobile}</span>
                  </a>
                </Button>
              ) : null}
              {mapUrl ? (
                <Button
                  asChild
                  variant="onDark"
                  className="w-full justify-between"
                >
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center gap-3">
                      <MapPin aria-hidden="true" strokeWidth={1.5} />
                      Haritada aç
                      <span className="sr-only">(yeni sekmede açılır)</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* Form ve büro bilgileri */}
      <section
        aria-label="Genel iletişim formu ve büro bilgileri"
        className="py-20 md:py-28"
      >
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <SectionHeading
              id="form-baslik"
              marker="Form"
              title="Genel iletişim formu"
            />
            <div className="mt-10">
              <ContactForm
                deliveryConfigured={deliveryConfigured}
                phone={
                  phone ? { label: phone, href: telHref(phone) } : undefined
                }
              />
            </div>
          </div>

          <aside
            aria-labelledby="buro-bilgileri-baslik"
            className="lg:col-span-4 lg:col-start-9"
          >
            <div className="border-t border-ink-950 pt-6 lg:sticky lg:top-32">
              <h2
                id="buro-bilgileri-baslik"
                className="tagline-rule-start font-sans text-sm font-medium tracking-[0.14em] text-stone-deep uppercase"
              >
                Büro bilgileri
              </h2>
              <dl className="mt-4">
                {facts.map((fact) => (
                  <div
                    key={fact.term}
                    className="grid gap-1 border-b border-border py-4"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {fact.term}
                    </dt>
                    <dd className="min-w-0 break-words">{fact.node}</dd>
                  </div>
                ))}
                <div className="grid gap-1 border-b border-border py-4">
                  <dt className="text-sm text-muted-foreground">Harita</dt>
                  <dd>
                    {isPlaceholder(contact.mapUrl) ? (
                      <MaybeValue value={contact.mapUrl} />
                    ) : (
                      <a
                        href={contact.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 border-b border-current/30 font-medium hover:border-current"
                      >
                        Google Haritalar&apos;da aç
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        <span className="sr-only">(yeni sekmede açılır)</span>
                      </a>
                    )}
                  </dd>
                </div>
              </dl>
              <VerificationNote verified={contact.verified} className="mt-5" />
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Kişisel verilerinizin işlenmesine ilişkin bilgi için{" "}
                <Link
                  href={routes.privacyNotice.href}
                  className="font-medium text-foreground underline decoration-stone underline-offset-4 hover:decoration-ink-950"
                >
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni inceleyebilirsiniz.
              </p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  )
}
