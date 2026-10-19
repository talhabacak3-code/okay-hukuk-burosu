import type { MediaItem } from "@/lib/admin/data"

/** Medya kütüphanesindeki görselleri açılır liste seçeneklerine çevirir. */
export function mediaOptions(media: MediaItem[]) {
  return [
    { value: "", label: "— Görsel seçilmedi —" },
    ...media.map((item) => ({
      value: item.path,
      label: `${item.alt} (${item.width ?? "?"}×${item.height ?? "?"})`,
    })),
  ]
}
