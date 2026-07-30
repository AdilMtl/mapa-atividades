import * as React from 'react'

import { Card, Eyebrow } from '@/components/ds2'
import type { LinhaOrigem, PontoSerieTemporal } from '@/lib/admin/analytics'

function SerieTemporal({ serie }: { serie: PontoSerieTemporal[] }) {
  if (serie.length === 0) {
    return <p className="font-ds2-sans text-sm text-ds2-text-muted">Sem sessões na janela pra desenhar a série.</p>
  }

  const maxSessoes = Math.max(1, ...serie.map((p) => p.sessoes))

  return (
    <div className="space-y-2">
      <div className="flex h-24 items-end gap-[3px] overflow-x-auto">
        {serie.map((ponto) => (
          <div
            key={ponto.data}
            className="flex min-w-[6px] flex-1 flex-col items-center justify-end gap-1"
            title={`${ponto.data} · ${ponto.sessoes} sessões · ${ponto.leadsUnicos} leads`}
          >
            {ponto.leadsUnicos > 0 && <span className="h-1.5 w-1.5 rounded-full bg-ds2-magenta" />}
            <span
              className="w-full rounded-t-sm bg-ds2-gradient-primary"
              style={{ height: `${Math.max(4, (ponto.sessoes / maxSessoes) * 72)}px` }}
            />
          </div>
        ))}
      </div>
      <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
        barras = sessões por dia · ponto magenta = dia com lead
      </p>
    </div>
  )
}

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

export function BlocoOrigem({ origem, serie }: { origem: LinhaOrigem[]; serie: PontoSerieTemporal[] }) {
  return (
    <section className="space-y-3">
      <Eyebrow>origem do tráfego</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Qual campanha traz gente que TERMINA — não qual traz clique. Ordenado por sessões.
      </p>

      <Card className="space-y-4">
        <SerieTemporal serie={serie} />
      </Card>

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
