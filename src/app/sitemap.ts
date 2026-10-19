import type { MetadataRoute } from "next"

import { routes } from "@/config/routes"
import { articleHref, getPublishedArticles } from "@/lib/content/articles"
import { attorneyHref, getAttorneys } from "@/lib/content/attorneys"
import { absoluteUrl } from "@/lib/env"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = Object.values(routes).map((route) => ({
    url: absoluteUrl(route.href),
    changeFrequency: "monthly" as const,
    priority: route.href === "/" ? 1 : 0.6,
  }))

  const profiles = (await getAttorneys()).map((attorney) => ({
    url: absoluteUrl(attorneyHref(attorney.slug)),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))

  const articles = (await getPublishedArticles()).map((article) => ({
    url: absoluteUrl(articleHref(article.slug)),
    lastModified: article.publishedAt,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }))

  return [...pages, ...profiles, ...articles]
}
