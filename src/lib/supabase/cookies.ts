/**
 * Oturum çerezleri yalnızca sunucuda okunur: httpOnly (betiklerden erişilemez),
 * SameSite=Lax ve üretimde Secure. Panelde tarayıcı tarafı Supabase istemcisi kullanılmaz.
 */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}
