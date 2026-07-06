import * as React from "react"

import { cn } from "@/lib/utils"

// Grid técnico (docs/revamp/08_diretrizes_visuais_ds2.md §1) — usar só em
// hero, módulos de ferramenta e áreas de laboratório. Nunca em página inteira.
function GridSection({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ds2-grid-section"
      className={cn("ds2-bg-grid relative overflow-hidden", className)}
      {...props}
    />
  )
}

export { GridSection }
