import { expect, type Page } from "@playwright/test"

/** Onaylı logonun (1361×503) oranı; ±%2 tolerans. */
export const LOGO_RATIO = 1361 / 503

/** Sayfadaki görünür onaylı logo görsellerini ve çizim oranlarını döndürür. */
export async function visibleLogos(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('img[src*="okay-logo"]')]
      .filter((img) => {
        const rect = img.getBoundingClientRect()
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          getComputedStyle(img).visibility !== "hidden"
        )
      })
      .map((img) => {
        const rect = img.getBoundingClientRect()
        return {
          src: img.currentSrc || img.src,
          ratio: rect.width / rect.height,
          natural: img.naturalWidth / img.naturalHeight,
          complete: img.complete && img.naturalWidth > 0,
          objectFit: getComputedStyle(img).objectFit,
          filter: getComputedStyle(img).filter,
        }
      }),
  )
}

/** Konsol hatalarını ve yakalanmamış istisnaları toplar. */
export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow, "yatay taşma (px)").toBeLessThanOrEqual(0)
}

/** Supabase yapılandırılmış mı? Panel yapılandırma yoksa "bağlantı yok" ekranı gösterir. */
export async function isDatabaseConfigured(page: Page) {
  const response = await page.request.get("/admin", { maxRedirects: 0 })
  if (response.status() >= 300 && response.status() < 400) return true
  const body = await response.text()
  return !body.includes("Veritabanı bağlantısı yapılandırılmadı")
}

export const adminCredentials =
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
    ? {
        email: process.env.E2E_ADMIN_EMAIL,
        password: process.env.E2E_ADMIN_PASSWORD,
      }
    : null

/**
 * Bilinmeyen kayıt: 404 ya da (dinamik bölüm akış başladıktan sonra notFound() çağırdıysa)
 * 200 + noindex + bulunamadı sayfası. Next.js belgelenmiş davranışı; sonraki istekler 404.
 */
export async function expectNotFound(page: Page, path: string) {
  const response = await page.goto(path)
  const status = response?.status()
  expect([200, 404]).toContain(status)
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first(),
  ).toBeAttached()
  await expect(page.locator("h1:visible")).toHaveText(/bulunamadı/i)
}
