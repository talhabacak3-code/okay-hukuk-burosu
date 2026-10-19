"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { requireStaffClient } from "@/lib/admin/auth"
import { dbFailure, invalid, text, type FormState } from "@/lib/admin/form"
import { articleFormSchema, uuidSchema } from "@/lib/admin/schemas"
import { contentTags } from "@/lib/content/tags"

type Supabase = Awaited<ReturnType<typeof requireStaffClient>>["supabase"]

function parse(formData: FormData) {
  return articleFormSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    category: text(formData, "category"),
    authorAttorneyId: text(formData, "authorAttorneyId"),
    coverPath: text(formData, "coverPath"),
    status: text(formData, "status"),
    publishedDate: text(formData, "publishedDate"),
  })
}

async function withCoverAlt(
  supabase: Supabase,
  values: NonNullable<ReturnType<typeof parse>["data"]>,
): Promise<
  { ok: true; row: Record<string, unknown> } | { ok: false; state: FormState }
> {
  if (!values.cover_path)
    return { ok: true, row: { ...values, cover_alt: null } }
  const { data, error } = await supabase
    .from("media")
    .select("alt")
    .eq("path", values.cover_path)
    .maybeSingle<{ alt: string }>()
  if (error) return { ok: false, state: dbFailure("medya okuma", error) }
  if (!data) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Seçilen kapak görseli medya kütüphanesinde bulunamadı.",
        fieldErrors: { coverPath: "Görsel bulunamadı." },
      },
    }
  }
  return { ok: true, row: { ...values, cover_alt: data.alt } }
}

export async function createArticle(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)
  const prepared = await withCoverAlt(supabase, parsed.data)
  if (!prepared.ok) return prepared.state

  const { data, error } = await supabase
    .from("articles")
    .insert(prepared.row)
    .select("id")
    .single<{ id: string }>()
  if (error) return dbFailure("yayın ekleme", error)

  updateTag(contentTags.articles)
  redirect(`/admin/yayinlar/${data.id}?kaydedildi=1`)
}

export async function updateArticle(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }
  const parsed = parse(formData)
  if (!parsed.success) return invalid(parsed.error)
  const prepared = await withCoverAlt(supabase, parsed.data)
  if (!prepared.ok) return prepared.state

  const { data, error } = await supabase
    .from("articles")
    .update(prepared.row)
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("yayın güncelleme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya güncelleme yetkiniz yok.",
    }
  }

  updateTag(contentTags.articles)
  return {
    status: "success",
    message:
      parsed.data.status === "published"
        ? "Yayın kaydedildi ve sitede yayımlandı."
        : "Taslak kaydedildi (sitede görünmez).",
  }
}

export async function deleteArticle(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }

  const { data, error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("yayın silme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya silme yetkiniz yok.",
    }
  }

  updateTag(contentTags.articles)
  redirect("/admin/yayinlar?silindi=1")
}
