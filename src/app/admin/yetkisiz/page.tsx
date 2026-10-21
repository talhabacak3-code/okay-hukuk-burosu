import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Yetkisiz erişim" }

/** Rolü yetmeyen panel kullanıcısının yönlendirildiği sayfa (ör. editörün ayarlara girmesi). */
export default function ForbiddenPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md">
        <p className="eyebrow text-stone-deep">403</p>
        <h1 className="mt-4 text-h2">Bu bölüm için yetkiniz yok</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Bu sayfa yalnızca yönetici rolündeki kullanıcılara açıktır. Erişim
          gerekiyorsa büronun panel yöneticisine başvurun.
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-flex min-h-11 items-center border border-ink-950/80 px-5 text-sm font-medium hover:bg-ink-950 hover:text-paper"
        >
          Genel bakışa dön
        </Link>
      </div>
    </main>
  )
}
