import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { siteConfig } from "@/config/site"
import { contentTags } from "@/lib/content/tags"
import { placeholder, type Maybe } from "@/lib/placeholder"
import { createPublicClient } from "@/lib/supabase/public"

/**
 * Sitede gösterilen, panelden ("İletişim bilgileri" ve "SEO ve site ayarları")
 * düzenlenebilen kurumsal bilgiler. Boş alanlar açık yer tutucu olarak döner.
 */
export type SiteSettings = {
  legalName: Maybe<string>
  contact: {
    address: Maybe<string>
    phone: Maybe<string>
    mobile: Maybe<string>
    email: Maybe<string>
    kep: Maybe<string>
    workingHours: Maybe<string>
    mapUrl: Maybe<string>
    verified: boolean
  }
  professional: {
    barAssociation: Maybe<string>
    barRegistrationNo: Maybe<string>
    mediatorRegistryNo: Maybe<string>
    mediatorSpecializations: Maybe<string>
  }
  firm: {
    foundedYear: Maybe<string>
    workingLanguages: Maybe<string>
  }
  dataController: {
    name: Maybe<string>
    address: Maybe<string>
    contactEmail: Maybe<string>
  }
  seo: {
    title: string
    description: string
  }
}

const or = (value: string | null | undefined, label: string): Maybe<string> =>
  value && value.trim() !== "" ? value : placeholder(label)

/** Supabase yoksa: yerel yapılandırma (src/config/site.ts). */
function localSettings(): SiteSettings {
  return {
    legalName: siteConfig.legalName,
    contact: siteConfig.contact,
    professional: siteConfig.professional,
    firm: siteConfig.firm,
    dataController: siteConfig.dataController,
    seo: { title: siteConfig.name, description: siteConfig.description },
  }
}

type SettingsRow = Record<string, string | boolean | null>

/**
 * Site ayarlarını okur. Önbellekli ("use cache"); panelden kayıt sonrası
 * `updateTag(contentTags.settings)` ile yenilenir. Veritabanı hatası yutulmaz.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache"
  cacheTag(contentTags.settings)
  cacheLife("hours")

  const supabase = createPublicClient()
  if (!supabase) return localSettings()

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle<SettingsRow>()
  if (error) {
    throw new Error(`site_settings okunamadı (${error.code ?? "bilinmiyor"})`)
  }

  const row: SettingsRow = data ?? {}
  const s = (key: string) => {
    const value = row[key]
    return typeof value === "string" ? value : null
  }

  return {
    legalName: or(s("legal_name"), "Baro kaydındaki tam unvan"),
    contact: {
      address: or(s("address"), "Açık adres"),
      phone: or(s("phone"), "Telefon"),
      mobile: or(s("mobile"), "Mobil telefon"),
      email: or(s("email"), "E-posta"),
      kep: or(s("kep"), "KEP adresi"),
      workingHours: or(s("working_hours"), "Çalışma saatleri"),
      mapUrl: or(s("map_url"), "Harita bağlantısı"),
      verified: row.contact_verified === true,
    },
    professional: {
      barAssociation: or(s("bar_association"), "Kayıtlı olunan baro"),
      barRegistrationNo: or(s("bar_registration_no"), "Baro sicil numarası"),
      mediatorRegistryNo: or(
        s("mediator_registry_no"),
        "Arabulucular Sicili numarası",
      ),
      mediatorSpecializations: or(
        s("mediator_specializations"),
        "Arabuluculuk uzmanlık alanları (sicil kaydına göre)",
      ),
    },
    firm: {
      foundedYear: or(s("founded_year"), "Kuruluş yılı"),
      workingLanguages: or(s("working_languages"), "Çalışma dilleri"),
    },
    dataController: {
      name: or(s("data_controller_name"), "Veri sorumlusu"),
      address: or(s("data_controller_address"), "Veri sorumlusu adresi"),
      contactEmail: or(s("data_controller_email"), "KVKK başvuru e-postası"),
    },
    seo: {
      title: s("seo_title") ?? siteConfig.name,
      description: s("seo_description") ?? siteConfig.description,
    },
  }
}
