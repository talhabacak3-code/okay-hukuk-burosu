import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FlowLine } from "@/components/brand/flow-line"
import { OfficePhoto } from "@/components/home/office-photo"
import { Container } from "@/components/primitives/container"
import { PageHeader } from "@/components/primitives/page-header"
import { MaybeValue, PendingBlock } from "@/components/primitives/placeholder"
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { RichText } from "@/components/primitives/rich-text"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { attorneyHref, getAttorneys } from "@/lib/content/attorneys"
import { getPageContent } from "@/lib/content/pages"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"
import { placeholder } from "@/lib/placeholder"

const route = routes.about

export const metadata = buildMetadata(route)

/**
 * Avukatlık mesleğinin kanundan doğan yükümlülükleri — büroya özgü bir taahhüt veya
 * üstünlük iddiası olarak değil, mesleğin çerçevesi olarak sunulur.
 */
const duties = [
  {
    title: "Özen ve doğruluk",
    body: "Avukatlar, üstlendikleri görevleri bu görevin gerektirdiği saygı ve güvene yakışır biçimde; özen, doğruluk ve onurun gerektirdiği şekilde yerine getirmekle yükümlüdür.",
    source: "1136 s. Avukatlık Kanunu, m. 34",
  },
  {
    title: "Sır saklama",
    body: "Avukatların, kendilerine tevdi edilen veya avukatlık görevleri dolayısıyla öğrendikleri hususları açığa vurmaları yasaktır.",
    source: "1136 s. Avukatlık Kanunu, m. 36",
  },
] as const

export default async function AboutPage() {
  const { location } = siteConfig
  const [settings, attorneys, about] = await Promise.all([
    getSiteSettings(),
    getAttorneys(),
    getPageContent("about"),
  ])
  const { firm, professional } = settings

  const resume: { term: string; value: React.ReactNode }[] = [
    { term: "Unvan", value: <MaybeValue value={settings.legalName} /> },
    { term: "Merkez", value: `${location.city}, ${location.country}` },
    {
      term: "Faaliyet",
      value: "Avukatlık · Hukuki danışmanlık · Arabuluculuk",
    },
    { term: "Kuruluş", value: <MaybeValue value={firm.foundedYear} /> },
    { term: "Baro", value: <MaybeValue value={professional.barAssociation} /> },
    {
      term: "Çalışma dilleri",
      value: <MaybeValue value={firm.workingLanguages} />,
    },
    {
      term: "Kurucu avukatlar",
      value:
        attorneys.length > 0 ? (
          <ul className="space-y-1">
            {attorneys.map((attorney) => (
              <li key={attorney.slug}>
                <Link
                  href={attorneyHref(attorney.slug)}
                  className="underline decoration-champagne underline-offset-4 hover:decoration-navy-950"
                >
                  {attorney.fullName}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <MaybeValue value={placeholder("Avukat profilleri")} />
        ),
    },
  ]

  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={
          <p>
            {siteConfig.name}, {location.city} merkezli bir hukuk bürosudur;
            hukuki danışmanlık ve arabuluculuk alanlarında faaliyet gösterir.
          </p>
        }
      />

      {/* Tanıtım — fotoğraf solda, metin sağda (editoryal split) */}
      <Section
        spacing="none"
        className="pb-20 md:pb-28"
        aria-labelledby="buro-baslik"
      >
        <Container className="grid gap-14 md:grid-cols-12 md:gap-8">
          <OfficePhoto
            tone="light"
            preload
            aspect="aspect-[4/5]"
            className="md:col-span-5 lg:col-span-5"
          />
          <div className="md:col-span-7 md:pt-4 lg:col-span-6 lg:col-start-7">
            <SectionHeading
              id="buro-baslik"
              marker="Büro"
              title="Yaklaşımımız"
            />
            <Reveal className="mt-10 space-y-8">
              {about.intro || about.approach ? (
                <>
                  <RichText value={about.intro} className="text-lg" />
                  <RichText value={about.approach} />
                </>
              ) : (
                <PendingBlock title="Büro tanıtım metni">
                  Büronun kuruluş hikâyesi, çalışma yöntemi ve müvekkille
                  iletişim biçimi yönetim panelinden (Hakkımızda) eklenecek.
                  Metin bilgilendirici olmalı; başarı, müvekkil, karşılaştırma
                  veya üstünlük iddiası içermemelidir.
                </PendingBlock>
              )}
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Büro özgeçmişi — CV düzeni */}
      <Section
        surface="paper-deep"
        aria-labelledby="ozgecmis-baslik"
        className="relative isolate overflow-hidden"
      >
        <FlowLine
          variant="drift"
          className="absolute right-0 bottom-0 -z-10 h-28 w-2/3 opacity-50"
        />
        <Container className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4 lg:col-span-3">
            <SectionHeading
              id="ozgecmis-baslik"
              marker="Künye"
              title="Büro özgeçmişi"
              className="md:sticky md:top-32"
            />
          </div>
          <Reveal className="md:col-span-8 lg:col-span-8 lg:col-start-5">
            <dl className="border-t border-navy-950">
              {resume.map((row) => (
                <div
                  key={row.term}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <dt className="pt-1.5 eyebrow text-muted-foreground">
                    {row.term}
                  </dt>
                  <dd className="min-w-0 font-serif text-xl break-words">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </Section>

      {/* Mesleki yükümlülükler — kanundan doğan çerçeve */}
      <Section aria-labelledby="yukumluluk-baslik">
        <Container className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5 lg:col-span-4">
            <SectionHeading
              id="yukumluluk-baslik"
              marker="Meslek kuralları"
              title="Mesleki yükümlülükler"
              lede="Avukatlık mesleği, kanunla düzenlenmiş yükümlülükler çerçevesinde yürütülür."
            />
          </div>
          <RevealGroup
            as="ol"
            className="grid gap-x-10 md:col-span-7 lg:col-span-7 lg:col-start-6 lg:grid-cols-2"
          >
            {duties.map((duty, index) => (
              <RevealItem
                as="li"
                key={duty.title}
                className="border-t border-navy-950/80 pt-6 pb-10"
              >
                <span
                  aria-hidden="true"
                  className="font-serif text-5xl leading-none text-champagne-deep"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-h3">{duty.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {duty.body}
                </p>
                <p className="mt-4 text-xs tracking-wide text-champagne-deep">
                  {duty.source}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* Yönlendirme — lacivert bant */}
      <Section
        surface="navy"
        spacing="tight"
        aria-labelledby="yonlendirme-baslik"
      >
        <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="tagline-rule-start eyebrow text-champagne">
              {routes.attorneys.marker}
            </p>
            <h2 id="yonlendirme-baslik" className="mt-4 text-h2">
              Avukatlarımızın mesleki bilgileri
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button asChild variant="onDark">
              <Link href={routes.attorneys.href}>
                Avukatlarımız
                <ArrowRight aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="quiet">
              <Link href={routes.contact.href}>İletişim bilgileri</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
