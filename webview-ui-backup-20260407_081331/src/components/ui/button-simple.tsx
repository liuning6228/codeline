import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified button variants matching Cline's styles
const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer [&_svg]:size-2 overflow-hidden",
  
  variant: {
    default: "bg-button-background text-primary-foreground hover:bg-button-hover",
    icon: "hover:opacity-80 p-0 m-0 border-0 cursor-pointer hover:shadow-none focus:ring-0 focus:ring-offset-0",
    text: "text-foreground cursor-text select-text p-0 m-0",
  },
  
  size: {
    default: "py-1.5 px-4 [&_svg]:size-3",
    icon: "px-0.5 m-0 [&_svg]:size-2",
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // For now, ignore asChild prop (simplified version)
    return (
      <button 
        className={cn(
          buttonVariants.base,
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )} 
        ref={ref} 
        {...props} 
      />
    )
  },
)
Button.displayName = "Button"

export { Button }