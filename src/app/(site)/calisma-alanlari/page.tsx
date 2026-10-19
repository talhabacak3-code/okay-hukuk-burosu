import { PracticeCard } from "@/components/cards/practice-card"
import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { PendingBlock } from "@/components/primitives/placeholder"
import { RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { routes } from "@/config/routes"
import { getPracticeAreas } from "@/lib/content/practice-areas"
import { buildMetadata } from "@/lib/metadata"

const route = routes.practiceAreas

export const metadata = buildMetadata(route)

export default async function PracticeAreasPage() {
  const areas = await getPracticeAreas()

  return (
    <>
      <PageHeader marker={route.marker} href={route.href} title={route.title} />
      <Container className="pb-24 md:pb-32">
        {areas.length === 0 ? (
          <div className="grid md:grid-cols-12">
            <PendingBlock
              title="Çalışma alanları listesi"
              className="md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3"
            >
              Büronun fiilen çalıştığı alanlar doğrulandıktan sonra yönetim
              panelinden (Faaliyet alanları) eklenecek. Her alan için kısa ve
              bilgilendirici bir açıklama yazılacak; uzmanlık veya üstünlük
              iddiası kullanılmayacak.
            </PendingBlock>
          </div>
        ) : (
          <RevealGroup
            as="ol"
            className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {areas.map((area, index) => (
              <RevealItem as="li" key={area.slug}>
                <PracticeCard area={area} index={index + 1} headingLevel={2} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Container>
    </>
  )
}
