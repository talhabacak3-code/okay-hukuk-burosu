import type { Metadata } from "next"

import {
  AdminForm,
  FieldGroup,
  TextAreaField,
} from "@/components/admin/form-kit"
import { AdminPageTitle } from "@/components/admin/page-title"
import { saveAboutPage } from "@/lib/admin/actions/pages"
import { getPageContentAdmin } from "@/lib/admin/data"

export const metadata: Metadata = { title: "Hakkımızda" }

export default async function AboutContentPage() {
  const content = await getPageContentAdmin("about")

  return (
    <>
      <AdminPageTitle
        title="Hakkımızda"
        description="Hakkımızda sayfasındaki tanıtım metinleri. Kuruluş yılı, baro ve çalışma dilleri gibi künye bilgileri 'SEO ve site ayarları' bölümünden düzenlenir."
      />
      <AdminForm action={saveAboutPage}>
        <FieldGroup legend="Metinler">
          <TextAreaField
            name="intro"
            label="Giriş"
            defaultValue={content.intro}
            maxLength={2000}
            rows={6}
            className="md:col-span-2"
            hint="Paragrafları boş bir satırla ayırın. Başarı, müvekkil, karşılaştırma veya üstünlük iddiası kullanmayın."
          />
          <TextAreaField
            name="approach"
            label="Çalışma yaklaşımı"
            defaultValue={content.approach}
            maxLength={3000}
            rows={8}
            className="md:col-span-2"
            hint='Ara başlık için satıra "## " ile başlayın.'
          />
        </FieldGroup>
      </AdminForm>
    </>
  )
}
