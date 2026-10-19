import type { Metadata } from "next"

import { ArticleForm } from "@/components/admin/article-form"
import { AdminPageTitle } from "@/components/admin/page-title"
import { createArticle } from "@/lib/admin/actions/articles"
import { listAttorneysAdmin, listMedia } from "@/lib/admin/data"

export const metadata: Metadata = { title: "Yeni yazı" }

export default async function NewArticlePage() {
  const [media, attorneys] = await Promise.all([
    listMedia(),
    listAttorneysAdmin(),
  ])
  return (
    <>
      <AdminPageTitle
        title="Yeni yazı"
        back={{ href: "/admin/yayinlar", label: "Hukuki yayınlar" }}
      />
      <ArticleForm action={createArticle} media={media} authors={attorneys} />
    </>
  )
}
