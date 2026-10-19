/**
 * Önbellek etiketleri. Site okumaları `cacheTag(...)` ile etiketlenir; panelden yapılan
 * her başarılı kayıt ilgili etiketi `updateTag(...)` ile yeniler.
 */
export const contentTags = {
  settings: "site-settings",
  pages: "pages",
  attorneys: "attorneys",
  practiceAreas: "practice-areas",
  articles: "articles",
  media: "media",
} as const

export type ContentTag = (typeof contentTags)[keyof typeof contentTags]
