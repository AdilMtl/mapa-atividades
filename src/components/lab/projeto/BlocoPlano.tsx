'use client'

// =============================================================================
// PÁGINA DO PROJETO — BLOCO 3: "O PLANO" (ISSUE-314 + 314B)
// Etapas do LabPlan + checklist vivo. A 314B transformou a lista num caminho:
// a etapa atual (primeira pendente) ganha moldura "você tá aqui" e descrição
// aberta; as feitas compactam (título riscado, sem descrição); as futuras
// seguem legíveis — ler adiante nunca é punido (spec 314 §2: modo documento
// não tem pedágio). O beat do consultor (composto em lib/lab/continuidade.ts)
// aparece colado na etapa atual logo após uma marcação.
// =============================================================================

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { Button, Card } from '@/components/ds2'
import { CheckDesenhado } from '@/components/lab/wizard/IconesAnimados'
import type { LabChecklistItem, LabPlanEtapa } from '@/lib/lab/types'
import { cn } from '@/lib/utils'

interface BlocoPlanoProps {
  etapas: LabPlanEtapa[]
  checklist: LabChecklistItem[]
  pendentes: Set<string>
  onToggle: (id: string, done: boolean) => void
  podeConcluir: boolean
  concluindo: boolean
  onConcluir: () => void
  jaConcluido: boolean
  /** Primeira etapa pendente — a moldura "você tá aqui" (ISSUE-314B). */
  etapaAtualId: string | null
  /** Fala do consultor logo após marcar uma etapa (null = sem beat agora). */
  beat: string | null
}

export function BlocoPlano({
  etapas,
  checklist,
  pendentes,
  onToggle,
  podeConcluir,
  concluindo,
  onConcluir,
  jaConcluido,
  etapaAtualId,
  beat,
}: BlocoPlanoProps) {
  const semMovimento = useReducedMotion()
  const doneById = new Map(checklist.map((c) => [c.id, c.done]))
  const transicao = semMovimento
    ? { duration: 0 }
    : { duration: 0.22, ease: 'easeOut' as const }

  return (
    <section className="space-y-4" aria-label="O plano">
      <p className="text-base text-ds2-text-secondary">
        O caminho, do jeito que eu desenharia contigo numa folha.
      </p>

      <Card className="max-w-3xl">
        <ol className="space-y-1">
          {etapas.map((etapa, idx) => {
            const done = doneById.get(etapa.id) ?? false
            const salvando = pendentes.has(etapa.id)
            const atual = etapa.id === etapaAtualId
            return (
              <li
                key={etapa.id}
                id={`etapa-${etapa.id}`}
                className={cn(
                  'flex gap-3 py-3',
                  atual
                    ? 'rounded-[16px] border border-ds2-orange/35 bg-[rgba(217,119,6,0.06)] px-3'
                    : 'border-b border-ds2-border-subtle/60 last:border-none',
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(etapa.id, !done)}
                  disabled={salvando}
                  aria-pressed={done}
                  aria-label={done ? `Desmarcar etapa: ${etapa.titulo}` : `Marcar etapa como feita: ${etapa.titulo}`}
                  className={cn(
                    'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
                    done
                      ? 'border-ds2-orange/60 bg-ds2-orange/15'
                      : 'border-ds2-border-medium bg-white/5 hover:bg-white/10',
                    salvando && 'opacity-60',
                  )}
                >
                  {done ? (
                    <CheckDesenhado className="h-4 w-4 text-ds2-orange" />
                  ) : (
                    <span className="font-ds2-mono text-xs text-ds2-text-muted">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                </button>
                <div className="pt-1">
                  {atual && (
                    <>
                      <AnimatePresence initial={false}>
                        {beat && (
                          <motion.p
                            key="beat"
                            initial={semMovimento ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={transicao}
                            className="mb-2 text-sm leading-relaxed text-ds2-text-secondary italic"
                          >
                            {beat}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                        você tá aqui
                      </p>
                    </>
                  )}
                  <h3
                    className={cn(
                      'font-ds2-sans text-sm font-semibold',
                      done ? 'text-ds2-text-muted line-through' : 'text-ds2-text-primary',
                      atual && 'mt-1',
                    )}
                  >
                    {etapa.titulo}
                  </h3>
                  {/* Feita = compacta (a descrição já cumpriu o papel dela). */}
                  {!done && (
                    <p className="mt-1 text-sm leading-relaxed text-ds2-text-secondary">
                      {etapa.descricao}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      {/* Beat final (tudo marcado): mora junto do botão que ele aponta. */}
      <AnimatePresence initial={false}>
        {beat && etapaAtualId === null && !jaConcluido && (
          <motion.p
            key="beat-final"
            initial={semMovimento ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transicao}
            className="max-w-3xl text-sm leading-relaxed text-ds2-text-secondary italic"
          >
            {beat}
          </motion.p>
        )}
      </AnimatePresence>

      {!jaConcluido && podeConcluir && (
        <Button onClick={onConcluir} disabled={concluindo}>
          {concluindo ? 'Concluindo…' : 'Concluir projeto'}
        </Button>
      )}
    </section>
  )
}
