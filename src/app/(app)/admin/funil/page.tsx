import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/AdminShell'
import { PainelFunil } from '@/components/admin/PainelFunil'
import { exigirAdminSessao } from '@/lib/admin'

// Painel de Funil (ISSUE-601B). Mesmo gate SERVER-SIDE das outras telas de
// admin: sessão vem do cookie, anônimo é barrado pelo middleware, usuário
// comum cai no /dashboard.
export default async function AdminFunilPage() {
  const admin = await exigirAdminSessao()
  if (!admin) redirect('/dashboard')

  return (
    <AdminShell email={admin.email ?? ''}>
      <PainelFunil />
    </AdminShell>
  )
}
