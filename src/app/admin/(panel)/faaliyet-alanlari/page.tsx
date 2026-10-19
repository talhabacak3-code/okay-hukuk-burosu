import type { Metadata } from "next"
import Link from "next/link"

import { DataTable, StatusPill } from "@/components/admin/data-table"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { Button } from "@/components/ui/button"
import { listPracticeAreasAdmin } from "@/lib/admin/data"

export const metadata: Metadata = { title: "Faaliyet alanları" }

export default async function PracticeAreasAdminPage({
  searchParams,
}: PageProps<"/admin/faaliyet-alanlari">) {
  const [areas, params] = await Promise.all([
    listPracticeAreasAdmin(),
    searchParams,
  ])

  return (
    <>
      <AdminPageTitle
        title="Faaliyet alanları"
        description="Yalnızca büronun fiilen çalıştığı alanları ekleyin. Açıklamalar bilgilendirici olmalı; 'uzman', 'en iyi' gibi üstünlük ifadeleri kullanılmamalıdır."
        actions={
          <Button asChild>
            <Link href="/admin/faaliyet-alanlari/yeni">
              Yeni faaliyet alanı
            </Link>
          </Button>
        }
      />
      <SavedNotice show={params.silindi === "1"}>
        Faaliyet alanı silindi.
      </SavedNotice>
      <DataTable
        caption="Faaliyet alanları"
        columns={["Başlık", "Sıra", "Durum"]}
        rows={areas.map((area) => ({
          key: area.id,
          href: `/admin/faaliyet-alanlari/${area.id}`,
          cells: [
            area.title,
            <span key="o" className="tabular-nums">
              {area.sort_order}
            </span>,
            <StatusPill key="s" tone={area.published ? "on" : "off"}>
              {area.published ? "Yayında" : "Taslak"}
            </StatusPill>,
          ],
        }))}
        empty="Henüz faaliyet alanı eklenmedi."
      />
    </>
  )
}
