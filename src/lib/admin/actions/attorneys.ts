"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { requireStaffClient } from "@/lib/admin/auth"
import {
  checkbox,
  dbFailure,
  invalid,
  text,
  type FormState,
} from "@/lib/admin/form"
import { attorneyFormSchema, uuidSchema } from "@/lib/admin/schemas"
import { contentTags } from "@/lib/content/tags"

type Supabase = Awaited<ReturnType<typeof requireStaffClient>>["supabase"]

function parse(formData: FormData) {
  return attorneyFormSchema.safeParse({
    fullName: text(formData, "fullName"),
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    barAssociation: text(formData, "barAssociation"),
    barRegistrationNo: text(formData, "barRegistrationNo"),
    photoPath: text(formData, "photoPath"),
    education: text(formData, "education"),
    experience: text(formData, "experience"),
    practiceAreas: text(formData, "practiceAreas"),
    mediatorRegistryNo: text(formData, "mediatorRegistryNo"),
    mediatorSpecializations: text(formData, "mediatorSpecializations"),
    mediatorVerified: checkbox(formData, "mediatorVerified"),
    sortOrder: text(formData, "sortOrder") || "0",
    published: checkbox(formData, "published"),
  })
}

/** Fotoğraf seçildiyse alt metni medya kütüphanesinden alır. */
async function withPhotoAlt(
  supabase: Supabase,
  values: NonNullable<ReturnType<typeof parse>["data"]>,
): Promise<
  { ok: true; row: Record<string, unknown> } | { ok: false; state: FormState }
> {
  if (!values.photo_path)
    return { ok: true, row: { ...values, photo_alt: null } }
  const { data, error } = await supabase
    .from("media")
    .select("alt")
    .eq("path", values.photo_path)
    .maybeSingle<{ alt: string }>()
  if (error) return { ok: false, state: dbFailure("medya okuma", error) }
  if (!data) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Seçilen fotoğraf medya kütüphanesinde bulunamadı.",
        fieldErrors: { photoPath: "Görsel bulunamadı." },
      },
    }
  }
  return { ok: true, row: { ...values, photo_alt: data.alt } }
}

export async function createAttorney(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)
  const prepared = await withPhotoAlt(supabase, parsed.data)
  if (!prepared.ok) return prepared.state

  const { data, error } = await supabase
    .from("attorneys")
    .insert(prepared.row)
    .select("id")
    .single<{ id: string }>()
  if (error) return dbFailure("avukat ekleme", error)

  updateTag(contentTags.attorneys)
  redirect(`/admin/avukatlar/${data.id}?kaydedildi=1`)
}

export async function updateAttorney(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)
  const prepared = await withPhotoAlt(supabase, parsed.data)
  if (!prepared.ok) return prepared.state

  const { data, error } = await supabase
    .from("attorneys")
    .update(prepared.row)
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("avukat güncelleme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya güncelleme yetkiniz yok.",
    }
  }

  updateTag(contentTags.attorneys)
  updateTag(contentTags.articles) // yazar adı yayınlarda görünür
  return { status: "success", message: "Avukat profili kaydedildi." }
}

export async function deleteAttorney(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }

  const { data, error } = await supabase
    .from("attorneys")
    .delete()
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("avukat silme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya silme yetkiniz yok.",
    }
  }

  updateTag(contentTags.attorneys)
  updateTag(contentTags.articles)
  redirect("/admin/avukatlar?silindi=1")
}
