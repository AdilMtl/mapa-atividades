import * as React from "react"

import { cn } from "@/lib/utils"

// Container de página (docs/revamp/08_diretrizes_visuais_ds2.md §4): width:min(1220px, calc(100% - 40px)).
function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ds2-page-container"
      className={cn("mx-auto w-[min(1220px,calc(100%-40px))]", className)}
      {...props}
    />
  )
}

export { PageContainer }
