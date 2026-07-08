import * as React from "react"

import { cn } from "@/lib/utils"

// H2 de seção (docs/revamp/08_diretrizes_visuais_ds2.md §2) — Fraunces 500, 42px.
// `as="h1"` (ISSUE-110): permite usar como o H1 único da página em telas sem hero
// próprio (/newsletter, /lab, /obrigado) sem duplicar estilo — visual idêntico.
type SectionTitleProps = React.ComponentProps<"h2"> & { as?: "h1" | "h2" }

function SectionTitle({ className, as: Tag = "h2", ...props }: SectionTitleProps) {
  return (
    <Tag
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
