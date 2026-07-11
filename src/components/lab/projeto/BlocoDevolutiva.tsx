// =============================================================================
// PÁGINA DO PROJETO — BLOCO 1: "O QUE EU OUVI DE VOCÊ" (ISSUE-314)
// O consultor ecoa o que a PESSOA disse antes de qualquer resultado — a
// devolutiva é composta em `lib/lab/materiais.ts` (puro, testado). Este
// componente só renderiza. É a abertura da página: sem título fixo, é ELE o
// título (spec §2/§3).
// =============================================================================

import type { Devolutiva } from '@/lib/lab/materiais'

import { ManuscritoEco } from './ManuscritoEco'

export function BlocoDevolutiva({ devolutiva, titulo }: { devolutiva: Devolutiva; titulo: string }) {
  return (
    <section className="space-y-4" aria-label="O que eu ouvi de você">
      <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
        O que eu ouvi de você
      </p>
      <h1 className="font-ds2-serif text-3xl font-medium tracking-[-0.03em] text-ds2-text-primary sm:text-4xl">
        {titulo}
      </h1>
      <div className="space-y-2 text-base leading-relaxed text-ds2-text-secondary">
        {devolutiva.frases.map((frase, i) => (
          <p key={i}>{frase}</p>
        ))}
      </div>
      {devolutiva.manuscrito && <ManuscritoEco texto={devolutiva.manuscrito} className="pt-1" />}
    </section>
  )
}
