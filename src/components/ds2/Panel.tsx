import * as React from "react"

import { cn } from "@/lib/utils"

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ds2-panel"
      className={cn(
        "rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass p-6",
        className
      )}
      {...props}
    />
  )
}

export { Panel }
