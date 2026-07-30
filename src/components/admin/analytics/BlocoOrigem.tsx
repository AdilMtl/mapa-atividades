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

export function BlocoOrigem({ origem, serie }: { origem: LinhaOrigem[]; serie: PontoSerieTemporal[] }) {
  return (
    <section className="space-y-3">
      <Eyebrow>origem do tráfego</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Qual campanha traz gente que TERMINA — não qual traz clique.
      </p>

      <Card className="space-y-4">
        <SerieTemporal serie={serie} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-ds2-border-subtle text-left font-ds2-mono text-[11px] uppercase tracking-[0.06em] text-ds2-text-muted">
                <th className="py-2 pr-3 font-normal">origem</th>
                <th className="py-2 pr-3 font-normal">sessões</th>
                <th className="py-2 pr-3 font-normal">% conclusão</th>
                <th className="py-2 pr-3 font-normal">leads únicos</th>
                <th className="py-2 font-normal">lead / sessão</th>
              </tr>
            </thead>
            <tbody>
              {origem.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 font-ds2-sans text-sm text-ds2-text-muted">
                    Sem sessões na janela.
                  </td>
                </tr>
              ) : (
                origem.map((linha) => (
                  <tr key={linha.chave} className="border-b border-ds2-border-subtle/60 last:border-0">
                    <td className="py-2.5 pr-3 font-ds2-sans text-sm text-ds2-text-primary">{linha.chave}</td>
                    <td className="py-2.5 pr-3 font-ds2-mono text-sm text-ds2-text-secondary">{linha.sessoes}</td>
                    <td className="py-2.5 pr-3 font-ds2-mono text-sm text-ds2-text-secondary">
                      {linha.pctConclusao}% · {linha.conclusoes} de {linha.sessoes}
                    </td>
                    <td className="py-2.5 pr-3 font-ds2-mono text-sm text-ds2-text-secondary">{linha.leadsUnicos}</td>
                    <td className="py-2.5 font-ds2-mono text-sm text-ds2-text-secondary">
                      {linha.leadPorSessaoPct === null ? '—' : `${linha.leadPorSessaoPct}%`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}
