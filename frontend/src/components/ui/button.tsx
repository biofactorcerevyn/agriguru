import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-natural focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 shadow-natural",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-natural",
        outline:
          "border-2 border-input bg-transparent hover:bg-accent hover:text-white hover:border-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-natural",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-white hover:bg-success/90 shadow-natural",
        warning: "bg-warning text-white hover:bg-warning/90 shadow-natural",
        accent: "bg-accent text-white hover:bg-accent/90 shadow-natural",
        info: "bg-info text-white hover:bg-info/90 shadow-natural",
        purple: "bg-purple text-white hover:bg-purple/90 shadow-natural",
        pink: "bg-pink text-white hover:bg-pink/90 shadow-natural",
        orange: "bg-orange text-white hover:bg-orange/90 shadow-natural",
        gradient: "bg-gradient-primary text-white font-bold hover:opacity-90 shadow-natural text-shadow-sm",
        "gradient-blue": "bg-gradient-blue text-white font-bold hover:opacity-90 shadow-natural text-shadow-sm",
        "gradient-sunset": "bg-gradient-sunset text-white font-bold hover:opacity-90 shadow-natural text-shadow-sm",
        "gradient-purple": "bg-gradient-purple text-white font-bold hover:opacity-90 shadow-natural text-shadow-sm",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-4 py-2 text-sm",
        lg: "h-12 rounded-md px-8 py-3 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }