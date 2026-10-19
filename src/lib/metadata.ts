import type { Metadata } from "next"

import type { RouteEntry } from "@/config/routes"
import { logoAlt } from "@/config/brand"
import { siteConfig } from "@/config/site"

/**
 * Paylaşım görseli: src/app/opengraph-image.png (scripts/branding/prepare-og-image.mjs).
 * Sayfa düzeyinde tanımlanan openGraph nesnesi üst segmentteki dosya tabanlı görseli
 * devralmadığından burada açıkça eklenir.
 */
const shareImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: logoAlt,
}

/**
 * Sayfa metadata'sı: title, description, canonical ve Open Graph.
 * Yer tutucu (doğrulanmamış) bilgiler metadata'ya hiçbir zaman eklenmez.
 */
export function buildMetadata(
  route: Pick<RouteEntry, "href" | "title" | "description">,
  options: { absoluteTitle?: boolean } = {},
): Metadata {
  const title = options.absoluteTitle ? { absolute: route.title } : route.title
  const ogTitle =
    route.href === "/"
      ? siteConfig.name
      : `${route.title} · ${siteConfig.shortName}`

  return {
    title,
    description: route.description,
    alternates: { canonical: route.href },
    openGraph: {
      type: "website",
      locale: siteConfig.ogLocale,
      siteName: siteConfig.name,
      url: route.href,
      title: ogTitle,
      description: route.description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: route.description,
      images: [shareImage],
    },
  }
}
