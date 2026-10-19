import type { Metadata } from "next"

import {
  AdminForm,
  FieldGroup,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import { AdminPageTitle } from "@/components/admin/page-title"
import { siteConfig } from "@/config/site"
import { saveSiteSettings } from "@/lib/admin/actions/settings"
import { getSiteSettingsAdmin } from "@/lib/admin/data"

export const metadata: Metadata = { title: "SEO ve site ayarları" }

export default async function SiteSettingsPage() {
  const settings = await getSiteSettingsAdmin()
  const s = (key: string) => {
    const value = settings?.[key]
    return typeof value === "string" ? value : ""
  }

  return (
    <>
      <AdminPageTitle
        title="SEO ve site ayarları"
        description="Arama sonuçlarında görünen başlık/açıklama, büro künyesi ve KVKK veri sorumlusu bilgileri. Arama motoru indekslemesi sunucu ortam değişkeniyle (NEXT_PUBLIC_SITE_INDEXABLE) açılır."
      />
      {!settings ? (
        <p
          role="alert"
          className="mb-8 border-l-2 border-destructive bg-destructive/5 p-4 text-sm"
        >
          Site ayarları satırı veritabanında bulunamadı; kayıt yapılamaz.
        </p>
      ) : null}
      <AdminForm action={saveSiteSettings}>
        <FieldGroup legend="Arama motoru (SEO)">
          <TextField
            name="seoTitle"
            label="Site başlığı"
            defaultValue={s("seo_title")}
            maxLength={70}
            hint={`En fazla 70 karakter. Boşsa: "${siteConfig.name}"`}
            className="md:col-span-2"
          />
          <TextAreaField
            name="seoDescription"
            label="Site açıklaması"
            defaultValue={s("seo_description")}
            maxLength={200}
            rows={3}
            className="md:col-span-2"
            hint="En fazla 200 karakter. Anahtar kelime doldurmayın; büroyu ve konumu doğal biçimde anlatın."
          />
        </FieldGroup>

        <FieldGroup legend="Büro künyesi">
          <TextField
            name="legalName"
            label="Baro kaydındaki tam unvan"
            defaultValue={s("legal_name")}
            maxLength={200}
            className="md:col-span-2"
          />
          <TextField
            name="barAssociation"
            label="Kayıtlı olunan baro"
            defaultValue={s("bar_association")}
            maxLength={120}
          />
          <TextField
            name="barRegistrationNo"
            label="Baro sicil numarası"
            defaultValue={s("bar_registration_no")}
            maxLength={40}
          />
          <TextField
            name="foundedYear"
            label="Kuruluş yılı"
            defaultValue={s("founded_year")}
            maxLength={20}
          />
          <TextField
            name="workingLanguages"
            label="Çalışma dilleri"
            defaultValue={s("working_languages")}
            maxLength={200}
          />
        </FieldGroup>

        <FieldGroup
          legend="Arabuluculuk"
          description="Yalnızca Arabulucular Sicili kaydına göre girin."
        >
          <TextField
            name="mediatorRegistryNo"
            label="Arabulucular Sicili numarası"
            defaultValue={s("mediator_registry_no")}
            maxLength={40}
          />
          <TextField
            name="mediatorSpecializations"
            label="Uzmanlık alanları"
            defaultValue={s("mediator_specializations")}
            maxLength={300}
          />
        </FieldGroup>

        <FieldGroup
          legend="KVKK veri sorumlusu"
          description="KVKK Aydınlatma Metni'nde gösterilir."
        >
          <TextField
            name="dataControllerName"
            label="Veri sorumlusu"
            defaultValue={s("data_controller_name")}
            maxLength={200}
          />
          <TextField
            name="dataControllerEmail"
            label="Başvuru e-postası"
            type="email"
            defaultValue={s("data_controller_email")}
            maxLength={254}
          />
          <TextAreaField
            name="dataControllerAddress"
            label="Veri sorumlusu adresi"
            defaultValue={s("data_controller_address")}
            maxLength={300}
            rows={2}
            className="md:col-span-2"
          />
        </FieldGroup>
      </AdminForm>
    </>
  )
}
