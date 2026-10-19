import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { PendingBlock } from "@/components/primitives/placeholder"
import { routes } from "@/config/routes"
import { buildMetadata } from "@/lib/metadata"

const route = routes.cookiePolicy

export const metadata = buildMetadata(route)

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={<p>{route.description}</p>}
      />
      <Container className="grid gap-8 pb-24 md:grid-cols-12 md:pb-32">
        <div className="md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3">
          <PendingBlock title="Çerez politikası metni">
            Sitede analitik, pazarlama veya üçüncü taraf çerezi kullanılmaya
            başlanırsa; çerez türleri, amaçları ve saklama süreleri Kişisel
            Verileri Koruma Kurulu&apos;nun çerez uygulamalarına ilişkin
            rehberine göre listelenecek ve zorunlu olmayan çerezler için önceden
            açık rıza alınacak. Metin hukuki incelemeden sonra eklenecek.
          </PendingBlock>
        </div>
      </Container>
    </>
  )
}
