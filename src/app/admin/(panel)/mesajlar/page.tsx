import type { Metadata } from "next"

import { DeleteButton } from "@/components/admin/delete-button"
import { MessageStatusButton } from "@/components/admin/message-status-button"
import { AdminPageTitle } from "@/components/admin/page-title"
import { deleteContactMessage } from "@/lib/admin/actions/messages"
import { listContactMessages } from "@/lib/admin/data"
import { formatDateTime } from "@/lib/admin/labels"

export const metadata: Metadata = { title: "Gelen mesajlar" }

export default async function MessagesPage() {
  const messages = await listContactMessages()

  return (
    <>
      <AdminPageTitle
        title="Gelen mesajlar"
        description="İletişim formundan gelen mesajlar (yalnızca yönetici görür). Kişisel veri içerir: saklama ve imha politikanıza göre arşivleyin ve silin."
      />
      {messages.length === 0 ? (
        <p className="border border-dashed border-ink-950/20 p-8 text-sm text-muted-foreground">
          Mesaj yok.
        </p>
      ) : (
        <ul className="space-y-6">
          {messages.map((message) => (
            <li key={message.id} className="border border-border bg-paper p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {message.full_name}
                  {message.status === "new" ? (
                    <span className="ml-3 text-xs font-medium tracking-[0.12em] text-stone-deep uppercase">
                      Yeni
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(message.created_at)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <a
                  href={`mailto:${message.email}`}
                  className="underline underline-offset-4"
                >
                  {message.email}
                </a>
                {message.phone ? ` · ${message.phone}` : null}
              </p>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line">
                {message.message}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {message.status === "new" ? (
                  <MessageStatusButton
                    id={message.id}
                    status="read"
                    label="Okundu işaretle"
                  />
                ) : null}
                {message.status !== "archived" ? (
                  <MessageStatusButton
                    id={message.id}
                    status="archived"
                    label="Arşivle"
                  />
                ) : null}
                <DeleteButton
                  action={deleteContactMessage}
                  id={message.id}
                  label="Kalıcı olarak sil"
                  confirmText={`${message.full_name} adlı kişinin mesajı kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
