import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-ds2-pill border px-[0.65rem] py-[0.45rem] font-ds2-mono text-xs uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "border-ds2-border-medium bg-white/5 text-ds2-text-secondary",
        premium: "border-[rgba(211,76,117,0.35)] text-[#F2B5C7]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="ds2-badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
