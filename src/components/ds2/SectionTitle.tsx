import * as React from "react"

import { cn } from "@/lib/utils"

// H2 de seção (docs/revamp/08_diretrizes_visuais_ds2.md §2) — Fraunces 500, 42px.
function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="ds2-section-title"
      className={cn(
        "font-ds2-serif text-[42px] leading-none font-medium tracking-[-0.045em] text-ds2-text-primary",
        className
      )}
      {...props}
    />
  )
}

export { SectionTitle }
