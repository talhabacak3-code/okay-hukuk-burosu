import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import {
  pageSchemas,
  type PageContentMap,
  type PageSlug,
} from "@/lib/content/page-schemas"
import { contentTags } from "@/lib/content/tags"
import { createPublicClient, mediaPublicUrl } from "@/lib/supabase/public"

/**
 * Sayfa metinlerini okur. Supabase yoksa veya sayfa boşsa tüm alanlar null döner
 * (site varsayılan metinleri / yer tutucuları kullanır). Veritabanı hatası yutulmaz.
 */
export async function getPageContent<S extends PageSlug>(
  slug: S,
): Promise<PageContentMap[S]> {
  "use cache"
  cacheTag(contentTags.pages, `${contentTags.pages}:${slug}`)
  cacheLife("hours")

  const schema = pageSchemas[slug]
  const supabase = createPublicClient()
  if (!supabase) return schema.parse({}) as PageContentMap[S]

  const { data, error } = await supabase
    .from("pages")
    .select("content")
    .eq("slug", slug)
    .maybeSingle<{ content: Record<string, unknown> }>()
  if (error) throw new Error(`pages okunamadı (${error.code ?? "bilinmiyor"})`)

  const parsed = schema.safeParse(data?.content ?? {})
  // Şemaya uymayan eski/bozuk içerik sitede gösterilmez; varsayılanlara dönülür.
  return (parsed.success ? parsed.data : schema.parse({})) as PageContentMap[S]
}

/** Büro fotoğrafı (ana sayfa içeriğinde seçilir). Yoksa null. */
export async function getOfficePhoto(): Promise<{
  src: string
  alt: string
} | null> {
  const home = await getPageContent("home")
  if (!home.officePhotoPath || !home.officePhotoAlt) return null
  const src = mediaPublicUrl(home.officePhotoPath)
  return src ? { src, alt: home.officePhotoAlt } : null
}
