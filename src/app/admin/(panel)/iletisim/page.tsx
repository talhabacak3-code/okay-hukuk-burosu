import type { Metadata } from "next"

import {
  AdminForm,
  CheckboxField,
  FieldGroup,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import { AdminPageTitle } from "@/components/admin/page-title"
import { saveContactSettings } from "@/lib/admin/actions/settings"
import { getSiteSettingsAdmin } from "@/lib/admin/data"

export const metadata: Metadata = { title: "İletişim bilgileri" }

export default async function ContactSettingsPage() {
  const settings = await getSiteSettingsAdmin()
  const s = (key: string) => {
    const value = settings?.[key]
    return typeof value === "string" ? value : ""
  }

  return (
    <>
      <AdminPageTitle
        title="İletişim bilgileri"
        description="Sitenin üst/alt bilgisinde, İletişim sayfasında ve KVKK metninde kullanılır. Yalnızca büronun doğruladığı bilgileri girin."
      />
      {!settings ? (
        <p
          role="alert"
          className="mb-8 border-l-2 border-destructive bg-destructive/5 p-4 text-sm"
        >
          Site ayarları satırı veritabanında bulunamadı. İlk içerik
          migration&apos;ının (seed) uygulandığını kontrol edin; bu durumda
          kayıt yapılamaz.
        </p>
      ) : null}
      <AdminForm action={saveContactSettings}>
        <FieldGroup legend="Adres ve telefon">
          <TextAreaField
            name="address"
            label="Açık adres"
            defaultValue={s("address")}
            maxLength={300}
            rows={2}
            className="md:col-span-2"
          />
          <TextField
            name="phone"
            label="Sabit telefon"
            type="tel"
            defaultValue={s("phone")}
            maxLength={30}
            hint="Ör. +90 272 000 00 00"
          />
          <TextField
            name="mobile"
            label="Mobil telefon"
            type="tel"
            defaultValue={s("mobile")}
            maxLength={30}
            hint="Kişisel hat yayımlanacaksa büronun onayıyla."
          />
        </FieldGroup>
        <FieldGroup legend="Elektronik iletişim">
          <TextField
            name="email"
            label="E-posta"
            type="email"
            defaultValue={s("email")}
            maxLength={254}
          />
          <TextField
            name="kep"
            label="KEP adresi"
            defaultValue={s("kep")}
            maxLength={254}
          />
          <TextField
            name="workingHours"
            label="Çalışma saatleri"
            defaultValue={s("working_hours")}
            maxLength={200}
            hint="Ör. Hafta içi 09.00–18.00"
          />
          <TextField
            name="mapUrl"
            label="Harita bağlantısı"
            type="url"
            defaultValue={s("map_url")}
            maxLength={2000}
            hint="Google Haritalar veya Yandex Haritalar adresi (https). Harita sayfaya gömülmez."
          />
        </FieldGroup>
        <FieldGroup legend="Doğrulama">
          <CheckboxField
            name="contactVerified"
            label="Bu bilgiler büro tarafından doğrulandı"
            defaultChecked={settings?.contact_verified === true}
            className="md:col-span-2"
            hint="İşaretlenmezse İletişim sayfasında 'doğrulama bekliyor' notu gösterilir."
          />
        </FieldGroup>
      </AdminForm>
    </>
  )
}
