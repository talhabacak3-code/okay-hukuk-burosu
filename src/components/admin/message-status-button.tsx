"use client"

import { startTransition, useActionState } from "react"

import { setMessageStatus } from "@/lib/admin/actions/messages"
import { idleState } from "@/lib/admin/form"

export function MessageStatusButton({
  id,
  status,
  label,
}: {
  id: string
  status: "read" | "archived"
  label: string
}) {
  const [state, formAction, pending] = useActionState(
    setMessageStatus,
    idleState,
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="flex items-center gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center border border-ink-950/60 px-4 text-sm font-medium hover:bg-ink-950 hover:text-paper disabled:opacity-50"
      >
        {pending ? "…" : label}
      </button>
      {state.status === "error" ? (
        <span role="alert" className="text-sm text-destructive">
          {state.message}
        </span>
      ) : null}
    </form>
  )
}
