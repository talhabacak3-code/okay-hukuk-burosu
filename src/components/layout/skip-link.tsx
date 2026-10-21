/** Klavye kullanıcıları için "içeriğe geç" bağlantısı; odaklanınca görünür. */
export function SkipLink() {
  return (
    <a
      href="#icerik"
      className="fixed top-3 left-3 z-[60] -translate-y-24 bg-ink-950 px-4 py-3 text-sm font-medium text-paper transition-transform focus-visible:translate-y-0"
    >
      İçeriğe geç
    </a>
  )
}
