import type { Metadata } from "next"
import Image from "next/image"

import { DeleteButton } from "@/components/admin/delete-button"
import {
  AdminForm,
  FieldGroup,
  FileField,
  TextField,
} from "@/components/admin/form-kit"
import { AdminPageTitle } from "@/components/admin/page-title"
import {
  deleteMedia,
  updateMediaAlt,
  uploadMedia,
} from "@/lib/admin/actions/media"
import { listMedia } from "@/lib/admin/data"
import { formatBytes, formatDateTime } from "@/lib/admin/labels"
import { mediaPublicUrl } from "@/lib/supabase/public"

export const metadata: Metadata = { title: "Medya kütüphanesi" }

export default async function MediaLibraryPage() {
  const media = await listMedia()

  return (
    <>
      <AdminPageTitle
        title="Medya kütüphanesi"
        description="Avukat fotoğrafları, büro fotoğrafı ve yayın kapakları. Yalnızca gerçek ve kullanım izni olan görseller yükleyin."
      />

      <section aria-labelledby="yukle-baslik" className="mb-14">
        <h2 id="yukle-baslik" className="sr-only">
          Görsel yükle
        </h2>
        <AdminForm action={uploadMedia} submitLabel="Yükle">
          <FieldGroup
            legend="Yeni görsel"
            description="JPEG, PNG veya WebP; en fazla 5 MB. Görsel en uzun kenarı 2400 px olacak şekilde küçültülür; konum dahil tüm üst veri (EXIF) silinir."
          >
            <FileField
              name="file"
              label="Görsel dosyası"
              required
              accept="image/jpeg,image/png,image/webp"
            />
            <TextField
              name="alt"
              label="Açıklama (alt metin)"
              required
              maxLength={200}
              hint='Görme engelli ziyaretçiler için: ör. "Av. Ad Soyad portresi".'
            />
          </FieldGroup>
        </AdminForm>
      </section>

      <section aria-labelledby="liste-baslik">
        <h2 id="liste-baslik" className="text-h3">
          Görseller{" "}
          <span className="text-muted-foreground tabular-nums">
            ({media.length})
          </span>
        </h2>
        {media.length === 0 ? (
          <p className="mt-6 border border-dashed border-ink-950/20 p-8 text-sm text-muted-foreground">
            Henüz görsel yüklenmedi.
          </p>
        ) : (
          <ul className="mt-6 grid gap-8 md:grid-cols-2">
            {media.map((item) => {
              const src = mediaPublicUrl(item.path)
              return (
                <li key={item.id} className="border border-border bg-paper">
                  <div className="relative aspect-[4/3] bg-paper-deep">
                    {src ? (
                      <Image
                        src={src}
                        alt={item.alt}
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-4 p-5">
                    <p className="text-xs text-muted-foreground">
                      {item.width}×{item.height} ·{" "}
                      {formatBytes(item.size_bytes)} ·{" "}
                      {formatDateTime(item.created_at)}
                    </p>
                    <AdminForm
                      action={updateMediaAlt}
                      submitLabel="Alt metni kaydet"
                      className="space-y-4"
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <TextField
                        name="alt"
                        label="Alt metin"
                        required
                        defaultValue={item.alt}
                        maxLength={200}
                      />
                    </AdminForm>
                    <DeleteButton
                      action={deleteMedia}
                      id={item.id}
                      label="Görseli sil"
                      confirmText="Bu görsel kalıcı olarak silinsin mi? Kullanımdaysa silinmez."
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
