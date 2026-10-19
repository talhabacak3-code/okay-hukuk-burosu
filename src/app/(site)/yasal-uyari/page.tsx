import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { PendingBlock } from "@/components/primitives/placeholder"
import { routes } from "@/config/routes"
import { legalDisclaimer } from "@/content/legal/disclaimer"
import { buildMetadata } from "@/lib/metadata"

const route = routes.legalNotice

export const metadata = buildMetadata(route)

export default function LegalNoticePage() {
  return (
    <>
      <PageHeader marker={route.marker} href={route.href} title={route.title} />
      <Container className="grid gap-8 pb-24 md:grid-cols-12 md:pb-32">
        <div className="space-y-8 md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3">
          <p className="max-w-measure border-t border-border pt-8 text-lede">
            {legalDisclaimer}
          </p>
          <PendingBlock title="Yasal uyarı metninin tamamı">
            Fikri mülkiyet, dış bağlantılar ve sorumluluk sınırlarına ilişkin
            bölümler hukuki incelemeden sonra eklenecek.
          </PendingBlock>
        </div>
      </Container>
    </>
  )
}
