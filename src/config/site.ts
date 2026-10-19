import { placeholder, type Maybe } from "@/lib/placeholder"

/**
 * Markaya ait merkezi yapılandırma — sitedeki tüm kurumsal bilgilerin tek kaynağı.
 *
 * İÇERİK BÜTÜNLÜĞÜ: Bu dosyadaki `placeholder(...)` alanları büro tarafından
 * doğrulanmış bilgiyle değiştirilene kadar yer tutucu olarak kalmalıdır.
 * Avukat, sicil, adres, telefon, referans, başarı oranı veya sertifika uydurulmaz.
 */

export type PracticeArea = {
  slug: string
  title: string
  summary: string
}

export type SiteConfig = {
  name: string
  shortName: string
  legalName: Maybe<string>
  description: string
  locale: "tr-TR"
  ogLocale: "tr_TR"
  location: { city: string; country: string }
  contact: {
    address: Maybe<string>
    /** Sabit hat. */
    phone: Maybe<string>
    /** Mobil hat (büronun yayın onayıyla). */
    mobile: Maybe<string>
    email: Maybe<string>
    kep: Maybe<string>
    workingHours: Maybe<string>
    mapUrl: Maybe<string>
    /**
     * Adres, telefonlar ve harita konumu büro tarafından doğrulandı mı?
     * `false` iken sitede "doğrulama bekliyor" notu gösterilir (yayın öncesi taramada yakalanır).
     */
    verified: boolean
  }
  professional: {
    barAssociation: Maybe<string>
    barRegistrationNo: Maybe<string>
    mediatorRegistryNo: Maybe<string>
    mediatorSpecializations: Maybe<string>
  }
  /** KVKK kapsamında veri sorumlusu bilgileri (aydınlatma metninde kullanılacak). */
  dataController: {
    name: Maybe<string>
    address: Maybe<string>
    contactEmail: Maybe<string>
  }
  /** Büro özgeçmişi (Hakkımızda). Avukat profilleri: src/content/attorneys.ts. */
  firm: {
    foundedYear: Maybe<string>
    workingLanguages: Maybe<string>
  }
  /** Büronun fiilen çalıştığı alanlar doğrulanana kadar boş kalır. */
  practiceAreas: PracticeArea[]
  social: { label: string; href: string }[]
}

const officeAddress =
  "İstiklal Mahallesi, 225. Sokak No: 5, Afyonkarahisar Merkez / Afyonkarahisar"

export const siteConfig: SiteConfig = {
  name: "OKAY Hukuk Danışmanlık & Arabuluculuk",
  shortName: "OKAY Hukuk",
  legalName: placeholder("Baro kaydındaki tam unvan"),
  description:
    "OKAY Hukuk Danışmanlık & Arabuluculuk — Afyonkarahisar'da hukuki danışmanlık ve arabuluculuk.",
  locale: "tr-TR",
  ogLocale: "tr_TR",
  location: { city: "Afyonkarahisar", country: "Türkiye" },
  contact: {
    // Kaynak: kullanıcı tarafından sağlanan büro bilgileri (17 Ekim 2026).
    address: officeAddress,
    phone: "+90 272 217 59 52",
    mobile: "+90 542 846 33 47",
    email: placeholder("E-posta"),
    kep: placeholder("KEP adresi"),
    workingHours: placeholder("Çalışma saatleri"),
    // Harita sayfaya gömülmez (KVKK/çerez); yalnızca harici arama bağlantısı.
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`,
    // Bilgiler harita kayıtlarından geldi; büro onayı bekleniyor.
    verified: false,
  },
  professional: {
    barAssociation: placeholder("Kayıtlı olunan baro"),
    barRegistrationNo: placeholder("Baro sicil numarası"),
    mediatorRegistryNo: placeholder("Arabulucular Sicili numarası"),
    mediatorSpecializations: placeholder(
      "Arabuluculuk uzmanlık alanları (sicil kaydına göre)",
    ),
  },
  dataController: {
    name: placeholder("Veri sorumlusu"),
    address: placeholder("Veri sorumlusu adresi"),
    contactEmail: placeholder("KVKK başvuru e-postası"),
  },
  firm: {
    foundedYear: placeholder("Kuruluş yılı"),
    workingLanguages: placeholder("Çalışma dilleri"),
  },
  practiceAreas: [],
  social: [],
}
