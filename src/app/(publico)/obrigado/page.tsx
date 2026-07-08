import type { Metadata } from 'next'
import Link from 'next/link'

import { Button, Card, Eyebrow, PageContainer, Panel, SectionTitle } from '@/components/ds2'
import { ObrigadoTracker } from '@/components/obrigado/ObrigadoTracker'
import { PublicFooter, PublicHeader } from '@/components/shared'
import { LEITURAS } from '@/lib/radar/content'

export const metadata: Metadata = {
  title: 'Obrigado — +ConverSaaS',
  description: 'Sua trilha está a caminho. Enquanto o e-mail não chega, comece por uma destas conversas.',
}

const LEITURAS_RECOMENDADAS = [
  LEITURAS.fluencia,
  LEITURAS.iaQueCabe,
  LEITURAS.delegacao,
  LEITURAS.promptConversa,
  LEITURAS.hic,
]

// Pós-captura (ISSUE-108) — doc operacional §14. Standalone por enquanto: nenhum
// radar redireciona pra cá ainda (decisão do dono, liga esse fluxo numa issue futura).
export default function ObrigadoPage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <ObrigadoTracker />
      <PublicHeader />
      <PageContainer className="space-y-12 pb-16 pt-4">
        <section>
          <Eyebrow>Obrigado</Eyebrow>
          <SectionTitle className="mt-3 max-w-[720px] text-[32px] md:text-[42px]">
            Sua trilha está a caminho.
          </SectionTitle>
          <p className="mt-4 max-w-[640px] font-ds2-sans text-base leading-relaxed text-ds2-text-secondary">
            Enquanto o e-mail não chega, você pode começar por uma destas conversas.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {LEITURAS_RECOMENDADAS.map((leitura) => (
              <Card key={leitura.url}>
                <a
                  href={leitura.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <span className="font-ds2-mono text-[11px] uppercase tracking-[0.08em] text-ds2-text-muted">
                    Leitura
                  </span>
                  <p className="mt-2 text-sm text-ds2-text-primary">{leitura.titulo}</p>
                </a>
              </Card>
            ))}
          </div>
        </section>

        <Panel className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionTitle className="text-[24px] md:text-[28px]">
              A newsletter é onde a conversa continua.
            </SectionTitle>
            <p className="mt-2 max-w-[520px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
              Toda semana, uma reflexão prática sobre IA, trabalho, carreira e construção digital.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <a
                href="https://conversasnocorredor.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
              >
                Receber as próximas conversas
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/lab">Entrar na lista do Lab</Link>
            </Button>
          </div>
        </Panel>
      </PageContainer>
      <PublicFooter />
    </div>
  )
}
