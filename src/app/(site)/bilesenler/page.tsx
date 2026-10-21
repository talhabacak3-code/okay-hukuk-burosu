import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { FlowLine } from "@/components/brand/flow-line"
import { Logo } from "@/components/brand/logo"
import { ArticleCard } from "@/components/cards/article-card"
import { AttorneyGrid } from "@/components/attorneys/attorney-grid"
import { AttorneyProfile } from "@/components/attorneys/attorney-profile"
import { PracticeCard } from "@/components/cards/practice-card"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { Container } from "@/components/primitives/container"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { Button } from "@/components/ui/button"
import type { PracticeArea } from "@/config/site"
import { attorneySchema } from "@/lib/content/attorney-schema"
import type { ArticleSummary } from "@/lib/content/types"

/**
 * YALNIZCA GELİŞTİRME: bileşen galerisi. Üretim derlemesinde 404 döner,
 * sitemap'te ve menülerde yer almaz. Buradaki tüm veriler açıkça "örnek"tir;
 * büroya ait gerçek bilgi değildir ve sitenin başka bir yerinde kullanılmaz.
 */
export const metadata: Metadata = {
  title: "Bileşenler (geliştirme)",
  robots: { index: false, follow: false },
}

const sampleAreas: PracticeArea[] = [
  {
    slug: "ornek-1",
    title: "Örnek çalışma alanı başlığı",
    summary:
      "Örnek açıklama metni. Gerçek alanlar büro tarafından doğrulandıktan sonra eklenecek.",
  },
  {
    slug: "ornek-2",
    title: "İkinci örnek başlık, iki satıra taşabilecek uzunlukta",
    summary: "Kısa örnek açıklama.",
  },
  {
    slug: "ornek-3",
    title: "Üçüncü örnek",
    summary:
      "Daha uzun bir örnek açıklama; kartların farklı metin uzunluklarında hizasını test etmek için yazılmıştır.",
  },
]

/** Örnek avukat kayıtları — yalnızca düzen testi. Ad, sicil ve kurumlar açıkça örnektir. */
const sampleAttorneys = [
  {
    slug: "ornek-kisi",
    fullName: "Av. Örnek Kişi",
    title: "Avukat, Arabulucu (örnek)",
    summary:
      "Örnek mesleki özet. Gerçek metin yönetim panelinden, doğrulanmış bilgiyle girilecek.",
    barAssociation: "Örnek Barosu",
    barRegistrationNo: "00000 (örnek)",
    education: [
      {
        degree: "Hukuk Fakültesi (Lisans) — örnek",
        institution: "Örnek Üniversitesi",
        year: "20XX",
      },
      {
        degree: "Yüksek Lisans — örnek",
        institution: "Örnek Üniversitesi",
        year: null,
      },
    ],
    experience: [
      {
        period: "20XX – günümüz",
        role: "Avukat (örnek)",
        organization: "Örnek kurum",
        description: "Örnek açıklama satırı.",
      },
      {
        period: "20XX – 20XX",
        role: "Stajyer avukat (örnek)",
        organization: null,
        description: null,
      },
    ],
    practiceAreas: ["Örnek alan 1", "Örnek alan 2", "Örnek alan 3"],
    mediator: {
      registryNo: "00000 (örnek)",
      specializations: ["Örnek uzmanlık"],
      verified: true,
    },
    published: true,
  },
  { slug: "ornek-kisi-2", fullName: "İkinci Örnek Kişi", published: true },
  {
    slug: "ornek-kisi-3",
    fullName: "Üçüncü Örnek Kişi",
    title: "Avukat (örnek)",
    published: true,
  },
  {
    slug: "ornek-kisi-4",
    fullName: "Dördüncü Örnek Kişi",
    title: "Avukat (örnek)",
    mediator: { registryNo: "00000", verified: false },
    published: true,
  },
].map((record) => attorneySchema.parse(record))

const sampleArticles: ArticleSummary[] = [
  {
    slug: "ornek-yayin",
    title: "Örnek yayın başlığı — öne çıkan düzen",
    excerpt:
      "Örnek özet metni. Yayınlar sonraki aşamada içerik yönetimi üzerinden eklenecek; bu metin yalnızca düzeni test etmek içindir.",
    publishedAt: "2026-01-15",
    category: "Örnek kategori",
  },
  {
    slug: "ornek-yayin-2",
    title: "İkinci örnek yayın başlığı",
    excerpt: "Kısa örnek özet.",
    publishedAt: "2026-02-03",
  },
]

