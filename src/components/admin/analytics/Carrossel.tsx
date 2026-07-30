'use client'

import * as React from 'react'

// =============================================================================
// Carrossel de painéis (pedido do dono, 2026-07-30: "invés de ficar descendo
// até lá embaixo da tela"). scroll-snap nativo — zero dependência, swipe de
// verdade no celular, teclado e leitor de tela funcionando.
// No desktop (md+) o trilho vira empilhamento normal: mesmo DOM, dois layouts.
//
// ⚠️ GEOMETRIA (bug corrigido em 2026-07-30, achado no teste do dono): a v1 usava
// `min-w-full` + margem negativa de sangria. `min-w-full` é um MÍNIMO — conteúdo
// mais largo que a tela (um utm_campaign gigante, uma linha mono comprida) fazia
// o painel crescer, e com `snap-center` ele sobrava pros DOIS lados: título
// cortado à esquerda, números cortados à direita.
// A trava agora é tripla e proposital: `basis-full grow-0 shrink-0` fixa a
// largura na do trilho, `overflow-hidden` impede qualquer filho de vazar, e
// `snap-start` alinha pela borda esquerda (nunca corta o começo do painel).
// =============================================================================

export interface PainelCarrossel {
  id: string
  rotulo: string
  conteudo: React.ReactNode
}

export function Carrossel({ paineis }: { paineis: PainelCarrossel[] }) {
  const [ativo, setAtivo] = React.useState(paineis[0]?.id ?? '')
  const refs = React.useRef<Record<string, HTMLElement | null>>({})

  // Aba acompanha o que está visível — no celular conforme desliza, no desktop
  // conforme rola. Sem isso a aba mente sobre onde a pessoa está.
  React.useEffect(() => {
    const alvos = Object.values(refs.current).filter((el): el is HTMLElement => el !== null)
    if (alvos.length === 0) return

    const observador = new IntersectionObserver(
      (entradas) => {
        const maisVisivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = (maisVisivel?.target as HTMLElement | undefined)?.dataset.painelId
        if (id) setAtivo(id)
      },
      { threshold: [0.25, 0.5, 0.75] },
    )

    alvos.forEach((alvo) => observador.observe(alvo))
    return () => observador.disconnect()
  }, [paineis])

  const irPara = (id: string) => {
    setAtivo(id)
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {paineis.map((painel) => (
          <button
            key={painel.id}
            type="button"
            onClick={() => irPara(painel.id)}
            aria-current={ativo === painel.id}
            className={`flex min-h-[44px] shrink-0 items-center rounded-ds2-pill border px-3.5 font-ds2-mono text-xs transition-colors ${
              ativo === painel.id
                ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                : 'border-ds2-border-subtle text-ds2-text-secondary hover:bg-white/5'
            }`}
          >
            {painel.rotulo}
          </button>
        ))}
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:block md:space-y-10 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {paineis.map((painel) => (
          <div
            key={painel.id}
            data-painel-id={painel.id}
            ref={(el) => {
              refs.current[painel.id] = el
            }}
            className="min-w-0 shrink-0 grow-0 basis-full snap-start overflow-hidden md:basis-auto"
          >
            {painel.conteudo}
          </div>
        ))}
      </div>
    </div>
  )
}
