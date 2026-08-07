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
  calcularProgressaoChecklist,
  contarLeadsUnicos,
  excluirLeadsDeTeste,
  excluirProjetosDeTeste,
  montarDistribuicao,
  montarDropoutFases,
  montarDropoutPorPergunta,
  montarFunilRadar,
  montarMatrizAreaTipo,
  montarNumerosJanela,
  montarOQueDoi,
  montarOrigemTrafego,
  montarPipelineLab,
  montarQuemChega,
  montarSerieTemporal,
  normalizarEmail,
  ordenarAberturasGuias,
  resolverEmailsExcluidos,
  rotularDistribuicao,
  rotularMatriz,
  type AberturaGuia,
  type JanelaId,
  type LabProjetoLinha,
  type RadarLeadLinha,
  type RadarSessaoLinha,
} from '@/lib/admin/analytics'
import {
  rotuloGuia,
  rotuloNivelMaturidade,
  rotuloOpcaoRadar,
  rotuloStatusProjeto,
  rotuloTipoSolucao,
} from '@/lib/admin/analytics-rotulos'
import { SLUGS_CANONICOS } from '@/lib/lab/plan-generator'
import { PERGUNTAS_MATURIDADE } from '@/lib/radar/maturidade'
import { PERGUNTAS_OPORTUNIDADES } from '@/lib/radar/oportunidades'
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
const PLAN_LAB_BETA = 'lab_beta'

// ISSUE-318C — rotas de entrada medidas pelo page_viewed + ordem das perguntas
// de cada radar (insumo do dropout; ids fechados, importados do motor).
const ROTA_PAGEVIEW_POR_KIND: Record<RadarKind, string> = {
  maturidade: '/radar/maturidade',
  oportunidades: '/radar/oportunidades',
}
const PERGUNTAS_POR_KIND: Record<RadarKind, string[]> = {
  maturidade: PERGUNTAS_MATURIDADE.map((p) => p.id),
  oportunidades: PERGUNTAS_OPORTUNIDADES.map((p) => p.id),
}

function isoOuNull(d: Date | null): string | null {
  return d ? d.toISOString() : null
}

/**
 * `radar_sessions.answers` chega como JSONB solto. Só pares string→string
 * sobrevivem: os ids fechados são o único insumo dos Blocos 4/5, e filtrar aqui
 * garante que nenhum campo de texto que apareça no schema no futuro atravesse a
 * agregação por acidente.
 */
function apenasRespostasFechadas(bruto: unknown): Record<string, string> | null {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return null
  const limpo: Record<string, string> = {}
  for (const [chave, valor] of Object.entries(bruto as Record<string, unknown>)) {
    if (typeof valor === 'string') limpo[chave] = valor
  }
  return Object.keys(limpo).length > 0 ? limpo : null
}

/** Etapas marcadas / total, lidas do checklist dentro de `lab_projects.plan`. */
function lerChecklist(plan: unknown): { etapasFeitas: number; etapasTotal: number } {
  const checklist = (plan as { checklist?: unknown } | null)?.checklist
  if (!Array.isArray(checklist)) return { etapasFeitas: 0, etapasTotal: 0 }
  return {
    etapasTotal: checklist.length,
    etapasFeitas: checklist.filter((item) => (item as { done?: unknown })?.done === true).length,
  }
}

interface JanelaSql {
  desde: string | null
  ate: string
}

async function buscarSessoes(janela: JanelaSql): Promise<{ linhas: RadarSessaoLinha[]; amostra: { total: number; lidas: number; truncada: boolean } }> {
  let contagem = supabaseAdmin.from('radar_sessions').select('id', { count: 'exact', head: true }).lt('created_at', janela.ate)
  let busca = supabaseAdmin
    .from('radar_sessions')
    .select('id, kind, created_at, completed_at, utm_source, utm_medium, utm_campaign, result_key, answers')
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
    resultKey: s.result_key,
    // `answers` é JSONB de ids fechados (pergunta → opção). Descarta qualquer
    // valor que não seja string: nada de texto livre ou objeto aninhado sai
    // daqui para a resposta da API (§ zero PII).
    answers: apenasRespostasFechadas(s.answers),
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
  // `plan` inteiro em vez de `plan->checklist`: no volume de beta (dezenas de
  // projetos) a economia não paga o risco de uma seleção JSONB errada falhar em
  // produção. Se passar de alguns milhares, é o mesmo gatilho da §4.1 da spec.
  let busca = supabaseAdmin
    .from('lab_projects')
    .select('id, user_id, created_at, status, plan')
    .lt('created_at', janela.ate)
    .order('created_at', { ascending: false })
    .limit(CAP_LINHAS)

  if (janela.desde) busca = busca.gte('created_at', janela.desde)

  const { data, error } = await busca
  if (error) throw error

  return (data ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    createdAt: p.created_at,
    status: p.status ?? 'rascunho',
    ...lerChecklist(p.plan),
  }))
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

