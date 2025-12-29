import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white text-shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-white text-shadow-sm",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-white text-shadow-sm",
        warning:
          "border-transparent bg-warning text-white text-shadow-sm",
        accent:
          "border-transparent bg-accent text-white text-shadow-sm",
        info:
          "border-transparent bg-info text-white text-shadow-sm",
        purple:
          "border-transparent bg-purple text-white text-shadow-sm",
        pink:
          "border-transparent bg-pink text-white text-shadow-sm",
        orange:
          "border-transparent bg-orange text-white text-shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }