import { expect, test } from "@playwright/test"

import {
  collectErrors,
  expectNotFound,
  expectNoHorizontalOverflow,
  MARK_RATIO,
  visibleLogos,
} from "./helpers"

const pages = [
  { path: "/", h1: /Hukuka Saygı/ },
  { path: "/hakkimizda", h1: /Hakkımızda/ },
  { path: "/calisma-alanlari", h1: /Çalışma Alanları/ },
  { path: "/arabuluculuk", h1: /Arabuluculuk/ },
  { path: "/avukatlarimiz", h1: /Avukatlarımız/ },
  { path: "/yayinlar", h1: /Yayınlar/ },
  { path: "/iletisim", h1: /İletişim/ },
  { path: "/kvkk-aydinlatma-metni", h1: /KVKK/ },
  { path: "/gizlilik-politikasi", h1: /Gizlilik/ },
  { path: "/cerez-politikasi", h1: /Çerez/ },
  { path: "/yasal-uyari", h1: /Yasal Uyarı/ },
]

test.describe("Kamuya açık sayfalar", () => {
  for (const { path, h1 } of pages) {
    test(`${path}: tek h1, logo oranı korunmuş, konsol hatası ve taşma yok`, async ({
      page,
    }) => {
      const errors = collectErrors(page)
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator("h1")).toHaveText(h1)
      await expect(page).toHaveTitle(/OKAY Hukuk/)

      // Logo: her sayfada en az bir görünür onaylı amblem + "OKAY HUKUK DANIŞMANLIK"; oran korunmuş.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(400)
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect
        .poll(async () => (await visibleLogos(page)).length)
        .toBeGreaterThan(0)
      for (const logo of await visibleLogos(page)) {
        expect(Math.abs(logo.ratio - MARK_RATIO) / MARK_RATIO).toBeLessThan(
          0.02,
        )
        expect(logo.text).toContain("OKAY")
        expect(logo.text).toContain("HUKUK DANIŞMANLIK")
        expect(logo.filter).toBe("none")
      }

      await expectNoHorizontalOverflow(page)
      expect(errors).toEqual([])
    })
  }

  test("ana sayfa: hero, logo ve bölümler", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#giris")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Mesleğe Özen.",
    )
    // Koyu hero'da logo kırık beyaz amblem + yazı olarak görünür; başlıktaki logo gizlidir.
    const heroLogo = page.locator("#giris [data-okay-logo]")
    await expect(heroLogo.first()).toBeVisible()
    await expect(heroLogo.first()).toHaveAccessibleName(
      /OKAY Hukuk Danışmanlık/,
    )
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible()
    await expect(page.getByRole("contentinfo")).toBeVisible()
  })

  test("klavye: ilk Tab içeriğe geç bağlantısı, odak #icerik'e taşınır", async ({
    page,
  }) => {
    await page.goto("/hakkimizda")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "İçeriğe geç" })
    await expect(skip).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#icerik$/)
  })

  test("faaliyet alanları: kart listesi ya da açık 'eklenecek' bilgisi", async ({
    page,
  }) => {
    await page.goto("/calisma-alanlari")
    const cards = page.locator("main article, main li a")
    const pending = page.locator("main [data-placeholder]")
    expect((await cards.count()) + (await pending.count())).toBeGreaterThan(0)
  })

  test("arabuluculuk: 6325 sayılı Kanun bilgilendirmesi ve sicil kuralı", async ({
    page,
  }) => {
    await page.goto("/arabuluculuk")
    await expect(page.locator("main")).toContainText("6325")
    // Sicil no yalnızca teyitliyse gösterilir; uydurulmuş bir numara biçimi bulunmamalı.
    await expect(page.locator("main")).not.toContainText(
      /sicil no\s*:?\s*\d{3,}/i,
    )
  })

  test("avukat profilleri: liste → profil, bilinmeyen profil 404", async ({
    page,
  }) => {
    await page.goto("/avukatlarimiz")
    const profileLinks = page.locator('main a[href^="/avukatlarimiz/"]')
    const count = await profileLinks.count()
    if (count > 0) {
      const href = await profileLinks.first().getAttribute("href")
      await page.goto(href!)
      await expect(page.locator("h1")).toHaveCount(1)
      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()
      expect(jsonLd.some((text) => text.includes('"Person"'))).toBe(true)
    }
    await expectNotFound(page, "/avukatlarimiz/boyle-bir-profil-yok")
  })

  test("yayınlar: liste → detay (varsa), bilinmeyen yazı 404", async ({
    page,
  }) => {
    await page.goto("/yayinlar")
    const articleLinks = page.locator('main a[href^="/yayinlar/"]')
    const count = await articleLinks.count()
    if (count > 0) {
      const href = await articleLinks.first().getAttribute("href")
      await page.goto(href!)
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        "content",
        "article",
      )
      await expect(page.locator("main")).toContainText("genel bilgilendirme")
    } else {
      // Veri yokken boş durum açıkça gösterilir; sahte yazı üretilmez.
      await expect(
        page.locator("main [data-placeholder]").first(),
      ).toBeVisible()
    }
    await expectNotFound(page, "/yayinlar/boyle-bir-yazi-yok")
  })

  test("404 sayfası site kabuğuyla döner", async ({ page }) => {
    const response = await page.goto("/olmayan-sayfa")
    expect(response?.status()).toBe(404)
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.getByRole("contentinfo")).toBeVisible()
  })

  test("geliştirme galerisi (/bilesenler) üretimde kapalı", async ({
    page,
  }) => {
    const response = await page.goto("/bilesenler")
    expect(response?.status()).toBe(404)
  })
})

