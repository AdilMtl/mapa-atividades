// =============================================================================
// API DO LAB — /api/lab/projects (ISSUE-313)
// POST: cria o rascunho do projeto no primeiro salvamento do wizard.
// Segurança em camadas: sessão via cookie (getUser, validado no servidor) +
// gate de autorização (authorized_emails, mesmo critério do layout do Lab) +
// RLS `auth.uid() = user_id` no banco (ISSUE-310) — o INSERT roda com o
// cliente DA SESSÃO, nunca service role: a política é quem manda.
// =============================================================================

import { NextResponse } from 'next/server'

import {
  criarClienteServidor,
  obterUsuarioSessao,
  verificarAutorizacao,
} from '@/lib/supabase-server'
import { sanitizarRascunho } from '@/lib/lab/validacao'
import { sugerirTitulo } from '@/lib/lab/wizard-flow'

/** Título de fallback enquanto a conversa não chega no fechamento (NOT NULL no DB). */
function tituloDoRascunho(rascunho: ReturnType<typeof sanitizarRascunho>): string {
  if (rascunho.titulo) return rascunho.titulo
  if (rascunho.porta) {
    return sugerirTitulo({
      porta: rascunho.porta,
      arquetipo: rascunho.arquetipo,
      area: rascunho.area,
      perda: rascunho.perda,
    })
  }
  return 'Meu projeto no Lab'
}

export async function POST(request: Request) {
  const user = await obterUsuarioSessao()
  if (!user?.email) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }
  const acesso = await verificarAutorizacao(user.email)
  if (!acesso.autorizado) {
    return NextResponse.json({ error: 'sem acesso ao Lab' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const rascunho = sanitizarRascunho((body as { rascunho?: unknown })?.rascunho)

  const supabase = await criarClienteServidor()
  const { data, error } = await supabase
    .from('lab_projects')
    .insert({
      user_id: user.id,
      title: tituloDoRascunho(rascunho),
      status: 'rascunho',
      wizard_answers: rascunho,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[lab/projects POST]', error?.message)
    return NextResponse.json({ error: 'não consegui salvar o rascunho' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
