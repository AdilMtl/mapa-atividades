import * as React from 'react'

import { Badge, Card } from '@/components/ds2'
import type { FunilRadar } from '@/lib/admin/analytics'

const ROTULO_KIND: Record<FunilRadar['kind'], string> = {
  maturidade: 'radar de maturidade',
  oportunidades: 'radar de oportunidades',
}

export function BlocoFunil({ funil }: { funil: FunilRadar }) {
  return (
    <Card className="space-y-3 overflow-hidden">
      <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
        {ROTULO_KIND[funil.kind]}
      </p>
      <div className="space-y-2.5">
        {funil.degraus.map((degrau) => (
          <div key={degrau.id} className="space-y-1">
            {/* `min-w-0` no rótulo: sem isso o texto longo + o número
                `whitespace-nowrap` empurram a linha além da largura do card. */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 font-ds2-sans text-sm text-ds2-text-secondary">
                {degrau.rotulo}
                {degrau.direcional && (
                  <Badge className="ml-1.5 text-[9px]" title="derivado de evento — pode duplicar ou perder">
                    evento
                  </Badge>
                )}
              </span>
              <span className="shrink-0 whitespace-nowrap font-ds2-mono text-[11px] text-ds2-text-muted">
                {/* pct null = degrau de pageview (ISSUE-318C): visitas e sessões
                    são unidades diferentes — % aqui passaria de 100 e mentiria. */}
                {degrau.pct !== null ? `${degrau.pct}% · ${degrau.n}/${funil.topo}` : `${degrau.n} visitas`}
              </span>
            </div>
            {degrau.pct !== null && (
              <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                <span
                  className="block h-full bg-ds2-gradient-primary"
                  style={{ width: `${Math.min(100, degrau.pct)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
