"use server"

import { revalidatePath } from "next/cache"

import { requireStaffClient } from "@/lib/admin/auth"
import { dbFailure, text, type FormState } from "@/lib/admin/form"
import { uuidSchema } from "@/lib/admin/schemas"

/** Mesaj durumunu günceller (yalnızca admin). */
export async function setMessageStatus(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient("admin")
  const id = uuidSchema.safeParse(text(formData, "id"))
  const status = text(formData, "status")
  if (!id.success || !["new", "read", "archived"].includes(status)) {
    return { status: "error", message: "Geçersiz istek." }
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("mesaj durumu", error)
  if (!data || data.length === 0) {
    return { status: "error", message: "Mesaj bulunamadı veya yetkiniz yok." }
  }

  revalidatePath("/admin/mesajlar")
  return { status: "success", message: "Mesaj durumu güncellendi." }
}

/**
 * Mesajı kalıcı olarak siler (yalnızca admin). KVKK: saklama süresi dolan veya amacı
 * gerçekleşen kişisel veri imha edilir. Denetim kaydına yalnızca silme olayı yazılır.
 */
export async function deleteContactMessage(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireStaffClient("admin")
  const id = uuidSchema.safeParse(text(formData, "id"))
  if (!id.success) return { status: "error", message: "Geçersiz istek." }

  const { data, error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id.data)
    .select("id")
  if (error) return dbFailure("mesaj silme", error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Mesaj bulunamadı veya silme yetkiniz yok.",
    }
  }

  revalidatePath("/admin/mesajlar")
  return { status: "success", message: "Mesaj silindi." }
}
