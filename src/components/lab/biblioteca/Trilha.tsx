'use client'

// =============================================================================
// BIBLIOTECA — A TRILHA (ISSUE-316, Fatia A — 2ª reforma pós-feedback do dono)
// Feedback 1 (v3.11.21): virou roadmap com espinha + painel — MAS o painel ficou
// EMBAIXO da trilha no mobile: tocar num degrau atualizava algo fora da tela,
// "parecia que não teve efeito, tinha que rolar". Feedback 2: navegação sem
// fluidez.
// Correção: o detalhe abre INLINE, no próprio degrau tocado (estilo Duolingo) —
// o efeito acontece onde o dedo está, com expand animado. Sem painel distante.
// Espinha conectada + estados inequívocos + TRAVA REAL (só nó conquistado abre
// guia) mantidos. DS2, ícones lucide, reduced-motion. Conteúdo = Fatia B.
// ⚠️ COPY pendente de veto do dono. Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// =============================================================================

import * as React from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AppWindow,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
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

import { Progress } from '@/components/ds2'
import type { EstadoNo, NoTrilha, TrilhaView } from '@/lib/lab/trilha'
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

interface EstadoMeta {
  rotulo: string
  dot: string
  texto: string
}

const ESTADO_META: Record<EstadoNo, EstadoMeta> = {
  conquistado: { rotulo: 'conquistado', dot: 'bg-ds2-orange', texto: 'text-ds2-orange' },
  em_construcao: { rotulo: 'construindo', dot: 'bg-ds2-orange/50 ring-1 ring-ds2-orange', texto: 'text-ds2-orange' },
  ao_alcance: { rotulo: 'a desbloquear', dot: 'bg-ds2-amber-soft', texto: 'text-ds2-amber-soft' },
  horizonte: { rotulo: 'no horizonte', dot: 'bg-ds2-text-subtle', texto: 'text-ds2-text-subtle' },
}

const NO_ABRE_GUIA: Set<EstadoNo> = new Set(['conquistado', 'em_construcao'])

export function Trilha({ view }: { view: TrilhaView }) {
  const semMovimento = useReducedMotion()
  // Começa com o próximo passo aberto (orientação imediata, sem precisar caçar).
  const [aberto, setAberto] = React.useState<number | null>(view.proximoPassoIndice)
  const ratio = view.total > 0 ? (view.conquistados / view.total) * 100 : 0

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      {/* Orientação compacta: progresso + legenda (ensina a ler os estados) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
            {view.conquistados} de {view.total} conquistados
          </span>
        </div>
        <Progress value={ratio} />
        <Legenda />
      </div>

      {/* Trilha — cada degrau abre o detalhe INLINE (onde o dedo está) */}
      <ol className="relative">
        {view.nos.map((no, i) => (
          <Degrau
            key={no.tipo}
            no={no}
            ultimo={i === view.nos.length - 1}
            aberto={aberto === i}
            ehProximo={i === view.proximoPassoIndice}
            segmentoAceso={reached(no.estado)}
            onToggle={() => setAberto((cur) => (cur === i ? null : i))}
            semMovimento={!!semMovimento}
          />
        ))}
      </ol>
    </div>
  )
}

function reached(estado: EstadoNo): boolean {
  return estado === 'conquistado' || estado === 'em_construcao'
}

// ----------------------------------------------------------------------------
// Um degrau: nó + rótulo (botão) + detalhe inline animado
// ----------------------------------------------------------------------------

