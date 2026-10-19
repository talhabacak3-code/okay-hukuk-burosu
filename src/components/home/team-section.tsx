import { AttorneyGrid } from "@/components/attorneys/attorney-grid"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { PendingBlock } from "@/components/primitives/placeholder"
import { Reveal } from "@/components/primitives/reveal"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { routes } from "@/config/routes"
import { getAttorneys } from "@/lib/content/attorneys"

/** Avukat profilleri — yalnızca gerçek ve doğrulanmış kişiler; 1–4 kişiye göre yerleşim. */
export async function TeamSection() {
  const attorneys = await getAttorneys()

  return (
    <Section aria-labelledby="avukatlar-baslik">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
          <SectionHeading
            id="avukatlar-baslik"
            marker={routes.attorneys.marker}
            title="Avukatlarımız"
            lede="Büroda görev yapan avukatların mesleki bilgileri."
          />
          <ArrowLink href={routes.attorneys.href}>Tüm profiller</ArrowLink>
        </div>

        <div className="mt-12">
          {attorneys.length > 0 ? (
            <AttorneyGrid attorneys={attorneys} headingLevel={3} />
          ) : (
            <Reveal className="grid md:grid-cols-12">
              <PendingBlock
                title="Avukat profilleri"
                className="md:col-span-8 md:col-start-5"
              >
                Ad soyad, unvan, baro ve sicil numarası (teyitliyse arabulucu
                sicil numarası) yönetim panelinden eklenecek. Fotoğraflar
                yalnızca kişinin onayıyla ve gerçek fotoğraf olarak
                kullanılacak.
              </PendingBlock>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  )
}
