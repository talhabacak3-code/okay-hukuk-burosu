import { cn } from "@/lib/utils"

/** Hukuki metin dizgisindeki ince ayırıcı çizgi (dekoratif). */
export function Rule({
  className,
  tone = "line",
}: {
  className?: string
  tone?: "line" | "stone"
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px w-full",
        tone === "line" ? "bg-border" : "bg-stone",
        className,
      )}
    />
  )
}
