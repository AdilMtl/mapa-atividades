import type { Metadata } from 'next'

import { AppShell } from './AppShell'

// Camada Server Component só para poder exportar `metadata` (ISSUE-110) — o
// AppShell client component abaixo continua com toda a lógica de auth/navegação,
// sem nenhuma mudança de comportamento.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface LayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: LayoutProps) {
  return <AppShell>{children}</AppShell>
}
