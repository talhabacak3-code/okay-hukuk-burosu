import type { Metadata } from "next"
import Link from "next/link"

import { AdminPageTitle } from "@/components/admin/page-title"
import { requireStaff } from "@/lib/admin/auth"
import { getDashboardCounts, listAuditLog } from "@/lib/admin/data"
import { formatDateTime, tableLabel } from "@/lib/admin/labels"

export const metadata: Metadata = { title: "Genel bakış" }

export default async function DashboardPage() {
  const user = await requireStaff()
  const counts = await getDashboardCounts()
  const audit = user.role === "admin" ? await listAuditLog(8) : []

  const stats: { label: string; value: number; href: string }[] = [
    {
      label: "Avukat profili",
      value: counts.attorneys,
      href: "/admin/avukatlar",
    },
    {
      label: "Yayımlanmış yazı",
      value: counts.publishedArticles,
      href: "/admin/yayinlar",
    },
    {
      label: "Taslak yazı",
      value: counts.draftArticles,
      href: "/admin/yayinlar",
    },
    {
      label: "Faaliyet alanı",
      value: counts.practiceAreas,
      href: "/admin/faaliyet-alanlari",
    },
    { label: "Medya dosyası", value: counts.media, href: "/admin/medya" },
  ]
  if (counts.newMessages !== null) {
    stats.push({
      label: "Yeni mesaj",
      value: counts.newMessages,
      href: "/admin/mesajlar",
    })
  }

  return (
    <>
      <AdminPageTitle
        title="Genel bakış"
        description={`Hoş geldiniz${user.displayName ? `, ${user.displayName}` : ""}. Sayılar veritabanındaki güncel kayıtlardır.`}
      />

      <section aria-labelledby="sayilar-baslik">
        <h2 id="sayilar-baslik" className="sr-only">
          Kayıt sayıları
        </h2>
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.label} className="bg-paper">
              <Link
                href={stat.href}
                className="group flex h-full flex-col gap-2 p-6 transition-colors hover:bg-paper-deep"
              >
                <span className="font-serif text-4xl tabular-nums">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                  {stat.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {user.role === "admin" ? (
        <section aria-labelledby="son-islemler" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="son-islemler" className="text-h3">
              Son işlemler
            </h2>
            <Link
              href="/admin/denetim"
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              Denetim kaydının tamamı
            </Link>
          </div>
          {audit.length > 0 ? (
            <ul className="mt-6 divide-y divide-border border-y border-border text-sm">
              {audit.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap justify-between gap-2 py-3"
                >
                  <span>
                    {tableLabel(row.table_name)} ·{" "}
                    {row.action === "INSERT"
                      ? "eklendi"
                      : row.action === "UPDATE"
                        ? "güncellendi"
                        : "silindi"}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatDateTime(row.occurred_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Henüz kayıtlı işlem yok.
            </p>
          )}
        </section>
      ) : null}
    </>
  )
}
