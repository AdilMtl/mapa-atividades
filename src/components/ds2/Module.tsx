import * as React from "react"

import { cn } from "@/lib/utils"

function Module({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ds2-module"
      className={cn(
        "rounded-ds2-module border border-ds2-border-subtle bg-ds2-surface-glass p-5",
        className
      )}
      {...props}
    />
  )
}

function ModuleHead({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ds2-module-head"
      className={cn(
        "mb-3.5 flex items-center justify-between font-ds2-mono text-xs text-ds2-text-secondary",
        className
      )}
      {...props}
    />
  )
}

export { Module, ModuleHead }
