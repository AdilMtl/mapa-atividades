'use client'

import Link from 'next/link'

import { Button, Eyebrow, Panel, SectionTitle } from '@/components/ds2'
import { track } from '@/lib/analytics'

// Fechamento da home (ISSUE-111.1): quem rolou a página inteira é o visitante mais
// engajado — a seção devolve as duas portas + a newsletter antes do footer. CTAs com os
// MESMOS rótulos e destinos do hero/portas (reconhecimento), eventos próprios para medir
// quanto o fim da página converte.
export function FechamentoSection() {
  return (
    <section>
      <Panel className="bg-[rgba(46,104,96,0.13)] p-8 text-center md:p-10">
        <Eyebrow>Por onde começar</Eyebrow>
        <SectionTitle className="mx-auto mt-3 max-w-[680px]">
          Você leu até aqui. O próximo passo leva dois minutos.
        </SectionTitle>
        <p className="mx-auto mt-3 max-w-[560px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          Escolha uma porta: descubra o que dá para construir no seu trabalho, ou veja
          primeiro em que estágio você está.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary">
            <Link
              href="/radar/oportunidades"
              onClick={() => track('closing_cta_opportunities_clicked')}
            >
              Descobrir o que posso construir
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link
              href="/radar/maturidade"
              onClick={() => track('closing_cta_maturity_clicked')}
            >
              Ver meu nível em IA
            </Link>
          </Button>
        </div>
        <p className="mt-5 font-ds2-sans text-sm text-ds2-text-secondary">
          Prefere começar lendo?{' '}
          <a
            href="https://conversasnocorredor.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ds2-orange underline underline-offset-4 hover:text-ds2-amber-soft"
            onClick={() => track('closing_newsletter_clicked')}
          >
            Receber as próximas conversas
          </a>
        </p>
        <p className="mt-2 font-ds2-mono text-[11px] text-ds2-text-subtle">
          Grátis. Uma conversa por semana. Cancela quando quiser.
        </p>
      </Panel>
    </section>
  )
}
