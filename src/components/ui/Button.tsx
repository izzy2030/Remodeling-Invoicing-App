'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    // Base styles from the COPPER & CRAFT design system
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5",
      secondary: "bg-secondary text-secondary-foreground hover:bg-muted font-bold",
      outline: "border border-border bg-transparent hover:bg-secondary text-foreground hover:border-primary/30",
      ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/10",
    }
    
    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-12 px-6",
      lg: "h-14 px-8 text-base",
      icon: "h-10 w-10",
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
