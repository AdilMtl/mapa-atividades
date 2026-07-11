import { notFound } from 'next/navigation'

import { Badge, Card, Eyebrow } from '@/components/ds2'
import type { LabDiagnosis, LabPlan } from '@/lib/lab/types'
import { criarClienteServidor } from '@/lib/supabase-server'

// =============================================================================
// /lab/projeto/[id] — ESQUELETO (criado na ISSUE-313, mesmo padrão do esqueleto
// que a 311 fez pro /lab/inicio): recebe o redirect do wizard e prova que o
// projeto nasceu com diagnóstico e plano. A página COMPLETA — checklist
// clicável, materiais, diligência, estados — é a ISSUE-314. Não expandir aqui.
// Projeto de outra pessoa → RLS devolve vazio → 404 (aceite da 314, já valendo).
// =============================================================================

const LABEL_STATUS: Record<string, string> = {
  rascunho: 'rascunho',
  diagnosticado: 'diagnosticado',
  planejado: 'planejado',
  em_construcao: 'em construção',
  concluido: 'concluído',
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await criarClienteServidor()

  const { data: projeto } = await supabase
    .from('lab_projects')
    .select('id, title, status, diagnosis, plan')
    .eq('id', id)
    .maybeSingle()

  if (!projeto) notFound()

  const diagnosis = projeto.diagnosis as LabDiagnosis | null
  const plan = projeto.plan as LabPlan | null

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>teu projeto no lab</Eyebrow>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-ds2-serif text-4xl font-medium tracking-[-0.045em]">
            {projeto.title}
          </h1>
          <Badge>{LABEL_STATUS[projeto.status] ?? projeto.status}</Badge>
        </div>
      </div>

      {plan && (
        <Card className="max-w-3xl">
          <p className="mb-6 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted">
            01 / RESUMO DO PLANO
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ds2-text-secondary">
            {plan.resumo}
          </p>
        </Card>
      )}

      {plan && (
        <Card className="max-w-3xl">
          <p className="mb-6 font-ds2-mono text-[11px] tracking-[0.08em] text-ds2-text-muted">
            02 / ETAPAS ({plan.etapas.length})
          </p>
          <ol className="space-y-4">
            {plan.etapas.map((etapa, idx) => (
              <li key={etapa.id} className="flex gap-3">
                <span className="font-ds2-mono text-xs text-ds2-amber-soft">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-ds2-sans text-sm font-semibold text-ds2-text-primary">
                    {etapa.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ds2-text-secondary">
                    {etapa.descricao}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {diagnosis && (
        <p className="font-ds2-mono text-xs text-ds2-text-muted">
          classificação: {diagnosis.tipo} · família {diagnosis.familia} · complexidade{' '}
          {diagnosis.complexidade_label} — a página completa do projeto (checklist,
          materiais, diligência) chega na próxima atualização.
        </p>
      )}
    </div>
  )
}
