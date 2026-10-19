import { AboutIntro } from "@/components/home/about-intro"
import { ContactSection } from "@/components/home/contact-section"
import { Hero } from "@/components/home/hero"
import { MediationSection } from "@/components/home/mediation-section"
import { PracticeAreasSection } from "@/components/home/practice-areas-section"
import { PublicationsSection } from "@/components/home/publications-section"
import { TeamSection } from "@/components/home/team-section"
import { JsonLd } from "@/components/seo/json-ld"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"
import { legalServiceJsonLd } from "@/lib/structured-data"

export const metadata = buildMetadata(
  { ...routes.home, title: siteConfig.name },
  { absoluteTitle: true },
)

/**
 * Ana sayfa ritmi: lacivert giriş → açık künye → bej liste → lacivert bilgilendirme →
 * açık ekip → bej yayınlar → açık iletişim/konum → footer.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutIntro />
      <PracticeAreasSection />
      <MediationSection />
      <TeamSection />
      <PublicationsSection />
      <ContactSection />
      <OrganizationJsonLd />
    </>
  )
}

/** Büro künyesi (schema.org LegalService) — yalnızca doğrulanmış alanlar. */
async function OrganizationJsonLd() {
  const settings = await getSiteSettings()
  return <JsonLd data={legalServiceJsonLd(settings)} />
}
