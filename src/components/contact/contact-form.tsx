"use client"

import Link from "next/link"
import { startTransition, useActionState, useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"

import { submitContactForm } from "@/app/(site)/iletisim/actions"
import { describedBy, Field, inputClass } from "@/components/forms/fields"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import {
  contactFormSchema,
  MESSAGE_MAX,
  type ContactActionState,
  type ContactField,
  type ContactFormValues,
} from "@/lib/contact/schema"
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/contact/spam"
import { cn } from "@/lib/utils"

const initialState: ContactActionState = { status: "idle" }

const defaultValues: ContactFormValues = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  kvkkAcknowledged: false,
}

/**
 * Genel iletişim formu. İstemcide React Hook Form + Zod ile anında doğrulama; gönderim
 * Server Action ile yapılır ve sunucu aynı şemayla yeniden doğrular. Başarı mesajı
 * YALNIZCA sunucu kaydı onayladığında (`status: "success"`) gösterilir.
 */
export function ContactForm({
  deliveryConfigured,
  phone,
}: {
  /** Gönderim altyapısı bağlı değilse önizleme uyarısı gösterilir. */
  deliveryConfigured: boolean
  /** Hata durumlarında önerilecek telefon (doğrulanmış değilse undefined). */
  phone?: { label: string; href: string }
}) {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  )
  const startedAtRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    control,
    formState: { errors, submitCount },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onTouched",
  })

  // Süre kontrolü için formun açıldığı an (yalnızca istemcide; prerender'da çalışmaz).
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now())
  }, [])

  // Sunucu yanıtı: alan hataları alanlara işlenir; durum mesajına odak taşınır.
  useEffect(() => {
    if (state.status === "invalid") {
      const entries = Object.entries(state.fieldErrors) as [
        ContactField,
        string,
      ][]
      for (const [field, message] of entries) setError(field, { message })
      if (entries[0]) setFocus(entries[0][0])
      return
    }
    if (state.status !== "idle") statusRef.current?.focus()
  }, [state, setError, setFocus])

  // Form verisi (bal küpü ve zaman damgası dahil) gönderim olayındaki formdan okunur.
  const onValid = (
    _values: ContactFormValues,
    event?: React.BaseSyntheticEvent,
  ) => {
    const form = event?.target
    if (!(form instanceof HTMLFormElement)) return
    const formData = new FormData(form)
    startTransition(() => formAction(formData))
  }

  const messageLength = useWatch({ control, name: "message" })?.length ?? 0
  const errorCount = Object.keys(errors).length

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border border-champagne/70 bg-paper p-8 outline-none md:p-10"
      >
        <p className="tagline-rule-start eyebrow text-champagne-deep">
          Mesajınız alındı
        </p>
        <p className="mt-4 font-serif text-2xl">Teşekkür ederiz.</p>
        <p className="mt-3 max-w-measure leading-relaxed text-muted-foreground">
          Mesajınız büroya iletildi. Gerekli görülmesi hâlinde, bildirdiğiniz
          iletişim bilgileri üzerinden size dönüş yapılacaktır.
        </p>
        <Button
          type="button"
          variant="quiet"
          className="mt-8"
          onClick={() => {
            reset(defaultValues)
            window.location.reload()
          }}
        >
          Yeni mesaj yaz
        </Button>
      </div>
    )
  }

  const serverMessage =
    state.status === "idle" || state.status === "invalid" ? null : state.message

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid)}
      aria-describedby="form-aciklama"
      className="relative space-y-8"
    >
      {!deliveryConfigured ? (
        <div
          data-placeholder=""
          className="border border-dashed border-champagne-deep/60 bg-paper-deep p-5 text-sm leading-relaxed"
        >
          <p className="eyebrow text-champagne-deep">Önizleme</p>
          <p className="mt-2 text-muted-foreground">
            Form altyapısı henüz bağlanmadı; gönderilen mesajlar büroya
            iletilmez. Doğrulama ve güvenlik kontrolleri çalışır.
          </p>
        </div>
      ) : null}

      <p
        id="form-aciklama"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        Lütfen dava ayrıntısı, T.C. kimlik numarası, sağlık bilgisi gibi hassas
        bilgiler paylaşmayın. Bu form genel iletişim içindir; mesaj göndermek
        avukat–müvekkil ilişkisi kurmaz.
      </p>

      {/* Ekran okuyucular için gönderim sonucu özeti */}
      <div aria-live="polite" className="sr-only">
        {submitCount > 0 && errorCount > 0
          ? `${errorCount} alan düzeltilmeli.`
          : null}
      </div>

      {serverMessage ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="border-l-2 border-destructive bg-destructive/5 p-5 text-sm leading-relaxed outline-none"
        >
          <p className="font-medium text-destructive">{serverMessage}</p>
          {phone ? (
            <p className="mt-2">
              Telefon:{" "}
              <a
                href={phone.href}
                className="font-medium underline underline-offset-4"
              >
                {phone.label}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Ad soyad"
          required
          error={errors.fullName?.message}
        >
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            maxLength={100}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={describedBy("fullName", {
              error: !!errors.fullName,
            })}
            className={cn(inputClass, "h-12")}
            {...register("fullName")}
          />
        </Field>

        <Field
          id="email"
          label="E-posta"
          required
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email", { error: !!errors.email })}
            className={cn(inputClass, "h-12")}
            {...register("email")}
          />
        </Field>
      </div>

      <Field
        id="phone"
        label="Telefon"
        hint="Dönüş için tercih ederseniz."
        error={errors.phone?.message}
        className="sm:max-w-[calc(50%-1rem)]"
      >
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", {
            hint: true,
            error: !!errors.phone,
          })}
          className={cn(inputClass, "h-12")}
          {...register("phone")}
        />
      </Field>

      <Field
        id="message"
        label="Mesajınız"
        required
        hint={
          <span className="flex flex-wrap justify-between gap-2">
            <span>Konuyu genel hatlarıyla yazmanız yeterlidir.</span>
            <span className="tabular-nums" aria-hidden="true">
              {messageLength} / {MESSAGE_MAX}
            </span>
          </span>
        }
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={7}
          maxLength={MESSAGE_MAX}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message", {
            hint: true,
            error: !!errors.message,
          })}
          className={cn(inputClass, "min-h-44 resize-y py-3 leading-relaxed")}
          {...register("message")}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            id="kvkkAcknowledged"
            type="checkbox"
            aria-invalid={errors.kvkkAcknowledged ? true : undefined}
            aria-describedby={describedBy("kvkkAcknowledged", {
              hint: true,
              error: !!errors.kvkkAcknowledged,
            })}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-navy-950"
            {...register("kvkkAcknowledged")}
          />
          <label
            htmlFor="kvkkAcknowledged"
            className="cursor-pointer text-[0.9375rem] leading-snug"
          >
            <Link
              href={routes.privacyNotice.href}
              target="_blank"
              className="font-medium underline decoration-champagne underline-offset-4 hover:decoration-navy-950"
            >
              KVKK Aydınlatma Metni
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </Link>
            &apos;ni okudum.{" "}
            <span className="text-sm text-muted-foreground">(zorunlu)</span>
          </label>
        </div>
        <p
          id="kvkkAcknowledged-hint"
          className="pl-8 text-sm text-muted-foreground"
        >
          Bu kutu açık rıza beyanı değildir; yalnızca bilgilendirmeyi
          okuduğunuzu belirtir.
        </p>
        {errors.kvkkAcknowledged ? (
          <p
            id="kvkkAcknowledged-error"
            className="pl-8 text-sm font-medium text-destructive"
          >
            {errors.kvkkAcknowledged.message}
          </p>
        ) : null}
      </div>

      {/* Spam önlemleri — görünmez; ekran okuyuculardan gizli */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>Web siteniz (boş bırakın)</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
        <input ref={startedAtRef} name={STARTED_AT_FIELD} type="hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8">
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? "Gönderiliyor…" : "Mesajı gönder"}
          {!pending ? (
            <ArrowRight aria-hidden="true" strokeWidth={1.5} />
          ) : null}
        </Button>
        <p className="text-sm text-muted-foreground">
          Zorunlu alanlar işaretlidir.
        </p>
      </div>
    </form>
  )
}
