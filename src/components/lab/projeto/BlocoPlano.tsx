// =============================================================================
// PÁGINA DO PROJETO — BLOCO 3: "O PLANO" (ISSUE-314)
// Etapas do LabPlan + checklist vivo. Marcar/desmarcar é otimista (a
// persistência real e a transição de status ficam no orquestrador). Botão
// "Concluir projeto" só aparece com tudo marcado.
// =============================================================================

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
}: BlocoPlanoProps) {
  const doneById = new Map(checklist.map((c) => [c.id, c.done]))

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
            return (
              <li key={etapa.id} className="flex gap-3 border-b border-ds2-border-subtle/60 py-3 last:border-none">
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
                  <h3
                    className={cn(
                      'font-ds2-sans text-sm font-semibold',
                      done ? 'text-ds2-text-muted line-through' : 'text-ds2-text-primary',
                    )}
                  >
                    {etapa.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ds2-text-secondary">
                    {etapa.descricao}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      {!jaConcluido && podeConcluir && (
        <Button onClick={onConcluir} disabled={concluindo}>
          {concluindo ? 'Concluindo…' : 'Concluir projeto'}
        </Button>
      )}
    </section>
  )
}
