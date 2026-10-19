import { expect, test } from "@playwright/test"

import { isDatabaseConfigured } from "./helpers"

/** Algoritmaya uyan, hiçbir kişiye ait olmayan örnek T.C. kimlik numarası. */
const SAMPLE_TURKISH_ID = "10000000146"

test.describe("İletişim formu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/iletisim")
  })

  test("boş gönderimde her alan için erişilebilir hata mesajı", async ({
    page,
  }) => {
    await page
      .locator("form")
      .getByRole("button", { name: /gönder/i })
      .click()
    await expect(page.locator("#fullName-error")).toHaveText(/adınızı/)
    await expect(page.locator("#email-error")).toHaveText(/e-posta/)
    await expect(page.locator("#message-error")).toHaveText(/en az 20/)
    await expect(page.locator("#kvkkAcknowledged-error")).toHaveText(
      /aydınlatma/,
    )
    await expect(page.locator("input#fullName")).toHaveAttribute(
      "aria-invalid",
      "true",
    )
    // KVKK kutusu önceden işaretli değildir.
    await expect(page.locator("#kvkkAcknowledged")).not.toBeChecked()
  })

  test("geçersiz e-posta ve telefon reddedilir", async ({ page }) => {
    await page.locator("input#email").fill("gecersiz-adres")
    await page.locator("input#phone").fill("12")
    await page
      .locator("form")
      .getByRole("button", { name: /gönder/i })
      .click()
    await expect(page.locator("#email-error")).toHaveText(/Geçerli bir e-posta/)
    await expect(page.locator("#phone-error")).toHaveText(/telefon/)
  })

  test("mesajda T.C. kimlik numarası engellenir", async ({ page }) => {
    await page
      .locator("textarea#message")
      .fill(`Merhaba, kimlik numaram ${SAMPLE_TURKISH_ID}; görüşmek istiyorum.`)
    await page
      .locator("form")
      .getByRole("button", { name: /gönder/i })
      .click()
    await expect(page.locator("#message-error")).toHaveText(/T\.C\. kimlik/)
  })

  test("gönderim: başarı yalnızca gerçek kayıtla gösterilir", async ({
    page,
  }, testInfo) => {
    // Sunucu hız sınırı (10 dk / 3 gönderim) nedeniyle yalnızca bir projede gönderilir.
    test.skip(testInfo.project.name !== "masaustu", "tek gönderim yeterli")
    const configured = await isDatabaseConfigured(page)

    await page.locator("input#fullName").fill("E2E Test")
    await page.locator("input#email").fill("e2e-test@example.com")
    await page
      .locator("textarea#message")
      .fill(
        "Bu mesaj otomatik uçtan uca testi tarafından gönderildi; yanıt gerekmez.",
      )
    await page.locator("#kvkkAcknowledged").check()
    // Bot koruması: formun en az 3 sn açık kalması gerekir.
    await page.waitForTimeout(3500)
    await page
      .locator("form")
      .getByRole("button", { name: /gönder/i })
      .click()

    const status = page
      .locator('[role="status"], [role="alert"]')
      .filter({ hasText: /\S/ })
    await expect(status.first()).toBeVisible({ timeout: 10_000 })
    const text = (await status.allTextContents()).join(" ")

    if (configured && process.env.E2E_EXPECT_CONTACT_SUCCESS === "1") {
      expect(text).toMatch(/Mesajınız alındı/)
    } else {
      // Altyapı yoksa (veya hız sınırı dolduysa) asla başarı gösterilmez.
      expect(text).not.toMatch(/Mesajınız alındı|Teşekkür ederiz/)
      expect(text).toMatch(/iletilmedi|etkin değil|çok fazla|işlenemedi/i)
    }
  })
})
