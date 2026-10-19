import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { routes } from "@/config/routes"
import { attorneyRecords } from "@/content/attorneys"
import { attorneySchema, type Attorney } from "@/lib/content/attorney-schema"
import { contentTags } from "@/lib/content/tags"
import { createPublicClient, mediaPublicUrl } from "@/lib/supabase/public"

/**
 * Avukat profilleri. Supabase yapılandırılmışsa yalnızca yayımlanmış kayıtlar
 * veritabanından (RLS ile) okunur; değilse yerel geçici kaynak (src/content/attorneys.ts).
 * Kayıtlar Zod şemasıyla doğrulanır. Veritabanı hatası yutulmaz.
 */

/** Profil sayfası yolu: /avukatlarimiz/<slug> */
export function attorneyHref(slug: string): `/${string}` {
  return `${routes.attorneys.href}/${slug}`
}

export type AttorneyRow = {
  id: string
  slug: string
  full_name: string
  title: string | null
  summary: string | null
  bar_association: string | null
  bar_registration_no: string | null
  photo_path: string | null
  photo_alt: string | null
  education: unknown
  experience: unknown
  practice_areas: string[] | null
  mediator_registry_no: string | null
  mediator_specializations: string[] | null
  mediator_verified: boolean
  sort_order: number
  published: boolean
}

export function attorneyFromRow(row: AttorneyRow): Attorney {
  const photoSrc = row.photo_path ? mediaPublicUrl(row.photo_path) : null
  return attorneySchema.parse({
    slug: row.slug,
    fullName: row.full_name,
    title: row.title ?? "",
    summary: row.summary ?? "",
    barAssociation: row.bar_association ?? "",
    barRegistrationNo: row.bar_registration_no ?? "",
    photo:
      photoSrc && row.photo_alt ? { src: photoSrc, alt: row.photo_alt } : null,
    education: Array.isArray(row.education) ? row.education : [],
    experience: Array.isArray(row.experience) ? row.experience : [],
    practiceAreas: row.practice_areas ?? [],
    mediator: row.mediator_registry_no
      ? {
          registryNo: row.mediator_registry_no,
          specializations: row.mediator_specializations ?? [],
          verified: row.mediator_verified,
        }
      : null,
    sortOrder: row.sort_order,
    published: row.published,
  })
}

const byOrder = (a: Attorney, b: Attorney) =>
  a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName, "tr")

export async function getAttorneys(): Promise<Attorney[]> {
  "use cache"
  cacheTag(contentTags.attorneys)
  cacheLife("hours")

  const supabase = createPublicClient()
  if (!supabase) {
    return attorneyRecords
      .map((record) => attorneySchema.parse(record))
      .filter((attorney) => attorney.published)
      .sort(byOrder)
  }

  const { data, error } = await supabase
    .from("attorneys")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .returns<AttorneyRow[]>()
  if (error) {
    throw new Error(`attorneys okunamadı (${error.code ?? "bilinmiyor"})`)
  }
  return (data ?? []).map(attorneyFromRow).sort(byOrder)
}

export async function getAttorney(slug: string): Promise<Attorney | null> {
  const attorneys = await getAttorneys()
  return attorneys.find((attorney) => attorney.slug === slug) ?? null
}
