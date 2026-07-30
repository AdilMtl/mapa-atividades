import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Badge, Button, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'
import { LabWaitlistForm } from '@/components/lab/LabWaitlistForm'
import { PublicFooter, PublicHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Lab — +ConverSaaS',
  description:
    'O Lab do Conversas no Corredor está no ar: uma conversa guiada transforma um problema do seu trabalho em um projeto com diagnóstico e plano. Entre na lista de convites do beta.',
}

// O que o beta entrega HOJE (ISSUE-318) — substituiu a lista especulativa de 2026-07-05.
// Copy v2 com os vetos do dono aplicados (2026-07-29): docs/revamp/ISSUE-318-copy-vitrine-lab.md
const O_QUE_EXISTE = [
  'Conversa guiada, estilo consultor',
  'Diagnóstico com 9 tipos de solução',
  'Plano em fases, com guia e prompt',
  'Biblioteca que cresce com você',
]

// Vitrine em modo "beta no ar" (ISSUE-318): convidado entra, o resto continua na
// lista (a mesma captura da ISSUE-108 — formulário intocado).
export default function LabPage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PublicHeader />
      <PageContainer className="pb-16 pt-4">
        <div className="rounded-ds2-panel border border-[rgba(211,76,117,0.20)] bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-6 md:p-8">
          <Badge variant="premium">Lab · beta no ar</Badge>
          <SectionTitle as="h1" className="mt-4 max-w-[720px] text-[32px] md:text-[42px]">
            O Lab está no ar: o lugar onde um problema do seu trabalho vira um projeto com
            plano.
          </SectionTitle>
          <p className="mt-4 max-w-[680px] font-ds2-sans text-base leading-relaxed text-ds2-text-secondary">
            Você já sabe onde a IA poderia te ajudar: naquela planilha que você atualiza toda
            semana, naquele relatório que leva uma tarde inteira para ficar pronto, naquele
            processo que todo mundo reclama e ninguém arruma. Porque o que está travando talvez
            não seja a falta de ferramenta, mas transformar essa ideia em algo que funciona de
            verdade no seu contexto.
          </p>
          <p className="mt-4 max-w-[680px] font-ds2-sans text-base leading-relaxed text-ds2-text-secondary">
            No Lab, você conta esse problema numa conversa guiada, como se estivesse falando
            com um consultor, e sai com um diagnóstico honesto: que tipo de solução faz sentido
            para você, com as ferramentas que você já tem, e um plano em fases para construir.
            E aí, no final, você ainda tem acesso a uma biblioteca de ferramentas para
            transformar o que você construiu em algo prático, que te dá resultado na carreira.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {O_QUE_EXISTE.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>

          {/* O beta: convidado entra; o resto entra na lista */}
          <div className="mt-8 max-w-[680px] space-y-4 rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass p-5 md:p-6">
            <Eyebrow>beta por convite</Eyebrow>
            <p className="font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
              O Lab está abrindo em levas de convites, e quem entra agora ajuda a construir o
              que ele vai ser: testa primeiro, fala direto comigo e vê as próprias sugestões
              virarem produto.
            </p>
            <Button asChild variant="secondary">
              <Link href="/auth?next=/lab/inicio">
                Recebi meu convite, quero entrar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-8 max-w-[680px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
            Quer o seu convite? Entra na lista: é dela que saem as próximas levas.
          </p>
          <LabWaitlistForm className="mt-3 max-w-[520px]" />
          <p className="mt-3 font-ds2-mono text-xs text-ds2-text-muted">
            A lista também ajuda a decidir o que construir primeiro.
          </p>
        </div>
      </PageContainer>
      <PublicFooter />
    </div>
  )
}
