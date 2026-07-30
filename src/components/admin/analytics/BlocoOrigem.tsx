import * as React from 'react'

import { Card, Eyebrow } from '@/components/ds2'
import type { LinhaOrigem } from '@/lib/admin/analytics'

/**
 * Lista em cards (não tabela): no celular, 5 colunas + UTM comprido viram uma
 * tabela ilegível mesmo com scroll interno (achado do dono no teste real,
 * 2026-07-30). Cards empilham naturalmente — zero overflow horizontal, sem
 * precisar de breakpoint dedicado.
 */
function LinhaOrigemCard({ linha }: { linha: LinhaOrigem }) {
  return (
    <Card className="space-y-2 py-3.5">
      <p className="break-words font-ds2-sans text-sm font-medium text-ds2-text-primary">{linha.chave}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-ds2-mono text-xs text-ds2-text-secondary">
        <span>
          <strong className="text-ds2-text-primary">{linha.sessoes}</strong> sessões
        </span>
        <span>
          {linha.pctConclusao}% conclusão · {linha.conclusoes} de {linha.sessoes}
        </span>
        <span>
          <strong className="text-ds2-text-primary">{linha.leadsUnicos}</strong> leads únicos
        </span>
        <span>lead/sessão: {linha.leadPorSessaoPct === null ? '—' : `${linha.leadPorSessaoPct}%`}</span>
      </div>
    </Card>
  )
}

export function BlocoOrigem({ origem }: { origem: LinhaOrigem[] }) {
  return (
    <section className="space-y-3">
      <Eyebrow>origem do tráfego</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Qual campanha traz gente que TERMINA — não qual traz clique. Ordenado por sessões.
      </p>

      {origem.length === 0 ? (
        <Card>
          <p className="font-ds2-sans text-sm text-ds2-text-muted">Sem sessões na janela.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {origem.map((linha) => (
            <LinhaOrigemCard key={linha.chave} linha={linha} />
          ))}
        </div>
      )}
    </section>
  )
}
