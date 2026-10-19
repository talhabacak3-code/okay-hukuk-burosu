import { PracticeCard } from "@/components/cards/practice-card"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { PendingBlock } from "@/components/primitives/placeholder"
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { routes } from "@/config/routes"
import { getPracticeAreas } from "@/lib/content/practice-areas"

/** Faaliyet (çalışma) alanları — yalnızca büronun doğruladığı alanlar listelenir. */
export async function PracticeAreasSection() {
  const areas = await getPracticeAreas()

  return (
    <Section surface="paper-deep" aria-labelledby="alanlar-baslik">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
          <SectionHeading
            id="alanlar-baslik"
            marker={routes.practiceAreas.marker}
            title="Faaliyet alanları"
            lede="Büronun hukuki danışmanlık verdiği alanlar."
          />
          <ArrowLink href={routes.practiceAreas.href}>
            Tüm çalışma alanları
          </ArrowLink>
        </div>

        {areas.length > 0 ? (
          <RevealGroup
            as="ol"
            className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {areas.map((area, index) => (
              <RevealItem as="li" key={area.slug}>
                <PracticeCard
                  area={area}
                  index={index + 1}
                  href={routes.practiceAreas.href}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <Reveal className="mt-10 grid md:grid-cols-12">
            <PendingBlock
              title="Faaliyet alanları listesi"
              className="md:col-span-8 md:col-start-5"
            >
              Büronun fiilen çalıştığı alanlar doğrulandıktan sonra eklenecek.
              Her alan için kısa, bilgilendirici bir açıklama yazılacak;
              uzmanlık veya üstünlük iddiası kullanılmayacak.
            </PendingBlock>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}
