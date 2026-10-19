import Link from "next/link"

import { Verify } from "@/components/legal/draft-notice"
import type { LegalSection } from "@/components/legal/legal-document"
import { MaybeValue } from "@/components/primitives/placeholder"
import { routes } from "@/config/routes"
import type { SiteSettings } from "@/lib/content/settings"

/**
 * KVKK Aydınlatma Metni — TASLAK (nihai hukuki onay bekliyor).
 * Dayanak: 6698 s. KVKK m. 10 ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak
 * Usul ve Esaslar Hakkında Tebliğ. Büroya özgü olgular <Verify> / <MaybeValue> ile işaretlidir.
 */
export const KVKK_DRAFT_DATE = "17 Ekim 2026"

export function kvkkNoticeSections(settings: SiteSettings): LegalSection[] {
  const { dataController, contact } = settings

  return [
    {
      id: "veri-sorumlusu",
      title: "Veri sorumlusu",
      content: (
        <>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
            uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla aşağıda
            bilgileri yer alan büro tarafından işlenmektedir.
          </p>
          <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Unvan</dt>
            <dd>
              <MaybeValue value={dataController.name} />
            </dd>
            <dt className="text-muted-foreground">Adres</dt>
            <dd>
              <MaybeValue value={dataController.address} />
            </dd>
            <dt className="text-muted-foreground">KEP adresi</dt>
            <dd>
              <MaybeValue value={contact.kep} />
            </dd>
            <dt className="text-muted-foreground">Başvuru e-postası</dt>
            <dd>
              <MaybeValue value={dataController.contactEmail} />
            </dd>
          </dl>
        </>
      ),
    },
    {
      id: "kapsam",
      title: "Kapsam",
      content: (
        <>
          <p>
            Bu metin; internet sitemizi ziyaret eden ve büromuzla e-posta,
            telefon veya KEP aracılığıyla iletişime geçen kişilere ilişkin
            kişisel verilerin işlenmesini kapsar.
          </p>
          <p>
            Avukatlık hizmeti ilişkisi kurulduğunda müvekkillere ait veriler
            için ayrıca bilgilendirme yapılır. 1136 sayılı Avukatlık
            Kanunu&apos;nun 36. maddesinde düzenlenen sır saklama yükümlülüğü
            saklıdır.
          </p>
        </>
      ),
    },
    {
      id: "islenen-veriler",
      title: "İşlenen kişisel veriler",
      content: (
        <>
          <ul>
            <li>
              <strong className="font-medium">Kimlik ve iletişim:</strong> ad
              soyad, telefon numarası, e-posta adresi — yalnızca bizimle
              iletişime geçtiğinizde sizin ilettiğiniz ölçüde.
            </li>
            <li>
              <strong className="font-medium">Talep içeriği:</strong> iletişim
              sırasında bize aktardığınız bilgi ve belgeler.
            </li>
            <li>
              <strong className="font-medium">İşlem güvenliği:</strong> IP
              adresi, tarayıcı bilgisi ve erişim zamanı gibi sunucu kayıtları —{" "}
              <Verify>barındırma hizmet sağlayıcısının tuttuğu kayıtlar</Verify>
              .
            </li>
          </ul>
          <p>
            İnternet sitemizde şu anda iletişim formu, üyelik, analitik veya
            reklam amaçlı çerez bulunmamaktadır. Bu durum değişirse metin
            güncellenecektir.
          </p>
        </>
      ),
    },
    {
      id: "amaclar",
      title: "İşleme amaçları",
      content: (
        <ul>
          <li>Talep, soru ve başvurularınızın alınması ve yanıtlanması,</li>
          <li>İletişim faaliyetlerinin yürütülmesi,</li>
          <li>Bilgi güvenliği süreçlerinin yürütülmesi,</li>
          <li>
            Mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi ve yetkili
            kişi, kurum ve kuruluşlara bilgi verilmesi.
          </li>
        </ul>
      ),
    },
    {
      id: "hukuki-sebepler",
      title: "Hukuki sebepler",
      content: (
        <>
          <p>
            Kişisel verileriniz, KVKK&apos;nın 5. maddesinin 2. fıkrasında yer
            alan aşağıdaki hukuki sebeplere dayanılarak işlenir:
          </p>
          <ul>
            <li>
              Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m.
              5/2-c),
            </li>
            <li>
              Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için
              zorunlu olması (m. 5/2-ç),
            </li>
            <li>
              Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması
              (m. 5/2-e),
            </li>
            <li>
              İlgili kişinin temel hak ve özgürlüklerine zarar vermemek
              kaydıyla, veri sorumlusunun meşru menfaatleri için zorunlu olması
              (m. 5/2-f).
            </li>
          </ul>
          <p>
            <Verify>
              Açık rızaya dayanan bir işleme faaliyeti bulunup bulunmadığı
            </Verify>{" "}
            hukuki incelemede belirlenecektir; açık rıza gerekirse bu metinden
            ayrı olarak alınır.
          </p>
        </>
      ),
    },
    {
      id: "aktarim",
      title: "Kişisel verilerin aktarılması",
      content: (
        <>
          <p>
            Kişisel verileriniz, yukarıdaki amaçlarla sınırlı olarak; talep
            edilmesi hâlinde yetkili kamu kurum ve kuruluşlarına ve hizmet
            aldığımız{" "}
            <Verify>barındırma ve e-posta hizmet sağlayıcılarına</Verify>{" "}
            aktarılabilir.
          </p>
          <p>
            Hizmet sağlayıcılardan herhangi birinin yurt dışında bulunması
            hâlinde aktarım, KVKK&apos;nın 9. maddesi kapsamında yürütülür.{" "}
            <Verify>Sağlayıcıların ve veri konumlarının listesi</Verify> hukuki
            incelemede eklenecektir.
          </p>
        </>
      ),
    },
    {
      id: "toplama-yontemi",
      title: "Toplama yöntemi",
      content: (
        <p>
          Kişisel verileriniz; e-posta, telefon, KEP ve internet sitesi
          aracılığıyla, elektronik ortamda, kısmen otomatik (sunucu kayıtları)
          ve otomatik olmayan yollarla toplanır.
        </p>
      ),
    },
    {
      id: "saklama",
      title: "Saklama süresi",
      content: (
        <p>
          Kişisel verileriniz, işleme amacının gerektirdiği ve ilgili mevzuatta
          öngörülen süre boyunca saklanır; sürenin sonunda silinir, yok edilir
          veya anonim hâle getirilir. Veri kategorilerine göre{" "}
          <Verify>
            saklama süreleri, büronun saklama ve imha politikasına göre
          </Verify>{" "}
          eklenecektir.
        </p>
      ),
    },
    {
      id: "haklar",
      title: "İlgili kişi olarak haklarınız",
      content: (
        <>
          <p>KVKK&apos;nın 11. maddesi uyarınca;</p>
          <ol>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>
              İşlenme amacını ve bunların amacına uygun kullanılıp
              kullanılmadığını öğrenme,
            </li>
            <li>
              Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
            </li>
            <li>
              Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,
            </li>
            <li>
              KVKK&apos;nın 7. maddesindeki şartlar çerçevesinde silinmesini
              veya yok edilmesini isteme,
            </li>
            <li>
              Düzeltme, silme veya yok etme işlemlerinin, verilerin aktarıldığı
              üçüncü kişilere bildirilmesini isteme,
            </li>
            <li>
              İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz
              edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz
              etme,
            </li>
            <li>
              Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın
              giderilmesini talep etme
            </li>
          </ol>
          <p>haklarına sahipsiniz.</p>
        </>
      ),
    },
    {
      id: "basvuru",
      title: "Başvuru",
      content: (
        <>
          <p>
            Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve
            Esasları Hakkında Tebliğ&apos;e uygun olarak; yazılı şekilde veya
            kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza,
            mobil imza ya da tarafınızca daha önce bildirilen ve sistemimizde
            kayıtlı bulunan e-posta adresi aracılığıyla, &ldquo;Veri
            sorumlusu&rdquo; bölümündeki adreslere iletebilirsiniz.
          </p>
          <p>
            Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç otuz
            gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir
            maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu
            tarafından belirlenen tarifedeki ücret alınabilir (KVKK m. 13).
          </p>
          <p>
            İnternet sitesine ilişkin diğer bilgiler için{" "}
            <Link href={routes.privacyPolicy.href}>Gizlilik Politikası</Link> ve{" "}
            <Link href={routes.cookiePolicy.href}>Çerez Politikası</Link>{" "}
            sayfalarına bakabilirsiniz.
          </p>
        </>
      ),
    },
  ]
}
