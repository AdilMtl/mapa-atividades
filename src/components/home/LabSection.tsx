import Link from 'next/link'

import { Badge, Button, SectionTitle } from '@/components/ds2'

const ITENS = [
  'Wizard "Que solução devo construir?"',
  'Builder Canvas',
  'PRD Kit',
  'Trilha de Artesanato Digital',
  'Biblioteca de casos corporativos',
  'Checklists de publicação',
]

// A lista de interesse do Lab (captura real) é a página /lab (ISSUE-108) —
// este CTA é a vitrine que leva até ela.
export function LabSection() {
  return (
    <section id="lab">
      <div className="rounded-ds2-panel border border-[rgba(211,76,117,0.20)] bg-[linear-gradient(145deg,rgba(211,76,117,0.10),rgba(255,255,255,0.04))] p-6 md:p-8">
        <Badge variant="premium">Lab · em construção</Badge>
        <SectionTitle className="mt-4">Do diagnóstico à solução estruturada.</SectionTitle>
        <p className="mt-3 max-w-[680px] font-ds2-sans text-sm leading-relaxed text-ds2-text-secondary">
          O Lab é a próxima camada do +ConverSaaS: ferramentas e playbooks para assinantes que
          querem ir além da leitura — estruturar a ideia, escolher o formato certo de solução e
          chegar a um ativo digital de verdade.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {ITENS.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/lab">Quero entrar na lista do Lab</Link>
        </Button>
        <p className="mt-2 font-ds2-mono text-xs text-ds2-text-muted">
          A lista ajuda a decidir o que construir primeiro.
        </p>
      </div>
    </section>
  )
}
