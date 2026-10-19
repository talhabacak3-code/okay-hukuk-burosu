import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Marka düğmesi (shadcn tabanlı). Keskin köşeler, ölçülü hareket:
 * - primary: lacivert zemin; üzerine gelindiğinde alttan şampanya çizgi uzar
 * - outline: ince lacivert çerçeve; üzerine gelindiğinde lacivert dolgu
 * - quiet: yalnızca metin + alt çizgi (ikincil yönlendirmeler)
 * - onDark: koyu zeminde şampanya çerçeve
 * En küçük boy bile 44px dokunma hedefini korur.
 * Bağlantılar için `asChild` ile <Link> sarın: düğme görünümlü bağlantı yine <a> kalır.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius)]",
    "font-sans text-[0.9375rem] font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color] duration-300 ease-editorial",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "[&_svg]:transition-transform [&_svg]:duration-500 [&_svg]:ease-editorial hover:[&_svg:last-child]:translate-x-0.5",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-navy-950 text-paper hover:bg-navy-900",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-champagne after:transition-transform after:duration-500 after:ease-editorial hover:after:scale-x-100",
        ],
        outline:
          "border border-navy-950/80 bg-transparent text-navy-950 hover:bg-navy-950 hover:text-paper",
        quiet:
          "rounded-none border-b border-current/30 px-0 text-current hover:border-current",
        onDark:
          "border border-champagne/70 bg-transparent text-paper hover:border-champagne hover:bg-champagne hover:text-navy-950",
        // shadcn bileşenleri (ör. Sheet) içindeki ikon düğmeleri için korunur.
        ghost: "text-current hover:bg-paper-deep",
      },
      size: {
        default: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-11",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "h-11 px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
