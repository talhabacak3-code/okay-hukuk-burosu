import type { Metadata } from "next"

import { AdminPageTitle } from "@/components/admin/page-title"
import { PracticeAreaForm } from "@/components/admin/practice-area-form"
import { createPracticeArea } from "@/lib/admin/actions/practice-areas"
import { requireStaff } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Yeni faaliyet alanı" }

export default async function NewPracticeAreaPage() {
  await requireStaff()
  return (
    <>
      <AdminPageTitle
        title="Yeni faaliyet alanı"
        back={{ href: "/admin/faaliyet-alanlari", label: "Faaliyet alanları" }}
      />
      <PracticeAreaForm action={createPracticeArea} />
    </>
  )
}
