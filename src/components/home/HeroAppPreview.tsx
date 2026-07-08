'use client'

import * as React from 'react'

import { Progress } from '@/components/ds2'
import { cn } from '@/lib/utils'

// Janela de app animada do hero (direção C, ver docs/revamp/09_direcoes_landing.md) —
// prévia decorativa do Radar de Oportunidades, não o radar real (fora do escopo da ISSUE-107).
const OPTIONS = [
  'Consolidando informação de várias fontes',
  'Atualizando planilhas na mão',
  'Respondendo as mesmas dúvidas',
  'Montando apresentações do zero',
]

const STEP_MS = 2200

export function HeroAppPreview() {
  const [activeOption, setActiveOption] = React.useState(1)
  const [progress, setProgress] = React.useState(38)

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setActiveOption((prev) => (prev + 1) % OPTIONS.length)
      setProgress((prev) => (prev >= 88 ? 25 : prev + 21))
    }, STEP_MS)

    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="rounded-ds2-module border border-ds2-border-subtle bg-ds2-surface-glass p-5"
      role="img"
      aria-label="Prévia do Radar de Oportunidades em uso"
    >
      <div className="mb-4 flex items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-1 truncate">+conversaas/radar/oportunidades</span>
      </div>
      <div>
        <p className="font-ds2-mono text-xs text-ds2-amber-soft">Radar de Oportunidades · 3/8</p>
        <p className="mt-3 font-ds2-sans text-base font-semibold text-ds2-text-primary">
          Onde você mais perde tempo hoje?
        </p>
        <div className="mt-4 space-y-2">
          {OPTIONS.map((option, index) => (
            <div
              key={option}
              className={cn(
                'rounded-2xl border px-4 py-3 font-ds2-sans text-sm transition-colors duration-500',
                index === activeOption
                  ? 'border-ds2-orange/60 bg-ds2-surface-glass-hover text-ds2-text-primary'
                  : 'border-ds2-border-subtle text-ds2-text-secondary'
              )}
            >
              {option}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="whitespace-nowrap font-ds2-mono text-xs text-ds2-text-muted">
            ~3 min
          </span>
        </div>
      </div>
    </div>
  )
}
