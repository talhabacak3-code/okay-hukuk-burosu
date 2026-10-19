import type { MetadataRoute } from "next"

import { absoluteUrl, publicEnv } from "@/lib/env"

/** Yayın onayı (NEXT_PUBLIC_SITE_INDEXABLE=true) verilene kadar tüm site taramaya kapalıdır. */
export default function robots(): MetadataRoute.Robots {
  if (!publicEnv.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    // Yönetim paneli ayrıca noindex başlığı taşır; taramaya da kapatılır.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
