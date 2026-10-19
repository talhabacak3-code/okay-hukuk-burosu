import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { siteConfig, type PracticeArea } from "@/config/site"
import { contentTags } from "@/lib/content/tags"
import { createPublicClient } from "@/lib/supabase/public"

/**
 * Faaliyet alanları. Supabase yapılandırılmışsa yayımlanmış kayıtlar veritabanından,
 * değilse yerel yapılandırmadan (boş) okunur. Veritabanı hatası yutulmaz.
 */
export async function getPracticeAreas(): Promise<PracticeArea[]> {
  "use cache"
  cacheTag(contentTags.practiceAreas)
  cacheLife("hours")

  const supabase = createPublicClient()
  if (!supabase) return siteConfig.practiceAreas

  const { data, error } = await supabase
    .from("practice_areas")
    .select("slug, title, summary")
    .eq("published", true)
    .order("sort_order")
    .order("title")
    .returns<PracticeArea[]>()
  if (error) {
    throw new Error(`practice_areas okunamadı (${error.code ?? "bilinmiyor"})`)
  }
  return data ?? []
}
