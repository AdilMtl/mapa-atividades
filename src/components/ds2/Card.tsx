import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass p-5",
  {
    variants: {
      variant: {
        default: "",
        featured: "bg-[rgba(46,104,96,0.13)]",
        premium:
          "bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] border-[rgba(211,76,117,0.20)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="ds2-card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Card, cardVariants }
