'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { registrarPageview } from '@/lib/analytics'

/**
 * Registra o `page_viewed` das rotas de ENTRADA do funil (ISSUE-318C): a home
 * (destino do anúncio) e as páginas dos dois radares. Só essas três, de
 * propósito — pageview em toda rota pública seria o evento mais frequente da
 * tabela pra responder uma pergunta que só estas rotas respondem: quantas
 * pessoas viram a página e NÃO começaram um radar.
 *
 * Vive no layout de `(publico)` (que não remonta entre navegações do grupo),
 * por isso o `usePathname`: é ele que faz o efeito rodar de novo a cada troca
 * de rota. Dedupe e trilho único ficam no `registrarPageview`.
 */
const ROTAS_MEDIDAS = ['/', '/radar/maturidade', '/radar/oportunidades']

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && ROTAS_MEDIDAS.includes(pathname)) registrarPageview()
  }, [pathname])

  return null
}
