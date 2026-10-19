import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { EmailValue, PhoneValue } from "@/components/primitives/contact-links"
import { Container } from "@/components/primitives/container"
import { MaybeValue, Placeholder } from "@/components/primitives/placeholder"
import { Reveal } from "@/components/primitives/reveal"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { getSiteSettings } from "@/lib/content/settings"
import { isPlaceholder } from "@/lib/placeholder"

/**
 * İletişim ve konum. Harita bilinçli olarak gömülmez: üçüncü taraf harita yerleştirmeleri
 * çerez/kişisel veri işleyebilir (KVKK). Bunun yerine harici "Haritada aç"
 * bağlantısı verilir; gömülü harita ancak ziyaretçi onayıyla eklenebilir.
 */
export async function ContactSection() {
  const { location } = siteConfig
  const { contact } = await getSiteSettings()

  const facts = [
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
    <Section
      aria-labelledby="iletisim-baslik"
      className="border-t border-border"
    >
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <SectionHeading
            id="iletisim-baslik"
            marker={routes.contact.marker}
            title="İletişim ve konum"
          />
          <Reveal>
            <dl className="mt-10 border-t border-navy-950">
              {facts.map((fact) => (
                <div
                  key={fact.term}
                  className="grid gap-1 border-b border-border py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm text-muted-foreground">{fact.term}</dt>
                  <dd className="min-w-0 break-words">{fact.node}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Button asChild variant="outline" className="mt-10">
            <Link href={routes.contact.href}>İletişim sayfası</Link>
          </Button>
        </div>

        <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
          <figure className="relative">
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-3 translate-y-3 border border-champagne/50"
            />
            <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden bg-paper-deep p-6 sm:aspect-[5/4] md:p-8">
              {/* Soyut ızgara — gerçek bir harita izlenimi vermez. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50"
              />
              <p className="relative eyebrow text-champagne-deep">Konum</p>
              <div className="relative">
                <p className="font-serif text-h2">{location.city}</p>
                <p className="mt-1 text-muted-foreground">{location.country}</p>
                <div className="mt-6">
                  {isPlaceholder(contact.mapUrl) ? (
                    <Placeholder label="Harita bağlantısı (adres doğrulandığında)" />
                  ) : (
                    <a
                      href={contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 border-b border-current/30 font-medium hover:border-current"
                    >
                      Haritada aç
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      <span className="sr-only">(yeni sekmede açılır)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            <figcaption className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Harita, üçüncü taraf çerezleri nedeniyle sayfaya gömülmez;
              bağlantı Google Haritalar&apos;ı yeni sekmede açar.
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </Section>
  )
}
