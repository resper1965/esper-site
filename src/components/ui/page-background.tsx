import * as React from "react"
import { cn } from "@/lib/utils"

interface PageBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle'
  children: React.ReactNode
}

const PageBackground = React.forwardRef<HTMLDivElement, PageBackgroundProps>(
  ({ className, variant = 'subtle', children, ...props }, ref) => {
    return (
      <div className={cn("relative min-h-screen", className)} ref={ref} {...props}>
        {/* Background gradient */}
        <div className={cn(
          "absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]",
          variant === 'default' ? 'bg-purple-950/10 dark:bg-purple-950/10' : ''
        )} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
PageBackground.displayName = "PageBackground"

export { PageBackground }
