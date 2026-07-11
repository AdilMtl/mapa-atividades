'use client'

// =============================================================================
// WIZARD DO LAB — ÍCONES ANIMADOS (ISSUE-313)
// Micro-animações no padrão do projeto pqoqubbw/icons (MIT): framer-motion
// animando os PRÓPRIOS traços lucide — mesma família visual dos ícones
// estáticos que o app já usa, nada de biblioteca nova nem host externo.
// Regra da sessão: movimento curto e com função (ritmo "ágil e fluido").
// =============================================================================

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

/**
 * Check que SE DESENHA (pathLength 0→1) — usado quando uma resposta entra nas
 * notas ou uma hipótese é confirmada. O traço é o do lucide `check`.
 */
export function CheckDesenhado({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  const semMovimento = useReducedMotion()
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
      aria-hidden
    >
      <motion.path
        d="M4 12l5 5L20 6"
        initial={semMovimento ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, delay, ease: 'easeOut' }}
      />
    </svg>
  )
}

/**
 * Lápis "anotando" — balança de leve enquanto o consultor escreve. É o
 * background-action pedido pelo dono: a pessoa responde e VÊ que algo está
 * sendo registrado. Traço do lucide `pencil-line`.
 */
export function LapisAnotando({ ativo, className }: { ativo: boolean; className?: string }) {
  const semMovimento = useReducedMotion()
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
      animate={
        ativo && !semMovimento
          ? { rotate: [0, -8, 4, -6, 0], y: [0, 0.6, 0, 0.6, 0] }
          : { rotate: 0, y: 0 }
      }
      transition={
        ativo && !semMovimento
          ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2 }
      }
      aria-hidden
    >
      <path d="M13 21h8" />
      <path d="m15 5 4 4" />
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </motion.svg>
  )
}

/** Três pontinhos de "pensando…" — o beat curto entre a resposta e a nota. */
export function PontinhosPensando({ className }: { className?: string }) {
  const semMovimento = useReducedMotion()
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-current"
          animate={semMovimento ? undefined : { opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  )
}

/** Caret de escrita (o cursor do "diário") — pisca no fim da linha ativa. */
export function CaretEscrita({ className }: { className?: string }) {
  const semMovimento = useReducedMotion()
  return (
    <motion.span
      className={cn('ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-ds2-amber-soft', className)}
      animate={semMovimento ? undefined : { opacity: [1, 1, 0, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      aria-hidden
    />
  )
}

/**
 * Envelope de "pop" para ícones estáticos lucide nos cards: acorda no hover,
 * dá um spring curto quando selecionado. Sem enfeite contínuo.
 */
export function IconePop({
  selecionado,
  children,
  className,
}: {
  selecionado?: boolean
  children: React.ReactNode
  className?: string
}) {
  const semMovimento = useReducedMotion()
  return (
    <motion.span
      className={cn('inline-flex', className)}
      animate={
        selecionado && !semMovimento ? { scale: [1, 1.25, 1], rotate: [0, -6, 0] } : { scale: 1 }
      }
      whileHover={semMovimento ? undefined : { scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 420, damping: 17 }}
    >
      {children}
    </motion.span>
  )
}
