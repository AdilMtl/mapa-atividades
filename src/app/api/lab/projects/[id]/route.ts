// =============================================================================
// API DO LAB — /api/lab/projects/[id] (ISSUE-313)
// PATCH em dois modos:
//   { rascunho: {...} }  → salva o progresso do bloco (tolerante, só em rascunho)
//   { finalizar: {...} } → valida ESTRITO, roda o motor (diagnosticarV2 +
//                          ajuste pro tipo escolhido + gerarPlano) e promove o
//                          projeto a `planejado`. O motor roda AQUI (servidor):
//                          o que o cliente calcula é só preview da proposta.
// Mesmas camadas de segurança do POST (sessão + gate + RLS via cliente da sessão).
// =============================================================================

import { NextResponse } from 'next/server'

import { ajustarDiagnosticoParaTipo, diagnosticarV2 } from '@/lib/lab/engine'
import { gerarPlano } from '@/lib/lab/plan-generator'
import { sanitizarRascunho, validarCompleto } from '@/lib/lab/validacao'
import { sugerirTitulo } from '@/lib/lab/wizard-flow'
import {
  criarClienteServidor,
  obterUsuarioSessao,
  verificarAutorizacao,
} from '@/lib/supabase-server'

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
  let body: { rascunho?: unknown; finalizar?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const supabase = await criarClienteServidor()

  // O SELECT roda com RLS: projeto de outra pessoa simplesmente não existe aqui.
  const { data: projeto } = await supabase
    .from('lab_projects')
    .select('id, status')
    .eq('id', id)
    .single()

  if (!projeto) {
    return NextResponse.json({ error: 'projeto não encontrado' }, { status: 404 })
  }
  if (projeto.status !== 'rascunho') {
    return NextResponse.json(
      { error: 'projeto já finalizado — nada a atualizar' },
      { status: 409 },
    )
  }

  // --- Modo 1: salvar progresso do bloco -----------------------------------
  if (body.rascunho !== undefined) {
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

  return NextResponse.json({ error: 'informe `rascunho` ou `finalizar`' }, { status: 400 })
}
