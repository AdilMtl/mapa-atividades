import * as React from 'react'

import { Badge, Card } from '@/components/ds2'
import type { FunilRadar } from '@/lib/admin/analytics'

const ROTULO_KIND: Record<FunilRadar['kind'], string> = {
  maturidade: 'radar de maturidade',
  oportunidades: 'radar de oportunidades',
}

export function BlocoFunil({ funil }: { funil: FunilRadar }) {
  return (
    <Card className="space-y-3">
      <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
        {ROTULO_KIND[funil.kind]}
      </p>
      <div className="space-y-2.5">
        {funil.degraus.map((degrau) => (
          <div key={degrau.id} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-ds2-sans text-sm text-ds2-text-secondary">
                {degrau.rotulo}
                {degrau.direcional && (
                  <Badge className="ml-1.5 text-[9px]" title="derivado de evento — pode duplicar ou perder">
                    evento
                  </Badge>
                )}
              </span>
              <span className="whitespace-nowrap font-ds2-mono text-xs text-ds2-text-muted">
                {degrau.pct}% · {degrau.n} de {funil.topo}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
              <span
                className="block h-full bg-ds2-gradient-primary"
                style={{ width: `${Math.min(100, degrau.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
