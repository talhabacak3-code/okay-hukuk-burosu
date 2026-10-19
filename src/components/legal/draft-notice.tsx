import { Placeholder } from "@/components/primitives/placeholder"

/**
 * Taslak uyarısı: metin nihai hukuki onay almadan yayına alınmamalıdır.
 * `data-placeholder` ve `data-draft` nitelikleri yayın öncesi taramada yakalanır.
 */
export function DraftNotice({ preparedOn }: { preparedOn: string }) {
  return (
    <aside
      role="note"
      aria-label="Taslak uyarısı"
      data-draft=""
      data-placeholder=""
      className="border border-dashed border-champagne-deep/60 bg-paper-deep p-5 md:p-6"
    >
      <p className="eyebrow text-champagne-deep">
        Taslak · Nihai hukuki onay bekliyor
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Bu metin, büronun gerçek veri işleme faaliyetlerine göre hukuki
        incelemeden geçirilmek üzere hazırlanmış bir taslaktır; onaylanmadan
        yayına alınmamalıdır. &ldquo;Eklenecek&rdquo; ve &ldquo;Teyit
        edilecek&rdquo; olarak işaretli alanlar büro tarafından doğrulanmalıdır.
      </p>
      <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground">Taslak tarihi</dt>
        <dd>{preparedOn}</dd>
        <dt className="text-muted-foreground">Yürürlük tarihi</dt>
        <dd>
          <Placeholder label="Hukuki onay sonrası" />
        </dd>
      </dl>
    </aside>
  )
}

/** Metin içinde büro tarafından doğrulanması gereken bir ifade. */
export function Verify({ children }: { children: string }) {
  return (
    <span
      data-placeholder=""
      className="border-b border-dashed border-champagne-deep/70 bg-paper-deep/80 px-1 text-champagne-deep"
    >
      <span className="sr-only">Teyit edilecek: </span>
      {children}
    </span>
  )
}
