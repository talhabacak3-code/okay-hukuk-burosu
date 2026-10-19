import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AttorneyForm } from "@/components/admin/attorney-form"
import { DeleteButton } from "@/components/admin/delete-button"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { deleteAttorney, updateAttorney } from "@/lib/admin/actions/attorneys"
import { getAttorneyAdmin, listMedia } from "@/lib/admin/data"
import { uuidSchema } from "@/lib/admin/schemas"

export const metadata: Metadata = { title: "Avukat profilini düzenle" }

export default async function EditAttorneyPage({
  params,
  searchParams,
}: PageProps<"/admin/avukatlar/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!uuidSchema.safeParse(id).success) notFound()
  const [attorney, media] = await Promise.all([
    getAttorneyAdmin(id),
    listMedia(),
  ])
  if (!attorney) notFound()

  return (
    <>
      <AdminPageTitle
        title={attorney.full_name}
        back={{ href: "/admin/avukatlar", label: "Avukat profilleri" }}
        actions={
          <DeleteButton
            action={deleteAttorney}
            id={attorney.id}
            confirmText={`"${attorney.full_name}" profili kalıcı olarak silinsin mi? Yazarı olduğu yayınlarda yazar bilgisi kaldırılır.`}
          />
        }
      />
      <SavedNotice show={query.kaydedildi === "1"}>Profil eklendi.</SavedNotice>
      <AttorneyForm action={updateAttorney} attorney={attorney} media={media} />
    </>
  )
}
