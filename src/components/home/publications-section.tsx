import { ArticleCard } from "@/components/cards/article-card"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { PendingBlock } from "@/components/primitives/placeholder"
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { routes } from "@/config/routes"
import { articleHref, getLatestArticles } from "@/lib/content/articles"

/** Hukuki yayınlar — ilk yazı öne çıkan düzende, diğerleri yanında. */
export async function PublicationsSection() {
  const articles = await getLatestArticles(3)
  const [featured, ...rest] = articles

  return (
    <Section surface="paper-deep" aria-labelledby="yayinlar-baslik">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            id="yayinlar-baslik"
            marker={routes.publications.marker}
            title="Hukuki yayınlar"
            lede="Mevzuat ve uygulamaya ilişkin genel bilgilendirme amaçlı yazılar."
          />
          <ArrowLink href={routes.publications.href}>Tüm yayınlar</ArrowLink>
        </div>

        {featured ? (
          <div className="mt-14 grid gap-x-10 gap-y-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <ArticleCard
                article={featured}
                href={articleHref(featured.slug)}
                layout="featured"
              />
            </Reveal>
            <RevealGroup className="grid gap-12 lg:col-span-5">
              {rest.map((article) => (
                <RevealItem key={article.slug}>
                  <ArticleCard
                    article={article}
                    href={articleHref(article.slug)}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : (
          <Reveal className="mt-14">
            <PendingBlock title="Yayın listesi">
              Yazılar sonraki aşamada içerik yönetimi üzerinden yayımlanacak;
              her yazıda yayın tarihi, yazar ve genel bilgilendirme uyarısı yer
              alacak.
            </PendingBlock>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}
