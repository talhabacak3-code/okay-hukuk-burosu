import { toBlocks } from "@/lib/content/page-schemas"
import { cn } from "@/lib/utils"

/**
 * Panelden girilen düz metni gösterir: boş satır = paragraf, "## " = ara başlık.
 * HTML yorumlanmaz; React metni kaçışlar (XSS yok).
 */
export function RichText({
  value,
  className,
  headingLevel = 3,
}: {
  value: string | null | undefined
  className?: string
  headingLevel?: 2 | 3
}) {
  const blocks = toBlocks(value)
  if (blocks.length === 0) return null
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <div className={cn("max-w-measure space-y-5 leading-relaxed", className)}>
      {blocks.map((block, index) =>
        block.type === "heading" ? (
          <Heading key={index} className="pt-3 text-h3">
            {block.text}
          </Heading>
        ) : (
          <p key={index}>{block.text}</p>
        ),
      )}
    </div>
  )
}
