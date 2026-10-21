import { Logo } from "@/components/brand/logo"

/**
 * Supabase yapılandırılmamışken gösterilir. Hiçbir sahte veri veya "kaydedildi"
 * mesajı üretilmez; yalnızca gereken adımlar listelenir.
 */
export function ConfigMissing() {
  return (
    <main className="surface-ink flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl">
        <Logo className="text-[17px] text-paper" />
        <h1 className="mt-10 text-h2">
          Veritabanı bağlantısı yapılandırılmadı
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Yönetim paneli Supabase olmadan çalışmaz. Bu nedenle giriş yapılamaz
          ve hiçbir değişiklik kaydedilemez.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-paper/85 marker:text-stone">
          <li>Supabase projesi oluşturun.</li>
          <li>
            <code className="text-stone">supabase/migrations</code> klasöründeki
            dosyaları sırayla uygulayın.
          </li>
          <li>
            <code className="text-stone">.env.local</code> dosyasına
            <code className="text-stone"> NEXT_PUBLIC_SUPABASE_URL</code>,
            <code className="text-stone">
              {" "}
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </code>{" "}
            ve <code className="text-stone">SUPABASE_SECRET_KEY</code>{" "}
            değerlerini ekleyip siteyi yeniden derleyin.
          </li>
          <li>
            Panel kullanıcısını Supabase Auth&apos;ta oluşturup{" "}
            <code className="text-stone">staff</code> tablosuna rolüyle ekleyin.
          </li>
        </ol>
      </div>
    </main>
  )
}
