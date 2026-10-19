/**
 * schema.org JSON-LD çıktısı. `<` kaçırılır: veri `</script>` içerse bile betik
 * bloğundan çıkamaz (panelden girilen metinler için XSS koruması).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  )
}
