/**
 * Doğrulanmamış / henüz sağlanmamış bilgiler için açık yer tutucu tipi.
 *
 * Kural: Gerçek olmayan hiçbir bilgi (adres, telefon, sicil no, kişi, referans…)
 * düz metin olarak yazılmaz. Bunun yerine `placeholder("…")` kullanılır; arayüz
 * bunu açıkça "Eklenecek" olarak gösterir, metadata ve yapılandırılmış veri
 * üretimi ise yer tutucuları her zaman dışarıda bırakır.
 */
export type Placeholder = {
  readonly __placeholder: true
  readonly label: string
}

export type Maybe<T> = T | Placeholder

export function placeholder(label: string): Placeholder {
  return { __placeholder: true, label }
}

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === "object" &&
    value !== null &&
    "__placeholder" in value &&
    (value as Placeholder).__placeholder === true
  )
}

/** Gerçek değeri döndürür; yer tutucu ise `undefined`. */
export function resolve<T>(value: Maybe<T>): T | undefined {
  return isPlaceholder(value) ? undefined : value
}
