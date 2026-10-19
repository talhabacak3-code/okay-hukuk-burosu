import Link from "next/link"

import { Verify } from "@/components/legal/draft-notice"
import type { LegalSection } from "@/components/legal/legal-document"
import { MaybeValue } from "@/components/primitives/placeholder"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import type { SiteSettings } from "@/lib/content/settings"

/**
 * Gizlilik Politikası — TASLAK (nihai hukuki onay bekliyor).
 * Yalnızca sitenin bugünkü fiilî durumunu anlatır; teyit gerektiren ifadeler <Verify> ile işaretlidir.
 */
export const PRIVACY_DRAFT_DATE = "17 Ekim 2026"

export function privacyPolicySections(settings: SiteSettings): LegalSection[] {
  const { dataController } = settings

  return [
    {
      id: "amac",
      title: "Amaç ve kapsam",
      content: (
        <p>
          Bu politika, {siteConfig.name} internet sitesini ziyaret ettiğinizde
          bilgilerinizin nasıl ele alındığını açıklar. Kişisel verilerin
          işlenmesine ilişkin ayrıntılar{" "}
          <Link href={routes.privacyNotice.href}>KVKK Aydınlatma Metni</Link>
          &apos;nde yer alır; bu politika onunla birlikte okunmalıdır.
        </p>
      ),
    },
    {
      id: "toplanan-bilgiler",
      title: "Sitede toplanan bilgiler",
      content: (
        <>
          <p>
            İnternet sitemizde üyelik, iletişim formu, analitik ölçüm veya
            reklam amaçlı izleme bulunmamaktadır. Siteyi ziyaret ettiğinizde,
            sitenin çalışması ve güvenliği için gerekli teknik kayıtlar (IP
            adresi, tarayıcı bilgisi, erişim zamanı gibi){" "}
            <Verify>barındırma hizmet sağlayıcısı tarafından</Verify>{" "}
            tutulabilir.
          </p>
          <p>
            Sitede yeni bir özellik (ör. iletişim formu) kullanıma alındığında
            bu politika ve aydınlatma metni önceden güncellenir.
          </p>
        </>
      ),
    },
    {
      id: "cerezler",
      title: "Çerezler",
      content: (
        <p>
          Sitemizde analitik, pazarlama veya üçüncü taraf çerezi
          kullanılmamaktadır;{" "}
          <Verify>
            yalnızca zorunlu teknik çerezlerin kullanılıp kullanılmadığı
          </Verify>{" "}
          yayın öncesinde teyit edilecektir. Zorunlu olmayan çerezler
          kullanılmaya başlanırsa önceden açık rızanız alınır. Ayrıntılar için{" "}
          <Link href={routes.cookiePolicy.href}>Çerez Politikası</Link>
          &apos;na bakınız.
        </p>
      ),
    },
    {
      id: "iletisim-yoluyla",
      title: "Bizimle paylaştığınız bilgiler",
      content: (
        <>
          <p>
            E-posta, telefon veya KEP yoluyla bize ilettiğiniz bilgiler yalnızca
            talebinizi değerlendirmek ve yanıtlamak amacıyla kullanılır.
          </p>
          <p>
            İlk iletişimde, gerekli olmadıkça sağlık verisi gibi özel nitelikli
            kişisel verilerinizi veya üçüncü kişilere ait ayrıntılı bilgileri
            paylaşmamanızı öneririz. Bilgi paylaşılması tek başına
            avukat–müvekkil ilişkisi kurmaz.
          </p>
        </>
      ),
    },
    {
      id: "baglantilar",
      title: "Üçüncü taraf bağlantıları",
      content: (
        <p>
          Sitemizdeki harici bağlantılar (ör. harita bağlantısı) üçüncü
          tarafların sitelerine yönlendirir. Bu sitelerin gizlilik
          uygulamalarından sorumlu değiliz; ilgili sitelerin politikalarını
          incelemenizi öneririz. Harita, bu nedenle sayfaya gömülmez.
        </p>
      ),
    },
    {
      id: "guvenlik",
      title: "Güvenlik",
      content: (
        <p>
          Sitemiz{" "}
          <Verify>şifreli bağlantı (HTTPS) üzerinden yayımlanacaktır</Verify>.
          Bilgilerinizi korumak için makul teknik ve idari tedbirler alınır;
          ancak internet üzerinden yapılan hiçbir iletimin tamamen güvenli
          olduğu garanti edilemez.
        </p>
      ),
    },
    {
      id: "degisiklikler",
      title: "Değişiklikler",
      content: (
        <p>
          Bu politika güncellendiğinde yeni metin bu sayfada, güncelleme
          tarihiyle birlikte yayımlanır.
        </p>
      ),
    },
    {
      id: "iletisim",
      title: "İletişim",
      content: (
        <p>
          Bu politika hakkındaki sorularınız için{" "}
          <MaybeValue value={dataController.contactEmail} /> adresine
          yazabilirsiniz.
        </p>
      ),
    },
  ]
}
