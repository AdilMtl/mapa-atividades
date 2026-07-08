import type { Metadata } from 'next'

import { Badge, PageContainer, SectionTitle } from '@/components/ds2'
import { LabWaitlistForm } from '@/components/lab/LabWaitlistForm'
import { PublicFooter, PublicHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Lab — +ConverSaaS',
  description:
    'O Lab do Conversas no Corredor está em construção: playbooks, templates e ferramentas para transformar leitura em prática. Entre na lista de interesse.',
}

const ITENS_FUTUROS = [
  'Wizard "Que solução devo construir?"',
  'Builder Canvas',
  'PRD Kit',
  'Trilha de Artesanato Digital / Vibe Coding',
  'Biblioteca de casos de uso corporativos',
  'Checklists de publicação e compartilhamento',
]

// Premium em construção + lista de interesse (ISSUE-108) — doc operacional §8.9.
export default function LabPage() {
  return (
    <div className="ds2-bg-ambient min-h-screen">
      <PublicHeader />
      <PageContainer className="pb-16 pt-4">
        <div className="rounded-ds2-panel border border-[rgba(211,76,117,0.20)] bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-6 md:p-8">
          <Badge variant="premium">Lab · em construção</Badge>
          <SectionTitle as="h1" className="mt-4 max-w-[720px] text-[32px] md:text-[42px]">
            Em breve: uma área para transformar leitura em prática.
          </SectionTitle>
          <p className="mt-4 max-w-[680px] font-ds2-sans text-base leading-relaxed text-ds2-text-secondary">
            Conteúdo sobre IA não falta. O que falta é o passo seguinte: transformar a ideia que
            ficou na cabeça em algo que funciona no seu trabalho. O Lab nasce para isso —
            playbooks, templates, trilhas e ferramentas para assinantes que querem estruturar o
            problema, escolher o formato certo de solução e levar o primeiro experimento até um
            ativo digital de verdade.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {ITENS_FUTUROS.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
          <LabWaitlistForm className="mt-8 max-w-[520px]" />
          <p className="mt-3 font-ds2-mono text-xs text-ds2-text-muted">
            A lista ajuda a decidir o que construir primeiro.
          </p>
        </div>
      </PageContainer>
      <PublicFooter />
    </div>
  )
}
