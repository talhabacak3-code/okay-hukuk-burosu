import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleForm } from "@/components/admin/article-form"
import { DeleteButton } from "@/components/admin/delete-button"
import { AdminPageTitle, SavedNotice } from "@/components/admin/page-title"
import { deleteArticle, updateArticle } from "@/lib/admin/actions/articles"
import {
  getArticleAdmin,
  listAttorneysAdmin,
  listMedia,
} from "@/lib/admin/data"
import { uuidSchema } from "@/lib/admin/schemas"

export const metadata: Metadata = { title: "Yazıyı düzenle" }

export default async function EditArticlePage({
  params,
  searchParams,
}: PageProps<"/admin/yayinlar/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!uuidSchema.safeParse(id).success) notFound()
  const [article, media, attorneys] = await Promise.all([
    getArticleAdmin(id),
    listMedia(),
    listAttorneysAdmin(),
  ])
  if (!article) notFound()

  return (
    <>
      <AdminPageTitle
        title={article.title}
        back={{ href: "/admin/yayinlar", label: "Hukuki yayınlar" }}
        actions={
          <DeleteButton
            action={deleteArticle}
            id={article.id}
            confirmText={`"${article.title}" kalıcı olarak silinsin mi?`}
          />
        }
      />
      <SavedNotice show={query.kaydedildi === "1"}>Yazı eklendi.</SavedNotice>
      <ArticleForm
        action={updateArticle}
        article={article}
        media={media}
        authors={attorneys}
      />
    </>
  )
}
