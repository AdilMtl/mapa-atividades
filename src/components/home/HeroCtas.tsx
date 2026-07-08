'use client'

import Link from 'next/link'

import { Button } from '@/components/ds2'
import { track } from '@/lib/analytics'

// CTAs do hero (ISSUE-109 pendente, fechada aqui): os 2 únicos eventos do doc
// operacional §21 que dependiam desta seção existir.
export function HeroCtas() {
  return (
    <>
      <Button asChild variant="primary">
        <Link
          href="/radar/oportunidades"
          onClick={() => track('hero_cta_opportunities_clicked')}
        >
          Descobrir o que posso construir
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/radar/maturidade" onClick={() => track('hero_cta_maturity_clicked')}>
          Ver meu nível em IA
        </Link>
      </Button>
    </>
  )
}
