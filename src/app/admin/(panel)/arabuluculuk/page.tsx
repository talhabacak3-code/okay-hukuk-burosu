import type { Metadata } from "next"

import {
  AdminForm,
  FieldGroup,
  TextAreaField,
} from "@/components/admin/form-kit"
import { AdminPageTitle } from "@/components/admin/page-title"
import { saveMediationPage } from "@/lib/admin/actions/pages"
import { getPageContentAdmin } from "@/lib/admin/data"
import { pageDefaults } from "@/lib/content/page-schemas"

export const metadata: Metadata = { title: "Arabuluculuk" }

export default async function MediationContentPage() {
  const content = await getPageContentAdmin("mediation")

  return (
    <>
      <AdminPageTitle
        title="Arabuluculuk içerikleri"
        description="Arabuluculuk sayfasındaki bilgilendirme metinleri. Arabulucu sicil numarası ve uzmanlık alanları 'SEO ve site ayarları' bölümündedir ve yalnızca sicil kaydına göre girilmelidir."
      />
      <AdminForm action={saveMediationPage}>
        <FieldGroup legend="Metinler">
          <TextAreaField
            name="intro"
            label="Giriş"
            defaultValue={content.intro}
            maxLength={600}
            rows={4}
            className="md:col-span-2"
            hint={`Boşsa varsayılan tanım kullanılır: "${pageDefaults.mediationIntro.slice(0, 80)}…"`}
          />
          <TextAreaField
            name="process"
            label="Arabuluculuk süreci"
            defaultValue={content.process}
            maxLength={4000}
            rows={8}
            className="md:col-span-2"
            hint="Başvuru, ilk toplantı, müzakere ve tutanak aşamaları. Mevzuata dayalı, tarafsız ve bilgilendirici dil kullanın."
          />
          <TextAreaField
            name="roleSeparation"
            label="Tarafsızlık ve görev ayrılığı"
            defaultValue={content.roleSeparation}
            maxLength={2000}
            rows={6}
            className="md:col-span-2"
            hint="Arabuluculuk hizmetini taraflardan birine 'kazandırma' vaadiyle sunmayın."
          />
        </FieldGroup>
      </AdminForm>
    </>
  )
}
