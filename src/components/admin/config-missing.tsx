import { LogoPlaque } from "@/components/brand/logo-plaque"

/**
 * Supabase yapılandırılmamışken gösterilir. Hiçbir sahte veri veya "kaydedildi"
 * mesajı üretilmez; yalnızca gereken adımlar listelenir.
 */
export function ConfigMissing() {
  return (
    <main className="surface-navy flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl">
        <LogoPlaque sizes="173px" logoClassName="h-16" />
        <h1 className="mt-10 text-h2">
          Veritabanı bağlantısı yapılandırılmadı
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Yönetim paneli Supabase olmadan çalışmaz. Bu nedenle giriş yapılamaz
          ve hiçbir değişiklik kaydedilemez.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-paper/85 marker:text-champagne">
          <li>Supabase projesi oluşturun.</li>
          <li>
            <code className="text-champagne">supabase/migrations</code>{" "}
            klasöründeki dosyaları sırayla uygulayın.
          </li>
          <li>
            <code className="text-champagne">.env.local</code> dosyasına
            <code className="text-champagne"> NEXT_PUBLIC_SUPABASE_URL</code>,
            <code className="text-champagne">
              {" "}
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </code>{" "}
            ve <code className="text-champagne">SUPABASE_SECRET_KEY</code>{" "}
            değerlerini ekleyip siteyi yeniden derleyin.
          </li>
          <li>
            Panel kullanıcısını Supabase Auth&apos;ta oluşturup{" "}
            <code className="text-champagne">staff</code> tablosuna rolüyle
            ekleyin.
          </li>
        </ol>
      </div>
    </main>
  )
}
