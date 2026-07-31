'use client'

// =============================================================================
// AdminShell (ISSUE-318B · refinado na 318E) — casca de navegação DS2 das telas
// de admin.
//
// Por que mudou (revisão de UX sobre a v1, no celular real): com 4 abas, os
// pills quebravam em duas linhas e o "Sair" caía sozinho numa terceira — quase
// meia tela de navegação antes de qualquer conteúdo, o mesmo problema que a
// v3.11.30 corrigiu no header de /admin/assinantes. E o pill laranja da aba
// ativa era EXATAMENTE o tratamento dos pills de filtro de dentro das páginas
// (janela 7/28/90 dias): navegação e filtro falando a mesma língua visual é o
// motivo de "não parecer aba".
//
// Agora: linha 1 = identidade + sair; linha 2 = abas numa faixa única com
// scroll horizontal e sublinhado na ativa (mesmo padrão de barra do Carrossel
// da 318A2, inclusive a máscara de desbotamento na borda). Sublinhado é
// vocabulário de ABA; pill fica reservado pra filtro.
// =============================================================================

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PageContainer } from '@/components/ds2'
import { LabLogout } from '@/components/lab/LabLogout'

const ABAS = [
  { href: '/admin/assinantes', label: 'Assinantes' },
  { href: '/admin/lab-beta', label: 'Convites do Lab' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/feedback', label: 'Feedback' },
]

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const abaAtiva = React.useRef<HTMLAnchorElement>(null)

  // Sem isto, entrar direto numa aba do fim da faixa (Feedback, no celular)
  // abre a barra rolada no começo e a aba ativa fica fora de vista — a barra
  // passaria a mentir sobre onde você está. `block: 'nearest'` impede que o
  // scroll horizontal arraste a página junto.
  React.useEffect(() => {
    abaAtiva.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [pathname])

  return (
    <div className="bg-ds2-bg-app text-ds2-text-primary">
      <header className="sticky top-0 z-30 border-b border-ds2-border-subtle bg-ds2-bg-app/95 backdrop-blur-sm">
        <PageContainer className="flex items-center justify-between gap-3 pt-2">
          <Link href="/dashboard" className="flex min-h-11 items-center">
            <span className="font-ds2-sans text-base font-bold">
              <span className="text-ds2-orange">+</span>ConverSaaS{' '}
              <span className="font-ds2-mono text-xs font-medium text-ds2-amber-soft">admin</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <span className="hidden font-ds2-mono text-[10px] text-ds2-text-subtle lg:inline">
              {email}
            </span>
            <Link
              href="/dashboard"
              aria-label="Voltar para a plataforma"
              title="Voltar para a plataforma"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-ds2-pill text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <LabLogout />
          </div>
        </PageContainer>

        <PageContainer>
          {/* Faixa de abas: uma linha só. A máscara na borda direita avisa que a
              barra continua, já que a scrollbar fica escondida (padrão da 318A2). */}
          <nav className="-mb-px flex gap-1 overflow-x-auto [-ms-overflow-style:none] [mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-28px),transparent_100%)] [scrollbar-width:none] md:[mask-image:none] [&::-webkit-scrollbar]:hidden">
            {ABAS.map((aba) => {
              const ativo = pathname === aba.href
              return (
                <Link
                  key={aba.href}
                  href={aba.href}
                  ref={ativo ? abaAtiva : undefined}
                  aria-current={ativo ? 'page' : undefined}
                  className={`relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 font-ds2-mono text-xs transition-colors ${
                    ativo
                      ? 'text-ds2-text-primary'
                      : 'text-ds2-text-muted hover:text-ds2-text-secondary'
                  }`}
                >
                  {aba.label}
                  {ativo && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ds2-orange" />
                  )}
                </Link>
              )
            })}
          </nav>
        </PageContainer>
      </header>

      {children}
    </div>
  )
}
