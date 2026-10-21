import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { RichText } from "@/components/primitives/rich-text"
import { routes } from "@/config/routes"
import { legalDisclaimer } from "@/content/legal/disclaimer"
import {
  articleHref,
  getArticle,
  getPublishedArticles,
} from "@/lib/content/articles"
import { formatDate } from "@/lib/format"
import { buildMetadata } from "@/lib/metadata"

/**
 * Cache Components ile generateStaticParams boş dizi döndüremez (build hatası).
 * Yayımlanmış yazı yokken tek yer tutucu yol üretilir ve 404 döner.
 */
const NO_ARTICLE_SLUG = "yayin-hazirlaniyor"

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  if (articles.length === 0) return [{ slug: NO_ARTICLE_SLUG }]
  return articles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/yayinlar/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Yayın bulunamadı", robots: { index: false } }

  const metadata = buildMetadata({
    href: articleHref(article.slug),
    title: article.title,
    description: article.excerpt,
  })
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      ...(article.cover
        ? { images: [{ url: article.cover.src, alt: article.cover.alt }] }
        : {}),
    },
  }
}

export default async function ArticlePage({
  params,
}: PageProps<"/yayinlar/[slug]">) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <article aria-labelledby="yayin-baslik" className="pb-24 md:pb-32">
      <Container className="pt-8 md:pt-12">
        <Breadcrumb
          className="animate-rise"
          items={[
            { label: "Ana sayfa", href: "/" },
            {
              label: routes.publications.label,
              href: routes.publications.href,
            },
            { label: article.title, href: articleHref(article.slug) },
          ]}
        />
        <span
          aria-hidden="true"
          className="mt-6 block h-px w-full bg-border md:mt-8"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <header className="md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
            <p className="tagline-rule-start flex-wrap eyebrow text-stone-deep">
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              {article.category ? <span>· {article.category}</span> : null}
            </p>
            <h1 id="yayin-baslik" className="mt-5 text-h1">
              {article.title}
            </h1>
            <p className="mt-6 text-lede text-muted-foreground">
              {article.excerpt}
            </p>
            {article.author ? (
              <p className="mt-6 text-sm">
                <span className="text-muted-foreground">Yazar: </span>
                {article.author}
              </p>
            ) : null}
          </header>

          {article.cover ? (
            <figure className="relative aspect-[16/9] overflow-hidden bg-paper-deep md:col-span-10 md:col-start-2">
              <Image
                src={article.cover.src}
                alt={article.cover.alt}
                fill
                preload
                sizes="(min-width: 768px) 80vw, 100vw"
                className="object-cover"
              />
            </figure>
          ) : null}

          <div className="md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
            <RichText
              value={article.body}
              headingLevel={2}
              className="text-[1.0625rem]"
            />
            <aside
              aria-label="Genel bilgilendirme uyarısı"
              className="mt-12 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground"
            >
              {legalDisclaimer}
            </aside>
            <ArrowLink href={routes.publications.href} className="mt-10">
              Tüm yayınlar
            </ArrowLink>
          </div>
        </div>
      </Container>
    </article>
  )
}
