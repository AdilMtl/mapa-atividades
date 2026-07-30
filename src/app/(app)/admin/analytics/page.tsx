import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/AdminShell'
import { PainelAnalytics } from '@/components/admin/PainelAnalytics'
import { exigirAdminSessao } from '@/lib/admin'

// Painel de Analytics do admin (ISSUE-318A). Gate SERVER-SIDE de verdade:
// a sessão vem do cookie e só o admin renderiza — anônimo é barrado antes
// pelo middleware (/admin está no matcher); usuário comum cai no /dashboard.
export default async function AdminAnalyticsPage() {
  const admin = await exigirAdminSessao()
  if (!admin) redirect('/dashboard')

  return (
    <AdminShell email={admin.email ?? ''}>
      <PainelAnalytics />
    </AdminShell>
  )
}
