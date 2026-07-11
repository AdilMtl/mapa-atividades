import Link from 'next/link'

import { Button, Eyebrow, PageContainer, Panel } from '@/components/ds2'

import { LabLogout } from './LabLogout'

// Tela pra quem LOGOU mas não está no beta (ISSUE-311): sem tom de porta na
// cara — explica o momento e aponta pra lista de espera (a vitrine /lab).
export function BetaFechado({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen items-center bg-ds2-bg-app text-ds2-text-primary">
      <PageContainer className="max-w-xl">
        <Panel className="p-8">
          <Eyebrow>lab · beta fechado</Eyebrow>
          <h1 className="mt-4 font-ds2-serif text-3xl font-medium tracking-[-0.045em]">
            O Lab está aberto pra poucos — por enquanto.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ds2-text-secondary">
            Tua conta ({email}) ainda não está entre os convidados desta primeira
            turma. Os convites saem da lista de espera, em levas pequenas — é assim
            que a gente garante atenção de verdade pra quem entra.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/lab">Quero entrar na lista</Link>
            </Button>
            <LabLogout />
          </div>
        </Panel>
      </PageContainer>
    </div>
  )
}
