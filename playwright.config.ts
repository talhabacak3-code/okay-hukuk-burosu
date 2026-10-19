import { defineConfig, devices } from "@playwright/test"

/**
 * Uçtan uca testler (tests/e2e). Varsayılan: yerel üretim derlemesi (`npm run build`
 * sonrası) 3200 portunda başlatılır. Yayındaki/staging siteyi test etmek için:
 *   E2E_BASE_URL=https://staging.ornek.com npm run test:e2e
 *
 * Yetkili giriş ve CRUD testleri yalnızca E2E_ADMIN_EMAIL ve E2E_ADMIN_PASSWORD
 * tanımlıysa çalışır (yalnızca STAGING veritabanında; kayıt ekleyip siler).
 * Tarayıcı indirilmez: sistemdeki Google Chrome kullanılır (channel: "chrome").
 */
const port = 3200
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Tek "next start" sürecine çok sayıda tarayıcı yüklenince gezinmeler zaman aşımına düşüyor.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL,
    locale: "tr-TR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "masaustu",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobil",
      use: {
        ...devices["Pixel 7"],
        channel: "chrome",
        viewport: { width: 375, height: 812 },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
})
