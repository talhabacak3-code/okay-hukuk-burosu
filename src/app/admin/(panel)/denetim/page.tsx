import type { Metadata } from "next"

import { AdminPageTitle } from "@/components/admin/page-title"
import { listAuditLog } from "@/lib/admin/data"
import { formatDateTime, tableLabel } from "@/lib/admin/labels"

export const metadata: Metadata = { title: "Denetim kaydı" }

const actions = {
  INSERT: "Ekleme",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
} as const

export default async function AuditLogPage() {
  const rows = await listAuditLog(200)

  return (
    <>
      <AdminPageTitle
        title="Denetim kaydı"
        description="Son 200 işlem. Kayıtlar veritabanı tetikleyicileriyle tutulur, panelden değiştirilemez veya silinemez. Kişisel veri sızmaması için yalnızca değişen alan adları saklanır."
      />
      {rows.length === 0 ? (
        <p className="border border-dashed border-ink-950/20 p-8 text-sm text-muted-foreground">
          Henüz kayıtlı işlem yok.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">Denetim kaydı</caption>
            <thead className="bg-paper-deep">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Zaman
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  İşlem
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Kayıt
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Rol
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Değişen alanlar
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatDateTime(row.occurred_at)}
                  </td>
                  <td className="px-4 py-3">{actions[row.action]}</td>
                  <td className="px-4 py-3">{tableLabel(row.table_name)}</td>
                  <td className="px-4 py-3">
                    {row.actor_role === "admin"
                      ? "Yönetici"
                      : row.actor_role === "editor"
                        ? "Editör"
                        : "Sistem"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.changed_fields?.join(", ") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
