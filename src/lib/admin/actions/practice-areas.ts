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
import { practiceAreaSchema, uuidSchema } from "@/lib/admin/schemas"
import { contentTags } from "@/lib/content/tags"

function parse(formData: FormData) {
  return practiceAreaSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    summary: text(formData, "summary"),
    sortOrder: text(formData, "sortOrder") || "0",
    published: checkbox(formData, "published"),
  })
}

export async function createPracticeArea(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)

  const { data, error } = await supabase
    .from("practice_areas")
    .insert(parsed.data)
    .select("id")
    .single<{ id: string }>()
  if (error) return dbFailure("faaliyet alanı ekleme", error)

  updateTag(contentTags.practiceAreas)
  redirect(`/admin/faaliyet-alanlari/${data.id}?kaydedildi=1`)
}

export async function updatePracticeArea(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)

  const { data, error } = await supabase
    .from("practice_areas")
    .update(parsed.data)
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("faaliyet alanı güncelleme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya güncelleme yetkiniz yok.",
    }
  }

  updateTag(contentTags.practiceAreas)
  return { status: "success", message: "Faaliyet alanı kaydedildi." }
}

export async function deletePracticeArea(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }

  const { data, error } = await supabase
    .from("practice_areas")
    .delete()
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("faaliyet alanı silme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya silme yetkiniz yok.",
    }
  }

  updateTag(contentTags.practiceAreas)
  redirect("/admin/faaliyet-alanlari?silindi=1")
}
