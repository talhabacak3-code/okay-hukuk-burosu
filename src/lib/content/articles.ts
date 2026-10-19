import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { routes } from "@/config/routes"
import { contentTags } from "@/lib/content/tags"
import type { Article, ArticleSummary } from "@/lib/content/types"
import { createPublicClient, mediaPublicUrl } from "@/lib/supabase/public"

/**
 * Hukuki yayınlar. Yalnızca yayımlanmış ve yayın tarihi gelmiş yazılar okunur (RLS).
 * Supabase yoksa yayın yoktur — örnek/uydurma yazı eklenmez. Veritabanı hatası yutulmaz.
 */

export function articleHref(slug: string): `/${string}` {
  return `${routes.publications.href}/${slug}`
}

type ArticleRow = {
  slug: string
  title: string
  excerpt: string
  body: string
  category: string | null
  published_at: string
  cover_path: string | null
  cover_alt: string | null
  author: { full_name: string } | null
}

function toArticle(row: ArticleRow): Article {
  const coverSrc = row.cover_path ? mediaPublicUrl(row.cover_path) : null
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedAt: row.published_at,
    category: row.category ?? undefined,
    author: row.author?.full_name ?? undefined,
    cover:
      coverSrc && row.cover_alt ? { src: coverSrc, alt: row.cover_alt } : null,
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  "use cache"
  cacheTag(contentTags.articles)
  cacheLife("hours")

  const supabase = createPublicClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("articles")
    .select(
      "slug, title, excerpt, body, category, published_at, cover_path, cover_alt, author:attorneys(full_name)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<ArticleRow[]>()
  if (error) {
    throw new Error(`articles okunamadı (${error.code ?? "bilinmiyor"})`)
  }
  return (data ?? []).map(toArticle)
}

export async function getLatestArticles(limit = 3): Promise<ArticleSummary[]> {
  const articles = await getPublishedArticles()
  return articles.slice(0, limit)
}

export async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getPublishedArticles()
  return articles.find((article) => article.slug === slug) ?? null
}
