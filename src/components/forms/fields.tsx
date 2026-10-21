import { cn } from "@/lib/utils"

/**
 * Form alanı iskeleti: görünür etiket, zorunlu/isteğe bağlı ibaresi, yardım metni ve
 * hata mesajı (`aria-describedby` ile alana bağlı). Hata metni `role="alert"` taşımaz;
 * hatalar gönderimde özet ve odak taşıma ile duyurulur (çift okuma önlenir).
 */
export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className,
}: {
  id: string
  label: string
  required?: boolean
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[0.9375rem] font-medium">
        {label}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {required ? "(zorunlu)" : "(isteğe bağlı)"}
        </span>
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Alanın `aria-describedby` değerini yardım ve hata metinlerinden üretir. */
export function describedBy(
  id: string,
  opts: { hint?: boolean; error?: boolean },
) {
  const ids = [opts.hint && `${id}-hint`, opts.error && `${id}-error`].filter(
    Boolean,
  )
  return ids.length > 0 ? ids.join(" ") : undefined
}

export const inputClass = cn(
  "w-full rounded-[var(--radius)] border border-ink-950/25 bg-paper px-4 text-base text-ink-950",
  "transition-[border-color,box-shadow] duration-200",
  "placeholder:text-muted-foreground/70",
  "hover:border-ink-950/50",
  "focus-visible:border-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2",
  "aria-invalid:border-destructive aria-invalid:bg-destructive/5",
  "disabled:cursor-not-allowed disabled:opacity-60",
)
