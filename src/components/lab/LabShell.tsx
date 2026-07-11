import Link from 'next/link'

import { Badge, PageContainer } from '@/components/ds2'

import { LabLogout } from './LabLogout'

// =============================================================================
// LabShell (ISSUE-311) — casca da área logada do Lab, 100% DS2 (doc 08).
// Server Component: a sessão já foi validada pelo layout; aqui é só visual.
// Navegação: Início (única rota viva na 1A) · Biblioteca/Perfil nascem com a
// 316/317 — até lá aparecem como "em breve", sem link (nada de 404).
// Link discreto pro legado SÓ para assinante antigo (plan_type ≠ 'lab_beta',
// decisão da pergunta 14). PROIBIDO tocar no AppShell/(app) legado.
// =============================================================================

interface LabShellProps {
  email: string
  /** true = assinante antigo (vê o atalho pra plataforma ROI do Foco). */
  mostrarLegado: boolean
  children: React.ReactNode
}

export function LabShell({ email, mostrarLegado, children }: LabShellProps) {
  return (
    <div className="min-h-screen bg-ds2-bg-app text-ds2-text-primary">
      <header className="border-b border-ds2-border-subtle">
        <PageContainer className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
          <Link href="/lab/inicio" className="flex min-h-11 items-center">
            <span className="font-ds2-sans text-base font-bold">
              <span className="text-ds2-orange">+</span>ConverSaaS{' '}
              <span className="font-ds2-mono text-xs font-medium text-ds2-amber-soft">lab</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 font-ds2-mono text-xs">
            <Link
              href="/lab/inicio"
              className="flex min-h-11 items-center text-ds2-text-primary"
            >
              Início
            </Link>
            <span className="flex min-h-11 items-center gap-2 text-ds2-text-subtle">
              Biblioteca <Badge className="px-2 py-0.5 text-[10px]">em breve</Badge>
            </span>
            <span className="flex min-h-11 items-center gap-2 text-ds2-text-subtle">
              Perfil <Badge className="px-2 py-0.5 text-[10px]">em breve</Badge>
            </span>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {mostrarLegado && (
              <Link
                href="/dashboard"
                className="hidden min-h-11 items-center font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary sm:flex"
              >
                plataforma ROI do Foco →
              </Link>
            )}
            <span className="hidden font-ds2-mono text-[10px] text-ds2-text-subtle md:inline">
              {email}
            </span>
            <LabLogout />
          </div>
        </PageContainer>
      </header>

      <main className="py-10">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  )
}
