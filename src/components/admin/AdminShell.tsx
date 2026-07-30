'use client'

// =============================================================================
// AdminShell (ISSUE-318B) — casca de navegação DS2 mobile-first das 3 telas de
// admin. Antes, /admin/* herdava o AppShell legado (sidebar do produto ROI do
// Foco) — ilegível no celular. Este shell substitui isso: abas Assinantes ·
// Convites do Lab · Analytics, sempre visíveis, sem hambúrguer.
// Não wrap em PageContainer/min-h-screen de propósito: cada painel
// (PainelConvitesLab, PainelAnalytics, a página de assinantes) já é
// self-contained com seu próprio fundo — só a barra de navegação é nova aqui.
// =============================================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { PageContainer } from '@/components/ds2'
import { LabLogout } from '@/components/lab/LabLogout'

const ABAS = [
  { href: '/admin/assinantes', label: 'Assinantes' },
  { href: '/admin/lab-beta', label: 'Convites do Lab' },
  { href: '/admin/analytics', label: 'Analytics' },
]

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="bg-ds2-bg-app text-ds2-text-primary">
      <header className="border-b border-ds2-border-subtle">
        <PageContainer className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
          <Link href="/dashboard" className="flex min-h-11 items-center">
            <span className="font-ds2-sans text-base font-bold">
              <span className="text-ds2-orange">+</span>ConverSaaS{' '}
              <span className="font-ds2-mono text-xs font-medium text-ds2-amber-soft">admin</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 font-ds2-mono text-xs">
            {ABAS.map((aba) => {
              const ativo = pathname === aba.href
              return (
                <Link
                  key={aba.href}
                  href={aba.href}
                  className={`flex min-h-11 items-center rounded-ds2-pill px-3 transition-colors ${
                    ativo
                      ? 'bg-ds2-orange/15 text-ds2-text-primary'
                      : 'text-ds2-text-secondary hover:text-ds2-text-primary'
                  }`}
                >
                  {aba.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden min-h-11 items-center font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary sm:flex"
            >
              ← plataforma
            </Link>
            <span className="hidden font-ds2-mono text-[10px] text-ds2-text-subtle md:inline">{email}</span>
            <LabLogout />
          </div>
        </PageContainer>
      </header>

      {children}
    </div>
  )
}
