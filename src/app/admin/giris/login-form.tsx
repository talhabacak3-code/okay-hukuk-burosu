"use client"

import { useSearchParams } from "next/navigation"
import { startTransition, useActionState, useEffect, useRef } from "react"

import { signIn } from "@/app/admin/giris/actions"
import { describedBy, inputClass } from "@/components/forms/fields"
import { Button } from "@/components/ui/button"
import { idleState } from "@/lib/admin/form"
import { cn } from "@/lib/utils"

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, idleState)
  const next = useSearchParams().get("next") ?? ""
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === "error") alertRef.current?.focus()
  }, [state])

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {}

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-6"
    >
      {!configured ? (
        <p
          role="note"
          className="border-l-2 border-stone bg-paper-deep p-4 text-sm leading-relaxed"
        >
          Supabase bağlantısı yapılandırılmadığı için giriş yapılamaz.
        </p>
      ) : null}

      {state.status === "error" ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="border-l-2 border-destructive bg-destructive/5 p-4 text-sm font-medium text-destructive outline-none"
        >
          {state.message}
        </div>
      ) : null}

      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email", { error: !!errors.email })}
          className={cn(inputClass, "h-12")}
        />
        {errors.email ? (
          <p id="email-error" className="text-sm font-medium text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={describedBy("password", {
            error: !!errors.password,
          })}
          className={cn(inputClass, "h-12")}
        />
        {errors.password ? (
          <p
            id="password-error"
            className="text-sm font-medium text-destructive"
          >
            {errors.password}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        aria-busy={pending}
        className="w-full"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  )
}
