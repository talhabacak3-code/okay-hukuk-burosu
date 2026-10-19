import { ArticleCard } from "@/components/cards/article-card"
import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { PendingBlock } from "@/components/primitives/placeholder"
import { RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { routes } from "@/config/routes"
import { articleHref, getPublishedArticles } from "@/lib/content/articles"
import { buildMetadata } from "@/lib/metadata"

const route = routes.publications

export const metadata = buildMetadata(route)

export default async function PublicationsPage() {
  const articles = await getPublishedArticles()

  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={<p>{route.description}</p>}
      />
      <Container className="pb-24 md:pb-32">
        {articles.length > 0 ? (
          <RevealGroup
            as="ol"
            className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
          >
            {articles.map((article) => (
              <RevealItem as="li" key={article.slug}>
                <ArticleCard
                  article={article}
                  href={articleHref(article.slug)}
                  headingLevel={2}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="grid md:grid-cols-12">
            <PendingBlock
              title="Yayın listesi"
              className="md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3"
            >
              Henüz yayımlanmış yazı yok. Yazılar yönetim panelinden (Hukuki
              yayınlar) eklenir; her yazıda yayın tarihi, yazar ve genel
              bilgilendirme uyarısı yer alır.
            </PendingBlock>
          </div>
        )}
      </Container>
    </>
  )
}
