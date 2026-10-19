import {
  AdminForm,
  CheckboxField,
  FieldGroup,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import type { FormState } from "@/lib/admin/form"
import type { PracticeAreaRow } from "@/lib/admin/data"

export function PracticeAreaForm({
  action,
  area,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  area?: PracticeAreaRow | null
}) {
  return (
    <AdminForm action={action} submitLabel={area ? "Kaydet" : "Ekle"}>
      {area ? <input type="hidden" name="id" value={area.id} /> : null}
      <FieldGroup legend="Faaliyet alanı">
        <TextField
          name="title"
          label="Başlık"
          required
          defaultValue={area?.title}
          maxLength={120}
        />
        <TextField
          name="slug"
          label="Bağlantı adı (slug)"
          defaultValue={area?.slug}
          maxLength={80}
          hint="Boş bırakılırsa başlıktan üretilir (ör. kira-hukuku)."
        />
        <TextAreaField
          name="summary"
          label="Kısa açıklama"
          required
          defaultValue={area?.summary}
          maxLength={400}
          rows={4}
          className="md:col-span-2"
          hint="10–400 karakter. Sonuç vaadi veya üstünlük iddiası içermemelidir."
        />
        <TextField
          name="sortOrder"
          label="Sıra"
          type="number"
          defaultValue={area?.sort_order ?? 0}
          hint="Küçük sayı önce gösterilir."
        />
        <CheckboxField
          name="published"
          label="Sitede yayımla"
          defaultChecked={area?.published ?? false}
          className="self-end"
        />
      </FieldGroup>
    </AdminForm>
  )
}
