import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type StaffRole = "admin" | "editor"

export type StaffUser = {
  id: string
  email: string | null
  role: StaffRole
  displayName: string | null
}

export const ADMIN_LOGIN_PATH = "/admin/giris"
export const ADMIN_FORBIDDEN_PATH = "/admin/yetkisiz"

/**
 * Veri erişim katmanının (DAL) kimlik kapısı. Oturum JWT'si getClaims ile doğrulanır,
 * rol `staff` tablosundan okunur. İstek başına bir kez çalışır (React cache).
 * Supabase yapılandırılmamışsa veya kullanıcı panel personeli değilse `null`.
 */
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const claims = claimsData?.claims
  if (claimsError || !claims?.sub) return null

  const { data: staff, error } = await supabase
    .from("staff")
    .select("role, display_name")
    .eq("user_id", claims.sub)
    .maybeSingle()

  if (error || !staff) return null
  if (staff.role !== "admin" && staff.role !== "editor") return null

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    role: staff.role,
    displayName: staff.display_name ?? null,
  }
})

/**
 * Sayfa ve Server Action'ların başında çağrılır (savunma derinliği: proxy + bu kontrol + RLS).
 * Oturum yoksa girişe, rol yetersizse "yetkisiz" sayfasına yönlendirir.
 */
export async function requireStaff(minRole: StaffRole = "editor") {
  const user = await getStaffUser()
  if (!user) redirect(ADMIN_LOGIN_PATH)
  if (minRole === "admin" && user.role !== "admin") {
    redirect(ADMIN_FORBIDDEN_PATH)
  }
  return user
}

/** Oturumlu Supabase istemcisi + doğrulanmış kullanıcı. */
export async function requireStaffClient(minRole: StaffRole = "editor") {
  const user = await requireStaff(minRole)
  const supabase = await createClient()
  if (!supabase) redirect(ADMIN_LOGIN_PATH)
  return { user, supabase }
}
