// ═══════════════════════════════════════════════════════════════════
// 📊 API: PAINEL DE ANALYTICS DO ADMIN — ISSUE-318A (Fatia A)
// ═══════════════════════════════════════════════════════════════════
// GET /api/admin/analytics — somente leitura, zero PII na resposta.
// Fonte única: Supabase (radar_sessions, radar_leads, radar_events, lab_projects).
// Zero SQL/view/tabela nova (decisão §4.1 da spec) — a agregação é feita em TS
// por src/lib/admin/analytics.ts (puro, testado). Esta rota só busca as linhas
// (com cap explícito) e os contadores de eventos direcionais.
//
// 🔒 Gate: sessão do cookie no servidor (mesmo padrão da ISSUE-318, nunca header
// do cliente). Client service_role instanciado LOCAL (nunca de lib/supabase).
//
// ⚠️ Trava de tracking (§4.4 da spec): esta rota só LÊ o que o tracking grava.
// Não toca layout.tsx, EmailGate, api/prediag/*, lib/analytics.ts,
// lib/radar-events.ts, lib/lab-events.ts.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { exigirAdminSessao } from '@/lib/admin'
import {
  calcularAmostra,
  calcularDesde,
  calcularJanelaAnterior,
  contarLeadsUnicos,
  excluirLeadsDeTeste,
  excluirProjetosDeTeste,
  montarFunilRadar,
  montarNumerosJanela,
  montarOrigemTrafego,
  montarSerieTemporal,
  normalizarEmail,
  resolverEmailsExcluidos,
  type JanelaId,
  type LabProjetoLinha,
  type RadarLeadLinha,
  type RadarSessaoLinha,
} from '@/lib/admin/analytics'
import type { RadarKind } from '@/lib/radar/types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

// Teto do client JS do Supabase é 1000 linhas por query — o cap aqui é
// deliberadamente menor pra sinalizar amostraTruncada bem antes do limite real
// (o volume atual é de beta: dezenas a poucas centenas de linhas).
const CAP_LINHAS = 1000
const JANELAS_VALIDAS: JanelaId[] = ['7', '28', '90', 'tudo']
const RADAR_KINDS: RadarKind[] = ['maturidade', 'oportunidades']
const EVENTOS_LEITURA = ['recommended_article_clicked', 'newsletter_cta_clicked']

function isoOuNull(d: Date | null): string | null {
  return d ? d.toISOString() : null
}

interface JanelaSql {
  desde: string | null
  ate: string
}

async function buscarSessoes(janela: JanelaSql): Promise<{ linhas: RadarSessaoLinha[]; amostra: { total: number; lidas: number; truncada: boolean } }> {
  let contagem = supabaseAdmin.from('radar_sessions').select('id', { count: 'exact', head: true }).lt('created_at', janela.ate)
  let busca = supabaseAdmin
    .from('radar_sessions')
    .select('id, kind, created_at, completed_at, utm_source, utm_medium, utm_campaign')
    .lt('created_at', janela.ate)
    .order('created_at', { ascending: false })
    .limit(CAP_LINHAS)

  if (janela.desde) {
    contagem = contagem.gte('created_at', janela.desde)
    busca = busca.gte('created_at', janela.desde)
  }

  const [{ count }, { data, error }] = await Promise.all([contagem, busca])
  if (error) throw error

  const linhas: RadarSessaoLinha[] = (data ?? []).map((s) => ({
    id: s.id,
    kind: s.kind,
    createdAt: s.created_at,
    completedAt: s.completed_at,
    utmSource: s.utm_source,
    utmMedium: s.utm_medium,
    utmCampaign: s.utm_campaign,
  }))

  return { linhas, amostra: calcularAmostra(count ?? linhas.length, linhas.length) }
}

async function buscarLeads(janela: JanelaSql): Promise<{ linhas: RadarLeadLinha[]; amostra: { total: number; lidas: number; truncada: boolean } }> {
  let contagem = supabaseAdmin.from('radar_leads').select('id', { count: 'exact', head: true }).lt('created_at', janela.ate)
  let busca = supabaseAdmin
    .from('radar_leads')
    .select('email, created_at, kind, session_id, lab_interest')
    .lt('created_at', janela.ate)
    .order('created_at', { ascending: false })
    .limit(CAP_LINHAS)

  if (janela.desde) {
    contagem = contagem.gte('created_at', janela.desde)
    busca = busca.gte('created_at', janela.desde)
  }

  const [{ count }, { data, error }] = await Promise.all([contagem, busca])
  if (error) throw error

  const linhas: RadarLeadLinha[] = (data ?? []).map((l) => ({
    email: l.email,
    createdAt: l.created_at,
    kind: l.kind,
    sessionId: l.session_id,
    labInterest: !!l.lab_interest,
  }))

  return { linhas, amostra: calcularAmostra(count ?? linhas.length, linhas.length) }
}

async function buscarProjetos(janela: JanelaSql): Promise<LabProjetoLinha[]> {
  let busca = supabaseAdmin
    .from('lab_projects')
    .select('id, user_id, created_at')
    .lt('created_at', janela.ate)
    .order('created_at', { ascending: false })
    .limit(CAP_LINHAS)

  if (janela.desde) busca = busca.gte('created_at', janela.desde)

  const { data, error } = await busca
  if (error) throw error

  return (data ?? []).map((p) => ({ id: p.id, userId: p.user_id, createdAt: p.created_at }))
}

