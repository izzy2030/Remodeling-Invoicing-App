'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'premium'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Base styles from the COPPER & CRAFT design system - Premium minimal look
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-primary text-white hover:opacity-90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-muted font-bold",
      outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
      ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      premium: "bg-primary text-white font-extrabold rounded-lg shadow-[0_4px_14px_0_rgba(249,115,22,0.25)] ring-1 ring-primary/20 hover:shadow-[0_6px_20px_0_rgba(249,115,22,0.35)] hover:ring-primary/30 transition-all duration-300 tracking-wide",
    }

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-12 px-6",
      lg: "h-14 px-8 text-base",
      icon: "h-10 w-10",
      premium: "h-14 px-6 text-base sm:text-lg",
    }

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
