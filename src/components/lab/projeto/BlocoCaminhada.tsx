'use client'

// =============================================================================
// PÁGINA DO PROJETO — BLOCO 3: "A CAMINHADA" (ISSUE-314B v2)
// O plano deixou de ser lista com checkbox: cada etapa é uma FASE sequencial.
// A fase atual abre como um card grande (instrução densa + material quando é
// a fase de executar com IA) e fecha com um gate ("fechei essa fase") — a
// próxima abre sozinha, com o beat do consultor no topo. Fases feitas
// colapsam (toque pra reler, com desfazer); futuras mostram só o título como
// mapa da trilha (toque pra espiar — curiosidade permitida, decisão do dono).
// Substitui os antigos BlocoPlano + BlocoMaoNaMassa: o guia + primeiro prompt
// moram DENTRO da fase certa (faseDoMaterial), não num bloco separado no fim.
// v1 (destaque + scroll de volta) vetada pelo dono: "eu queria senso de
// jornada". Decisões: pergunta 18 (v2) do 00b_open_questions.md.
// =============================================================================

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'

import { Button, Card } from '@/components/ds2'
import { CheckDesenhado } from '@/components/lab/wizard/IconesAnimados'
import { formatarDuracaoMin } from '@/lib/lab/continuidade'
import type { Guia } from '@/lib/lab/materiais'
import type { LabChecklistItem, LabPlanEtapa } from '@/lib/lab/types'
import { cn } from '@/lib/utils'

interface BlocoCaminhadaProps {
  etapas: LabPlanEtapa[]
  checklist: LabChecklistItem[]
  pendentes: Set<string>
  /** Fecha o gate da fase (marca feita) — a próxima abre sozinha. */
  onFecharFase: (id: string) => void
  /** Desfaz uma marcação (fase feita reaberta pelo "marquei sem querer"). */
  onReabrirFase: (id: string) => void
  jaConcluido: boolean
  etapaAtualId: string | null
  /** Fala do consultor no topo da fase recém-aberta (null = sem beat agora). */
  beat: string | null
  guia: Guia
  prompt: string
  /** Fase em que o material (guia + prompt) mora — faseDoMaterial(). */
  faseMaterialId: string | null
  /** Soma de `etapas[].duracao_min` (ISSUE-314C) — null em planos sem estimativa. */
  duracaoTotalMin: number | null
}

/** O prompt copiável — o mesmo do antigo Mão na massa, agora dentro da fase. */
function PromptDaFase({ prompt }: { prompt: string }) {
  const [copiado, setCopiado] = React.useState(false)

  const copiar = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      // Sem permissão de clipboard (raro): a pessoa ainda consegue selecionar
      // o texto manualmente — o <pre> abaixo já mostra o prompt inteiro.
    }
  }, [prompt])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
          Teu primeiro prompt
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={copiar}
          className={cn('py-2.5 text-xs', copiado && 'border-ds2-orange/50')}
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4" /> copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> copiar prompt
            </>
          )}
        </Button>
      </div>
      <pre className="max-h-96 overflow-y-auto rounded-[14px] border border-ds2-border-subtle bg-black/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-ds2-text-secondary">
        {prompt}
      </pre>
      <p className="text-xs text-ds2-text-muted">
        Cola isso na tua IA, executa do outro lado — e volta aqui pra fechar a fase.
      </p>
    </div>
  )
}

/** Guia do ofício + prompt — o material que a fase carrega. */
function MaterialDaFase({ guia, prompt }: { guia: Guia; prompt: string }) {
  return (
    <div className="space-y-3 rounded-[16px] border border-ds2-border-subtle bg-white/[0.03] p-4">
      <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
        Material desta fase
      </p>
      <h4 className="font-ds2-serif text-lg font-medium text-ds2-text-primary">{guia.titulo}</h4>
      {guia.paragrafos.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-ds2-text-secondary">
          {p}
        </p>
      ))}
      <PromptDaFase prompt={prompt} />
    </div>
  )
}

