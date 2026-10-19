import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DeleteButton } from "@/components/admin/delete-button"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { PracticeAreaForm } from "@/components/admin/practice-area-form"
import {
  deletePracticeArea,
  updatePracticeArea,
} from "@/lib/admin/actions/practice-areas"
import { getPracticeAreaAdmin } from "@/lib/admin/data"
import { uuidSchema } from "@/lib/admin/schemas"

export const metadata: Metadata = { title: "Faaliyet alanını düzenle" }

export default async function EditPracticeAreaPage({
  params,
  searchParams,
}: PageProps<"/admin/faaliyet-alanlari/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!uuidSchema.safeParse(id).success) notFound()
  const area = await getPracticeAreaAdmin(id)
  if (!area) notFound()

  return (
    <>
      <AdminPageTitle
        title={area.title}
        back={{ href: "/admin/faaliyet-alanlari", label: "Faaliyet alanları" }}
        actions={
          <DeleteButton
            action={deletePracticeArea}
            id={area.id}
            confirmText={`"${area.title}" kalıcı olarak silinsin mi?`}
          />
        }
      />
      <SavedNotice show={query.kaydedildi === "1"}>
        Faaliyet alanı eklendi.
      </SavedNotice>
      <PracticeAreaForm action={updatePracticeArea} area={area} />
    </>
  )
}
