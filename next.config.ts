import type { NextConfig } from "next"

// Panelden yüklenen görseller Supabase Storage'dan (herkese açık 'media' kovası) sunulur.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const mediaPattern = supabaseUrl
  ? [
      new URL(
        `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/media/**`,
      ),
    ]
  : []

const isDev = process.env.NODE_ENV === "development"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? ""
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : ""

/**
 * İçerik Güvenliği Politikası (CSP).
 *
 * Sayfalar statik/PPR olarak önceden üretildiği için istek başına nonce kullanılamaz
 * (Next.js CSP rehberi: nonce, PPR ile uyumsuzdur). Next.js satır içi RSC betikleri
 * ürettiğinden script-src 'unsafe-inline' içerir; buna karşın harici betik kaynağı
 * yalnızca 'self'tir, eklenti/iframe/base etiketi yasaktır ve formlar yalnızca siteye
 * gönderilir. XSS'e karşı asıl savunma: React'in otomatik kaçışı, kullanıcı içeriğinin
 * HTML olarak hiç basılmaması (RichText düz metin üretir) ve JSON-LD'de "<" kaçışı.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}${isDev ? " ws:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(siteUrl.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // HTTPS üzerinde geçerlidir (HTTP yanıtlarında tarayıcılar yok sayar). Alan adının
  // diğer alt alan adları bilinmediği için includeSubDomains/preload eklenmedi.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
]

/**
 * GitHub Pages (statik dışa aktarım) modu: GITHUB_PAGES=true. Yalnızca kamuya açık sayfalar
 * HTML olarak üretilir; panel, iletişim formu gönderimi, proxy, güvenlik başlıkları ve
 * yönlendirmeler bu modda YOKTUR (Next.js statik dışa aktarım kısıtları). Kaynaklar
 * derlemeden önce scripts/pages/prepare.mjs ile ayıklanır (yalnızca CI'da).
 * NEXT_PUBLIC_BASE_PATH: depo adıyla alt yol (ör. /okay-hukuk-burosu).
 */
const pagesExport = process.env.GITHUB_PAGES === "true"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || undefined

const serverOnly: Pick<NextConfig, "headers" | "redirects"> = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      // Aşama 4: ekip sayfası /avukatlarimiz olarak yeniden adlandırıldı.
      { source: "/ekip", destination: "/avukatlarimiz", permanent: true },
    ]
  },
}

const nextConfig: NextConfig = {
  ...(pagesExport
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
      }
    : serverOnly),
  poweredByHeader: false,
  // Statik dışa aktarım PPR'ı desteklemez ("PPR cannot be enabled in export mode");
  // Cache Components PPR'ı açtığı için Pages modunda kapatılır, "use cache" ise
  // experimental.useCache ile çalışmaya devam eder.
  cacheComponents: !pagesExport,
  partialPrefetching: !pagesExport,
  images: {
    remotePatterns: mediaPattern,
    // Statik barındırmada görsel optimizasyon sunucusu yoktur.
    unoptimized: pagesExport,
  },
  experimental: {
    ...(pagesExport ? { useCache: true } : {}),
    serverActions: {
      // Medya yüklemesi: dosya en fazla 5 MB (sunucuda ayrıca doğrulanır) + form alanları.
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
