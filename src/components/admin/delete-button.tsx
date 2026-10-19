"use client"

import { startTransition, useActionState } from "react"

import { idleState, type FormState } from "@/lib/admin/form"

/**
 * Silme düğmesi: tarayıcının onay penceresiyle ikinci adım ister; sonuç (hata dahil)
 * düğmenin yanında duyurulur. Başarılı silme sonrası sunucu listeye yönlendirir.
 */
export function DeleteButton({
  action,
  id,
  label = "Sil",
  confirmText,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  id: string
  label?: string
  confirmText: string
}) {
  const [state, formAction, pending] = useActionState(action, idleState)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!window.confirm(confirmText)) return
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center border border-destructive/60 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-paper disabled:opacity-50"
      >
        {pending ? "Siliniyor…" : label}
      </button>
      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
