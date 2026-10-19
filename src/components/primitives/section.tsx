import { cn } from "@/lib/utils"

type Surface = "paper" | "paper-deep" | "navy"

const surfaceClass: Record<Surface, string> = {
  paper: "bg-paper text-navy-950",
  "paper-deep": "bg-paper-deep text-navy-950",
  navy: "surface-navy",
}

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  surface?: Surface
  spacing?: "default" | "tight" | "none"
}

/** Tam genişlik bölüm. Ritmi değiştirmek için yüzey ve boşluk varyantları kullanılır. */
export function Section({
  surface = "paper",
  spacing = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        surfaceClass[surface],
        spacing === "default" && "py-20 md:py-28 lg:py-32",
        spacing === "tight" && "py-12 md:py-16",
        className,
      )}
      {...props}
    />
  )
}
