import Link from "next/link"
import { ChevronLeft } from "lucide-react"

/** Panel sayfa başlığı: isteğe bağlı geri bağlantısı, başlık, açıklama ve eylemler. */
export function AdminPageTitle({
  title,
  description,
  back,
  actions,
}: {
  title: string
  description?: React.ReactNode
  back?: { href: string; label: string }
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-10 border-b border-border pb-8">
      {back ? (
        <Link
          href={back.href}
          className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.5}
          />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-h2">{title}</h1>
          {description ? (
            <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  )
}

/** "Kaydedildi" bandı — yalnızca kayıt sonrası sunucu yönlendirmesinin eklediği parametreyle. */
export function SavedNotice({
  show,
  children,
}: {
  show: boolean
  children: React.ReactNode
}) {
  if (!show) return null
  return (
    <p
      role="status"
      className="mb-8 border-l-2 border-stone bg-paper-deep p-4 text-sm font-medium"
    >
      {children}
    </p>
  )
}
