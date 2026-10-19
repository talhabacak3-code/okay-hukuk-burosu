import { expect, test } from "@playwright/test"

import { adminCredentials, isDatabaseConfigured } from "./helpers"

const panelRoutes = [
  "/admin",
  "/admin/ana-sayfa",
  "/admin/hakkimizda",
  "/admin/avukatlar",
  "/admin/avukatlar/yeni",
  "/admin/faaliyet-alanlari",
  "/admin/arabuluculuk",
  "/admin/yayinlar",
  "/admin/medya",
  "/admin/iletisim",
  "/admin/ayarlar",
  "/admin/mesajlar",
  "/admin/denetim",
]

test.describe("Yönetim paneli — yetkisiz erişim", () => {
  test("oturumsuz ziyaretçi hiçbir panel verisine ulaşamaz", async ({
    page,
    request,
  }) => {
    const configured = await isDatabaseConfigured(page)
    for (const path of panelRoutes) {
      const response = await request.get(path, { maxRedirects: 0 })
      const headers = response.headers()
      expect(headers["x-robots-tag"], path).toContain("noindex")
      expect(headers["cache-control"], path).toContain("no-store")
      if (configured) {
        expect(response.status(), path).toBe(307)
        expect(headers["location"], path).toContain("/admin/giris?next=")
      } else {
        // Veritabanı yoksa panel yalnızca "bağlantı yok" ekranını gösterir.
        expect(await response.text(), path).toContain(
          "Veritabanı bağlantısı yapılandırılmadı",
        )
      }
    }
  })

  test("sahte oturum çerezi kabul edilmez", async ({
    page,
    context,
    baseURL,
  }) => {
    test.skip(!(await isDatabaseConfigured(page)), "Supabase yapılandırılmadı")
    await context.addCookies([
      {
        name: "sb-x-auth-token",
        value: "base64-eyJmYWtlIjp0cnVlfQ",
        url: baseURL!,
      },
    ])
    await page.goto("/admin/avukatlar")
    await expect(page).toHaveURL(/\/admin\/giris/)
  })

  test("giriş formu: doğrulama, genel hata mesajı, açık yönlendirme engeli", async ({
    page,
  }) => {
    await page.goto("/admin/giris?next=https://kotu.example/")
    await expect(page.locator("h1")).toHaveText("Giriş")
    await page.getByRole("button", { name: "Giriş yap" }).click()
    await expect(page.locator("#email-error")).toBeVisible()

    await page.locator("#email").fill("olmayan-kullanici@example.com")
    await page.locator("#password").fill("yanlis-sifre-123")
    await page.getByRole("button", { name: "Giriş yap" }).click()
    const message = page
      .locator('[role="alert"]')
      .filter({ hasText: /\S/ })
      .first()
    await expect(message).toBeVisible({ timeout: 15_000 })
    // Hesap var/yok bilgisi sızmaz; veritabanı yoksa giriş yapılamadığı açıkça söylenir.
    await expect(message).toHaveText(
      /E-posta veya şifre hatalı|yapılandırılmadı|ulaşılamadı/,
    )
    expect(new URL(page.url()).host).not.toBe("kotu.example")
  })
})

test.describe("Yönetim paneli — yetkili kullanıcı ve CRUD", () => {
  test.describe.configure({ mode: "serial" })
  test.skip(
    !adminCredentials,
    "E2E_ADMIN_EMAIL ve E2E_ADMIN_PASSWORD tanımlı değil (yalnızca staging veritabanında çalıştırın)",
  )

  test("giriş → faaliyet alanı ekle → sitede gör → düzenle → sil", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "masaustu",
      "veritabanına tek kez yazılır",
    )
    const stamp = Date.now()
    const title = `E2E Test Alanı ${stamp}`
    const summary =
      "Uçtan uca test kaydıdır; test sonunda otomatik olarak silinir."

    await page.goto("/admin/faaliyet-alanlari")
    await expect(page).toHaveURL(/\/admin\/giris\?next=/)
    await page.locator("#email").fill(adminCredentials!.email)
    await page.locator("#password").fill(adminCredentials!.password)
    await page.getByRole("button", { name: "Giriş yap" }).click()
    await expect(page).toHaveURL(/\/admin\/faaliyet-alanlari$/)

    // Ekle (yayımlanmış)
    await page.goto("/admin/faaliyet-alanlari/yeni")
    await page.getByLabel("Başlık").fill(title)
    await page.getByLabel("Kısa açıklama").fill(summary)
    await page.getByLabel("Sitede yayımla").check()
    await page.getByRole("button", { name: "Ekle" }).click()
    await expect(page).toHaveURL(/kaydedildi=1/)
    await expect(page.getByRole("status")).toContainText("eklendi")

    // Sitede görünür (önbellek etiketi yenilendi)
    const publicPage = await page.context().newPage()
    await publicPage.goto("/calisma-alanlari")
    await expect(publicPage.locator("main")).toContainText(title)

    // Düzenle
    const edited = `${title} (düzenlendi)`
    await page.getByLabel("Başlık").fill(edited)
    await page.getByRole("button", { name: "Kaydet" }).click()
    await expect(
      page
        .locator('[role="status"]')
        .filter({ hasText: /kaydedildi/i })
        .first(),
    ).toBeVisible()
    await publicPage.reload()
    await expect(publicPage.locator("main")).toContainText(edited)

    // Sil
    page.once("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: /sil/i }).click()
    await expect(page).toHaveURL(/silindi=1/)
    await publicPage.reload()
    await expect(publicPage.locator("main")).not.toContainText(edited)

    // Denetim kaydında iz bulunur
    await page.goto("/admin/denetim")
    await expect(page.locator("main")).toContainText(/Faaliyet/i)
  })

  test("editör/admin dışı rol sayfaları: admin olmayan /admin/yetkisiz'e yönlenir", async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_ADMIN_ROLE !== "editor",
      "yalnızca editör hesabıyla anlamlı (E2E_ADMIN_ROLE=editor)",
    )
    await page.goto("/admin/giris")
    await page.locator("#email").fill(adminCredentials!.email)
    await page.locator("#password").fill(adminCredentials!.password)
    await page.getByRole("button", { name: "Giriş yap" }).click()
    await page.goto("/admin/ayarlar")
    await expect(page).toHaveURL(/\/admin\/yetkisiz/)
  })
})
