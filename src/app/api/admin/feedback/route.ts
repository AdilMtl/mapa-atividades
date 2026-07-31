// ═══════════════════════════════════════════════════════════════════
// 🗂️ API: TRIAGEM DE FEEDBACK — ISSUE-318E
// ═══════════════════════════════════════════════════════════════════
// GET   → fila (filtro por status/tipo) + contadores. `?formato=markdown`
//         devolve o inbox pronto pra colar em docs/revamp/feedback-inbox.md.
// PATCH → só status, notas_admin e issue_ref (allowlist em lib/admin/feedback).
// Sem DELETE de propósito: descartar é `status='descartado'`. Histórico não se
// apaga — o registro original é evidência, não rascunho.
//
// 🔒 Gate: exigirAdminSessao() (sessão do cookie, validada no servidor).
// Client service_role instanciado LOCAL, nunca de lib/supabase.

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { exigirAdminSessao } from '@/lib/admin'
import {
  formatarFilaMarkdown,
  montarPatchFeedback,
  type FeedbackLinha,
} from '@/lib/admin/feedback'
import { STATUS_FEEDBACK, TIPOS_FEEDBACK, type StatusFeedback, type TipoFeedback } from '@/lib/feedback/tipos'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const LIMITE_FILA = 200
const LIMITE_CONTAGEM = 2000

const COLUNAS = 'id, created_at, email, user_id, tipo, severidade, mensagem, rota, contexto, status, notas_admin, issue_ref'

interface LinhaBruta {
  id: string
  created_at: string
  email: string | null
  user_id: string | null
  tipo: TipoFeedback
  severidade: FeedbackLinha['severidade']
  mensagem: string
  rota: string | null
  contexto: FeedbackLinha['contexto']
  status: StatusFeedback
  notas_admin: string | null
  issue_ref: string | null
}

function normalizar(linha: LinhaBruta): FeedbackLinha {
  return {
    id: linha.id,
    createdAt: linha.created_at,
    email: linha.email,
    // `logado` vem do contexto gravado pelo servidor na captura; o user_id é o
    // desempate quando o feedback é anterior a esse campo existir.
    logado: linha.contexto?.logado ?? Boolean(linha.user_id),
    tipo: linha.tipo,
    severidade: linha.severidade,
    mensagem: linha.mensagem,
    rota: linha.rota,
    contexto: linha.contexto,
    status: linha.status,
    notasAdmin: linha.notas_admin,
    issueRef: linha.issue_ref,
  }
}

export async function GET(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const tipo = searchParams.get('tipo')
  const formato = searchParams.get('formato')

  try {
    let consulta = supabaseAdmin
      .from('feedback')
      .select(COLUNAS)
      .order('created_at', { ascending: false })
      .limit(LIMITE_FILA)

    if (status && STATUS_FEEDBACK.includes(status as StatusFeedback)) {
      consulta = consulta.eq('status', status)
    }
    if (tipo && TIPOS_FEEDBACK.includes(tipo as TipoFeedback)) {
      consulta = consulta.eq('tipo', tipo)
    }

    // Os contadores olham a base inteira (capada), não a página filtrada — senão
    // o topo da tela contaria só o que já está filtrado e mentiria.
    const [filaRes, contagemRes] = await Promise.all([
      consulta,
      supabaseAdmin.from('feedback').select('tipo, status').limit(LIMITE_CONTAGEM),
    ])

    if (filaRes.error) throw filaRes.error

    const itens = ((filaRes.data ?? []) as unknown as LinhaBruta[]).map(normalizar)

    if (formato === 'markdown') {
      return new NextResponse(formatarFilaMarkdown(itens), {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      })
    }

    const base = (contagemRes.data ?? []) as { tipo: TipoFeedback; status: StatusFeedback }[]
    const porTipo = Object.fromEntries(TIPOS_FEEDBACK.map((t) => [t, 0])) as Record<TipoFeedback, number>
    const porStatus = Object.fromEntries(STATUS_FEEDBACK.map((s) => [s, 0])) as Record<StatusFeedback, number>
    for (const linha of base) {
      if (linha.tipo in porTipo) porTipo[linha.tipo] += 1
      if (linha.status in porStatus) porStatus[linha.status] += 1
    }

    return NextResponse.json({ itens, contadores: { porTipo, porStatus, total: base.length } })
  } catch (error) {
    console.error('Erro ao carregar a fila de feedback:', error)
    return NextResponse.json({ error: 'Não foi possível carregar a fila' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const body = await request.json()
    const id = typeof body?.id === 'string' ? body.id : null
    if (!id) return NextResponse.json({ error: 'Feedback não informado' }, { status: 400 })

    // A allowlist é pura e testada: mensagem, contexto e user_id nunca chegam
    // ao UPDATE, venham como vierem no body.
    const patch = montarPatchFeedback(body)
    if (!patch) return NextResponse.json({ error: 'Nada válido para alterar' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .update(patch)
      .eq('id', id)
      .select(COLUNAS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item: normalizar(data as unknown as LinhaBruta) })
  } catch (error) {
    console.error('Erro ao triar feedback:', error)
    return NextResponse.json({ error: 'Não foi possível salvar a triagem' }, { status: 500 })
  }
}
