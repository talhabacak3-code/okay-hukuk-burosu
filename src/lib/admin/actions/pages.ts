"use server"

import { updateTag } from "next/cache"

import { requireStaffClient } from "@/lib/admin/auth"
import { dbFailure, invalid, text, type FormState } from "@/lib/admin/form"
import { pageSchemas, type PageSlug } from "@/lib/content/page-schemas"
import { contentTags } from "@/lib/content/tags"

/** Sayfa metnini kaydeder (upsert). Başarı yalnızca veritabanı onayıyla döner. */
async function savePage(
  slug: PageSlug,
  raw: Record<string, unknown>,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()

  const parsed = pageSchemas[slug].safeParse(raw)
  if (!parsed.success) return invalid(parsed.error)
  const content: Record<string, unknown> = { ...parsed.data }

  // Büro fotoğrafı: alt metin medya kütüphanesindeki kayıttan alınır.
  if (slug === "home") {
    const path = content.officePhotoPath as string | null
    content.officePhotoAlt = null
    if (path) {
      const { data: media, error } = await supabase
        .from("media")
        .select("alt")
        .eq("path", path)
        .maybeSingle<{ alt: string }>()
      if (error) return dbFailure("medya okuma", error)
      if (!media) {
        return {
          status: "error",
          message: "Seçilen görsel medya kütüphanesinde bulunamadı.",
          fieldErrors: { officePhotoPath: "Görsel bulunamadı." },
        }
      }
      content.officePhotoAlt = media.alt
    }
  }

  const { error } = await supabase
    .from("pages")
    .upsert({ slug, content }, { onConflict: "slug" })
  if (error) return dbFailure(`sayfa (${slug}) kaydı`, error)

  updateTag(contentTags.pages)
  return {
    status: "success",
    message: "Değişiklikler kaydedildi ve sitede yayımlandı.",
  }
}

export async function saveHomePage(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  return savePage("home", {
    heroLine1: text(formData, "heroLine1"),
    heroLine2: text(formData, "heroLine2"),
    heroLede: text(formData, "heroLede"),
    introText: text(formData, "introText"),
    officePhotoPath: text(formData, "officePhotoPath"),
  })
}

export async function saveAboutPage(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  return savePage("about", {
    intro: text(formData, "intro"),
    approach: text(formData, "approach"),
  })
}

export async function saveMediationPage(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  return savePage("mediation", {
    intro: text(formData, "intro"),
    process: text(formData, "process"),
    roleSeparation: text(formData, "roleSeparation"),
  })
}