export default function ComponentGalleryPage() {
  if (process.env.NODE_ENV !== "development") notFound()

  return (
    <>
      <Container className="pt-8 pb-12">
        <Breadcrumb
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Bileşenler", href: "/bilesenler" },
          ]}
        />
        <p className="mt-8 border border-dashed border-stone-deep/50 p-4 text-sm text-stone-deep">
          Geliştirme sayfası — üretimde yayınlanmaz. Tüm veriler örnektir.
        </p>
        <h1 className="mt-8 text-h1">Bileşenler</h1>
      </Container>

      <Section spacing="tight" aria-labelledby="g-logo">
        <Container className="space-y-8">
          <SectionHeading
            id="g-logo"
            marker="Logo"
            title="Zeminler ve düzenler"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["bg-white", "bg-paper", "bg-paper-deep"].map((bg) => (
              <div key={bg} className={`${bg} border border-border p-6`}>
                <Logo className="text-[16px]" />
                <p className="mt-3 text-xs text-muted-foreground">{bg}</p>
              </div>
            ))}
            <div className="surface-ink p-6">
              <Logo className="text-[16px]" />
              <p className="mt-3 text-xs text-muted-foreground">surface-ink</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-10 border border-border bg-paper p-8">
            <Logo layout="stacked" className="text-[18px]" />
            <div className="surface-ink p-8">
              <Logo layout="stacked" className="text-[18px]" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Paylaşım görseli kaynağı: scripts/branding/prepare-og-image.mjs bu çerçevenin
          ekran görüntüsünü alır (1200×630, sitenin kendi fontlarıyla). */}
      <Section spacing="tight" aria-labelledby="g-og">
        <Container className="space-y-8">
          <SectionHeading
            id="g-og"
            marker="Open Graph"
            title="Paylaşım görseli"
          />
          <div className="overflow-x-auto">
            <div
              id="og-frame"
              className="relative flex h-[630px] w-[1200px] shrink-0 items-center justify-center bg-paper text-ink-950"
            >
              <span
                aria-hidden="true"
                className="absolute inset-9 border border-stone"
              />
              <Logo layout="stacked" className="text-[30px]" />
            </div>
          </div>
        </Container>
      </Section>

      <Section surface="paper-deep" spacing="tight" aria-labelledby="g-btn">
        <Container className="space-y-8">
          <SectionHeading id="g-btn" marker="Button" title="Düğmeler" />
          <div className="flex flex-wrap items-center gap-4">
            <Button>Birincil</Button>
            <Button variant="outline">Çerçeveli</Button>
            <Button variant="quiet">
              Sessiz bağlantı <ArrowRight />
            </Button>
            <Button asChild size="lg">
              <Link href="/iletisim">
                Bağlantı olarak <ArrowRight />
              </Link>
            </Button>
            <Button disabled>Devre dışı</Button>
          </div>
        </Container>
      </Section>

      <Section surface="ink" spacing="tight" aria-labelledby="g-dark">
        <Container className="relative space-y-8">
          <FlowLine className="absolute top-0 right-0 hidden h-32 w-1/2 md:block" />
          <SectionHeading
            id="g-dark"
            marker="Koyu yüzey"
            title="Başlık ve düğme"
            lede="Koyu zeminde etiket taş rengi, metin kırık beyaz."
          />
          <Button variant="onDark">Koyu zeminde düğme</Button>
        </Container>
      </Section>

      <Section aria-labelledby="g-heading">
        <Container>
          <SectionHeading
            id="g-heading"
            marker="SectionHeading"
            title="Ortalanmış başlık"
            lede="Logo alt yazısındaki iki yanlı taş rengi kılçıklar."
            align="center"
          />
        </Container>
      </Section>

      <Section surface="paper-deep" aria-labelledby="g-practice">
        <Container className="space-y-10">
          <SectionHeading
            id="g-practice"
            marker="PracticeCard"
            title="Çalışma alanı kartları"
          />
          <RevealGroup
            as="ol"
            className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sampleAreas.map((area, index) => (
              <RevealItem as="li" key={area.slug}>
                <PracticeCard
                  area={area}
                  index={index + 1}
                  href={index === 2 ? undefined : "/bilesenler"}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {[1, 2, 3, 4].map((count) => (
        <Section
          key={count}
          surface={count % 2 === 0 ? "paper-deep" : "paper"}
          aria-labelledby={`g-attorney-${count}`}
        >
          <Container className="space-y-10">
            <SectionHeading
              id={`g-attorney-${count}`}
              marker="AttorneyGrid"
              title={`${count} avukat`}
            />
            <AttorneyGrid
              attorneys={sampleAttorneys.slice(0, count)}
              headingLevel={3}
            />
          </Container>
        </Section>
      ))}

      <Section spacing="none" aria-label="AttorneyProfile — dolu örnek">
        <p className="bg-ink-950 px-5 py-3 text-center text-sm text-paper">
          AttorneyProfile — tüm alanları dolu örnek (teyitli arabuluculuk)
        </p>
        <AttorneyProfile attorney={sampleAttorneys[0]!} />
      </Section>

      <Section spacing="none" aria-label="AttorneyProfile — eksik alanlı örnek">
        <p className="bg-ink-950 px-5 py-3 text-center text-sm text-paper">
          AttorneyProfile — yalnızca ad soyad girilmiş örnek
        </p>
        <AttorneyProfile attorney={sampleAttorneys[1]!} />
      </Section>

      <Section surface="paper-deep" aria-labelledby="g-article">
        <Container className="space-y-10">
          <SectionHeading
            id="g-article"
            marker="ArticleCard"
            title="Yayın kartları"
          />
          <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
            <ArticleCard
              article={sampleArticles[0]!}
              href="/bilesenler"
              layout="featured"
              className="lg:col-span-7"
            />
            <ArticleCard
              article={sampleArticles[1]!}
              href="/bilesenler"
              className="lg:col-span-5"
            />
          </div>
        </Container>
      </Section>
    </>
  )
}
