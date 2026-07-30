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
  // Texto curto de propósito: num tile de ~160px no celular, a frase longa da
  // v1 ("amostra insuficiente p/ variação") quebrava em 3 linhas e desalinhava
  // a grade inteira. A explicação completa mora no bloco "como ler".
  if (metrica.variacaoPct === null) {
    return <span className="font-ds2-mono text-[10px] text-ds2-text-subtle">sem base p/ comparar</span>
  }
  const positiva = metrica.variacaoPct >= 0
  return (
    <span className={`font-ds2-mono text-[10px] ${positiva ? 'text-ds2-orange' : 'text-ds2-text-muted'}`}>
      {positiva ? '+' : ''}
      {metrica.variacaoPct}% vs. anterior
    </span>
  )
}

export function BlocoNumeros({ numeros }: { numeros: NumerosJanela }) {
  return (
    <section className="space-y-3">
      <Eyebrow>números da janela</Eyebrow>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {TILES.map(({ chave, rotulo }) => (
          <Card key={chave} className="flex flex-col gap-1 overflow-hidden py-4">
            <p className="font-ds2-serif text-[30px] leading-none text-ds2-text-primary">
              {numeros[chave].valor}
            </p>
            <p className="font-ds2-sans text-xs leading-snug text-ds2-text-secondary">{rotulo}</p>
            <Variacao metrica={numeros[chave]} />
          </Card>
        ))}
      </div>
    </section>
  )
}
