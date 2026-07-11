'use client'

// =============================================================================
// WIZARD DO LAB — NOTAS DO CONSULTOR (ISSUE-313)
// O protagonista da tela (decisão do dono, sessão 2026-07-10): em vez de um
// resumo no rodapé, uma folha de notas MANUSCRITAS (fonte cursiva) em que o
// consultor vai anotando o caso enquanto a pessoa responde — cada linha se
// escreve da esquerda pra direita ("diário do Voldemort"), com beat curto de
// "anotando…" antes (ritmo ágil: o beat é micro-pensar, nunca espera).
// Linha que muda (pessoa voltou/ajustou) é reescrita; linha que sai, apaga.
// prefers-reduced-motion: tudo instantâneo.
// =============================================================================

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import type { LinhaNota } from './dados'
import { CaretEscrita, CheckDesenhado, LapisAnotando, PontinhosPensando } from './IconesAnimados'

const MS_POR_LETRA = 16
const MS_BEAT_ANOTANDO = 380

interface NotasConsultorProps {
  linhas: LinhaNota[]
  className?: string
}

/** Estado interno de escrita: quanto de cada linha já está "no papel". */
interface LinhaEscrita {
  id: string
  texto: string
  destaque?: boolean
  /** Caracteres já desenhados (== texto.length quando completa). */
  ate: number
}

export function NotasConsultor({ linhas, className }: NotasConsultorProps) {
  const semMovimento = useReducedMotion()
  const [escritas, setEscritas] = React.useState<LinhaEscrita[]>([])
  const [anotando, setAnotando] = React.useState(false)
  const [expandidaMobile, setExpandidaMobile] = React.useState(false)

  // Reconciliação: mantém o que não mudou, reescreve o que mudou, tira o que
  // saiu e agenda a escrita do que entrou (uma linha por vez, em ordem).
  React.useEffect(() => {
    setEscritas((atuais) => {
      const porId = new Map(atuais.map((l) => [l.id, l]))
      return linhas.map((linha) => {
        const existente = porId.get(linha.id)
        if (existente && existente.texto === linha.texto) return existente
        // Nova ou alterada: nasce vazia e a escrita anima (ou instantânea).
        return { ...linha, ate: semMovimento ? linha.texto.length : 0 }
      })
    })
  }, [linhas, semMovimento])

  // Motor da escrita: acha a primeira linha incompleta e digita.
  const haIncompleta = escritas.some((l) => l.ate < l.texto.length)
  React.useEffect(() => {
    if (!haIncompleta) {
      setAnotando(false)
      return
    }
    setAnotando(true)
    let intervalo: ReturnType<typeof setInterval> | undefined
    // Beat de "anotando…" antes da tinta encostar no papel.
    const beat = setTimeout(() => {
      intervalo = setInterval(() => {
        setEscritas((atuais) => {
          const idx = atuais.findIndex((l) => l.ate < l.texto.length)
          if (idx === -1) return atuais
          const proximas = [...atuais]
          proximas[idx] = { ...proximas[idx], ate: proximas[idx].ate + 1 }
          return proximas
        })
      }, MS_POR_LETRA)
    }, MS_BEAT_ANOTANDO)
    return () => {
      clearTimeout(beat)
      if (intervalo) clearInterval(intervalo)
    }
  }, [haIncompleta])

  const completas = escritas.filter((l) => l.ate >= l.texto.length)
  const emEscrita = escritas.find((l) => l.ate < l.texto.length)
  const ultimaCompleta = completas[completas.length - 1]

  return (
    <aside
      className={cn(
        'rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass',
        className,
      )}
      aria-label="Notas do consultor sobre o teu caso"
    >
      {/* Cabeçalho — também é o botão de expandir no mobile */}
      <button
        type="button"
        onClick={() => setExpandidaMobile((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-5 py-3 text-left lg:pointer-events-none"
        aria-expanded={expandidaMobile}
      >
        <span className="flex items-center gap-2 font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
          <LapisAnotando ativo={anotando} className="text-ds2-amber-soft" />
          notas do consultor
        </span>
        <span className="flex items-center gap-2 font-ds2-mono text-[11px] text-ds2-text-muted">
          {anotando ? (
            <span className="flex items-center gap-1.5">
              anotando <PontinhosPensando className="text-ds2-amber-soft" />
            </span>
          ) : (
            `${completas.length} ${completas.length === 1 ? 'nota' : 'notas'}`
          )}
          <span className="lg:hidden">{expandidaMobile ? '−' : '+'}</span>
        </span>
      </button>

      {/* Mobile fechado: espia a última nota (progresso sempre visível). */}
      {!expandidaMobile && (ultimaCompleta || emEscrita) && (
        <p
          className="truncate px-5 pb-3 text-[17px] leading-snug text-ds2-text-secondary lg:hidden"
          style={{ fontFamily: 'var(--font-nota), cursive' }}
        >
          {emEscrita ? emEscrita.texto.slice(0, emEscrita.ate) : ultimaCompleta?.texto}
          {emEscrita && <CaretEscrita />}
        </p>
      )}

      {/* A folha de notas (sempre aberta no desktop) */}
      <div
        className={cn(
          'px-5 pb-5',
          expandidaMobile ? 'block' : 'hidden lg:block',
        )}
      >
        <div
          className="rounded-[18px] border border-ds2-border-subtle px-4 py-3"
          style={{
            // Pauta sutil de caderno — mesma alíquota de alpha do grid técnico DS2.
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.045) 31px, rgba(255,255,255,0.045) 32px)',
          }}
        >
          {escritas.length === 0 && (
            <p
              className="py-2 text-[17px] text-ds2-text-subtle"
              style={{ fontFamily: 'var(--font-nota), cursive' }}
            >
              (a folha ainda tá em branco — me conta do teu caso)
            </p>
          )}

          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {escritas.map((linha) => {
                const completa = linha.ate >= linha.texto.length
                return (
                  <motion.li
                    key={linha.id}
                    layout={!semMovimento}
                    initial={semMovimento ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={semMovimento ? undefined : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                      'flex min-h-[32px] items-baseline gap-2 text-[18px] leading-[32px]',
                      linha.destaque ? 'text-ds2-amber-soft' : 'text-ds2-text-secondary',
                    )}
                    style={{ fontFamily: 'var(--font-nota), cursive' }}
                  >
                    <span className="w-4 shrink-0 self-center">
                      {completa && (
                        <CheckDesenhado
                          className={cn(
                            'h-3.5 w-3.5',
                            linha.destaque ? 'text-ds2-amber-soft' : 'text-ds2-orange/80',
                          )}
                        />
                      )}
                    </span>
                    <span>
                      {linha.texto.slice(0, linha.ate)}
                      {!completa && linha.ate > 0 && <CaretEscrita />}
                    </span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </aside>
  )
}
