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
//
// 2ª rodada de feedback: o gráfico não tinha eixo NENHUM (nem data embaixo das
// barras, nem referência de escala) e a legenda era uma frase corrida
// descrevendo as cores. Agora: pico como referência de escala, datas de início
// e fim ancoradas no eixo, e legenda com amostras de cor de verdade.
// =============================================================================

interface Props {
  serie: PontoSerieTemporal[]
  /** Totais da janela — dedupe real de e-mail, não a soma dos dias. */
  sessoesTotal: number
  leadsUnicosTotal: number
}

const ALTURA_MAX_PX = 104

function AmostraLegenda({ classe, children }: { classe: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-ds2-mono text-[11px] text-ds2-text-muted">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${classe}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export function BlocoVisitasConversao({ serie, sessoesTotal, leadsUnicosTotal }: Props) {
  const [selecionada, setSelecionada] = React.useState<string | null>(null)

  const granularidade = resolverGranularidade(serie)
  const pontos = agregarSerie(serie, granularidade)
  const janela = calcularTaxaConversao(sessoesTotal, leadsUnicosTotal)
  const maxSessoes = Math.max(1, ...pontos.map((p) => p.sessoes))
  const detalhe = pontos.find((p) => p.chave === selecionada) ?? null
  const unidade = granularidade === 'semana' ? 'semana' : 'dia'

  return (
    <section className="space-y-3">
      <Eyebrow>visitas × conversão</Eyebrow>

      <Card className="space-y-4 overflow-hidden">
        {/* Taxa da janela: o único percentual com N que sustenta leitura. */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-ds2-serif text-[34px] leading-none text-ds2-text-primary">
              {janela.taxaConversaoPct === null ? '—' : `${janela.taxaConversaoPct}%`}
            </span>
            <span className="font-ds2-sans text-sm text-ds2-text-secondary">de conversão na janela</span>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ds2-mono text-[11px] text-ds2-text-muted">
            <span>
              {leadsUnicosTotal} leads de {sessoesTotal} sessões
            </span>
            {janela.amostraPequena && sessoesTotal > 0 && (
              <Badge className="text-[9px]">amostra pequena</Badge>
            )}
          </p>
        </div>

        {pontos.length === 0 ? (
          <p className="font-ds2-sans text-sm text-ds2-text-muted">
            Sem sessões na janela pra desenhar a série.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Referência de escala — sem isso a altura das barras não tem unidade. */}
            <p className="font-ds2-mono text-[10px] text-ds2-text-subtle">
              pico: {maxSessoes} sessões/{unidade}
            </p>

            <div className="flex items-end gap-[2px]" style={{ height: ALTURA_MAX_PX }}>
              {pontos.map((ponto) => {
                const alturaBarra = Math.max(3, (ponto.sessoes / maxSessoes) * ALTURA_MAX_PX)
                const fracaoLead = ponto.sessoes > 0 ? ponto.leadsUnicos / ponto.sessoes : 0
                const ativo = ponto.chave === selecionada

                return (
                  <button
                    key={ponto.chave}
                    type="button"
                    onClick={() => setSelecionada(ativo ? null : ponto.chave)}
                    aria-label={`${ponto.rotulo}: ${ponto.sessoes} sessões, ${ponto.leadsUnicos} leads`}
                    aria-pressed={ativo}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                  >
                    <span
                      className={`relative flex w-full flex-col justify-end overflow-hidden rounded-t-[3px] transition-colors ${
                        ativo ? 'bg-ds2-text-muted' : 'bg-white/[0.14]'
                      }`}
                      style={{ height: alturaBarra }}
                    >
                      {/* Fatia que virou lead — preenche de baixo pra cima. */}
                      <span
                        className="w-full bg-ds2-orange"
                        style={{ height: `${Math.min(100, fracaoLead * 100)}%` }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Eixo: linha + âncoras de início e fim (antes não havia data nenhuma). */}
            <div className="border-t border-ds2-border-subtle pt-1.5">
              <div className="flex items-center justify-between font-ds2-mono text-[10px] text-ds2-text-subtle">
                <span>{pontos[0]?.rotulo}</span>
                {pontos.length > 2 && <span>por {unidade}</span>}
                <span>{pontos[pontos.length - 1]?.rotulo}</span>
              </div>
            </div>

            {/* Legenda com amostra de cor — mostrar a cor, não descrevê-la. */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <AmostraLegenda classe="bg-white/[0.14]">sessões</AmostraLegenda>
              <AmostraLegenda classe="bg-ds2-orange">virou lead</AmostraLegenda>
            </div>
          </div>
        )}

        {/* Detalhe do período tocado — números absolutos sempre junto do %. */}
        {pontos.length > 0 && (
          <div className="rounded-ds2-card border border-ds2-border-subtle bg-white/[0.03] px-3.5 py-3">
            {detalhe ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-ds2-mono text-xs">
                  <strong className="text-ds2-text-primary">{detalhe.rotulo}</strong>
                  <span className="text-ds2-text-secondary">{detalhe.sessoes} sessões</span>
                  <span className="text-ds2-text-secondary">
                    {detalhe.leadsUnicos} {detalhe.leadsUnicos === 1 ? 'lead' : 'leads'}
                  </span>
                  <span className={detalhe.amostraPequena ? 'text-ds2-text-subtle' : 'text-ds2-orange'}>
                    {detalhe.taxaConversaoPct === null ? '—' : `${detalhe.taxaConversaoPct}%`}
                  </span>
                </div>
                {detalhe.amostraPequena && detalhe.sessoes > 0 && (
                  <p className="font-ds2-mono text-[10px] text-ds2-text-subtle">
                    N baixo — indício, não conclusão.
                  </p>
                )}
              </div>
            ) : (
              <p className="font-ds2-mono text-[11px] text-ds2-text-subtle">
                Toque numa barra pra ver os números daquele {unidade}.
              </p>
            )}
          </div>
        )}
      </Card>
    </section>
  )
}
