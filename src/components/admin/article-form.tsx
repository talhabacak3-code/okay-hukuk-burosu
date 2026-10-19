import {
  AdminForm,
  FieldGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-kit"
import { mediaOptions } from "@/components/admin/media-options"
import type { ArticleRowAdmin, MediaItem } from "@/lib/admin/data"
import type { FormState } from "@/lib/admin/form"
import { toDateInput } from "@/lib/admin/labels"

export function ArticleForm({
  action,
  article,
  media,
  authors,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  article?: ArticleRowAdmin | null
  media: MediaItem[]
  authors: { id: string; full_name: string }[]
}) {
  return (
    <AdminForm action={action} submitLabel={article ? "Kaydet" : "Ekle"}>
      {article ? <input type="hidden" name="id" value={article.id} /> : null}

      <FieldGroup legend="Yazı">
        <TextField
          name="title"
          label="Başlık"
          required
          defaultValue={article?.title}
          maxLength={200}
          className="md:col-span-2"
        />
        <TextAreaField
          name="excerpt"
          label="Özet"
          required
          defaultValue={article?.excerpt}
          maxLength={500}
          rows={3}
          className="md:col-span-2"
          hint="Listede ve arama sonuçlarında görünür (20–500 karakter)."
        />
        <TextAreaField
          name="body"
          label="Metin"
          required
          defaultValue={article?.body}
          maxLength={50000}
          rows={16}
          className="md:col-span-2"
          hint='Paragrafları boş bir satırla ayırın; ara başlık için satıra "## " ile başlayın. Yazı genel bilgilendirme niteliğinde olmalı; sitede otomatik olarak "hukuki görüş değildir" uyarısı eklenir.'
        />
      </FieldGroup>

      <FieldGroup legend="Ayrıntılar">
        <TextField
          name="category"
          label="Kategori"
          defaultValue={article?.category}
          maxLength={60}
          hint='Ör. "İş hukuku"'
        />
        <SelectField
          name="authorAttorneyId"
          label="Yazar"
          defaultValue={article?.author_attorney_id}
          options={[
            { value: "", label: "— Yazar belirtilmedi —" },
            ...authors.map((a) => ({ value: a.id, label: a.full_name })),
          ]}
        />
        <TextField
          name="slug"
          label="Bağlantı adı (slug)"
          defaultValue={article?.slug}
          maxLength={80}
          hint="Boş bırakılırsa başlıktan üretilir."
        />
        <SelectField
          name="coverPath"
          label="Kapak görseli"
          defaultValue={article?.cover_path}
          options={mediaOptions(media)}
        />
      </FieldGroup>

      <FieldGroup legend="Yayın durumu">
        <SelectField
          name="status"
          label="Durum"
          defaultValue={article?.status ?? "draft"}
          options={[
            { value: "draft", label: "Taslak (sitede görünmez)" },
            { value: "published", label: "Yayımlandı" },
          ]}
        />
        <TextField
          name="publishedDate"
          label="Yayın tarihi"
          type="date"
          defaultValue={toDateInput(article?.published_at ?? null)}
          hint="Boş bırakılırsa yayımlandığı an kullanılır. İleri bir tarih seçilirse o gün yayına girer."
        />
      </FieldGroup>
    </AdminForm>
  )
}
