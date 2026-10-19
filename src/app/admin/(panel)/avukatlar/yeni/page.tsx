import type { Metadata } from "next"

import { AttorneyForm } from "@/components/admin/attorney-form"
import { AdminPageTitle } from "@/components/admin/page-title"
import { createAttorney } from "@/lib/admin/actions/attorneys"
import { listMedia } from "@/lib/admin/data"

export const metadata: Metadata = { title: "Yeni avukat profili" }

export default async function NewAttorneyPage() {
  const media = await listMedia()
  return (
    <>
      <AdminPageTitle
        title="Yeni avukat profili"
        back={{ href: "/admin/avukatlar", label: "Avukat profilleri" }}
      />
      <AttorneyForm action={createAttorney} media={media} />
    </>
  )
}
