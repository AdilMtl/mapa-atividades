import * as React from 'react'

import { Eyebrow } from '@/components/ds2'
import type { DistribuicaoRotulada } from '@/lib/admin/analytics'

import { BarrasDistribuicao } from './BarrasDistribuicao'

export interface QuemChegaRotulado {
  area: DistribuicaoRotulada
  nivelMaturidade: DistribuicaoRotulada
  tipoRecomendado: DistribuicaoRotulada
}

/**
 * Bloco 4 da spec — decisão de CONTEÚDO. A pergunta que ele responde: para quem
 * eu estou escrevendo? Não é demografia (não temos, e não queremos: geo por IP
 * está bloqueado até a ISSUE-209) — é segmentação profissional autodeclarada,
 * que serve melhor à pauta.
 */
export function BlocoQuemChega({ quemChega }: { quemChega: QuemChegaRotulado }) {
  return (
    <section className="space-y-3">
      <Eyebrow>quem chega</Eyebrow>
      <p className="max-w-[640px] font-ds2-sans text-xs text-ds2-text-muted">
        Pra quem você está escrevendo. Só quem respondeu entra na conta — quem abandonou o radar
        não deixa resposta gravada.
      </p>

      <div className="space-y-2.5">
        <BarrasDistribuicao
          titulo="área de atuação"
          descricao="radar de oportunidades · pergunta 1"
          distribuicao={quemChega.area}
        />
        <BarrasDistribuicao
          titulo="nível de fluência"
          descricao="resultado do radar de maturidade"
          distribuicao={quemChega.nivelMaturidade}
          unidade="radares concluídos"
        />
        <BarrasDistribuicao
          titulo="tipo de solução recomendado"
          descricao="resultado do radar de oportunidades"
          distribuicao={quemChega.tipoRecomendado}
          unidade="radares concluídos"
        />
      </div>
    </section>
  )
}
