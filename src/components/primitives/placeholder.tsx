import { isPlaceholder, type Maybe } from "@/lib/placeholder"
import { cn } from "@/lib/utils"

/**
 * Doğrulanmamış bilgi için açık yer tutucu. Kesik çerçeve ve "Eklenecek" önekiyle
 * gerçek veri gibi görünmesi engellenir. `data-placeholder` niteliği, yayın öncesi
 * kalan yer tutucuların otomatik taranmasını sağlar.
 */
export function Placeholder({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      data-placeholder=""
      className={cn(
        "inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 border border-dashed border-current/40 px-1.5 py-0.5 font-sans text-[0.8125rem] leading-snug text-champagne-deep",
        "[.surface-navy_&]:text-champagne",
        className,
      )}
    >
      <span className="font-medium tracking-wide uppercase">Eklenecek:</span>
      <span className="min-w-0 break-words">{label}</span>
    </span>
  )
}

/** Gerçek değer varsa onu, yoksa yer tutucuyu gösterir. */
export function MaybeValue({
  value,
  render,
}: {
  value: Maybe<string>
  render?: (value: string) => React.ReactNode
}) {
  if (isPlaceholder(value)) return <Placeholder label={value.label} />
  return <>{render ? render(value) : value}</>
}

/**
 * Veritabanı tarzı boş alan (null) için: değer varsa onu, yoksa `label` ile yer tutucuyu
 * gösterir. Yönetim panelinden doldurulacak alanlar bununla gösterilir.
 */
export function FieldValue({
  value,
  label,
}: {
  value: string | null | undefined
  label: string
}) {
  if (value == null || value === "") return <Placeholder label={label} />
  return <>{value}</>
}

/** İçeriği sonraki aşamada eklenecek bir bölümün iskeleti. */
export function PendingBlock({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-placeholder=""
      className={cn(
        "border border-dashed border-current/25 p-6 md:p-8",
        className,
      )}
    >
      <p className="eyebrow text-champagne-deep [.surface-navy_&]:text-champagne">
        İçerik bekleniyor
      </p>
      <p className="mt-3 font-serif text-xl md:text-2xl">{title}</p>
      <div className="mt-3 max-w-measure text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
