'use client'

import { Circle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface OptionButtonProps {
  label: string
  selected: boolean
  onSelect: () => void
}

export function OptionButton({ label, selected, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex min-h-[44px] w-full items-center gap-3 rounded-ds2-card border px-4 py-3 text-left text-sm transition-colors',
        selected
          ? 'border-ds2-orange/50 bg-[rgba(217,119,6,0.12)] text-ds2-text-primary'
          : 'border-ds2-border-subtle bg-ds2-surface-glass text-ds2-text-secondary hover:bg-ds2-surface-glass-hover'
      )}
    >
      {selected ? (
        <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-ds2-orange" />
      ) : (
        <Circle className="h-[18px] w-[18px] shrink-0 text-ds2-border-medium" />
      )}
      <span>{label}</span>
    </button>
  )
}
