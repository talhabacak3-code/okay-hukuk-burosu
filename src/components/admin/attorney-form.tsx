import {
  AdminForm,
  CheckboxField,
  FieldGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import { mediaOptions } from "@/components/admin/media-options"
import type { MediaItem } from "@/lib/admin/data"
import type { FormState } from "@/lib/admin/form"
import type { AttorneyRow } from "@/lib/content/attorneys"

type Row = Record<string, unknown>

/** Veritabanındaki eğitim/deneyim dizilerini panelde düzenlenebilir satırlara çevirir. */
function educationLines(value: unknown) {
  if (!Array.isArray(value)) return ""
  return (value as Row[])
    .map((e) => [e.year, e.degree, e.institution].filter(Boolean).join(" | "))
    .join("\n")
}

function experienceLines(value: unknown) {
  if (!Array.isArray(value)) return ""
  return (value as Row[])
    .map((e) => {
      const parts = [
        e.period,
        e.role,
        e.organization ?? "",
        e.description ?? "",
      ]
      while (parts.length > 2 && !parts[parts.length - 1]) parts.pop()
      return parts.join(" | ")
    })
    .join("\n")
}

export function AttorneyForm({
  action,
  attorney,
  media,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  attorney?: AttorneyRow | null
  media: MediaItem[]
}) {
  return (
    <AdminForm action={action} submitLabel={attorney ? "Kaydet" : "Ekle"}>
      {attorney ? <input type="hidden" name="id" value={attorney.id} /> : null}

      <FieldGroup
        legend="Kimlik ve mesleki bilgiler"
        description="Yalnızca doğrulanmış bilgileri girin. Bilinmeyen alanları boş bırakın; sitede 'Eklenecek' olarak görünür."
      >
        <TextField
          name="fullName"
          label="Ad soyad"
          required
          defaultValue={attorney?.full_name}
          maxLength={120}
          hint='Ör. "Av. Ad Soyad"'
        />
        <TextField
          name="title"
          label="Unvan"
          defaultValue={attorney?.title}
          maxLength={120}
          hint='Ör. "Avukat" veya "Avukat, Arabulucu"'
        />
        <TextField
          name="barAssociation"
          label="Kayıtlı olduğu baro"
          defaultValue={attorney?.bar_association}
          maxLength={120}
        />
        <TextField
          name="barRegistrationNo"
          label="Baro sicil numarası"
          defaultValue={attorney?.bar_registration_no}
          maxLength={40}
        />
        <TextField
          name="slug"
          label="Bağlantı adı (slug)"
          defaultValue={attorney?.slug}
          maxLength={80}
          hint="Boş bırakılırsa addan üretilir (ör. ad-soyad)."
        />
        <SelectField
          name="photoPath"
          label="Fotoğraf"
          defaultValue={attorney?.photo_path}
          options={mediaOptions(media)}
          hint="Yalnızca kişinin onayıyla, gerçek fotoğraf. Önce Medya kütüphanesine yükleyin."
        />
        <TextAreaField
          name="summary"
          label="Kısa mesleki özet"
          defaultValue={attorney?.summary}
          maxLength={1200}
          rows={4}
          className="md:col-span-2"
          hint="Başarı, müvekkil veya üstünlük iddiası içermemelidir."
        />
      </FieldGroup>

      <FieldGroup legend="Özgeçmiş">
        <TextAreaField
          name="education"
          label="Eğitim"
          defaultValue={educationLines(attorney?.education)}
          rows={4}
          className="md:col-span-2"
          hint='Her satıra bir kayıt: "Yıl | Derece | Kurum" (yıl isteğe bağlı: "Derece | Kurum").'
        />
        <TextAreaField
          name="experience"
          label="Mesleki geçmiş"
          defaultValue={experienceLines(attorney?.experience)}
          rows={5}
          className="md:col-span-2"
          hint='Her satıra bir kayıt: "Dönem | Görev | Kurum | Açıklama" (kurum ve açıklama isteğe bağlı).'
        />
        <TextAreaField
          name="practiceAreas"
          label="Faaliyet alanları"
          defaultValue={(attorney?.practice_areas ?? []).join("\n")}
          rows={4}
          className="md:col-span-2"
          hint="Her satıra bir alan."
        />
      </FieldGroup>

      <FieldGroup
        legend="Arabuluculuk"
        description="Arabulucu bilgileri yalnızca 'Sicil kaydı teyit edildi' işaretliyse sitede görünür."
      >
        <TextField
          name="mediatorRegistryNo"
          label="Arabulucular Sicili numarası"
          defaultValue={attorney?.mediator_registry_no}
          maxLength={40}
        />
        <CheckboxField
          name="mediatorVerified"
          label="Sicil kaydı teyit edildi"
          defaultChecked={attorney?.mediator_verified ?? false}
          className="self-end"
          hint="Adalet Bakanlığı Arabulucular Sicili'nden kontrol edildi."
        />
        <TextAreaField
          name="mediatorSpecializations"
          label="Uzmanlık alanları (sicil kaydına göre)"
          defaultValue={(attorney?.mediator_specializations ?? []).join("\n")}
          rows={3}
          className="md:col-span-2"
          hint="Her satıra bir alan."
        />
      </FieldGroup>

      <FieldGroup legend="Yayın">
        <TextField
          name="sortOrder"
          label="Sıra"
          type="number"
          defaultValue={attorney?.sort_order ?? 0}
          hint="Küçük sayı önce gösterilir."
        />
        <CheckboxField
          name="published"
          label="Sitede yayımla"
          defaultChecked={attorney?.published ?? false}
          className="self-end"
        />
      </FieldGroup>
    </AdminForm>
  )
}
