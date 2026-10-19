import { cn } from "@/lib/utils"

type ContainerProps<T extends React.ElementType> = {
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">

/** Site genelindeki yatay ızgara: max 1320px, mobilde 20px kenar boşluğu. */
export function Container<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div"
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-site px-5 sm:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