function Degrau({
  no,
  ultimo,
  aberto,
  ehProximo,
  segmentoAceso,
  onToggle,
  semMovimento,
}: {
  no: NoTrilha
  ultimo: boolean
  aberto: boolean
  ehProximo: boolean
  segmentoAceso: boolean
  onToggle: () => void
  semMovimento: boolean
}) {
  const Icone = ICONE[no.tipo]
  const meta = ESTADO_META[no.estado]

  return (
    <li className="relative pb-6 last:pb-0">
      {/* Trecho de espinha até o próximo nó (aceso = já percorrido) — cobre a altura toda, inclusive o detalhe aberto */}
      {!ultimo && (
        <span
          aria-hidden
          className={cn(
            'absolute left-[27px] top-14 bottom-0 w-[2px] rounded-full',
            segmentoAceso ? 'bg-ds2-orange/45' : 'border-l-2 border-dashed border-ds2-border-subtle',
          )}
        />
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aberto}
        className="flex w-full items-center gap-4 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ds2-amber-soft"
      >
        {/* Nó */}
        <span
          className={cn(
            'relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-colors',
            no.estado === 'conquistado' && 'border-ds2-orange bg-ds2-orange text-[#1E1005]',
            no.estado === 'em_construcao' && 'border-2 border-ds2-orange bg-ds2-surface-glass text-ds2-orange',
            no.estado === 'ao_alcance' &&
              'border-ds2-amber-soft bg-ds2-surface-glass text-ds2-amber-soft shadow-[0_0_16px_-3px_rgba(240,182,116,0.5)]',
            no.estado === 'horizonte' && 'border-ds2-border-subtle bg-transparent text-ds2-text-subtle',
            aberto && 'ring-2 ring-ds2-amber-soft ring-offset-2 ring-offset-ds2-bg-app',
          )}
        >
          <Icone className="h-6 w-6" strokeWidth={1.75} />
          {no.estado === 'conquistado' && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ds2-orange ring-2 ring-ds2-bg-app">
              <Check className="h-3 w-3 text-[#1E1005]" strokeWidth={3} />
            </span>
          )}
          {(no.estado === 'ao_alcance' || no.estado === 'horizonte') && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ds2-bg-app ring-1 ring-ds2-border-subtle">
              <Lock
                className={cn('h-2.5 w-2.5', no.estado === 'ao_alcance' ? 'text-ds2-amber-soft' : 'text-ds2-text-subtle')}
                strokeWidth={2.5}
              />
            </span>
          )}
        </span>

        {/* Rótulo */}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={cn(
                'font-ds2-sans text-[15px] font-semibold tracking-[-0.02em]',
                no.estado === 'horizonte' ? 'text-ds2-text-muted' : 'text-ds2-text-primary',
              )}
            >
              {no.nome}
            </span>
            {ehProximo && (
              <span className="font-ds2-mono text-[9px] tracking-[0.1em] text-ds2-amber-soft uppercase">
                próximo passo
              </span>
            )}
            {no.temRamoValor && (
              <span className="flex items-center gap-1 rounded-full border border-ds2-magenta/30 bg-ds2-magenta/[0.08] px-1.5 py-0.5 font-ds2-mono text-[8px] tracking-[0.08em] text-ds2-magenta uppercase">
                <Sprout className="h-2.5 w-2.5" /> valor
              </span>
            )}
          </span>
          <span className={cn('mt-0.5 flex items-center gap-1.5 font-ds2-mono text-[10px] tracking-[0.06em] uppercase', meta.texto)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
            {meta.rotulo}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ds2-text-muted transition-transform',
            aberto && 'rotate-180',
          )}
        />
      </button>

      {/* Detalhe inline — abre no próprio degrau (o efeito acontece onde o dedo está) */}
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            initial={semMovimento ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={semMovimento ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <DetalheNo no={no} ehProximo={ehProximo} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// ----------------------------------------------------------------------------
// Legenda dos estados (ensina a ler a trilha)
// ----------------------------------------------------------------------------

function Legenda() {
  const ordem: EstadoNo[] = ['conquistado', 'em_construcao', 'ao_alcance', 'horizonte']
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {ordem.map((e) => (
        <li key={e} className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', ESTADO_META[e].dot)} />
          <span className="font-ds2-mono text-[10px] tracking-[0.04em] text-ds2-text-muted">
            {ESTADO_META[e].rotulo}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ----------------------------------------------------------------------------
// Detalhe do degrau — "o que é isso" + ação (abrir guia) OU hint de trava
// Indentado pra alinhar sob o rótulo (56px do nó + 16px do gap).
// ----------------------------------------------------------------------------

function DetalheNo({ no, ehProximo }: { no: NoTrilha; ehProximo: boolean }) {
  return (
    <div className="ml-[72px] mt-3 space-y-3 rounded-2xl border border-ds2-border-subtle bg-white/[0.03] p-4">
      <p className="text-sm leading-relaxed text-ds2-text-secondary">{no.descricao}</p>

      {NO_ABRE_GUIA.has(no.estado) ? (
        <Link
          href={`/lab/biblioteca/${no.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ds2-orange px-4 py-2 font-ds2-sans text-sm font-bold text-[#1E1005] transition-colors hover:bg-[linear-gradient(90deg,#D97706,#D34C75)]"
        >
          Ler o guia <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ds2-amber-soft" />
          <p className="font-ds2-mono text-[11px] leading-relaxed text-ds2-text-muted">
            {no.estado === 'ao_alcance'
              ? `Este guia abre quando você construir um ${no.nome.toLowerCase()} de verdade${ehProximo ? ' — é teu próximo passo natural' : ''}. Conclua um projeto desse tipo pra desbloquear.`
              : 'Continue subindo a trilha: este degrau entra no teu alcance quando você chegar perto dele.'}
          </p>
        </div>
      )}
    </div>
  )
}
