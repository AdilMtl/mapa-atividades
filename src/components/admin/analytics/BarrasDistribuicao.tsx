import * as React from 'react'

import { Card } from '@/components/ds2'
import type { DistribuicaoRotulada } from '@/lib/admin/analytics'

/** Abaixo disso a distribuição é indício — mesma régua do resto do painel (§3.3 da spec). */
const LIMIAR_N_MINIMO = 20

/**
 * Distribuição como lista de barras horizontais — nunca tabela, nunca pizza.
 * Tabela de 3+ colunas não cabe em 360px (achado do teste real do dono,
 * 2026-07-30); pizza obriga a comparar ângulos. Barra deitada compara
 * comprimento, que é a leitura mais fácil que existe, e empilha sozinha.
 *
 * A barra é proporcional ao MAIOR item, não ao total: com 12 categorias, quase
 * tudo ficaria abaixo de 20% da largura e a comparação morreria. O número ao
 * lado é sempre absoluto + percentual real sobre o total.
 */
export function BarrasDistribuicao({
  titulo,
  descricao,
  distribuicao,
  unidade = 'respostas',
}: {
  titulo: string
  descricao?: string
  distribuicao: DistribuicaoRotulada
  unidade?: string
}) {
  const maior = distribuicao.itens[0]?.n ?? 0
  const amostraPequena = distribuicao.total > 0 && distribuicao.total < LIMIAR_N_MINIMO

  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="space-y-1">
        <p className="font-ds2-mono text-xs uppercase tracking-[0.08em] text-ds2-amber-soft">{titulo}</p>
        {descricao && (
          <p className="font-ds2-sans text-xs leading-snug text-ds2-text-muted">{descricao}</p>
        )}
      </div>

      {distribuicao.total === 0 ? (
        <p className="font-ds2-sans text-sm text-ds2-text-muted">Ninguém respondeu isso na janela.</p>
      ) : (
        <>
          <div className="space-y-2">
            {distribuicao.itens.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  {/* `min-w-0` + `break-words`: rótulo de opção pode ter 40+ chars
                      ("Escalar, governar ou ensinar outras pessoas"). */}
                  <span className="min-w-0 break-words font-ds2-sans text-sm text-ds2-text-secondary">
                    {item.rotulo}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-ds2-mono text-[11px] text-ds2-text-muted">
                    {item.n} · {item.pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-ds2-pill bg-white/[0.08]">
                  <span
                    className="block h-full bg-ds2-gradient-primary"
                    style={{ width: `${maior > 0 ? Math.round((item.n / maior) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="font-ds2-mono text-[10px] text-ds2-text-subtle">
            base: {distribuicao.total} {unidade}
            {distribuicao.ocultados > 0 && ` · +${distribuicao.ocultados} fora do top`}
            {amostraPequena && ' · indício, não conclusão'}
          </p>
        </>
      )}
    </Card>
  )
}
