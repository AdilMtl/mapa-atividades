// =============================================================================
// API DO LAB — /api/lab/projects/[id] (ISSUE-313 + ISSUE-314)
// PATCH em quatro modos, mutuamente exclusivos:
//   { rascunho: {...} }      → salva o progresso do bloco (tolerante, só em rascunho)
//   { finalizar: {...} }     → valida ESTRITO, roda o motor (diagnosticarV2 +
//                              ajuste pro tipo escolhido + gerarPlano) e promove
//                              o projeto a `planejado`. O motor roda AQUI
//                              (servidor): o cliente só calcula preview.
//   { checklistItem: {...} } → marca/desmarca UMA etapa do plano (ISSUE-314).
//                              Primeira marcação vira `em_construcao` sozinha;
//                              status nunca regride. Vocabulário fechado: só
//                              ids que já existem no checklist do projeto.
//   { concluir: true }       → `em_construcao` → `concluido`, só com TODAS as
//                              etapas marcadas (servidor recalcula, nunca
//                              confia no que o cliente disse que está feito).
// Mesmas camadas de segurança em todos os modos: sessão + gate + RLS via
// cliente da própria sessão (nunca service role). Motor/plano NUNCA re-rodam
// fora do modo `finalizar`.
// =============================================================================

import { NextResponse } from 'next/server'

import { ajustarDiagnosticoParaTipo, diagnosticarV2 } from '@/lib/lab/engine'
import { gerarPlano } from '@/lib/lab/plan-generator'
import type { LabPlan } from '@/lib/lab/types'
import { sanitizarRascunho, validarCompleto } from '@/lib/lab/validacao'
import { sugerirTitulo } from '@/lib/lab/wizard-flow'
import {
  criarClienteServidor,
  obterUsuarioSessao,
  verificarAutorizacao,
} from '@/lib/supabase-server'

interface ChecklistItemBody {
  id: string
  done: boolean
}

