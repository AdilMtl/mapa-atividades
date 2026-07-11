import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { BetaFechado } from '@/components/lab/BetaFechado'
import { LabShell } from '@/components/lab/LabShell'
import { obterUsuarioSessao, verificarAutorizacao } from '@/lib/supabase-server'

// =============================================================================
// GATE DO LAB (ISSUE-311) — Server Component: decide ANTES de renderizar.
// Anônimo nem chega aqui (middleware manda pro /auth sem flash) — o redirect
// abaixo é defesa em profundidade. Logado: autorização via authorized_emails
// (service role). plan_type ≠ 'lab_beta' = assinante antigo → vê o legado.
// =============================================================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const user = await obterUsuarioSessao()
  if (!user?.email) redirect('/auth?next=%2Flab%2Finicio')

  const acesso = await verificarAutorizacao(user.email)
  if (!acesso.autorizado) return <BetaFechado email={user.email} />

  return (
    <LabShell email={user.email} mostrarLegado={acesso.planType !== 'lab_beta'}>
      {children}
    </LabShell>
  )
}
