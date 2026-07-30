import { redirect } from 'next/navigation'

import { PainelConvitesLab } from '@/components/admin/PainelConvitesLab'
import { exigirAdminSessao } from '@/lib/admin'

// Painel de convites do beta do Lab (ISSUE-318). Gate SERVER-SIDE de verdade:
// a sessão vem do cookie e só o admin renderiza — anônimo é barrado antes
// pelo middleware (/admin está no matcher); usuário comum cai no /dashboard.
export default async function AdminLabBetaPage() {
  const admin = await exigirAdminSessao()
  if (!admin) redirect('/dashboard')

  return <PainelConvitesLab />
}