test.describe("Navigasyon", () => {
  test("masaüstü ana menü ve alt menü bağlantıları çalışır", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "masaüstü menüsü yalnızca geniş ekranda")
    await page.goto("/")
    const nav = page.getByRole("navigation", { name: "Ana menü" })
    for (const label of [
      "Hakkımızda",
      "Çalışma Alanları",
      "Arabuluculuk",
      "Avukatlarımız",
      "Yayınlar",
      "İletişim",
    ]) {
      await nav.getByRole("link", { name: label }).click()
      await expect(page.locator("h1:visible")).toBeVisible()
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "page",
      )
    }
    const footerNav = page.getByRole("navigation", { name: "Alt menü" })
    await expect(footerNav.getByRole("link").first()).toBeVisible()
  })

  test("mobil menü: açılır, Esc ile kapanır, odak geri döner, bağlantı menüyü kapatır", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobil menü yalnızca dar ekranda")
    await page.goto("/hakkimizda")
    const trigger = page.getByRole("button", { name: "Menü" })
    await trigger.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await page
      .getByRole("navigation", { name: "Mobil ana menü" })
      .getByRole("link", { name: "Arabuluculuk" })
      .click()
    await expect(page).toHaveURL(/\/arabuluculuk$/)
    await expect(page.getByRole("dialog")).toBeHidden()
    // Next, önceki rotayı Activity ile gizli tutar; görünür h1 denetlenir.
    await expect(page.locator("h1:visible")).toHaveText(/Arabuluculuk/)
  })

  test("dokunma hedefleri en az 44px (mobil)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "yalnızca mobil")
    await page.goto("/iletisim")
    const small = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "main a, main button, header a, header button",
        ),
      ]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return (
            r.width > 0 &&
            r.height > 0 &&
            r.height < 43.5 &&
            getComputedStyle(el).display !== "inline"
          )
        })
        .map((el) =>
          (el.textContent ?? el.getAttribute("aria-label") ?? "")
            .trim()
            .slice(0, 40),
        ),
    )
    expect(small).toEqual([])
  })
})

test.describe("SEO", () => {
  test("robots.txt, sitemap.xml ve metadata", async ({ page, request }) => {
    const robots = await request.get("/robots.txt")
    expect(robots.status()).toBe(200)
    const robotsText = await robots.text()
    if (robotsText.includes("Sitemap:")) {
      // Yayın modu (NEXT_PUBLIC_SITE_INDEXABLE=true): panel taramaya kapalı.
      expect(robotsText).toMatch(/Disallow: \/admin/)
    } else {
      // Yayın öncesi: tüm site taramaya kapalı.
      expect(robotsText).toMatch(/Disallow: \/\s*$/m)
    }

    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.status()).toBe(200)
    const xml = await sitemap.text()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]!).pathname,
    )
    expect(locs).toContain("/")
    expect(locs).toContain("/iletisim")
    expect(
      locs.some(
        (path) => path.startsWith("/admin") || path.startsWith("/bilesenler"),
      ),
    ).toBe(false)
    for (const path of locs) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
    }

    await page.goto("/hakkimizda")
    await expect(page.locator("html")).toHaveAttribute("lang", "tr")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/hakkimizda$/,
    )
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{40,}/,
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    )
    const og = await request.get("/opengraph-image.png")
    expect(og.status()).toBe(200)
  })

  test("yapılandırılmış veri yalnızca doğrulanmış alanlar ve yer tutucu içermez", async ({
    page,
  }) => {
    await page.goto("/")
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    const org = blocks
      .map((text) => JSON.parse(text))
      .find((data) => data["@type"] === "LegalService")
    expect(org).toBeTruthy()
    expect(JSON.stringify(org)).not.toMatch(
      /Eklenecek|__placeholder|aggregateRating|review/i,
    )
  })
})

test.describe("Güvenlik başlıkları", () => {
  test("CSP ve temel başlıklar", async ({ request }) => {
    const response = await request.get("/")
    const headers = response.headers()
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    )
    expect(headers["content-security-policy"]).toContain("object-src 'none'")
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["x-powered-by"]).toBeUndefined()
  })
})
