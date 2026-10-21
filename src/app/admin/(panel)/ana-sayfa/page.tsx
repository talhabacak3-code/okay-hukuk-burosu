import type { Metadata } from "next"

import {
  AdminForm,
  FieldGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import { mediaOptions } from "@/components/admin/media-options"
import { AdminPageTitle } from "@/components/admin/page-title"
import { saveHomePage } from "@/lib/admin/actions/pages"
import { getPageContentAdmin, listMedia } from "@/lib/admin/data"
import { pageDefaults } from "@/lib/content/page-schemas"

export const metadata: Metadata = { title: "Ana sayfa" }

export default async function HomeContentPage() {
  const [content, media] = await Promise.all([
    getPageContentAdmin("home"),
    listMedia(),
  ])

  return (
    <>
      <AdminPageTitle
        title="Ana sayfa"
        description="Giriş bölümü metinleri, büro tanıtımı ve büro fotoğrafı. Boş bırakılan alanlarda sitedeki varsayılan metin kullanılır."
      />
      <AdminForm action={saveHomePage}>
        <FieldGroup legend="Giriş bölümü">
          <TextField
            name="heroLine1"
            label="Başlık — 1. satır"
            defaultValue={content.heroLine1}
            maxLength={60}
            hint={`Boşsa: "${pageDefaults.heroLine1}"`}
          />
          <TextField
            name="heroLine2"
            label="Başlık — 2. satır (taş rengi, italik)"
            defaultValue={content.heroLine2}
            maxLength={60}
            hint={`Boşsa: "${pageDefaults.heroLine2}"`}
          />
          <TextAreaField
            name="heroLede"
            label="Alt açıklama"
            defaultValue={content.heroLede}
            maxLength={300}
            rows={3}
            className="md:col-span-2"
            hint="Bilgilendirici, ölçülü bir cümle. Üstünlük veya sonuç vaadi içermemelidir."
          />
        </FieldGroup>

        <FieldGroup legend="Büro tanıtımı">
          <TextAreaField
            name="introText"
            label="Tanıtım metni"
            defaultValue={content.introText}
            maxLength={1200}
            rows={6}
            className="md:col-span-2"
            hint="Paragrafları boş bir satırla ayırın."
          />
        </FieldGroup>

        <FieldGroup
          legend="Büro fotoğrafı"
          description="Ana sayfa ve Hakkımızda sayfasında gösterilir. Yalnızca büronun gerçek fotoğrafı kullanılmalıdır."
        >
          <SelectField
            name="officePhotoPath"
            label="Medya kütüphanesinden seçin"
            defaultValue={content.officePhotoPath}
            options={mediaOptions(media)}
            className="md:col-span-2"
            hint="Listede yoksa önce Medya kütüphanesine yükleyin. Alt metin kütüphanedeki açıklamadan alınır."
          />
        </FieldGroup>
      </AdminForm>
    </>
  )
}
