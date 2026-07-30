import * as React from 'react'

import { Card, Eyebrow } from '@/components/ds2'
import type { MetricaJanela, NumerosJanela } from '@/lib/admin/analytics'

const TILES: { chave: keyof NumerosJanela; rotulo: string }[] = [
  { chave: 'sessoes', rotulo: 'sessões de radar' },
  { chave: 'conclusoes', rotulo: 'conclusões' },
  { chave: 'leadsUnicos', rotulo: 'leads únicos' },
  { chave: 'projetosLab', rotulo: 'projetos no Lab' },
]

function Variacao({ metrica }: { metrica: MetricaJanela }) {
  if (metrica.variacaoPct === null) {
    return <span className="font-ds2-mono text-[11px] text-ds2-text-subtle">amostra insuficiente p/ variação</span>
  }
  const positiva = metrica.variacaoPct >= 0
  return (
    <span className={`font-ds2-mono text-[11px] ${positiva ? 'text-ds2-orange' : 'text-ds2-text-muted'}`}>
      {positiva ? '+' : ''}
      {metrica.variacaoPct}% vs. janela anterior
    </span>
  )
}

export function BlocoNumeros({ numeros }: { numeros: NumerosJanela }) {
  return (
    <section className="space-y-3">
      <Eyebrow>números da janela</Eyebrow>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TILES.map(({ chave, rotulo }) => (
          <Card key={chave} className="space-y-1.5">
            <p className="font-ds2-serif text-[32px] leading-none text-ds2-text-primary">{numeros[chave].valor}</p>
            <p className="font-ds2-sans text-xs text-ds2-text-secondary">{rotulo}</p>
            <Variacao metrica={numeros[chave]} />
          </Card>
        ))}
      </div>
    </section>
  )
}
