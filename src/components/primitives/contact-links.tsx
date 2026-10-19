import type { Maybe } from "@/lib/placeholder"

import { MaybeValue } from "@/components/primitives/placeholder"

/** "+90 272 217 59 52" → "tel:+902722175952" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

/** Telefon numarası: gerçek değer varsa aranabilir bağlantı, yoksa yer tutucu. */
export function PhoneValue({ value }: { value: Maybe<string> }) {
  return (
    <MaybeValue
      value={value}
      render={(phone) => (
        <a
          href={telHref(phone)}
          className="inline-flex min-h-11 items-center whitespace-nowrap tabular-nums underline-offset-4 hover:underline md:min-h-6"
        >
          {phone}
        </a>
      )}
    />
  )
}

/** E-posta: gerçek değer varsa mailto bağlantısı, yoksa yer tutucu. */
export function EmailValue({ value }: { value: Maybe<string> }) {
  return (
    <MaybeValue
      value={value}
      render={(email) => (
        <a
          href={`mailto:${email}`}
          className="inline-flex min-h-11 items-center underline-offset-4 hover:underline md:min-h-6"
        >
          {email}
        </a>
      )}
    />
  )
}
