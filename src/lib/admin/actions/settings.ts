"use server"

import { updateTag } from "next/cache"

import { requireStaffClient } from "@/lib/admin/auth"
import {
  checkbox,
  dbFailure,
  invalid,
  text,
  type FormState,
} from "@/lib/admin/form"
import { contactSettingsSchema, siteSettingsSchema } from "@/lib/admin/schemas"
import { contentTags } from "@/lib/content/tags"

/** site_settings tek satırını günceller (yalnızca admin; RLS ayrıca zorlar). */
async function updateSettings(
  values: Record<string, unknown>,
  context: string,
  message: string,
): Promise<FormState> {
  const { supabase } = await requireStaffClient("admin")
  const { data, error } = await supabase
    .from("site_settings")
    .update(values)
    .eq("id", true)
    .select("id")
  if (error) return dbFailure(context, error)
  if (!data || data.length === 0) {
    return {
      status: "error",
      message:
        "Site ayarları satırı bulunamadı. Lütfen ilk içerik migration'ının uygulandığını kontrol edin.",
    }
  }
  updateTag(contentTags.settings)
  return { status: "success", message }
}

export async function saveContactSettings(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSettingsSchema.safeParse({
    address: text(formData, "address"),
    phone: text(formData, "phone"),
    mobile: text(formData, "mobile"),
    email: text(formData, "email"),
    kep: text(formData, "kep"),
    workingHours: text(formData, "workingHours"),
    mapUrl: text(formData, "mapUrl"),
    contactVerified: checkbox(formData, "contactVerified"),
  })
  if (!parsed.success) return invalid(parsed.error)
  return updateSettings(
    parsed.data,
    "iletişim bilgileri",
    "İletişim bilgileri kaydedildi ve sitede güncellendi.",
  )
}

export async function saveSiteSettings(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = siteSettingsSchema.safeParse({
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    legalName: text(formData, "legalName"),
    barAssociation: text(formData, "barAssociation"),
    barRegistrationNo: text(formData, "barRegistrationNo"),
    mediatorRegistryNo: text(formData, "mediatorRegistryNo"),
    mediatorSpecializations: text(formData, "mediatorSpecializations"),
    foundedYear: text(formData, "foundedYear"),
    workingLanguages: text(formData, "workingLanguages"),
    dataControllerName: text(formData, "dataControllerName"),
    dataControllerAddress: text(formData, "dataControllerAddress"),
    dataControllerEmail: text(formData, "dataControllerEmail"),
  })
  if (!parsed.success) return invalid(parsed.error)
  return updateSettings(
    parsed.data,
    "site ayarları",
    "Site ayarları kaydedildi ve sitede güncellendi.",
  )
}
