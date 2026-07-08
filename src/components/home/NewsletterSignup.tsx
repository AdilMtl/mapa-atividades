'use client'

import * as React from 'react'

import { track } from '@/lib/analytics'

// Assinatura da newsletter sem sair do site (ISSUE-111.1) — embed oficial do Substack,
// premissa aprovada em 00b_open_questions.md pergunta 5 (opção a+b). As cores do embed se
// configuram no painel do Substack (operação do dono); aqui só o container DS2.
// Cliques DENTRO do iframe são cross-origin e não são rastreáveis — o evento
// `newsletter_embed_viewed` (primeira vez que o embed entra na tela) dá a taxa de
// visualização; a assinatura em si o dono acompanha no painel do Substack.
export function NewsletterSignup() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const viewedRef = React.useRef(false)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (viewedRef.current) return
        if (entries.some((entry) => entry.isIntersecting)) {
          viewedRef.current = true
          track('newsletter_embed_viewed')
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass">
        <iframe
          src="https://conversasnocorredor.substack.com/embed"
          title="Assinar a newsletter Conversas no Corredor"
          className="block h-[150px] w-full border-0"
          loading="lazy"
          scrolling="no"
        />
      </div>
      <p className="font-ds2-mono text-[11px] text-ds2-text-subtle">
        Grátis. Uma conversa por semana. Cancela quando quiser.
      </p>
      <p className="font-ds2-sans text-xs text-ds2-text-muted">
        Prefere assinar direto no Substack?{' '}
        <a
          href="https://conversasnocorredor.substack.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ds2-orange underline underline-offset-2 hover:text-ds2-amber-soft"
          onClick={() => track('newsletter_cta_clicked', { location: 'home_newsletter' })}
        >
          Abrir a página de assinatura
        </a>
      </p>
    </div>
  )
}
