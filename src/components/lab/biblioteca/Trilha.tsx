'use client'

// =============================================================================
// BIBLIOTECA — A TRILHA (ISSUE-316, Fatia A)
// A trilha de construção: 9 nós numa escada de complexidade crescente, com o
// mapa de calor por adjacência (conquistado / em construção / ao alcance /
// horizonte). Serpente (cara de jogo) dentro do DS2 — sem neon/circuito/robô
// (proibições doc 08 §6): o "jogo" vem dos estados do nó, não de estética sci-fi.
// Responsivo: DESKTOP = varredura horizontal (mapa inteiro num relance);
// MOBILE = coluna vertical (rola "escalando"). Nós conquistados brotam um ramo
// de Valor — aqui um PLACEHOLDER "em breve" (o conteúdo é Fatia B).
// Ícones lucide (nunca emoji). prefers-reduced-motion respeitado.
// Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// =============================================================================

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AppWindow,
  BarChart3,
  Boxes,
  Check,
  LayoutTemplate,
  Lock,
  type LucideIcon,
  MessageSquare,
  Sparkles,
  Sprout,
  Table2,
  Workflow,
  Zap,
} from 'lucide-react'

import type { EstadoNo, NoTrilha } from '@/lib/lab/trilha'
import type { SolutionTypeId } from '@/lib/radar/types'
import { cn } from '@/lib/utils'

const ICONE: Record<SolutionTypeId, LucideIcon> = {
  prompt: MessageSquare,
  template: LayoutTemplate,
  workflow: Workflow,
  automacao: Zap,
  dashboard: BarChart3,
  app_offline: AppWindow,
  app_tabela: Table2,
  orquestrado: Boxes,
  agentico: Sparkles,
}

const NO_ACESSIVEL: Set<EstadoNo> = new Set(['conquistado', 'em_construcao', 'ao_alcance'])

export function Trilha({ nos }: { nos: NoTrilha[] }) {
  const semMovimento = useReducedMotion()

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
      {nos.map((no, i) => (
        <ItemTrilha
          key={no.tipo}
          no={no}
          primeiro={i === 0}
          segmentoAceso={i > 0 && reachedEstado(nos[i - 1]!.estado)}
          indice={i}
          semMovimento={!!semMovimento}
        />
      ))}
    </div>
  )
}

function reachedEstado(estado: EstadoNo): boolean {
  return estado === 'conquistado' || estado === 'em_construcao'
}

function ItemTrilha({
  no,
  primeiro,
  segmentoAceso,
  indice,
  semMovimento,
}: {
  no: NoTrilha
  primeiro: boolean
  segmentoAceso: boolean
  indice: number
  semMovimento: boolean
}) {
  return (
    <div className="flex flex-col items-center md:flex-1 md:flex-row">
      {!primeiro && (
        <span
          aria-hidden
          className={cn(
            'h-6 w-px shrink-0 md:mt-7 md:h-px md:w-full md:self-start',
            segmentoAceso ? 'bg-ds2-orange/50' : 'bg-ds2-border-subtle',
          )}
        />
      )}

      <motion.div
        initial={semMovimento ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: semMovimento ? 0 : indice * 0.05 }}
        className="flex flex-col items-center"
      >
        <No no={no} />
      </motion.div>
    </div>
  )
}

function No({ no }: { no: NoTrilha }) {
  const Icone = ICONE[no.tipo]
  const acessivel = NO_ACESSIVEL.has(no.estado)

  const miolo = (
    <div className="flex flex-col items-center gap-2 py-2">
      <span
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full border transition-colors',
          no.estado === 'conquistado' && 'border-ds2-orange bg-ds2-orange text-[#1E1005]',
          no.estado === 'em_construcao' && 'border-2 border-ds2-orange bg-ds2-surface-glass text-ds2-orange',
          no.estado === 'ao_alcance' &&
            'border-ds2-amber-soft bg-ds2-surface-glass text-ds2-amber-soft shadow-[0_0_18px_-2px_rgba(240,182,116,0.45)]',
          no.estado === 'horizonte' && 'border-ds2-border-subtle bg-transparent text-ds2-text-subtle opacity-70',
        )}
      >
        <Icone className="h-6 w-6" strokeWidth={1.75} />
        {no.estado === 'conquistado' && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ds2-orange ring-2 ring-ds2-bg-app">
            <Check className="h-3 w-3 text-[#1E1005]" strokeWidth={3} />
          </span>
        )}
        {no.estado === 'ao_alcance' && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ds2-bg-app ring-1 ring-ds2-border-subtle">
            <Lock className="h-2.5 w-2.5 text-ds2-amber-soft" strokeWidth={2.5} />
          </span>
        )}
      </span>

      <span
        className={cn(
          'max-w-[6rem] text-center font-ds2-mono text-[11px] leading-tight tracking-[0.04em]',
          no.estado === 'horizonte' ? 'text-ds2-text-subtle' : 'text-ds2-text-secondary',
          no.estado === 'ao_alcance' && 'text-ds2-amber-soft',
        )}
      >
        {no.nome}
      </span>

      {/* Ramo de Valor — brota do nó conquistado. Conteúdo = Fatia B (placeholder). */}
      {no.temRamoValor && (
        <span className="mt-1 flex items-center gap-1 rounded-full border border-ds2-magenta/30 bg-ds2-magenta/[0.08] px-2 py-0.5 font-ds2-mono text-[9px] tracking-[0.08em] text-ds2-magenta uppercase">
          <Sprout className="h-2.5 w-2.5" /> valor · em breve
        </span>
      )}
    </div>
  )

  if (!acessivel) {
    // Horizonte: fosco, sem link (a pessoa chega aqui construindo, não clicando).
    return (
      <div aria-disabled className="cursor-default select-none">
        {miolo}
      </div>
    )
  }

  return (
    <Link
      href={`/lab/biblioteca/${no.slug}`}
      className="rounded-2xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ds2-amber-soft"
    >
      {miolo}
    </Link>
  )
}
