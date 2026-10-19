import { AttorneyGrid } from "@/components/attorneys/attorney-grid"
import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { PendingBlock } from "@/components/primitives/placeholder"
import { routes } from "@/config/routes"
import { getAttorneys } from "@/lib/content/attorneys"
import { buildMetadata } from "@/lib/metadata"

const route = routes.attorneys

export const metadata = buildMetadata(route)

export default async function AttorneysPage() {
  const attorneys = await getAttorneys()

  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={
          <p>
            Büroda görev yapan avukatların mesleki bilgileri. Profillerde
            yalnızca doğrulanmış bilgiler yer alır.
          </p>
        }
      />
      <Container className="pb-24 md:pb-32">
        {attorneys.length > 0 ? (
          <AttorneyGrid attorneys={attorneys} />
        ) : (
          <div className="grid md:grid-cols-12">
            <PendingBlock
              title="Avukat profilleri"
              className="md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3"
            >
              Ad soyad, unvan, baro, sicil numarası, eğitim, mesleki geçmiş,
              faaliyet alanları ve (teyitliyse) arabulucu sicil bilgileri
              yönetim panelinden eklenecek. Gerçek bilgi sağlanana kadar bu
              sayfada kişi gösterilmez.
            </PendingBlock>
          </div>
        )}
      </Container>
    </>
  )
}
