import type { Metadata } from 'next'

import { Badge, Button, Card, Eyebrow, PageContainer, Panel, SectionTitle } from '@/components/ds2'
import { PublicFooter, PublicHeader } from '@/components/shared'
import { LEITURAS } from '@/lib/radar/content'

export const metadata: Metadata = {
  title: 'Newsletter — +ConverSaaS',
  description:
    'Toda semana, uma reflexão prática sobre IA, trabalho, carreira e construção digital. Assine grátis a newsletter Conversas no Corredor.',
}

const TEMAS = [
  'IA no trabalho real',
  'Fluência em IA',
  'Construção de soluções digitais',
  'Produtividade como sistema',
  'Discernimento e diligência',
  'Carreira em tempos de IA',
  'Liderança, estratégia e tecnologia',
]

const EXEMPLOS = [LEITURAS.fluencia, LEITURAS.promptConversa, LEITURAS.hic, LEITURAS.iaQueCabe]

// Página editorial da newsletter (ISSUE-108) — periferia do funil, doc operacional §8.7.
export default function NewsletterPage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PublicHeader />
      <PageContainer className="space-y-12 pb-16 pt-4">
        <Panel>
          <Eyebrow>Newsletter</Eyebrow>
          <SectionTitle className="mt-3 max-w-[720px] text-[32px] md:text-[42px]">
            A newsletter é onde a conversa continua.
          </SectionTitle>
          <p className="mt-4 max-w-[640px] font-ds2-sans text-base leading-relaxed text-ds2-text-secondary">
            Toda semana, uma reflexão prática sobre IA, trabalho, carreira e construção digital —
            escrita por quem vive o corredor corporativo, não por quem vende curso.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TEMAS.map((tema) => (
              <Badge key={tema}>{tema}</Badge>
            ))}
          </div>
          <Button asChild variant="primary" className="mt-6">
            <a
              href="https://conversasnocorredor.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
            >
              Receber as próximas conversas
            </a>
          </Button>
        </Panel>

        <section>
          <Eyebrow>Algumas conversas recentes</Eyebrow>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EXEMPLOS.map((leitura) => (
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
      </PageContainer>
      <PublicFooter />
    </div>
  )
}
