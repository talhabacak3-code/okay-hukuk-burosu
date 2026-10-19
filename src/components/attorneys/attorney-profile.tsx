import Link from "next/link"

import { AttorneyPortrait } from "@/components/attorneys/attorney-portrait"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { ArrowLink } from "@/components/primitives/arrow-link"
import { Container } from "@/components/primitives/container"
import { FieldValue, Placeholder } from "@/components/primitives/placeholder"
import { Reveal } from "@/components/primitives/reveal"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { verifiedMediator, type Attorney } from "@/lib/content/attorney-schema"
import { attorneyHref } from "@/lib/content/attorneys"

/**
 * Avukat profili — özgeçmiş düzeni. Üstte portre ve künye; altta solda bölüm adı,
 * sağda kayıtlar (eğitim, mesleki geçmiş, faaliyet alanları, teyitli arabuluculuk).
 * Boş alanlar "Eklenecek" olarak gösterilir; hiçbir bilgi tahminle doldurulmaz.
 */
export function AttorneyProfile({ attorney }: { attorney: Attorney }) {
  const mediator = verifiedMediator(attorney)

  return (
    <article aria-labelledby="profil-baslik">
      <header className="pt-8 pb-16 md:pt-12 md:pb-24">
        <Container>
          <Breadcrumb
            className="animate-rise"
            items={[
              { label: "Ana sayfa", href: "/" },
              { label: routes.attorneys.label, href: routes.attorneys.href },
              { label: attorney.fullName, href: attorneyHref(attorney.slug) },
            ]}
          />
          <span
            aria-hidden="true"
            className="mt-6 block h-px w-full bg-border md:mt-8"
          />

          <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:gap-8">
            <AttorneyPortrait
              attorney={attorney}
              framed
              preload
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw"
              className="max-w-sm animate-unveil md:col-span-5 md:max-w-none lg:col-span-4"
            />

            <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
              <p className="tagline-rule-start animate-rise eyebrow text-champagne-deep">
                {routes.attorneys.marker} · Avukat profili
              </p>
              <h1
                id="profil-baslik"
                className="mt-6 animate-rise text-h1 [animation-delay:80ms]"
              >
                {attorney.fullName}
              </h1>
              <p className="mt-3 animate-rise text-lede text-muted-foreground [animation-delay:120ms]">
                <FieldValue value={attorney.title} label="Unvan" />
              </p>

              <div className="mt-8 max-w-measure animate-rise leading-relaxed [animation-delay:160ms]">
                <FieldValue
                  value={attorney.summary}
                  label="Kısa mesleki özet"
                />
              </div>

              <dl className="mt-10 animate-rise border-t border-navy-950 [animation-delay:200ms]">
                <ProfileFact term="Baro">
                  <FieldValue value={attorney.barAssociation} label="Baro" />
                </ProfileFact>
                <ProfileFact term="Baro sicil no">
                  <FieldValue
                    value={attorney.barRegistrationNo}
                    label="Baro sicil numarası"
                  />
                </ProfileFact>
                {mediator ? (
                  <ProfileFact term="Arabulucu sicil no">
                    {mediator.registryNo}
                  </ProfileFact>
                ) : null}
              </dl>
            </div>
          </div>
        </Container>
      </header>

      <div className="border-t border-border bg-paper-deep py-20 md:py-28">
        <Container className="space-y-16 md:space-y-20">
          <CvSection id="egitim" title="Eğitim">
            {attorney.education.length > 0 ? (
              <ol>
                {attorney.education.map((item) => (
                  <CvRow
                    key={`${item.degree}-${item.institution}`}
                    aside={item.year ?? "—"}
                  >
                    <p className="font-serif text-xl">{item.degree}</p>
                    <p className="mt-1 text-muted-foreground">
                      {item.institution}
                    </p>
                  </CvRow>
                ))}
              </ol>
            ) : (
              <EmptyRow label="Eğitim bilgileri" />
            )}
          </CvSection>

          <CvSection id="mesleki-gecmis" title="Mesleki geçmiş">
            {attorney.experience.length > 0 ? (
              <ol>
                {attorney.experience.map((item) => (
                  <CvRow
                    key={`${item.period}-${item.role}`}
                    aside={item.period}
                  >
                    <p className="font-serif text-xl">{item.role}</p>
                    {item.organization ? (
                      <p className="mt-1 text-muted-foreground">
                        {item.organization}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-3 max-w-measure text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </CvRow>
                ))}
              </ol>
            ) : (
              <EmptyRow label="Mesleki geçmiş" />
            )}
          </CvSection>

          <CvSection id="faaliyet-alanlari" title="Faaliyet alanları">
            {attorney.practiceAreas.length > 0 ? (
              <ul className="grid gap-x-10 border-t border-navy-950/80 sm:grid-cols-2">
                {attorney.practiceAreas.map((area) => (
                  <li
                    key={area}
                    className="flex items-baseline gap-4 border-b border-border py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 translate-y-[-0.3em] bg-champagne"
                    />
                    <span className="font-serif text-lg">{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow label="Faaliyet alanları" />
            )}
          </CvSection>

          {mediator ? (
            <CvSection id="arabuluculuk" title="Arabuluculuk">
              <dl className="border-t border-navy-950/80">
                <ProfileFact term="Arabulucular Sicili no">
                  {mediator.registryNo}
                </ProfileFact>
                <ProfileFact term="Uzmanlık alanları">
                  {mediator.specializations.length > 0 ? (
                    mediator.specializations.join(", ")
                  ) : (
                    <Placeholder label="Sicil kaydındaki uzmanlık alanları" />
                  )}
                </ProfileFact>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Bilgiler Adalet Bakanlığı Arabulucular Sicili kaydına göredir.
              </p>
            </CvSection>
          ) : null}
        </Container>
      </div>

      <Container className="flex flex-wrap items-center justify-between gap-6 py-14">
        <ArrowLink href={routes.attorneys.href}>Tüm avukatlarımız</ArrowLink>
        <Button asChild variant="outline">
          <Link href={routes.contact.href}>İletişim bilgileri</Link>
        </Button>
      </Container>
    </article>
  )
}

function ProfileFact({
  term,
  children,
}: {
  term: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

function CvSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Reveal>
      <section
        aria-labelledby={`${id}-baslik`}
        className="grid gap-6 md:grid-cols-12 md:gap-8"
      >
        <h2
          id={`${id}-baslik`}
          className="tagline-rule-start self-start font-sans text-sm font-medium tracking-[0.14em] text-champagne-deep uppercase md:col-span-3"
        >
          {title}
        </h2>
        <div className="md:col-span-9 lg:col-span-8">{children}</div>
      </section>
    </Reveal>
  )
}

function CvRow({
  aside,
  children,
}: {
  aside: string
  children: React.ReactNode
}) {
  return (
    <li className="grid gap-2 border-t border-border py-5 first:border-navy-950/80 sm:grid-cols-[9rem_1fr] sm:gap-8">
      <span className="text-sm text-muted-foreground tabular-nums">
        {aside}
      </span>
      <div>{children}</div>
    </li>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="border-t border-navy-950/80 py-5">
      <Placeholder label={label} />
      <p className="mt-3 text-sm text-muted-foreground">
        Yönetim panelinden, doğrulanmış bilgiyle doldurulacak.
      </p>
    </div>
  )
}
