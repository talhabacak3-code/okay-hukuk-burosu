/**
 * GitHub Pages (statik dışa aktarım) sürümündeki iletişim formu yerine geçen bilgi kutusu.
 * Statik barındırmada Server Action çalışmaz; form gösterip gönderimi başarısız bırakmak
 * yerine ziyaretçi doğrudan telefon ve e-postaya yönlendirilir.
 *
 * scripts/pages/prepare.mjs bu dosyayı yalnızca CI'daki geçici kopyada
 * src/components/contact/contact-form.tsx yerine koyar. Asıl form değişmez.
 */
export function ContactForm({
  phone,
}: {
  deliveryConfigured: boolean
  phone?: { label: string; href: string }
}) {
  return (
    <div
      role="note"
      className="border border-dashed border-champagne-deep/60 bg-paper-deep p-6 md:p-8"
    >
      <p className="eyebrow text-champagne-deep">Önizleme sürümü</p>
      <p className="mt-4 max-w-measure leading-relaxed">
        Bu önizleme sürümünde çevrim içi form kapalıdır; mesaj gönderilemez.
        Büroya ulaşmak için sağdaki iletişim bilgilerini kullanabilirsiniz.
      </p>
      {phone ? (
        <p className="mt-4">
          <a
            href={phone.href}
            className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
          >
            Telefon: {phone.label}
          </a>
        </p>
      ) : null}
    </div>
  )
}
