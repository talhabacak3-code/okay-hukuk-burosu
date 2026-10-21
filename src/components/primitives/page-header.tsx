import {
  Breadcrumb,
  rootBreadcrumb,
  type BreadcrumbItem,
} from "@/components/navigation/breadcrumb"
import { Container } from "@/components/primitives/container"
import { Reveal } from "@/components/primitives/reveal"

/**
 * İç sayfa başlığı: sayfa yolu, solda madde numarası (§ 01 / Ek 1), sağda başlık
 * ve giriş metni. Mobilde numara başlığın üstüne iner.
 */
export function PageHeader({
  marker,
  title,
  href,
  lede,
  breadcrumbs,
}: {
  marker: string
  title: string
  /** Geçerli sayfanın yolu — varsayılan sayfa yolu (Ana sayfa → bu sayfa) için. */
  href: string
  lede?: React.ReactNode
  /** Daha derin sayfalar için tam sayfa yolu. */
  breadcrumbs?: BreadcrumbItem[]
}) {
  return (
    <header className="pt-8 pb-16 md:pt-12 md:pb-24">
      <Container>
        <Breadcrumb
          items={breadcrumbs ?? rootBreadcrumb({ label: title, href })}
          className="animate-rise"
        />
        <Reveal variant="line" className="mt-6 md:mt-8">
          <span aria-hidden="true" className="block h-px w-full bg-border" />
        </Reveal>
        <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-12 md:gap-8">
          <p className="tagline-rule-start animate-rise self-start eyebrow text-stone-deep md:col-span-3 lg:col-span-2">
            {marker}
          </p>
          <div className="md:col-span-9 lg:col-span-8">
            <h1 className="animate-rise text-h1 [animation-delay:80ms]">
              {title}
            </h1>
            {lede ? (
              <div className="mt-6 max-w-measure animate-rise text-lede text-muted-foreground [animation-delay:160ms]">
                {lede}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  )
}
