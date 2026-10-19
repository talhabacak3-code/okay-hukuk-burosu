"use server"

import { revalidatePath, updateTag } from "next/cache"

import { requireStaffClient } from "@/lib/admin/auth"
import { dbFailure, invalid, text, type FormState } from "@/lib/admin/form"
import { prepareImageUpload } from "@/lib/admin/media"
import { mediaAltSchema, uuidSchema } from "@/lib/admin/schemas"
import { contentTags } from "@/lib/content/tags"

/**
 * Görsel yükleme: tür/boyut doğrulaması ve üst veri temizliği sunucuda yapılır;
 * dosya kullanıcının oturumuyla (Storage RLS: yalnızca panel personeli) yüklenir.
 * Üst veri kaydı başarısız olursa yüklenen dosya geri silinir (yetim dosya kalmaz).
 */
export async function uploadMedia(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireStaffClient()

  const alt = mediaAltSchema.safeParse({ alt: text(formData, "alt") })
  if (!alt.success) return invalid(alt.error)

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Lütfen bir görsel seçin.",
      fieldErrors: { file: "Görsel seçilmedi." },
    }
  }

  const prepared = await prepareImageUpload(file, new Date())
  if (!prepared.ok) {
    return {
      status: "error",
      message: prepared.message,
      fieldErrors: { file: prepared.message },
    }
  }
  const { upload } = prepared

  const { error: storageError } = await supabase.storage
    .from("media")
    .upload(upload.path, upload.body, {
      contentType: upload.mime,
      cacheControl: "31536000",
      upsert: false,
    })
  if (storageError) {
    console.error("[admin] medya yükleme başarısız:", storageError.name)
    return {
      status: "error",
      message: "Görsel depoya yüklenemedi; değişiklik kaydedilmedi.",
    }
  }

  const { error } = await supabase.from("media").insert({
    path: upload.path,
    mime_type: upload.mime,
    size_bytes: upload.body.length,
    width: upload.width,
    height: upload.height,
    alt: alt.data.alt,
    uploaded_by: user.id,
  })
  if (error) {
    await supabase.storage.from("media").remove([upload.path])
    return dbFailure("medya kaydı", error)
  }

  updateTag(contentTags.media)
  revalidatePath("/admin/medya")
  return {
    status: "success",
    message: "Görsel yüklendi ve kütüphaneye eklendi.",
  }
}

export async function updateMediaAlt(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }
  const alt = mediaAltSchema.safeParse({ alt: text(formData, "alt") })
  if (!alt.success) return invalid(alt.error)

  const { data, error } = await supabase
    .from("media")
    .update({ alt: alt.data.alt })
    .eq("id", id.data)
    .select("path")
  if (error) return dbFailure("alt metin güncelleme", error)
  const path = (data as { path: string }[] | null)?.[0]?.path
  if (!path) {
    return {
      status: "error",
      message: "Kayıt bulunamadı veya güncelleme yetkiniz yok.",
    }
  }

  // Görseli kullanan kayıtların alt metnini de eşitle.
  const [a, b] = await Promise.all([
    supabase
      .from("attorneys")
      .update({ photo_alt: alt.data.alt })
      .eq("photo_path", path),
    supabase
      .from("articles")
      .update({ cover_alt: alt.data.alt })
      .eq("cover_path", path),
  ])
  if (a.error || b.error)
    return dbFailure("alt metin eşitleme", a.error ?? b.error)

  updateTag(contentTags.media)
  revalidatePath("/admin/medya")
  updateTag(contentTags.attorneys)
  updateTag(contentTags.articles)
  return { status: "success", message: "Alt metin güncellendi." }
}

export async function deleteMedia(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient()
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz kayıt." }

  const { data: media, error: readError } = await supabase
    .from("media")
    .select("path")
    .eq("id", id.data)
    .maybeSingle<{ path: string }>()
  if (readError) return dbFailure("medya okuma", readError)
  if (!media) return { status: "error", message: "Kayıt bulunamadı." }

  // Kullanımdaki görsel silinmez.
  const [attorneys, articles, pages] = await Promise.all([
    supabase
      .from("attorneys")
      .select("id", { count: "exact", head: true })
      .eq("photo_path", media.path),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("cover_path", media.path),
    supabase
      .from("pages")
      .select("slug", { count: "exact", head: true })
      .eq("content->>officePhotoPath", media.path),
  ])
  const usageError = attorneys.error ?? articles.error ?? pages.error
  if (usageError) return dbFailure("medya kullanım kontrolü", usageError)
  if ((attorneys.count ?? 0) + (articles.count ?? 0) + (pages.count ?? 0) > 0) {
    return {
      status: "error",
      message:
        "Bu görsel bir avukat profilinde, yayında veya ana sayfada kullanılıyor. Önce oradan kaldırın.",
    }
  }

  const { error: storageError } = await supabase.storage
    .from("media")
    .remove([media.path])
  if (storageError) {
    console.error("[admin] medya dosyası silinemedi:", storageError.name)
    return {
      status: "error",
      message: "Dosya depodan silinemedi; işlem yapılmadı.",
    }
  }

  const { error } = await supabase.from("media").delete().eq("id", id.data)
  if (error) return dbFailure("medya kaydı silme", error)

  updateTag(contentTags.media)
  revalidatePath("/admin/medya")
  return { status: "success", message: "Görsel silindi." }
}