/** Contagem direcional (radar_events) — NUNCA lida em bulk, só `count`. */
async function contarEvento(params: {
  eventNames: string[]
  assessmentType: RadarKind
  janela: JanelaSql
}): Promise<number> {
  let query = supabaseAdmin
    .from('radar_events')
    .select('id', { count: 'exact', head: true })
    .in('event_name', params.eventNames)
    .eq('payload->>assessment_type', params.assessmentType)
    .lt('created_at', params.janela.ate)

  if (params.janela.desde) query = query.gte('created_at', params.janela.desde)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

/** IDs de usuário (auth.users) cujo e-mail está na lista de exclusão do dono. */
async function buscarUserIdsExcluidos(emailsExcluidos: string[]): Promise<string[]> {
  const { data, error } = await supabaseAdmin.rpc('admin_list_users')
  if (error || !data) return []
  const excluidos = new Set(emailsExcluidos.map(normalizarEmail))
  return (data as { id: string; email: string | null }[])
    .filter((u) => u.email && excluidos.has(normalizarEmail(u.email)))
    .map((u) => u.id)
}

export async function GET(request: NextRequest) {
  const admin = await exigirAdminSessao()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  try {
    const params = request.nextUrl.searchParams
    const janelaParam = params.get('janela') ?? '28'
    const janela: JanelaId = JANELAS_VALIDAS.includes(janelaParam as JanelaId) ? (janelaParam as JanelaId) : '28'
    const dataCorte = params.get('dataCorte')
    const incluirTrafegoTeste = params.get('incluirTeste') === '1'

    const agora = new Date()
    const desdeAtual = calcularDesde(janela, agora, dataCorte)
    const janelaAtual: JanelaSql = { desde: isoOuNull(desdeAtual), ate: agora.toISOString() }

    const anterior = calcularJanelaAnterior(desdeAtual, agora)
    const janelaAnterior: JanelaSql | null = anterior
      ? { desde: anterior.desde.toISOString(), ate: anterior.ate.toISOString() }
      : null

    const emailsExcluidos = resolverEmailsExcluidos(process.env.ANALYTICS_EMAILS_EXCLUIDOS)

    const [
      sessoesAtualRes,
      leadsAtualRes,
      projetosAtualRaw,
      sessoesAnteriorRes,
      leadsAnteriorRes,
      projetosAnteriorRaw,
      userIdsExcluidos,
    ] = await Promise.all([
      buscarSessoes(janelaAtual),
      buscarLeads(janelaAtual),
      buscarProjetos(janelaAtual),
      janelaAnterior ? buscarSessoes(janelaAnterior) : Promise.resolve({ linhas: [], amostra: calcularAmostra(0, 0) }),
      janelaAnterior ? buscarLeads(janelaAnterior) : Promise.resolve({ linhas: [], amostra: calcularAmostra(0, 0) }),
      janelaAnterior ? buscarProjetos(janelaAnterior) : Promise.resolve([]),
      incluirTrafegoTeste ? Promise.resolve([]) : buscarUserIdsExcluidos(emailsExcluidos),
    ])

    // Eventos direcionais do funil (Bloco 2) — 2 kinds × 2 grupos de evento, só count.
    const [gateMaturidade, gateOportunidades, leituraMaturidade, leituraOportunidades] = await Promise.all([
      contarEvento({ eventNames: ['email_capture_viewed'], assessmentType: 'maturidade', janela: janelaAtual }),
      contarEvento({ eventNames: ['email_capture_viewed'], assessmentType: 'oportunidades', janela: janelaAtual }),
      contarEvento({ eventNames: EVENTOS_LEITURA, assessmentType: 'maturidade', janela: janelaAtual }),
      contarEvento({ eventNames: EVENTOS_LEITURA, assessmentType: 'oportunidades', janela: janelaAtual }),
    ])

    const leadsAtual = incluirTrafegoTeste
      ? leadsAtualRes.linhas
      : excluirLeadsDeTeste(leadsAtualRes.linhas, emailsExcluidos)
    const leadsAnterior = incluirTrafegoTeste
      ? leadsAnteriorRes.linhas
      : excluirLeadsDeTeste(leadsAnteriorRes.linhas, emailsExcluidos)
    const projetosAtual = incluirTrafegoTeste
      ? projetosAtualRaw
      : excluirProjetosDeTeste(projetosAtualRaw, userIdsExcluidos)
    const projetosAnterior = incluirTrafegoTeste
      ? projetosAnteriorRaw
      : excluirProjetosDeTeste(projetosAnteriorRaw, userIdsExcluidos)

    const numeros = montarNumerosJanela({
      sessoesAtual: sessoesAtualRes.linhas,
      sessoesAnterior: sessoesAnteriorRes.linhas,
      leadsAtual,
      leadsAnterior,
      projetosAtual,
      projetosAnterior,
    })

    const funis = RADAR_KINDS.map((kind) =>
      montarFunilRadar({
        kind,
        sessoes: sessoesAtualRes.linhas,
        leads: leadsAtual,
        eventoGateViews: kind === 'maturidade' ? gateMaturidade : gateOportunidades,
        eventoLeituraClicks: kind === 'maturidade' ? leituraMaturidade : leituraOportunidades,
      }),
    )

    const origem = montarOrigemTrafego(sessoesAtualRes.linhas, leadsAtual)
    const serie = montarSerieTemporal(sessoesAtualRes.linhas, leadsAtual)

    return NextResponse.json({
      janela,
      dataCorte,
      incluirTrafegoTeste,
      desde: janelaAtual.desde,
      ate: janelaAtual.ate,
      numeros,
      funis,
      origem,
      serie,
      leadsUnicosTotal: contarLeadsUnicos(leadsAtual),
      amostra: {
        sessoes: sessoesAtualRes.amostra,
        leads: leadsAtualRes.amostra,
      },
    })
  } catch (error) {
    console.error('Erro no GET admin/analytics:', error)
    return NextResponse.json({ error: 'Erro ao montar o painel' }, { status: 500 })
  }
}
