import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value: number
}

function Progress({ value, className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      data-slot="ds2-progress"
      className={cn(
        "h-2.5 overflow-hidden rounded-ds2-pill bg-white/[0.11]",
        className
      )}
      {...props}
    >
      <span
        data-slot="ds2-progress-bar"
        className="block h-full bg-ds2-gradient-primary"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
