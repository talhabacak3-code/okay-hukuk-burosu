import { cn } from "@/lib/utils"

/** Hukuki metin dizgisindeki ince ayırıcı çizgi (dekoratif). */
export function Rule({
  className,
  tone = "line",
}: {
  className?: string
  tone?: "line" | "champagne"
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px w-full",
        tone === "line" ? "bg-border" : "bg-champagne",
        className,
      )}
    />
  )
}