export function BlocoCaminhada({
  etapas,
  checklist,
  pendentes,
  onFecharFase,
  onReabrirFase,
  jaConcluido,
  etapaAtualId,
  beat,
  guia,
  prompt,
  faseMaterialId,
  duracaoTotalMin,
}: BlocoCaminhadaProps) {
  const semMovimento = useReducedMotion()
  const doneById = new Map(checklist.map((c) => [c.id, c.done]))
  // Fases feitas/futuras que a pessoa abriu pra reler/espiar nesta visita.
  const [abertas, setAbertas] = React.useState<Set<string>>(new Set())

  const alternarAberta = React.useCallback((id: string) => {
    setAbertas((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }, [])

  const transicao = semMovimento
    ? { duration: 0 }
    : { duration: 0.24, ease: 'easeOut' as const }

  return (
    <section className="space-y-4" aria-label="A caminhada">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-base text-ds2-text-secondary">
          O caminho, do jeito que eu desenharia contigo numa folha — uma fase de cada vez.
        </p>
        {duracaoTotalMin !== null && (
          <p className="font-ds2-mono text-[11px] tracking-[0.1em] text-ds2-text-muted uppercase">
            {formatarDuracaoMin(duracaoTotalMin)} de foco real · {etapas.length} fases
          </p>
        )}
      </div>

      <ol className="max-w-3xl space-y-3">
        {etapas.map((etapa, idx) => {
          const done = doneById.get(etapa.id) ?? false
          const atual = etapa.id === etapaAtualId
          const salvando = pendentes.has(etapa.id)
          const temMaterial = etapa.id === faseMaterialId
          const aberta = abertas.has(etapa.id)
          const numero = String(idx + 1).padStart(2, '0')

          // ---- Fase atual: o card grande com o gate ----
          if (atual) {
            return (
              <li key={etapa.id} id={`fase-${etapa.id}`}>
                <motion.div
                  initial={semMovimento ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transicao}
                >
                  <Card className="space-y-4 border-ds2-orange/35 bg-[rgba(217,119,6,0.05)]">
                    <AnimatePresence initial={false}>
                      {beat && (
                        <motion.p
                          key="beat"
                          initial={semMovimento ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={transicao}
                          className="text-sm leading-relaxed text-ds2-text-secondary italic"
                        >
                          {beat}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <p className="font-ds2-mono text-[11px] tracking-[0.13em] text-ds2-amber-soft uppercase">
                      fase {idx + 1} de {etapas.length}
                      {etapa.duracao_min !== undefined &&
                        ` · ${formatarDuracaoMin(etapa.duracao_min)}`}{' '}
                      · você tá aqui
                    </p>
                    <h3 className="font-ds2-serif text-xl font-medium text-ds2-text-primary">
                      {etapa.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed text-ds2-text-secondary">
                      {etapa.descricao}
                    </p>
                    {temMaterial && <MaterialDaFase guia={guia} prompt={prompt} />}
                    <Button
                      type="button"
                      onClick={() => onFecharFase(etapa.id)}
                      disabled={salvando}
                    >
                      <Check className="h-4 w-4" />{' '}
                      {salvando ? 'salvando…' : 'fechei essa fase'}
                    </Button>
                  </Card>
                </motion.div>
              </li>
            )
          }

          // ---- Fase feita: colapsada, toque pra reler, com desfazer ----
          if (done) {
            return (
              <li key={etapa.id} id={`fase-${etapa.id}`}>
                <button
                  type="button"
                  onClick={() => alternarAberta(etapa.id)}
                  aria-expanded={aberta}
                  className="flex min-h-11 w-full items-center gap-3 rounded-[14px] border border-ds2-border-subtle bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <CheckDesenhado className="h-4 w-4 shrink-0 text-ds2-orange" />
                  <span className="font-ds2-sans text-sm font-semibold text-ds2-text-muted line-through">
                    {etapa.titulo}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {aberta && (
                    <motion.div
                      key="reler"
                      initial={semMovimento ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={semMovimento ? undefined : { opacity: 0 }}
                      transition={transicao}
                      className="space-y-3 px-4 pt-3 pb-1"
                    >
                      <p className="text-sm leading-relaxed text-ds2-text-secondary">
                        {etapa.descricao}
                      </p>
                      {temMaterial && <MaterialDaFase guia={guia} prompt={prompt} />}
                      <button
                        type="button"
                        onClick={() => onReabrirFase(etapa.id)}
                        disabled={salvando}
                        className="min-h-11 text-sm text-ds2-text-muted underline underline-offset-2 hover:text-ds2-text-secondary"
                      >
                        {salvando ? 'salvando…' : 'marquei sem querer — reabrir essa fase'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          }

          // ---- Fase futura: título no mapa da trilha, toque pra espiar ----
          return (
            <li key={etapa.id} id={`fase-${etapa.id}`}>
              <button
                type="button"
                onClick={() => alternarAberta(etapa.id)}
                aria-expanded={aberta}
                className="flex min-h-11 w-full items-center gap-3 rounded-[14px] border border-ds2-border-subtle/50 px-4 py-3 text-left opacity-70 transition-opacity hover:opacity-100"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ds2-border-medium font-ds2-mono text-[11px] text-ds2-text-muted">
                  {numero}
                </span>
                <span className="font-ds2-sans text-sm font-semibold text-ds2-text-muted">
                  {etapa.titulo}
                </span>
                {etapa.duracao_min !== undefined && (
                  <span className="ml-auto shrink-0 font-ds2-mono text-[10px] text-ds2-text-subtle">
                    {formatarDuracaoMin(etapa.duracao_min)}
                  </span>
                )}
              </button>
              <AnimatePresence initial={false}>
                {aberta && (
                  <motion.div
                    key="espiar"
                    initial={semMovimento ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={semMovimento ? undefined : { opacity: 0 }}
                    transition={transicao}
                    className="space-y-3 px-4 pt-3 pb-1"
                  >
                    <p className="text-sm leading-relaxed text-ds2-text-secondary">
                      {etapa.descricao}
                    </p>
                    {temMaterial && <MaterialDaFase guia={guia} prompt={prompt} />}
                    <p className="text-xs text-ds2-text-muted">
                      Essa fase abre sozinha quando você fechar a atual.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>

      {/* Fechamento: tudo marcado → beat final. A conclusão em si (com o
          check-up de resultado da ISSUE-314D) é o BlocoResultado, logo abaixo. */}
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
    </section>
  )
}
