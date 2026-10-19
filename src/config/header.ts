/**
 * Koyu hero'su olan sayfalar: başlık hero üzerindeyken lacivert ve logosuz görünür,
 * hero geçilince açık temaya döner (bkz. HeaderShell ve globals.css → .site-header).
 */
export const DARK_HERO_PATHS: ReadonlySet<string> = new Set(["/", "/iletisim"])

/** Koyu hero bölümünün id'si — HeaderShell bu öğenin alt kenarını izler. */
export const DARK_HERO_ID = "giris"
