/**
 * Sayfa kayıtları — navigasyon, metadata ve sitemap bu listeden üretilir.
 * `marker` alanı editoryal "madde" numarasıdır (§ 01 …, yasal metinlerde "Ek 1" …).
 */
export type RouteEntry = {
  href: `/${string}`
  label: string
  title: string
  description: string
  marker: string
}

export const routes = {
  home: {
    href: "/",
    label: "Ana sayfa",
    title: "Ana sayfa",
    description:
      "OKAY Hukuk Danışmanlık & Arabuluculuk — Afyonkarahisar'da hukuki danışmanlık ve arabuluculuk.",
    marker: "§ 00",
  },
  about: {
    href: "/hakkimizda",
    label: "Hakkımızda",
    title: "Hakkımızda",
    description:
      "Afyonkarahisar'daki OKAY Hukuk Danışmanlık & Arabuluculuk bürosu, çalışma ilkeleri ve yaklaşımı hakkında bilgi.",
    marker: "§ 01",
  },
  practiceAreas: {
    href: "/calisma-alanlari",
    label: "Çalışma Alanları",
    title: "Çalışma Alanları",
    description:
      "OKAY Hukuk Danışmanlık & Arabuluculuk bürosunun hukuki danışmanlık verdiği çalışma alanları.",
    marker: "§ 02",
  },
  mediation: {
    href: "/arabuluculuk",
    label: "Arabuluculuk",
    title: "Arabuluculuk",
    description:
      "6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu çerçevesinde arabuluculuk süreci hakkında bilgilendirme.",
    marker: "§ 03",
  },
  attorneys: {
    href: "/avukatlarimiz",
    label: "Avukatlarımız",
    title: "Avukatlarımız",
    description:
      "OKAY Hukuk Danışmanlık & Arabuluculuk bürosunda görev yapan avukatların mesleki bilgileri.",
    marker: "§ 04",
  },
  publications: {
    href: "/yayinlar",
    label: "Yayınlar",
    title: "Yayınlar",
    description:
      "Mevzuat ve uygulamaya ilişkin genel bilgilendirme amaçlı yazılar.",
    marker: "§ 05",
  },
  contact: {
    href: "/iletisim",
    label: "İletişim",
    title: "İletişim",
    description:
      "OKAY Hukuk Danışmanlık & Arabuluculuk iletişim bilgileri — Afyonkarahisar.",
    marker: "§ 06",
  },
  privacyNotice: {
    href: "/kvkk-aydinlatma-metni",
    label: "KVKK Aydınlatma Metni",
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    marker: "Ek 1",
  },
  privacyPolicy: {
    href: "/gizlilik-politikasi",
    label: "Gizlilik Politikası",
    title: "Gizlilik Politikası",
    description:
      "Bu internet sitesinin ziyaretçi bilgilerini nasıl ele aldığına ilişkin gizlilik politikası.",
    marker: "Ek 2",
  },
  cookiePolicy: {
    href: "/cerez-politikasi",
    label: "Çerez Politikası",
    title: "Çerez Politikası",
    description:
      "Bu internet sitesinde kullanılan çerezlere ilişkin bilgilendirme.",
    marker: "Ek 3",
  },
  legalNotice: {
    href: "/yasal-uyari",
    label: "Yasal Uyarı",
    title: "Yasal Uyarı",
    description:
      "Bu internet sitesinin kullanımına ve içeriklerinin niteliğine ilişkin yasal uyarı.",
    marker: "Ek 4",
  },
} as const satisfies Record<string, RouteEntry>

export type RouteKey = keyof typeof routes

export const mainNavigation = [
  routes.about,
  routes.practiceAreas,
  routes.mediation,
  routes.attorneys,
  routes.publications,
  routes.contact,
] as const satisfies readonly RouteEntry[]

export const legalNavigation = [
  routes.privacyNotice,
  routes.privacyPolicy,
  routes.cookiePolicy,
  routes.legalNotice,
] as const satisfies readonly RouteEntry[]

/** Sondaki "/" atılır (statik dışa aktarımda trailingSlash açıktır: "/iletisim/"). */
export function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
}

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
