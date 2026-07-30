import * as React from 'react'

import { Card, Eyebrow } from '@/components/ds2'
import type { DistribuicaoRotulada, MatrizRotulada } from '@/lib/admin/analytics'

import { BarrasDistribuicao } from './BarrasDistribuicao'

export interface OQueDoiRotulado {
  perda: DistribuicaoRotulada
  entrega: DistribuicaoRotulada
  fronteira: DistribuicaoRotulada
}

/**
 * Cruzamento área × tipo recomendado como LISTA, não como grade. Uma matriz de
 * 12 áreas × 9 tipos tem 108 células e não cabe em tela de celular nem com
 * scroll interno — e, com o volume de hoje, quase todas seriam vazias. A lista
 * mostra só o que sobreviveu ao corte de N, que é exatamente o que interessa.
 */
function Matriz({ matriz }: { matriz: MatrizRotulada }) {
  const maior = matriz.celulas[0]?.n ?? 0

  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="space-y-1">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">
          área × tipo recomendado
        </p>
        <p className="font-ds2-sans text-xs leading-snug text-ds2-text-muted">
          Onde a área e a recomendação se repetem juntas — a pauta que serve pra um grupo, não pra
          uma pessoa.
        </p>
      </div>

      {matriz.celulas.length === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">
          {matriz.pares === 0
            ? 'Ninguém concluiu o radar de oportunidades na janela.'
            : `Nenhuma combinação apareceu 2 vezes ainda (${matriz.pares} radares concluídos). Com esse volume, cruzar área com tipo seria ler borra de café.`}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {matriz.celulas.map((celula) => (
              <div key={`${celula.area}|${celula.tipo}`} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 break-words font-ds2-sans text-sm text-ds2-text-secondary">
                    {celula.rotuloArea} → {celula.rotuloTipo}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-ds2-mono text-[11px] text-ds2-text-muted">
                    {celula.n}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                  <span
                    className="block h-full bg-ds2-gradient-primary"
                    style={{ width: `${maior > 0 ? Math.round((celula.n / maior) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="font-ds2-mono text-[10px] text-ds2-text-subtle">
            base: {matriz.pares} radares concluídos
            {matriz.celulasOcultas > 0 && ` · ${matriz.celulasOcultas} combinações com N=1 ocultas`}
          </p>
        </>
      )}
    </Card>
  )
}

/**
 * Bloco 5 da spec — decisão de CONTEÚDO. `mat_fronteira` ("qual é sua maior
 * dificuldade hoje?") é o sinal editorial mais direto que existe no banco: é a
 * pessoa dizendo, em opção fechada, sobre o que ela quer ler.
 */
export function BlocoOQueDoi({
  oQueDoi,
  matriz,
}: {
  oQueDoi: OQueDoiRotulado
  matriz: MatrizRotulada
}) {
  return (
    <section className="space-y-3">
      <Eyebrow>o que dói</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Sobre o que escrever. Top 5 de cada pergunta — a lista completa não ajuda a escolher pauta.
      </p>

      <div className="space-y-2.5">
        <BarrasDistribuicao
          titulo="o que quer evoluir"
          descricao="radar de maturidade · o sinal editorial mais direto do banco"
          distribuicao={oQueDoi.fronteira}
        />
        <BarrasDistribuicao
          titulo="onde perde tempo"
          descricao="radar de oportunidades"
          distribuicao={oQueDoi.perda}
        />
        <BarrasDistribuicao
          titulo="entrega principal"
          descricao="radar de oportunidades"
          distribuicao={oQueDoi.entrega}
        />
        <Matriz matriz={matriz} />
      </div>
    </section>
  )
}
