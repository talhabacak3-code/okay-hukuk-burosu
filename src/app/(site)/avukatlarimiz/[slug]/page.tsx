import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AttorneyProfile } from "@/components/attorneys/attorney-profile"
import { JsonLd } from "@/components/seo/json-ld"
import { siteConfig } from "@/config/site"
import {
  attorneyHref,
  getAttorney,
  getAttorneys,
} from "@/lib/content/attorneys"
import { buildMetadata } from "@/lib/metadata"
import { attorneyJsonLd } from "@/lib/structured-data"

/**
 * Cache Components ile generateStaticParams boş dizi döndüremez (build hatası).
 * Henüz yayımlanmış profil yoksa bu tek yer tutucu yol üretilir ve 404 döner.
 */
const NO_PROFILE_SLUG = "profil-hazirlaniyor"

export async function generateStaticParams() {
  const attorneys = await getAttorneys()
  if (attorneys.length === 0) return [{ slug: NO_PROFILE_SLUG }]
  return attorneys.map((attorney) => ({ slug: attorney.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/avukatlarimiz/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const attorney = await getAttorney(slug)
  if (!attorney) {
    return { title: "Profil bulunamadı", robots: { index: false } }
  }

  const role = attorney.title ? `${attorney.title}, ` : ""
  return buildMetadata({
    href: attorneyHref(attorney.slug),
    title: attorney.fullName,
    description: `${attorney.fullName} — ${role}${siteConfig.name}. Mesleki bilgiler ve özgeçmiş.`,
  })
}

export default async function AttorneyPage({
  params,
}: PageProps<"/avukatlarimiz/[slug]">) {
  const { slug } = await params
  const attorney = await getAttorney(slug)
  if (!attorney) notFound()

  return (
    <>
      <AttorneyProfile attorney={attorney} />
      <JsonLd data={attorneyJsonLd(attorney)} />
    </>
  )
}
