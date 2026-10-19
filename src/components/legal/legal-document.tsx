import { Container } from "@/components/primitives/container"
import { cn } from "@/lib/utils"

export type LegalSection = {
  id: string
  title: string
  content: React.ReactNode
}

/**
 * Yasal metin düzeni: solda yapışkan içindekiler, sağda "Madde n" numaralı bölümler.
 * Gövde tipografisi okunabilirlik için sans-serif, satır uzunluğu sınırlıdır.
 */
export function LegalDocument({
  sections,
  notice,
}: {
  sections: LegalSection[]
  /** Belgenin başında ve sonunda gösterilen durum uyarısı (ör. taslak). */
  notice?: React.ReactNode
}) {
  return (
    <Container className="grid gap-12 pb-24 md:grid-cols-12 md:gap-8 md:pb-32">
      <nav
        aria-labelledby="icindekiler-baslik"
        className="md:col-span-4 lg:col-span-3"
      >
        <div className="md:sticky md:top-32">
          <h2
            id="icindekiler-baslik"
            className="font-sans text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase"
          >
            Bu metinde
          </h2>
          <ol className="mt-4 border-t border-navy-950/80 text-sm">
            {sections.map((section, index) => (
              <li key={section.id} className="border-b border-border">
                <a
                  href={`#${section.id}`}
                  className="flex min-h-11 items-baseline gap-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="w-5 shrink-0 text-xs text-champagne-deep tabular-nums">
                    {index + 1}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
        {notice}
        <div className={cn(notice && "mt-12")}>
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-baslik`}
              className="scroll-mt-32 border-t border-border py-10 first:border-navy-950 first:pt-8"
            >
              <p className="eyebrow text-champagne-deep">Madde {index + 1}</p>
              <h2 id={`${section.id}-baslik`} className="mt-3 text-h3">
                {section.title}
              </h2>
              <div
                className={cn(
                  "mt-5 max-w-measure leading-relaxed text-foreground/90",
                  "[&_ol+p]:mt-4 [&_p+ol]:mt-4 [&_p+p]:mt-4 [&_p+ul]:mt-4 [&_ul+p]:mt-4",
                  "[&_ol]:space-y-2.5 [&_ul]:space-y-2.5",
                  "[&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:before:absolute [&_ul>li]:before:top-[0.8em] [&_ul>li]:before:left-0 [&_ul>li]:before:h-px [&_ul>li]:before:w-3 [&_ul>li]:before:bg-champagne",
                  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:pl-1 [&_ol>li]:marker:text-champagne-deep",
                  "[&_a]:underline [&_a]:decoration-champagne [&_a]:underline-offset-4 [&_a:hover]:decoration-navy-950",
                )}
              >
                {section.content}
              </div>
            </section>
          ))}
        </div>
        {notice ? <div className="mt-6">{notice}</div> : null}
      </div>
    </Container>
  )
}
