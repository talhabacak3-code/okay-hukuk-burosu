import { DraftNotice } from "@/components/legal/draft-notice"
import { LegalDocument } from "@/components/legal/legal-document"
import { PageHeader } from "@/components/primitives/page-header"
import { routes } from "@/config/routes"
import {
  PRIVACY_DRAFT_DATE,
  privacyPolicySections,
} from "@/content/legal/privacy-policy"
import { getSiteSettings } from "@/lib/content/settings"
import { buildMetadata } from "@/lib/metadata"

const route = routes.privacyPolicy

export const metadata = buildMetadata(route)

export default async function PrivacyPolicyPage() {
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
        sections={privacyPolicySections(settings)}
        notice={<DraftNotice preparedOn={PRIVACY_DRAFT_DATE} />}
      />
    </>
  )
}
