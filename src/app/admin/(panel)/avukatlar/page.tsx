import type { Metadata } from "next"
import Link from "next/link"

import { DataTable, StatusPill } from "@/components/admin/data-table"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { Button } from "@/components/ui/button"
import { listAttorneysAdmin } from "@/lib/admin/data"

export const metadata: Metadata = { title: "Avukat profilleri" }

export default async function AttorneysAdminPage({
  searchParams,
}: PageProps<"/admin/avukatlar">) {
  const [attorneys, params] = await Promise.all([
    listAttorneysAdmin(),
    searchParams,
  ])

  return (
    <>
      <AdminPageTitle
        title="Avukat profilleri"
        description="Ad soyad, unvan, baro, sicil, eğitim, mesleki geçmiş, faaliyet alanları, fotoğraf ve teyitli arabuluculuk bilgileri."
        actions={
          <Button asChild>
            <Link href="/admin/avukatlar/yeni">Yeni profil</Link>
          </Button>
        }
      />
      <SavedNotice show={params.silindi === "1"}>Profil silindi.</SavedNotice>
      <DataTable
        caption="Avukat profilleri"
        columns={["Ad soyad", "Unvan", "Sicil", "Durum"]}
        rows={attorneys.map((a) => ({
          key: a.id,
          href: `/admin/avukatlar/${a.id}`,
          cells: [
            a.full_name,
            a.title ?? (
              <span key="t" className="text-muted-foreground">
                —
              </span>
            ),
            a.bar_registration_no ? (
              <span key="b" className="tabular-nums">
                {a.bar_registration_no}
              </span>
            ) : (
              <span key="b" className="text-muted-foreground">
                Eksik
              </span>
            ),
            <StatusPill key="s" tone={a.published ? "on" : "off"}>
              {a.published ? "Yayında" : "Taslak"}
            </StatusPill>,
          ],
        }))}
        empty="Henüz avukat profili eklenmedi."
      />
    </>
  )
}
