import Link from 'next/link'

import { PageContainer } from '@/components/ds2'

// Navegação das páginas públicas novas (ISSUE-107). "Entrar" preserva o padrão
// já existente na home antiga (linhas ~357–364/~420–422): login direto na plataforma,
// sem destaque na narrativa editorial.
export function PublicHeader() {
  return (
    <PageContainer>
      <nav
        aria-label="Navegação principal"
        className="flex flex-wrap items-center justify-between gap-4 py-6"
      >
        <div>
          <Link
            href="/"
            className="font-ds2-sans text-lg font-bold text-ds2-text-primary"
          >
            <span className="bg-ds2-gradient-primary bg-clip-text text-transparent">+</span>
            ConverSaaS
          </Link>
          <p className="hidden font-ds2-mono text-[10px] text-ds2-text-subtle sm:block">
            o ecossistema virtual da newsletter Conversas no Corredor
          </p>
        </div>
        <div className="flex items-center gap-3.5 font-ds2-mono text-xs">
          <a
            href="#newsletter"
            className="hidden text-ds2-text-secondary transition-colors hover:text-ds2-text-primary md:inline"
          >
            Newsletter
          </a>
          <a
            href="#lab"
            className="hidden text-ds2-text-secondary transition-colors hover:text-ds2-text-primary md:inline"
          >
            Lab
          </a>
          <Link
            href="/auth"
            className="text-ds2-text-secondary transition-colors hover:text-ds2-text-primary"
          >
            Entrar
          </Link>
        </div>
      </nav>
    </PageContainer>
  )
}
