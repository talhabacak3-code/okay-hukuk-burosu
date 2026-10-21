import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { MaybeValue, PendingBlock } from "@/components/primitives/placeholder"
import { Reveal } from "@/components/primitives/reveal"
import { RichText } from "@/components/primitives/rich-text"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { getPageContent } from "@/lib/content/pages"
import { getSiteSettings } from "@/lib/content/settings"

/**
 * Büro hakkında kısa tanıtım: solda başlık, sağda büronun "künyesi" (yalnızca bilinen
 * olgular veya açık yer tutucular) ve panelden girilen tanıtım metni.
 */
export async function AboutIntro() {
  const { location } = siteConfig
  const [settings, home] = await Promise.all([
    getSiteSettings(),
    getPageContent("home"),
  ])

  const facts: { term: string; value: React.ReactNode }[] = [
    { term: "Unvan", value: <MaybeValue value={settings.legalName} /> },
    { term: "Konum", value: `${location.city}, ${location.country}` },
    {
      term: "Faaliyet",
      value: "Avukatlık · Hukuki danışmanlık · Arabuluculuk",
    },
    {
      term: "Baro",
      value: <MaybeValue value={settings.professional.barAssociation} />,
    },
  ]

  return (
    <Section id="buro" aria-labelledby="buro-baslik" className="scroll-mt-24">
      <Container className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 lg:col-span-4">
          <SectionHeading
            id="buro-baslik"
            marker={routes.about.marker}
            title="Büro"
          />
          <ArrowLink href={routes.about.href} className="mt-8">
            Büro hakkında
          </ArrowLink>
        </div>

        <div className="space-y-10 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <Reveal>
            <h3 className="eyebrow text-muted-foreground">Künye</h3>
            <dl className="mt-4 border-t border-ink-950">
              {facts.map((fact) => (
                <div
                  key={fact.term}
                  className="grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm text-muted-foreground">{fact.term}</dt>
                  <dd className="font-serif text-lg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1}>
            {home.introText ? (
              <RichText value={home.introText} className="text-lg" />
            ) : (
              <PendingBlock title="Büro tanıtım metni">
                Büronun kuruluşu, çalışma ilkeleri ve yaklaşımı yönetim
                panelinden (Ana sayfa) eklenecek. Metin; başarı, müvekkil veya
                üstünlük iddiası içermeyecek şekilde hazırlanmalıdır.
              </PendingBlock>
            )}
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
