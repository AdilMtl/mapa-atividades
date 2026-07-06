import * as React from "react"

import { cn } from "@/lib/utils"

function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ds2-eyebrow"
      className={cn(
        "font-ds2-mono text-[11px] uppercase tracking-[0.13em] text-ds2-amber-soft",
        className
      )}
      {...props}
    />
  )
}

export { Eyebrow }
