import { Caveat } from 'next/font/google'
import { notFound, redirect } from 'next/navigation'

import { PaginaProjeto } from '@/components/lab/projeto/PaginaProjeto'
import {
  guiaAncora,
  linhaEvolucao,
  montarDevolutiva,
  montarPrimeiroPrompt,
  paraFonteDevolutiva,
} from '@/lib/lab/materiais'
import type { AmbienteId, LabDiagnosis, LabPlan } from '@/lib/lab/types'
import { criarClienteServidor } from '@/lib/supabase-server'

// =============================================================================
// /lab/projeto/[id] — "A FOLHA VIROU PLANO" (ISSUE-314)
// Server Component: busca o projeto (RLS — de outra pessoa não existe aqui,
// vira 404) e faz TODA a composição de texto (devolutiva, guia âncora,
// primeiro prompt, linha de evolução) via `lib/lab/materiais.ts` — puro,
// testado, sem IA em runtime. O cliente (PaginaProjeto) só orquestra a
// revelação em blocos e a persistência do checklist.
// A fonte manuscrita (Caveat) carrega SÓ nesta rota, como no wizard — o eco
// manuscrito do Bloco 1 é coadjuvante aqui, não protagonista (spec §3).
// Spec completa: docs/revamp/ISSUE-314-spec-pagina-projeto.md
// =============================================================================

const fonteNota = Caveat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nota',
  display: 'swap',
})

export default async function ProjetoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ leitura?: string }>
}) {
  const { id } = await params
  const { leitura } = await searchParams
  const supabase = await criarClienteServidor()

  const { data: projeto } = await supabase
    .from('lab_projects')
    .select('id, title, status, diagnosis, plan, wizard_answers')
    .eq('id', id)
    .maybeSingle()

  if (!projeto) notFound()

  // Rascunho não tem diagnóstico/plano — a tela que resolve isso é a do
  // wizard (retoma o rascunho no ponto certo). Nada pra mostrar aqui.
  if (projeto.status === 'rascunho') {
    redirect('/lab/novo-projeto')
  }

  const diagnosis = projeto.diagnosis as LabDiagnosis | null
  const plan = projeto.plan as LabPlan | null
  if (!diagnosis || !plan) notFound()

  const wizardAnswers = projeto.wizard_answers as {
    area?: string | null
    entrega?: string
    ambiente?: AmbienteId[]
  } | null

  const devolutiva = montarDevolutiva(paraFonteDevolutiva(projeto.wizard_answers))
  const guia = guiaAncora(diagnosis.tipo)
  const prompt = montarPrimeiroPrompt(diagnosis.tipo, {
    area: wizardAnswers?.area ?? null,
    entrega: wizardAnswers?.entrega ?? null,
    ambiente: wizardAnswers?.ambiente ?? null,
  })
  const evolucao = linhaEvolucao(diagnosis)

  return (
    <div className={fonteNota.variable}>
      <PaginaProjeto
        id={projeto.id}
        titulo={projeto.title}
        status={projeto.status}
        diagnosis={diagnosis}
        etapas={plan.etapas}
        checklistInicial={plan.checklist}
        devolutiva={devolutiva}
        guia={guia}
        prompt={prompt}
        linhaEvolucao={evolucao}
        modoInicial={leitura === '1' ? 'guiado' : 'documento'}
      />
    </div>
  )
}
