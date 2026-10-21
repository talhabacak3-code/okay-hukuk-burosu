import { brandAssets } from "@/config/brand"
import { siteConfig } from "@/config/site"
import type { Attorney } from "@/lib/content/attorney-schema"
import { attorneyHref } from "@/lib/content/attorneys"
import type { SiteSettings } from "@/lib/content/settings"
import { absoluteUrl } from "@/lib/env"
import { resolve } from "@/lib/placeholder"

/**
 * schema.org verisi YALNIZCA doğrulanmış olgulardan üretilir:
 * - yer tutucular (placeholder) hiçbir alana girmez,
 * - adres ve telefonlar büro `contact.verified` onayı verene kadar eklenmez,
 * - değerlendirme/puan (aggregateRating, review), ödül, fiyat bilgisi hiç eklenmez
 *   (avukatlık reklam yasağı).
 */

const absolute = absoluteUrl

export const organizationId = () => absolute("/#buro")

export function legalServiceJsonLd(settings: SiteSettings) {
  const { contact } = settings
  const verified = contact.verified
  const address = verified ? resolve(contact.address) : undefined
  const telephone = verified
    ? [resolve(contact.phone), resolve(contact.mobile)].filter(Boolean)
    : []
  const email = verified ? resolve(contact.email) : undefined

  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": organizationId(),
    name: siteConfig.name,
    legalName: resolve(settings.legalName),
    url: absolute("/"),
    logo: absolute(brandAssets.markPng.src),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressLocality: siteConfig.location.city,
        addressCountry: "TR",
      },
    }),
    ...(telephone.length > 0 && {
      telephone: telephone.length === 1 ? telephone[0] : telephone,
    }),
    ...(email && { email }),
  }
}

/** Avukat profili: ad, sitede yayımlanan unvan ve çalıştığı büro. */
export function attorneyJsonLd(attorney: Attorney) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: attorney.fullName,
    ...(attorney.title && { jobTitle: attorney.title }),
    url: absolute(attorneyHref(attorney.slug)),
    ...(attorney.photo && { image: absolute(attorney.photo.src) }),
    worksFor: {
      "@type": "LegalService",
      "@id": organizationId(),
      name: siteConfig.name,
    },
  }
}
