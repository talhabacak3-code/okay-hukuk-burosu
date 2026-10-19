import { DraftNotice } from "@/components/legal/draft-notice"
import { LegalDocument } from "@/components/legal/legal-document"
import { PageHeader } from "@/components/primitives/page-header"
import { routes } from "@/config/routes"
import {
  KVKK_DRAFT_DATE,
  kvkkNoticeSections,
} from "@/content/legal/kvkk-notice"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"

const route = routes.privacyNotice

export const metadata = buildMetadata(route)

export default async function PrivacyNoticePage() {
  const settings = await getSiteSettings()
  return (
    <>
      <PageHeader
        marker={route.marker}
        href={route.href}
        title={route.title}
        lede={<p>{route.description}</p>}
      />
      <LegalDocument
        sections={kvkkNoticeSections(settings)}
        notice={<DraftNotice preparedOn={KVKK_DRAFT_DATE} />}
      />
    </>
  )
}
