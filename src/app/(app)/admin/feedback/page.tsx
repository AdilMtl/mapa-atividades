import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/AdminShell'
import { PainelFeedback } from '@/components/admin/PainelFeedback'
import { exigirAdminSessao } from '@/lib/admin'

// Painel de triagem de feedback (ISSUE-318E). Mesmo gate das outras telas de
// admin: sessão do cookie validada no servidor. Anônimo nem chega (o middleware
// cobre /admin/*); usuário comum logado cai no /dashboard.
export default async function AdminFeedbackPage() {
  const admin = await exigirAdminSessao()
  if (!admin) redirect('/dashboard')

  return (
    <AdminShell email={admin.email ?? ''}>
      <PainelFeedback />
    </AdminShell>
  )
}
