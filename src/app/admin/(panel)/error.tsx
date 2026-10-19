"use client"

/**
 * Panel hata sınırı. Hata ayrıntısı (SQL, yığın izi) kullanıcıya gösterilmez; yalnızca
 * sunucu günlüklerinde eşleştirmek için özet kimliği (digest) verilir.
 */
export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      role="alert"
      className="max-w-xl border-l-2 border-destructive bg-destructive/5 p-6"
    >
      <h1 className="text-h3">Bu sayfa yüklenemedi</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Veritabanına ulaşılamadı veya beklenmeyen bir hata oluştu. Hiçbir
        değişiklik kaydedilmedi.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Hata kodu: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 items-center border border-navy-950/80 px-5 text-sm font-medium hover:bg-navy-950 hover:text-paper"
      >
        Tekrar dene
      </button>
    </div>
  )
}