/**
 * Pageviews in-house de uma rota de entrada (ISSUE-318C) — direcional, só
 * `count` (regra da §4.1: nenhuma linha de radar_events é transferida). O
 * evento não carrega assessment_type; a rota (page_url) é o discriminador.
 */
async function contarPageviews(pageUrl: string, janela: JanelaSql): Promise<number> {
  let query = supabaseAdmin
    .from('radar_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_name', 'page_viewed')
    .eq('page_url', pageUrl)
    .lt('created_at', janela.ate)

  if (janela.desde) query = query.gte('created_at', janela.desde)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

/**
 * Uma leitura só de `auth.users`, dois usos: os ids do dono (para tirar o
 * tráfego de teste) e os e-mails que já viraram conta (degrau do pipeline do
 * Lab). Nenhum dos dois atravessa a resposta da API — só as contagens saem.
 */
async function buscarUsuariosAuth(
  emailsExcluidos: string[],
): Promise<{ idsExcluidos: string[]; emailsComConta: string[] }> {
  const { data, error } = await supabaseAdmin.rpc('admin_list_users')
  if (error || !data) return { idsExcluidos: [], emailsComConta: [] }

  const excluidos = new Set(emailsExcluidos.map(normalizarEmail))
  const usuarios = data as { id: string; email: string | null }[]

  return {
    idsExcluidos: usuarios
      .filter((u) => u.email && excluidos.has(normalizarEmail(u.email)))
      .map((u) => u.id),
    emailsComConta: usuarios.filter((u) => u.email).map((u) => normalizarEmail(u.email!)),
  }
}

/**
 * Insumos do pipeline do Lab (Bloco 6). ⚠️ ACUMULADO, sem janela — o beta é por
 * convite e os degraus vivem em tabelas de tempos diferentes (alguém convidado
 * há 40 dias cria conta hoje): recortar por janela produziria degrau maior que
 * o próprio topo. A tela declara isso.
 */
async function buscarInteresseLab(): Promise<{ interesse: string[]; convidados: string[] }> {
  const [labLeadsRes, radarLeadsRes, autorizadosRes] = await Promise.all([
    supabaseAdmin.from('lab_leads').select('email').limit(CAP_LINHAS),
    supabaseAdmin.from('radar_leads').select('email').eq('lab_interest', true).limit(CAP_LINHAS),
    supabaseAdmin
      .from('authorized_emails')
      .select('email')
      .eq('plan_type', PLAN_LAB_BETA)
      .limit(CAP_LINHAS),
  ])

  const emails = (linhas: { email: string | null }[] | null) =>
    (linhas ?? []).filter((l) => l.email).map((l) => normalizarEmail(l.email!))

  return {
    interesse: [...new Set([...emails(labLeadsRes.data), ...emails(radarLeadsRes.data)])],
    convidados: emails(autorizadosRes.data),
  }
}

/**
 * Guias mais abertos — o único número do Bloco 6 sem tabela equivalente, logo
 * direcional. Uma contagem `head` por slug canônico: nenhuma linha de
 * `radar_events` é transferida (regra da §4.1 da spec), e a lista de slugs é
 * fechada, então não há N+1 escondido.
 */
async function contarAberturasGuias(): Promise<AberturaGuia[]> {
  const contagens = await Promise.all(
    SLUGS_CANONICOS.map(async (slug) => {
      const { count } = await supabaseAdmin
        .from('radar_events')
        .select('id', { count: 'exact', head: true })
        .eq('event_name', 'lab_asset_opened')
        .eq('payload->>slug', slug)
      return { slug, n: count ?? 0, titulo: rotuloGuia(slug) }
    }),
  )
  return ordenarAberturasGuias(contagens)
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
      usuariosAuth,
      // Bloco 6 é acumulado — ignora a janela de propósito (ver buscarInteresseLab).
      projetosTodosRaw,
      interesseLab,
      aberturasGuias,
    ] = await Promise.all([
      buscarSessoes(janelaAtual),
      buscarLeads(janelaAtual),
      buscarProjetos(janelaAtual),
      janelaAnterior ? buscarSessoes(janelaAnterior) : Promise.resolve({ linhas: [], amostra: calcularAmostra(0, 0) }),
      janelaAnterior ? buscarLeads(janelaAnterior) : Promise.resolve({ linhas: [], amostra: calcularAmostra(0, 0) }),
      janelaAnterior ? buscarProjetos(janelaAnterior) : Promise.resolve([]),
      buscarUsuariosAuth(emailsExcluidos),
      buscarProjetos({ desde: null, ate: agora.toISOString() }),
      buscarInteresseLab(),
      contarAberturasGuias(),
    ])

    const userIdsExcluidos = incluirTrafegoTeste ? [] : usuariosAuth.idsExcluidos

    // Eventos direcionais do funil (Bloco 2) — 2 kinds × 2 grupos de evento, só
    // count. ISSUE-318C somou os pageviews das 3 rotas de entrada ao mesmo lote.
    const [
      gateMaturidade,
      gateOportunidades,
      leituraMaturidade,
      leituraOportunidades,
      pageviewsHome,
      pageviewsMaturidade,
      pageviewsOportunidades,
    ] = await Promise.all([
      contarEvento({ eventNames: ['email_capture_viewed'], assessmentType: 'maturidade', janela: janelaAtual }),
      contarEvento({ eventNames: ['email_capture_viewed'], assessmentType: 'oportunidades', janela: janelaAtual }),
      contarEvento({ eventNames: EVENTOS_LEITURA, assessmentType: 'maturidade', janela: janelaAtual }),
      contarEvento({ eventNames: EVENTOS_LEITURA, assessmentType: 'oportunidades', janela: janelaAtual }),
      contarPageviews('/', janelaAtual),
      contarPageviews(ROTA_PAGEVIEW_POR_KIND.maturidade, janelaAtual),
      contarPageviews(ROTA_PAGEVIEW_POR_KIND.oportunidades, janelaAtual),
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
        eventoPageviews: kind === 'maturidade' ? pageviewsMaturidade : pageviewsOportunidades,
        eventoGateViews: kind === 'maturidade' ? gateMaturidade : gateOportunidades,
        eventoLeituraClicks: kind === 'maturidade' ? leituraMaturidade : leituraOportunidades,
      }),
    )

    // ISSUE-318C — dropout por pergunta, das mesmas sessões da janela (exato).
    const dropout = RADAR_KINDS.map((kind) =>
      montarDropoutPorPergunta({
        kind,
        sessoes: sessoesAtualRes.linhas,
        perguntasOrdenadas: PERGUNTAS_POR_KIND[kind],
      }),
    )

    const origem = montarOrigemTrafego(sessoesAtualRes.linhas, leadsAtual)
    const serie = montarSerieTemporal(sessoesAtualRes.linhas, leadsAtual)

    // Blocos 4 e 5 leem as sessões da JANELA (é decisão de conteúdo: o que a
    // gente escreve agora responde a quem chegou agora).
    const quemChegaBruto = montarQuemChega(sessoesAtualRes.linhas)
    const oQueDoiBruto = montarOQueDoi(sessoesAtualRes.linhas)

    const quemChega = {
      area: rotularDistribuicao(quemChegaBruto.area, rotuloOpcaoRadar),
      nivelMaturidade: rotularDistribuicao(quemChegaBruto.nivelMaturidade, rotuloNivelMaturidade),
      tipoRecomendado: rotularDistribuicao(quemChegaBruto.tipoRecomendado, rotuloTipoSolucao),
    }
    const oQueDoi = {
      perda: rotularDistribuicao(oQueDoiBruto.perda, rotuloOpcaoRadar),
      entrega: rotularDistribuicao(oQueDoiBruto.entrega, rotuloOpcaoRadar),
      fronteira: rotularDistribuicao(oQueDoiBruto.fronteira, rotuloOpcaoRadar),
    }
    const matriz = rotularMatriz(
      montarMatrizAreaTipo(sessoesAtualRes.linhas),
      rotuloOpcaoRadar,
      rotuloTipoSolucao,
    )

    // Bloco 6 lê tudo (acumulado). A exclusão do tráfego de teste continua
    // valendo — ela é por identidade, não por período.
    const emailsExcluidosSet = new Set(emailsExcluidos.map(normalizarEmail))
    const semDono = (lista: string[]) =>
      incluirTrafegoTeste ? lista : lista.filter((e) => !emailsExcluidosSet.has(e))
    const projetosTodos = incluirTrafegoTeste
      ? projetosTodosRaw
      : excluirProjetosDeTeste(projetosTodosRaw, usuariosAuth.idsExcluidos)

    const pipelineLab = montarPipelineLab({
      emailsInteresse: semDono(interesseLab.interesse),
      emailsConvidados: semDono(interesseLab.convidados),
      emailsComConta: usuariosAuth.emailsComConta,
      projetos: projetosTodos,
    })

    return NextResponse.json({
      janela,
      dataCorte,
      incluirTrafegoTeste,
      desde: janelaAtual.desde,
      ate: janelaAtual.ate,
      numeros,
      funis,
      // ISSUE-318C — topo do funil (direcional) + dropout por pergunta (exato).
      pageviewsHome,
      dropout,
      origem,
      serie,
      leadsUnicosTotal: contarLeadsUnicos(leadsAtual),
      quemChega,
      oQueDoi,
      matriz,
      lab: {
        pipeline: pipelineLab,
        statusProjetos: rotularDistribuicao(
          montarDistribuicao(projetosTodos.map((p) => p.status)),
          rotuloStatusProjeto,
        ),
        progressao: calcularProgressaoChecklist(projetosTodos),
        fases: montarDropoutFases(projetosTodos),
        guias: aberturasGuias,
      },
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
