'use client'

// =============================================================================
// BIBLIOTECA — A TRILHA (ISSUE-316, Fatia A — reforma visual pós-feedback do dono)
// Feedback (2026-07-14): mobile "linear/blocos empilhados", estados confusos,
// cadeado não travava (abria tudo), sem instrução do "o que é aquilo?".
// Reforma: roadmap com ESPINHA conectada (nós conquistados acendem o trecho),
// estados INEQUÍVOCOS, PAINEL DE ORIENTAÇÃO reativo (toca num nó → o painel
// explica o que é + o que falta), e TRAVA REAL — só o nó conquistado abre o
// guia; nó bloqueado explica, não abre. DS2, ícones lucide, reduced-motion.
// Conteúdo dos guias/ramos de Valor continua Fatia B.
// ⚠️ COPY pendente de veto do dono. Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// =============================================================================

import * as React from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AppWindow,
  ArrowRight,
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

function selecaoInicial(view: TrilhaView): number {
  if (view.proximoPassoIndice !== null) return view.proximoPassoIndice
  for (let i = view.nos.length - 1; i >= 0; i--) {
    if (view.nos[i]!.estado === 'conquistado') return i
  }
  return 0
}

export function Trilha({ view }: { view: TrilhaView }) {
  const semMovimento = useReducedMotion()
  const [selecionado, setSelecionado] = React.useState(() => selecaoInicial(view))
  const noSel = view.nos[selecionado]!
  const ratio = view.total > 0 ? (view.conquistados / view.total) * 100 : 0

  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_19rem] md:items-start md:gap-8">
      {/* Trilha (roadmap com espinha) */}
      <ol className="relative mx-auto w-full max-w-md md:order-1">
        {view.nos.map((no, i) => (
          <NoTrilhaItem
            key={no.tipo}
            no={no}
            indice={i}
            ultimo={i === view.nos.length - 1}
            selecionado={i === selecionado}
            ehProximo={i === view.proximoPassoIndice}
            segmentoAceso={reached(no.estado)}
            onSelecionar={() => setSelecionado(i)}
            semMovimento={!!semMovimento}
          />
        ))}
      </ol>

      {/* Painel de orientação (a "instrução") — reativo ao nó tocado */}
      <aside className="rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass p-5 md:order-2 md:sticky md:top-6">
        <div className="space-y-2">
          <p className="font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted uppercase">
            {view.conquistados} de {view.total} conquistados
          </p>
          <Progress value={ratio} />
        </div>

        <Legenda />

        <div className="mt-5 border-t border-ds2-border-subtle pt-4">
          <DetalheNo no={noSel} ehProximo={selecionado === view.proximoPassoIndice} />
        </div>
      </aside>
    </div>
  )
}

function reached(estado: EstadoNo): boolean {
  return estado === 'conquistado' || estado === 'em_construcao'
}

// ----------------------------------------------------------------------------
// Um degrau da trilha (nó + trecho de espinha até o próximo)
// ----------------------------------------------------------------------------

function NoTrilhaItem({
  no,
  indice,
  ultimo,
  selecionado,
  ehProximo,
  segmentoAceso,
  onSelecionar,
  semMovimento,
}: {
  no: NoTrilha
  indice: number
  ultimo: boolean
  selecionado: boolean
  ehProximo: boolean
  segmentoAceso: boolean
  onSelecionar: () => void
  semMovimento: boolean
}) {
  const Icone = ICONE[no.tipo]
  const meta = ESTADO_META[no.estado]

  return (
    <motion.li
      initial={semMovimento ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: semMovimento ? 0 : indice * 0.04 }}
      className="relative flex gap-4 pb-7 last:pb-0"
    >
      {/* Trecho de espinha até o próximo nó (aceso = já percorrido) */}
      {!ultimo && (
        <span
          aria-hidden
          className={cn(
            'absolute left-[27px] top-14 h-[calc(100%-3.5rem)] w-[2px] rounded-full',
            segmentoAceso ? 'bg-ds2-orange/45' : 'border-l-2 border-dashed border-ds2-border-subtle bg-transparent',
          )}
        />
      )}

      {/* Nó (botão — seleciona e explica; NÃO abre guia aqui) */}
      <button
        type="button"
        onClick={onSelecionar}
        aria-pressed={selecionado}
        className={cn(
          'relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ds2-amber-soft',
          no.estado === 'conquistado' && 'border-ds2-orange bg-ds2-orange text-[#1E1005]',
          no.estado === 'em_construcao' && 'border-2 border-ds2-orange bg-ds2-surface-glass text-ds2-orange',
          no.estado === 'ao_alcance' &&
            'border-ds2-amber-soft bg-ds2-surface-glass text-ds2-amber-soft shadow-[0_0_16px_-3px_rgba(240,182,116,0.5)]',
          no.estado === 'horizonte' && 'border-ds2-border-subtle bg-transparent text-ds2-text-subtle',
          selecionado && 'ring-2 ring-ds2-amber-soft ring-offset-2 ring-offset-ds2-bg-app',
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
      </button>

      {/* Rótulo do degrau */}
      <div className="flex min-w-0 flex-col justify-center pt-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
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
        </div>
        <span className={cn('mt-0.5 flex items-center gap-1.5 font-ds2-mono text-[10px] tracking-[0.06em] uppercase', meta.texto)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
          {meta.rotulo}
        </span>
      </div>
    </motion.li>
  )
}

// ----------------------------------------------------------------------------
// Legenda dos estados (ensina a ler a trilha)
// ----------------------------------------------------------------------------

function Legenda() {
  const ordem: EstadoNo[] = ['conquistado', 'em_construcao', 'ao_alcance', 'horizonte']
  return (
    <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5">
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
// Detalhe do nó selecionado — o "o que é isso" + a ação (ou o hint de trava)
// ----------------------------------------------------------------------------

function DetalheNo({ no, ehProximo }: { no: NoTrilha; ehProximo: boolean }) {
  const meta = ESTADO_META[no.estado]

  return (
    <div className="space-y-3">
      <div>
        <p className="font-ds2-sans text-lg font-semibold tracking-[-0.02em] text-ds2-text-primary">
          {no.nome}
        </p>
        <p className={cn('mt-0.5 font-ds2-mono text-[10px] tracking-[0.06em] uppercase', meta.texto)}>
          {meta.rotulo}
          {ehProximo && no.estado === 'ao_alcance' ? ' · teu próximo passo' : ''}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-ds2-text-secondary">{no.descricao}</p>

      {NO_ABRE_GUIA.has(no.estado) ? (
        <Link
          href={`/lab/biblioteca/${no.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ds2-orange px-4 py-2 font-ds2-sans text-sm font-bold text-[#1E1005] transition-colors hover:bg-[linear-gradient(90deg,#D97706,#D34C75)]"
        >
          Ler o guia <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-start gap-2 rounded-2xl border border-ds2-border-subtle bg-white/[0.03] p-3">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ds2-amber-soft" />
          <p className="font-ds2-mono text-[11px] leading-relaxed text-ds2-text-muted">
            {no.estado === 'ao_alcance'
              ? `Este guia abre quando você construir um ${no.nome.toLowerCase()} de verdade — conclua um projeto desse tipo pra desbloquear.`
              : 'Continue subindo a trilha: este degrau entra no teu alcance quando você chegar perto dele.'}
          </p>
        </div>
      )}
    </div>
  )
}
