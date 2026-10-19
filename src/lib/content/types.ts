/**
 * Yayın (bilgi notu) özeti — liste ve kartlarda kullanılır.
 * `publishedAt` ISO 8601 tarih dizesidir (ör. "2026-01-15").
 */
export type ArticleSummary = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  category?: string
  author?: string
}

/** Yayının tamamı (detay sayfası). */
export type Article = ArticleSummary & {
  body: string
  cover: { src: string; alt: string } | null
}
