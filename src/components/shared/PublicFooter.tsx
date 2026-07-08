import Link from 'next/link'

import { PageContainer } from '@/components/ds2'

export function PublicFooter() {
  return (
    <footer className="border-t border-ds2-border-subtle py-12">
      <PageContainer className="flex flex-col items-center gap-6 text-center">
        <p className="max-w-[560px] font-ds2-serif text-lg text-ds2-text-primary">
          Use IA com repertório, não com FOMO. Uma conversa por vez, uma solução melhor por vez.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-ds2-mono text-xs text-ds2-text-secondary">
          <a
            href="https://conversasnocorredor.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ds2-text-primary"
          >
            Newsletter
          </a>
          <a
            href="https://conversasnocorredor.substack.com/s/roi-do-foco"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ds2-text-primary"
          >
            Série ROI do Foco
          </a>
          <Link href="/privacidade" className="transition-colors hover:text-ds2-text-primary">
            Privacidade
          </Link>
          <Link href="/auth" className="transition-colors hover:text-ds2-text-primary">
            Entrar na plataforma
          </Link>
        </div>
        <p className="font-ds2-mono text-[11px] text-ds2-text-subtle">
          +ConverSaaS, o ecossistema virtual da newsletter Conversas no Corredor
        </p>
      </PageContainer>
    </footer>
  )
}
