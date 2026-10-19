import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { MaybeValue, PendingBlock } from "@/components/primitives/placeholder"
import { RichText } from "@/components/primitives/rich-text"
import { routes } from "@/config/routes"
import { pageDefaults } from "@/lib/content/page-schemas"
import { getPageContent } from "@/lib/content/pages"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"

const route = routes.mediation

export const metadata = buildMetadata(route)

export default async function MediationPage() {
  const [{ professional }, content] = await Promise.all([
    getSiteSettings(),
    getPageContent("mediation"),
  ])

  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={<p>{content.intro ?? pageDefaults.mediationIntro}</p>}
      />
      <Container className="grid gap-8 pb-24 md:grid-cols-12 md:pb-32">
        <div className="space-y-12 md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3">
          <section
            aria-labelledby="arabulucu-bilgileri"
            className="border-t border-border pt-8"
          >
            <h2 id="arabulucu-bilgileri" className="text-h2">
              Arabulucu bilgileri
            </h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-[14rem_1fr]">
              <dt className="text-muted-foreground">Arabulucular Sicili no</dt>
              <dd>
                <MaybeValue value={professional.mediatorRegistryNo} />
              </dd>
              <dt className="text-muted-foreground">Uzmanlık alanları</dt>
              <dd>
                <MaybeValue value={professional.mediatorSpecializations} />
              </dd>
            </dl>
          </section>

          <section
            aria-labelledby="surec-baslik"
            className="border-t border-border pt-8"
          >
            <h2 id="surec-baslik" className="text-h2">
              Arabuluculuk süreci
            </h2>
            {content.process ? (
              <RichText value={content.process} className="mt-6" />
            ) : (
              <PendingBlock title="Süreç metni" className="mt-6">
                Başvuru, ilk toplantı, müzakere ve anlaşma/anlaşamama tutanağı
                aşamaları; mevzuat metni doğrulanarak yönetim panelinden
                (Arabuluculuk) eklenecek.
              </PendingBlock>
            )}
          </section>

          <section
            aria-labelledby="ayrilik-baslik"
            className="border-t border-border pt-8"
          >
            <h2 id="ayrilik-baslik" className="text-h2">
              Tarafsızlık ve görev ayrılığı
            </h2>
            {content.roleSeparation ? (
              <RichText value={content.roleSeparation} className="mt-6" />
            ) : (
              <PendingBlock title="Bilgilendirme metni" className="mt-6">
                Arabulucunun tarafsızlık ve bağımsızlık ilkeleri ile avukatlık
                ve arabuluculuk görevlerinin ayrılığına ilişkin bilgilendirme,
                ilgili mevzuat ve Arabuluculuk Etik Kuralları doğrulanarak
                eklenecek.
              </PendingBlock>
            )}
          </section>
        </div>
      </Container>
    </>
  )
}
