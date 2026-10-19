import type { Metadata } from "next"
import Link from "next/link"

import { DataTable, StatusPill } from "@/components/admin/data-table"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { Button } from "@/components/ui/button"
import { listArticlesAdmin } from "@/lib/admin/data"
import { formatDateTime } from "@/lib/admin/labels"

export const metadata: Metadata = { title: "Hukuki yayınlar" }

export default async function ArticlesAdminPage({
  searchParams,
}: PageProps<"/admin/yayinlar">) {
  const [articles, params] = await Promise.all([
    listArticlesAdmin(),
    searchParams,
  ])

  return (
    <>
      <AdminPageTitle
        title="Hukuki yayınlar"
        description="Genel bilgilendirme amaçlı yazılar. Taslaklar sitede görünmez."
        actions={
          <Button asChild>
            <Link href="/admin/yayinlar/yeni">Yeni yazı</Link>
          </Button>
        }
      />
      <SavedNotice show={params.silindi === "1"}>Yazı silindi.</SavedNotice>
      <DataTable
        caption="Hukuki yayınlar"
        columns={["Başlık", "Durum", "Yayın tarihi", "Son güncelleme"]}
        rows={articles.map((a) => ({
          key: a.id,
          href: `/admin/yayinlar/${a.id}`,
          cells: [
            a.title,
            <StatusPill key="s" tone={a.status === "published" ? "on" : "off"}>
              {a.status === "published" ? "Yayında" : "Taslak"}
            </StatusPill>,
            <span key="p" className="tabular-nums">
              {a.published_at ? formatDateTime(a.published_at) : "—"}
            </span>,
            <span key="u" className="tabular-nums">
              {formatDateTime(a.updated_at)}
            </span>,
          ],
        }))}
        empty="Henüz yazı eklenmedi."
      />
    </>
  )
}
