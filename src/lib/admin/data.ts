import "server-only"

import { requireStaffClient } from "@/lib/admin/auth"
import type { AttorneyRow } from "@/lib/content/attorneys"
import {
  pageSchemas,
  type PageContentMap,
  type PageSlug,
} from "@/lib/content/page-schemas"

/**
 * Panel veri okumaları (DAL). Her fonksiyon önce oturumu ve rolü doğrular, sonra
 * kullanıcının kendi oturumuyla (RLS) okur. Hata yutulmaz: çağıran sayfa hata
 * sınırına (error.tsx) düşer; sahte/boş veri gösterilmez.
 */

class AdminDataError extends Error {
  constructor(context: string, code?: string) {
    super(`${context} okunamadı (${code ?? "bilinmiyor"})`)
  }
}

export type MediaItem = {
  id: string
  path: string
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  alt: string
  created_at: string
}

export async function listMedia() {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("media")
    .select("id, path, mime_type, size_bytes, width, height, alt, created_at")
    .order("created_at", { ascending: false })
    .returns<MediaItem[]>()
  if (error) throw new AdminDataError("media", error.code)
  return data ?? []
}

export async function listAttorneysAdmin() {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("attorneys")
    .select("*")
    .order("sort_order")
    .order("full_name")
    .returns<AttorneyRow[]>()
  if (error) throw new AdminDataError("attorneys", error.code)
  return data ?? []
}

export async function getAttorneyAdmin(id: string) {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("attorneys")
    .select("*")
    .eq("id", id)
    .maybeSingle<AttorneyRow>()
  if (error) throw new AdminDataError("attorney", error.code)
  return data
}

export type PracticeAreaRow = {
  id: string
  slug: string
  title: string
  summary: string
  sort_order: number
  published: boolean
  updated_at: string
}

export async function listPracticeAreasAdmin() {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("practice_areas")
    .select("*")
    .order("sort_order")
    .order("title")
    .returns<PracticeAreaRow[]>()
  if (error) throw new AdminDataError("practice_areas", error.code)
  return data ?? []
}

export async function getPracticeAreaAdmin(id: string) {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("practice_areas")
    .select("*")
    .eq("id", id)
    .maybeSingle<PracticeAreaRow>()
  if (error) throw new AdminDataError("practice_area", error.code)
  return data
}

export type ArticleRowAdmin = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: string | null
  author_attorney_id: string | null
  cover_path: string | null
  status: "draft" | "published"
  published_at: string | null
  updated_at: string
}

export async function listArticlesAdmin() {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<ArticleRowAdmin[]>()
  if (error) throw new AdminDataError("articles", error.code)
  return data ?? []
}

export async function getArticleAdmin(id: string) {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle<ArticleRowAdmin>()
  if (error) throw new AdminDataError("article", error.code)
  return data
}

export async function getPageContentAdmin<S extends PageSlug>(
  slug: S,
): Promise<PageContentMap[S]> {
  const { supabase } = await requireStaffClient()
  const { data, error } = await supabase
    .from("pages")
    .select("content")
    .eq("slug", slug)
    .maybeSingle<{ content: Record<string, unknown> }>()
  if (error) throw new AdminDataError("pages", error.code)
  const parsed = pageSchemas[slug].safeParse(data?.content ?? {})
  return (
    parsed.success ? parsed.data : pageSchemas[slug].parse({})
  ) as PageContentMap[S]
}

export type SiteSettingsRow = Record<string, string | boolean | null>

export async function getSiteSettingsAdmin() {
  const { supabase } = await requireStaffClient("admin")
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle<SiteSettingsRow>()
  if (error) throw new AdminDataError("site_settings", error.code)
  return data
}

export type ContactMessageRow = {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string
  status: "new" | "read" | "archived"
  created_at: string
}

export async function listContactMessages() {
  const { supabase } = await requireStaffClient("admin")
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, full_name, email, phone, message, status, created_at")
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<ContactMessageRow[]>()
  if (error) throw new AdminDataError("contact_messages", error.code)
  return data ?? []
}

export type AuditRow = {
  id: number
  occurred_at: string
  actor_role: string | null
  action: "INSERT" | "UPDATE" | "DELETE"
  table_name: string
  record_id: string | null
  changed_fields: string[] | null
}

export async function listAuditLog(limit = 100) {
  const { supabase } = await requireStaffClient("admin")
  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, occurred_at, actor_role, action, table_name, record_id, changed_fields",
    )
    .order("occurred_at", { ascending: false })
    .limit(limit)
    .returns<AuditRow[]>()
  if (error) throw new AdminDataError("audit_log", error.code)
  return data ?? []
}

/** Genel bakış sayıları — rolün görebildiği tablolarla sınırlı. */
export async function getDashboardCounts() {
  const { user, supabase } = await requireStaffClient()
  const count = async (table: string, filter?: [string, string | boolean]) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true })
    if (filter) query = query.eq(filter[0], filter[1])
    const { count: value, error } = await query
    if (error) throw new AdminDataError(table, error.code)
    return value ?? 0
  }

  const [attorneys, publishedArticles, draftArticles, practiceAreas, media] =
    await Promise.all([
      count("attorneys"),
      count("articles", ["status", "published"]),
      count("articles", ["status", "draft"]),
      count("practice_areas"),
      count("media"),
    ])
  const newMessages =
    user.role === "admin"
      ? await count("contact_messages", ["status", "new"])
      : null

  return {
    attorneys,
    publishedArticles,
    draftArticles,
    practiceAreas,
    media,
    newMessages,
  }
}
