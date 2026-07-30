'use client'

import * as React from 'react'

import { Badge, Card, Eyebrow } from '@/components/ds2'
import {
  agregarSerie,
  calcularTaxaConversao,
  resolverGranularidade,
  type PontoSerieTemporal,
} from '@/lib/admin/analytics'

// =============================================================================
// Visitas × conversão (ajuste pós-teste do dono, 2026-07-30)
// A v1 marcava "teve lead nesse dia" com um ponto magenta — sinal binário, quase
// sem informação. Aqui a barra codifica DUAS coisas na mesma marca: a altura é o
// volume de sessões e a fatia pintada de dentro é quanto daquilo virou lead —
// então a taxa é legível sem número, e o volume relativiza a taxa.
//
// Guarda metodológica (§3.3 da spec): taxa diária com N pequeno mente ("50%" =
// 1 de 2). Por isso a taxa em destaque é a da JANELA INTEIRA (N real), e a taxa
// de um período só aparece ao tocar nele, marcada quando N < 20.
// =============================================================================

interface Props {
  serie: PontoSerieTemporal[]
  /** Totais da janela — dedupe real de e-mail, não a soma dos dias. */
  sessoesTotal: number
  leadsUnicosTotal: number
}

const ALTURA_MAX_PX = 96

export function BlocoVisitasConversao({ serie, sessoesTotal, leadsUnicosTotal }: Props) {
  const [selecionada, setSelecionada] = React.useState<string | null>(null)

  const granularidade = resolverGranularidade(serie)
  const pontos = agregarSerie(serie, granularidade)
  const janela = calcularTaxaConversao(sessoesTotal, leadsUnicosTotal)
  const maxSessoes = Math.max(1, ...pontos.map((p) => p.sessoes))
  const detalhe = pontos.find((p) => p.chave === selecionada) ?? null

  return (
    <section className="space-y-3">
      <Eyebrow>visitas × conversão</Eyebrow>

      <Card className="space-y-4">
        {/* Taxa da janela: o único percentual com N que sustenta leitura. */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-ds2-serif text-[32px] leading-none text-ds2-text-primary">
            {janela.taxaConversaoPct === null ? '—' : `${janela.taxaConversaoPct}%`}
          </span>
          <span className="font-ds2-sans text-sm text-ds2-text-secondary">
            de conversão na janela · {leadsUnicosTotal} de {sessoesTotal} sessões
          </span>
          {janela.amostraPequena && sessoesTotal > 0 && (
            <Badge className="text-[9px]">amostra pequena</Badge>
          )}
        </div>

        {pontos.length === 0 ? (
          <p className="font-ds2-sans text-sm text-ds2-text-muted">
            Sem sessões na janela pra desenhar a série.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-[3px]" style={{ height: ALTURA_MAX_PX }}>
              {pontos.map((ponto) => {
                const alturaBarra = Math.max(4, (ponto.sessoes / maxSessoes) * ALTURA_MAX_PX)
                const fracaoLead = ponto.sessoes > 0 ? ponto.leadsUnicos / ponto.sessoes : 0
                const ativo = ponto.chave === selecionada

                return (
                  <button
                    key={ponto.chave}
                    type="button"
                    onClick={() => setSelecionada(ativo ? null : ponto.chave)}
                    aria-label={`${ponto.rotulo}: ${ponto.sessoes} sessões, ${ponto.leadsUnicos} leads`}
                    aria-pressed={ativo}
                    className="flex h-full min-w-[6px] flex-1 flex-col justify-end"
                  >
                    <span
                      className={`relative flex w-full flex-col justify-end overflow-hidden rounded-t-sm transition-colors ${
                        ativo ? 'bg-ds2-text-muted' : 'bg-white/[0.14]'
                      }`}
                      style={{ height: alturaBarra }}
                    >
                      {/* Fatia que virou lead — preenche de baixo pra cima. */}
                      <span
                        className="w-full bg-ds2-gradient-primary"
                        style={{ height: `${Math.min(100, fracaoLead * 100)}%` }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
                altura = sessões · parte laranja = virou lead · por{' '}
                {granularidade === 'semana' ? 'semana' : 'dia'}
              </p>
              <p className="font-ds2-mono text-[11px] text-ds2-text-subtle">
                {pontos[0]?.rotulo} → {pontos[pontos.length - 1]?.rotulo}
              </p>
            </div>

            {/* Detalhe do período tocado — números absolutos sempre junto do %. */}
            <div className="rounded-ds2-card border border-ds2-border-subtle bg-white/[0.03] px-3.5 py-3">
              {detalhe ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ds2-mono text-xs text-ds2-text-secondary">
                  <strong className="text-ds2-text-primary">{detalhe.rotulo}</strong>
                  <span>{detalhe.sessoes} sessões</span>
                  <span>{detalhe.leadsUnicos} leads</span>
                  <span className={detalhe.amostraPequena ? 'text-ds2-text-subtle' : 'text-ds2-orange'}>
                    {detalhe.taxaConversaoPct === null ? '—' : `${detalhe.taxaConversaoPct}% de conversão`}
                  </span>
                  {detalhe.amostraPequena && detalhe.sessoes > 0 && (
                    <Badge className="text-[9px]">N baixo · indício, não conclusão</Badge>
                  )}
                </div>
              ) : (
                <p className="font-ds2-mono text-xs text-ds2-text-subtle">
                  Toque numa barra pra ver os números daquele{' '}
                  {granularidade === 'semana' ? 'período' : 'dia'}.
                </p>
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  )
}
