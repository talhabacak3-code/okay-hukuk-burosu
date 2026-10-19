"use client"

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
} from "react"

import { describedBy, inputClass } from "@/components/forms/fields"
import { Button } from "@/components/ui/button"
import { idleState, type FormState } from "@/lib/admin/form"
import { cn } from "@/lib/utils"

type Action = (state: FormState, formData: FormData) => Promise<FormState>

const FormStateContext = createContext<FormState>(idleState)

function useFieldError(name: string) {
  const state = use(FormStateContext)
  return state.status === "error" ? state.fieldErrors?.[name] : undefined
}

/**
 * Panel formu. Gönderim Server Action ile yapılır; React'ın otomatik form sıfırlaması
 * kullanılmaz (hata durumunda girilen değerler kaybolmaz). Başarı bandı yalnızca sunucu
 * `success` döndürdüğünde — yani veritabanı işlemi tamamlandığında — gösterilir.
 */
export function AdminForm({
  action,
  submitLabel = "Kaydet",
  children,
  className,
}: {
  action: Action
  submitLabel?: string
  children: React.ReactNode
  className?: string
}) {
  const [state, formAction, pending] = useActionState(action, idleState)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus()
  }, [state])

  return (
    <FormStateContext value={state}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          startTransition(() => formAction(formData))
        }}
        className={cn("space-y-8", className)}
      >
        {state.status !== "idle" ? (
          <div
            ref={statusRef}
            tabIndex={-1}
            role={state.status === "error" ? "alert" : "status"}
            className={cn(
              "border-l-2 p-4 text-sm outline-none",
              state.status === "error"
                ? "border-destructive bg-destructive/5 text-destructive"
                : "border-champagne bg-paper-deep text-navy-950",
            )}
          >
            <p className="font-medium">{state.message}</p>
          </div>
        ) : null}

        {children}

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Kaydediliyor…" : submitLabel}
          </Button>
        </div>
      </form>
    </FormStateContext>
  )
}

type BaseFieldProps = {
  name: string
  label: string
  hint?: React.ReactNode
  required?: boolean
  className?: string
}

function FieldShell({
  id,
  label,
  hint,
  required,
  error,
  className,
  children,
}: Omit<BaseFieldProps, "name"> & {
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-1 font-normal text-muted-foreground">
            (zorunlu)
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p
          id={`${id}-hint`}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  name,
  label,
  hint,
  required,
  className,
  defaultValue,
  type = "text",
  maxLength,
  placeholder,
  autoComplete,
}: BaseFieldProps & {
  defaultValue?: string | number | null
  type?: "text" | "email" | "url" | "tel" | "number" | "date" | "password"
  maxLength?: number
  placeholder?: string
  autoComplete?: string
}) {
  const error = useFieldError(name)
  const id = `f-${name}`
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint: !!hint, error: !!error })}
        className={cn(inputClass, "h-11")}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  name,
  label,
  hint,
  required,
  className,
  defaultValue,
  rows = 5,
  maxLength,
}: BaseFieldProps & {
  defaultValue?: string | null
  rows?: number
  maxLength?: number
}) {
  const error = useFieldError(name)
  const id = `f-${name}`
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint: !!hint, error: !!error })}
        className={cn(inputClass, "resize-y py-3 leading-relaxed")}
      />
    </FieldShell>
  )
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked,
  className,
}: Omit<BaseFieldProps, "required"> & { defaultChecked?: boolean }) {
  const error = useFieldError(name)
  const id = `f-${name}`
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-describedby={describedBy(id, { hint: !!hint, error: !!error })}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-navy-950"
        />
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
      </div>
      {hint ? (
        <p
          id={`${id}-hint`}
          className="pl-8 text-xs leading-relaxed text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="pl-8 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function SelectField({
  name,
  label,
  hint,
  required,
  className,
  defaultValue,
  options,
}: BaseFieldProps & {
  defaultValue?: string | null
  options: { value: string; label: string }[]
}) {
  const error = useFieldError(name)
  const id = `f-${name}`
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint: !!hint, error: !!error })}
        className={cn(inputClass, "h-11 cursor-pointer")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/** Form içinde gruplanmış alanlar (fieldset + legend). */
export function FieldGroup({
  legend,
  description,
  children,
}: {
  legend: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="grid gap-6 border-t border-border pt-6 md:grid-cols-2">
      <legend className="float-left mb-2 w-full font-sans text-xs font-medium tracking-[0.14em] text-champagne-deep uppercase md:col-span-2">
        {legend}
      </legend>
      {description ? (
        <p className="-mt-2 text-sm text-muted-foreground md:col-span-2">
          {description}
        </p>
      ) : null}
      {children}
    </fieldset>
  )
}

export function FileField({
  name,
  label,
  hint,
  required,
  className,
  accept,
}: BaseFieldProps & { accept: string }) {
  const error = useFieldError(name)
  const id = `f-${name}`
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint: !!hint, error: !!error })}
        className={cn(
          inputClass,
          "h-auto cursor-pointer py-2.5 file:mr-4 file:cursor-pointer file:border-0 file:bg-navy-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper",
        )}
      />
    </FieldShell>
  )
}
