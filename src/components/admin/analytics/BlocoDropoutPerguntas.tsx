import * as React from 'react'

import { Card } from '@/components/ds2'
import type { DropoutRadar } from '@/lib/admin/analytics'

// =============================================================================
// ISSUE-318C — Onde o radar trava, pergunta a pergunta.
// Fonte: radar_sessions.answers salvo a cada resposta (PATCH parcial) → é
// contagem de tabela, EXATA — sem selo "evento" de propósito. A ambiguidade que
// existe é só histórica: sessão aberta sem nenhuma resposta salva tanto pode ser
// "abriu e não respondeu nada" quanto abandono de antes da medição (ago/2026) —
// por isso o balde "sem resposta" sai separado do gráfico, nunca como "parou na
// pergunta 1".
// =============================================================================

const ROTULO_KIND: Record<DropoutRadar['kind'], string> = {
  maturidade: 'radar de maturidade',
  oportunidades: 'radar de oportunidades',
}

export function BlocoDropoutPerguntas({ dropout }: { dropout: DropoutRadar }) {
  const max = Math.max(1, ...dropout.porPergunta.map((p) => p.n))

  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
          {ROTULO_KIND[dropout.kind]}
        </p>
        <span className="shrink-0 font-ds2-mono text-[11px] text-ds2-text-muted">
          {dropout.incompletasMedidas} abandono{dropout.incompletasMedidas === 1 ? '' : 's'} medido
          {dropout.incompletasMedidas === 1 ? '' : 's'}
        </span>
      </div>

      {dropout.incompletasMedidas === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">
          Nenhum abandono com resposta salva nesta janela — o salvamento por pergunta existe desde
          ago/2026, então janelas antigas ficam vazias aqui.
        </p>
      ) : (
        <div className="space-y-2">
          {dropout.porPergunta.map((p) => (
            <div key={p.pergunta} className="flex items-center gap-2.5">
              <span className="w-8 shrink-0 font-ds2-mono text-[11px] text-ds2-text-secondary">
                P{p.pergunta}
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                <span
                  className="block h-full bg-white/[0.35]"
                  style={{ width: `${(p.n / max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-ds2-mono text-[11px] text-ds2-text-muted">
                {p.n}
              </span>
            </div>
          ))}
        </div>
      )}

      {dropout.semResposta > 0 && (
        <p className="border-t border-ds2-border-subtle pt-2 font-ds2-mono text-[10px] leading-relaxed text-ds2-text-subtle">
          + {dropout.semResposta} aberta{dropout.semResposta === 1 ? '' : 's'} sem resposta salva —
          mistura &quot;não respondeu nada&quot; com sessões de antes da medição; fora do gráfico.
        </p>
      )}
    </Card>
  )
}