function checklistItemValido(valor: unknown): ChecklistItemBody | null {
  if (typeof valor !== 'object' || valor === null) return null
  const v = valor as Record<string, unknown>
  if (typeof v.id !== 'string' || typeof v.done !== 'boolean') return null
  return { id: v.id, done: v.done }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await obterUsuarioSessao()
  if (!user?.email) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }
  const acesso = await verificarAutorizacao(user.email)
  if (!acesso.autorizado) {
    return NextResponse.json({ error: 'sem acesso ao Lab' }, { status: 403 })
  }

  const { id } = await params
  let body: {
    rascunho?: unknown
    finalizar?: unknown
    checklistItem?: unknown
    concluir?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const supabase = await criarClienteServidor()

  // O SELECT roda com RLS: projeto de outra pessoa simplesmente não existe aqui.
  const { data: projeto } = await supabase
    .from('lab_projects')
    .select('id, status, plan')
    .eq('id', id)
    .single()

  if (!projeto) {
    return NextResponse.json({ error: 'projeto não encontrado' }, { status: 404 })
  }

  // --- Modo 1: salvar progresso do bloco -----------------------------------
  if (body.rascunho !== undefined) {
    if (projeto.status !== 'rascunho') {
      return NextResponse.json(
        { error: 'projeto já finalizado — nada a atualizar' },
        { status: 409 },
      )
    }
    const rascunho = sanitizarRascunho(body.rascunho)
    const titulo =
      rascunho.titulo ??
      (rascunho.porta
        ? sugerirTitulo({
            porta: rascunho.porta,
            arquetipo: rascunho.arquetipo,
            area: rascunho.area,
            perda: rascunho.perda,
          })
        : 'Meu projeto no Lab')

    const { error } = await supabase
      .from('lab_projects')
      .update({ wizard_answers: rascunho, title: titulo })
      .eq('id', id)

    if (error) {
      console.error('[lab/projects PATCH rascunho]', error.message)
      return NextResponse.json({ error: 'não consegui salvar o rascunho' }, { status: 500 })
    }
    return NextResponse.json({ id, status: 'rascunho' })
  }

  // --- Modo 2: finalizar (motor + plano, servidor como autoridade) ---------
  if (body.finalizar !== undefined) {
    if (projeto.status !== 'rascunho') {
      return NextResponse.json(
        { error: 'projeto já finalizado — nada a atualizar' },
        { status: 409 },
      )
    }
    const validacao = validarCompleto(body.finalizar)
    if (!validacao.ok) {
      return NextResponse.json(
        { error: 'respostas incompletas', detalhes: validacao.erros },
        { status: 400 },
      )
    }

    const respostas = validacao.respostas
    const veredito = diagnosticarV2(respostas)
    // Proposta escolhida, não veredito (spec §9): o diagnóstico gravado ancora
    // no tipo que a PESSOA escolheu; pontuação/vencedor bruto preservam a
    // auditoria do motor dentro do próprio JSONB.
    const escolha = respostas.escolha_tipo ?? veredito.tipo
    const diagnosis = ajustarDiagnosticoParaTipo(veredito, escolha)
    const plan = gerarPlano(diagnosis, {
      area: respostas.area,
      ambiente: respostas.ambiente,
      horasSemana: respostas.horas_semana,
    })

    const { error } = await supabase
      .from('lab_projects')
      .update({
        title: respostas.titulo,
        wizard_answers: respostas,
        diagnosis,
        plan,
        status: 'planejado',
      })
      .eq('id', id)

    if (error) {
      console.error('[lab/projects PATCH finalizar]', error.message)
      return NextResponse.json({ error: 'não consegui criar o projeto' }, { status: 500 })
    }
    return NextResponse.json({ id, status: 'planejado' })
  }

  // --- Modo 3: marcar/desmarcar etapa do checklist (ISSUE-314) -------------
  if (body.checklistItem !== undefined) {
    if (projeto.status === 'rascunho') {
      return NextResponse.json({ error: 'projeto ainda não tem plano' }, { status: 409 })
    }
    const item = checklistItemValido(body.checklistItem)
    if (!item) {
      return NextResponse.json({ error: 'checklistItem inválido' }, { status: 400 })
    }
    const plan = projeto.plan as LabPlan | null
    if (!plan) {
      return NextResponse.json({ error: 'projeto sem plano' }, { status: 409 })
    }
    // Vocabulário fechado: só ids que já existem no checklist gerado (mesma
    // postura da validacao.ts — nunca aceitar checklist arbitrário do cliente).
    if (!plan.checklist.some((c) => c.id === item.id)) {
      return NextResponse.json({ error: 'etapa desconhecida' }, { status: 400 })
    }

    const checklist = plan.checklist.map((c) =>
      c.id === item.id ? { ...c, done: item.done } : c,
    )
    const novoStatus = item.done && projeto.status === 'planejado' ? 'em_construcao' : projeto.status

    const { error } = await supabase
      .from('lab_projects')
      .update({ plan: { ...plan, checklist }, status: novoStatus })
      .eq('id', id)

    if (error) {
      console.error('[lab/projects PATCH checklistItem]', error.message)
      return NextResponse.json({ error: 'não consegui salvar a etapa' }, { status: 500 })
    }
    return NextResponse.json({ id, status: novoStatus, checklist })
  }

  // --- Modo 4: concluir projeto (ISSUE-314) --------------------------------
  if (body.concluir !== undefined) {
    if (projeto.status !== 'em_construcao') {
      return NextResponse.json(
        { error: 'só conclui projeto em construção, com etapas marcadas' },
        { status: 409 },
      )
    }
    const plan = projeto.plan as LabPlan | null
    if (!plan || !plan.checklist.every((c) => c.done)) {
      return NextResponse.json({ error: 'ainda tem etapa pendente' }, { status: 409 })
    }

    const { error } = await supabase
      .from('lab_projects')
      .update({ status: 'concluido' })
      .eq('id', id)

    if (error) {
      console.error('[lab/projects PATCH concluir]', error.message)
      return NextResponse.json({ error: 'não consegui concluir o projeto' }, { status: 500 })
    }
    return NextResponse.json({ id, status: 'concluido' })
  }

  return NextResponse.json(
    { error: 'informe `rascunho`, `finalizar`, `checklistItem` ou `concluir`' },
    { status: 400 },
  )
}
