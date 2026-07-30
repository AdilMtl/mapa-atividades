// =============================================================================
// ADMIN — agregações puras do painel de Analytics (ISSUE-318A)
// Zero I/O, zero Supabase, zero Date.now() implícito — tudo recebe os dados já
// buscados e a data "agora" como parâmetro, para ser 100% testável com fixtures
// (mesmo padrão dos motores em lib/radar e lib/lab). A rota
// api/admin/analytics/route.ts busca as linhas (com cap + service_role) e chama
// estas funções; os componentes de UI só formatam o que sai daqui.
//
// Decisões travadas na spec (docs/revamp/ISSUE-318A-spec-analytics-admin.md):
// - Contagem de lead SEMPRE por e-mail distinto (radar_leads não tem UNIQUE).
// - Tráfego de teste do dono é excluído por e-mail/user_id (não por sessão —
//   sessão anônima sem lead não tem como ser identificada; a data de corte é
//   o instrumento honesto pra isso, não esta função).
// - Percentual sem N absoluto é desinformação — os tipos aqui sempre carregam
//   o N junto; a UI decide como renderizar.
// =============================================================================

import type { RadarKind } from '@/lib/radar/types'

// ----------------------------------------------------------------------------
// Formas de entrada (linhas já lidas do banco, mapeadas para camelCase)
// ----------------------------------------------------------------------------

export interface RadarSessaoLinha {
  id: string
  kind: RadarKind
  createdAt: string
  completedAt: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

export interface RadarLeadLinha {
  email: string
  createdAt: string
  kind: RadarKind
  sessionId: string | null
  labInterest: boolean
}

export interface LabProjetoLinha {
  id: string
  userId: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Janela de tempo (7/28/90/tudo) + data de corte manual
// ----------------------------------------------------------------------------

export type JanelaId = '7' | '28' | '90' | 'tudo'

export const JANELAS: JanelaId[] = ['7', '28', '90', 'tudo']

/**
 * Início efetivo da janela atual: o mais recente entre "N dias atrás" e a data
 * de corte manual (se houver). `null` = sem piso (só acontece com janela
 * 'tudo' e sem corte).
 */
export function calcularDesde(janela: JanelaId, agora: Date, dataCorte: string | null): Date | null {
  const desdeJanela = janela === 'tudo' ? null : new Date(agora.getTime() - Number(janela) * 24 * 60 * 60 * 1000)

  if (!dataCorte) return desdeJanela

  const corte = new Date(`${dataCorte}T00:00:00.000Z`)
  if (Number.isNaN(corte.getTime())) return desdeJanela
  if (!desdeJanela) return corte
  return corte.getTime() > desdeJanela.getTime() ? corte : desdeJanela
}

/**
 * Janela imediatamente anterior, de mesma duração — base da comparação do
 * Bloco 1. `null` quando a janela atual não tem piso (não há "anterior" de
 * "tudo").
 */
export function calcularJanelaAnterior(
  desde: Date | null,
  ate: Date,
): { desde: Date; ate: Date } | null {
  if (!desde) return null
  const duracaoMs = ate.getTime() - desde.getTime()
  if (duracaoMs <= 0) return null
  return { desde: new Date(desde.getTime() - duracaoMs), ate: desde }
}

// ----------------------------------------------------------------------------
// Exclusão do tráfego de teste do dono (§3.1 da spec)
// ----------------------------------------------------------------------------

/** Contas reais do dono usadas em teste em produção — override via env abaixo. */
export const EMAILS_TESTE_PADRAO = ['adilson.matioli@gmail.com', 'adilson.matioli1@gmail.com']

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** `envValue` = `ANALYTICS_EMAILS_EXCLUIDOS` (separados por vírgula); vazio → padrão. */
export function resolverEmailsExcluidos(envValue: string | null | undefined): string[] {
  const lista = envValue?.trim()
    ? envValue.split(',').map(normalizarEmail).filter(Boolean)
    : EMAILS_TESTE_PADRAO.map(normalizarEmail)
  return [...new Set(lista)]
}

export function excluirLeadsDeTeste(leads: RadarLeadLinha[], emailsExcluidos: string[]): RadarLeadLinha[] {
  const excluidos = new Set(emailsExcluidos.map(normalizarEmail))
  return leads.filter((l) => !excluidos.has(normalizarEmail(l.email)))
}

export function excluirProjetosDeTeste(
  projetos: LabProjetoLinha[],
  userIdsExcluidos: string[],
): LabProjetoLinha[] {
  const excluidos = new Set(userIdsExcluidos)
  return projetos.filter((p) => !excluidos.has(p.userId))
}

// ----------------------------------------------------------------------------
// Utilitários exatos × direcionais
// ----------------------------------------------------------------------------

/** Toda contagem de lead usa e-mail distinto — nunca `leads.length`. */
export function contarLeadsUnicos(leads: RadarLeadLinha[]): number {
  return new Set(leads.map((l) => normalizarEmail(l.email))).size
}

export interface AmostraInfo {
  total: number
  lidas: number
  truncada: boolean
}

export function calcularAmostra(total: number, lidas: number): AmostraInfo {
  return { total, lidas, truncada: lidas < total }
}

// ----------------------------------------------------------------------------
// Bloco 1 — Números da janela (com variação vs. janela anterior)
// ----------------------------------------------------------------------------

/** Abaixo disso a variação não é mostrada — degrau é "amostra insuficiente" (§3.3). */
const LIMIAR_N_MINIMO = 20

export interface MetricaJanela {
  valor: number
  /** `null` quando não há N suficiente (atual ou anterior) pra comparar sem mentir. */
  variacaoPct: number | null
}

export function calcularMetrica(valorAtual: number, valorAnterior: number): MetricaJanela {
  const comparavel = valorAtual >= LIMIAR_N_MINIMO && valorAnterior >= LIMIAR_N_MINIMO
  if (!comparavel || valorAnterior === 0) {
    return { valor: valorAtual, variacaoPct: null }
  }
  return {
    valor: valorAtual,
    variacaoPct: Math.round(((valorAtual - valorAnterior) / valorAnterior) * 1000) / 10,
  }
}

export interface NumerosJanela {
  sessoes: MetricaJanela
  conclusoes: MetricaJanela
  leadsUnicos: MetricaJanela
  projetosLab: MetricaJanela
}

export function montarNumerosJanela(input: {
  sessoesAtual: RadarSessaoLinha[]
  sessoesAnterior: RadarSessaoLinha[]
  leadsAtual: RadarLeadLinha[]
  leadsAnterior: RadarLeadLinha[]
  projetosAtual: LabProjetoLinha[]
  projetosAnterior: LabProjetoLinha[]
}): NumerosJanela {
  const concluiu = (s: RadarSessaoLinha[]) => s.filter((x) => x.completedAt !== null).length

  return {
    sessoes: calcularMetrica(input.sessoesAtual.length, input.sessoesAnterior.length),
    conclusoes: calcularMetrica(concluiu(input.sessoesAtual), concluiu(input.sessoesAnterior)),
    leadsUnicos: calcularMetrica(
      contarLeadsUnicos(input.leadsAtual),
      contarLeadsUnicos(input.leadsAnterior),
    ),
    projetosLab: calcularMetrica(input.projetosAtual.length, input.projetosAnterior.length),
  }
}

// ----------------------------------------------------------------------------
// Bloco 2 — Funil dos radares, separado por kind (decisão: Ads)
// ----------------------------------------------------------------------------

export interface DegrauFunil {
  id: string
  rotulo: string
  n: number
  /** % relativo ao topo do funil (degrau "abriu") — sempre com o N absoluto ao lado na UI. */
  pct: number
  direcional: boolean
}

export interface FunilRadar {
  kind: RadarKind
  topo: number
  degraus: DegrauFunil[]
}

export function montarFunilRadar(params: {
  kind: RadarKind
  sessoes: RadarSessaoLinha[]
  leads: RadarLeadLinha[]
  eventoGateViews: number
  eventoLeituraClicks: number
}): FunilRadar {
  const sessoesKind = params.sessoes.filter((s) => s.kind === params.kind)
  const leadsKind = params.leads.filter((l) => l.kind === params.kind)

  const topo = sessoesKind.length
  const concluiu = sessoesKind.filter((s) => s.completedAt !== null).length
  const leadsUnicos = contarLeadsUnicos(leadsKind)
  const pediuLab = contarLeadsUnicos(leadsKind.filter((l) => l.labInterest))

  const pct = (n: number) => (topo > 0 ? Math.round((n / topo) * 1000) / 10 : 0)

  return {
    kind: params.kind,
    topo,
    degraus: [
      { id: 'abriu', rotulo: 'Abriu o radar', n: topo, pct: topo > 0 ? 100 : 0, direcional: false },
      { id: 'concluiu', rotulo: 'Concluiu o radar', n: concluiu, pct: pct(concluiu), direcional: false },
      {
        id: 'viu_gate',
        rotulo: 'Viu o gate de e-mail',
        n: params.eventoGateViews,
        pct: pct(params.eventoGateViews),
        direcional: true,
      },
      { id: 'virou_lead', rotulo: 'Virou lead', n: leadsUnicos, pct: pct(leadsUnicos), direcional: false },
      { id: 'pediu_lab', rotulo: 'Pediu o Lab', n: pediuLab, pct: pct(pediuLab), direcional: false },
      {
        id: 'clicou_leitura',
        rotulo: 'Clicou em leitura/newsletter',
        n: params.eventoLeituraClicks,
        pct: pct(params.eventoLeituraClicks),
        direcional: true,
      },
    ],
  }
}

// ----------------------------------------------------------------------------
// Bloco 3 — Origem do tráfego (decisão: Ads) + série temporal
// ----------------------------------------------------------------------------

export const CHAVE_ORIGEM_DIRETA = 'direto / sem UTM'

function chaveOrigemDeSessao(s: RadarSessaoLinha): string {
  if (!s.utmSource) return CHAVE_ORIGEM_DIRETA
  return [s.utmSource, s.utmMedium ?? '—', s.utmCampaign ?? '—'].join(' / ')
}

export interface LinhaOrigem {
  chave: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  sessoes: number
  conclusoes: number
  pctConclusao: number
  leadsUnicos: number
  leadPorSessaoPct: number | null
}

export function montarOrigemTrafego(sessoes: RadarSessaoLinha[], leads: RadarLeadLinha[]): LinhaOrigem[] {
  const sessaoIdParaChave = new Map<string, string>()
  const grupos = new Map<
    string,
    { utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; sessoes: RadarSessaoLinha[] }
  >()

  for (const s of sessoes) {
    const chave = chaveOrigemDeSessao(s)
    sessaoIdParaChave.set(s.id, chave)
    if (!grupos.has(chave)) {
      grupos.set(chave, { utmSource: s.utmSource, utmMedium: s.utmMedium, utmCampaign: s.utmCampaign, sessoes: [] })
    }
    grupos.get(chave)!.sessoes.push(s)
  }

  const linhas: LinhaOrigem[] = []
  for (const [chave, grupo] of grupos) {
    const sessoesCount = grupo.sessoes.length
    const conclusoes = grupo.sessoes.filter((s) => s.completedAt !== null).length
    const leadsDoGrupo = leads.filter((l) => l.sessionId && sessaoIdParaChave.get(l.sessionId) === chave)
    const leadsUnicos = contarLeadsUnicos(leadsDoGrupo)

    linhas.push({
      chave,
      utmSource: grupo.utmSource,
      utmMedium: grupo.utmMedium,
      utmCampaign: grupo.utmCampaign,
      sessoes: sessoesCount,
      conclusoes,
      pctConclusao: sessoesCount > 0 ? Math.round((conclusoes / sessoesCount) * 1000) / 10 : 0,
      leadsUnicos,
      leadPorSessaoPct: sessoesCount > 0 ? Math.round((leadsUnicos / sessoesCount) * 1000) / 10 : null,
    })
  }

  return linhas.sort((a, b) => b.sessoes - a.sessoes)
}

export interface PontoSerieTemporal {
  data: string
  sessoes: number
  leadsUnicos: number
}

// ----------------------------------------------------------------------------
// Granularidade da série + taxa de conversão por período
// 90 dias viram 90 colunas de ~4px num celular — ilegível e, pior, convida a
// ler ruído como tendência. Acima de ~1 mês a série agrupa por semana (prática
// padrão contra over-plotting).
// ----------------------------------------------------------------------------

export type Granularidade = 'dia' | 'semana'

export function resolverGranularidade(serie: PontoSerieTemporal[]): Granularidade {
  return serie.length > 31 ? 'semana' : 'dia'
}

export interface PontoAgregado {
  /** Chave estável (dia ISO, ou o dia da segunda-feira quando é semana). */
  chave: string
  /** Rótulo curto pra UI: `10/07` ou `06–12/07`. */
  rotulo: string
  sessoes: number
  leadsUnicos: number
  /** `null` quando não houve sessão (evita 0/0 virar 0% e sugerir fracasso). */
  taxaConversaoPct: number | null
  /** N baixo demais pra taxa ser conclusiva (§3.3 da spec) — a UI marca. */
  amostraPequena: boolean
}

/** Segunda-feira da semana de uma data ISO (`AAAA-MM-DD`). */
function inicioDaSemana(dataIso: string): string {
  const d = new Date(`${dataIso}T00:00:00.000Z`)
  const diaDaSemana = d.getUTCDay() // 0 = domingo
  const recuo = diaDaSemana === 0 ? 6 : diaDaSemana - 1
  d.setUTCDate(d.getUTCDate() - recuo)
  return d.toISOString().slice(0, 10)
}

function rotuloDia(dataIso: string): string {
  const [, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}`
}

function rotuloSemana(inicioIso: string): string {
  const fim = new Date(`${inicioIso}T00:00:00.000Z`)
  fim.setUTCDate(fim.getUTCDate() + 6)
  const fimIso = fim.toISOString().slice(0, 10)
  const [, mesInicio, diaInicio] = inicioIso.split('-')
  const [, mesFim, diaFim] = fimIso.split('-')
  // Mesma mês: "06–12/07". Vira o mês: "29/06–05/07".
  return mesInicio === mesFim ? `${diaInicio}–${diaFim}/${mesFim}` : `${diaInicio}/${mesInicio}–${diaFim}/${mesFim}`
}

export function calcularTaxaConversao(
  sessoes: number,
  leadsUnicos: number,
): { taxaConversaoPct: number | null; amostraPequena: boolean } {
  if (sessoes <= 0) return { taxaConversaoPct: null, amostraPequena: true }
  return {
    taxaConversaoPct: Math.round((leadsUnicos / sessoes) * 1000) / 10,
    amostraPequena: sessoes < LIMIAR_N_MINIMO,
  }
}

/**
 * Agrega a série na granularidade pedida e calcula a taxa de conversão de cada
 * ponto. ⚠️ Em `semana`, `leadsUnicos` é a SOMA dos dedupes diários — a mesma
 * pessoa capturada em dois dias da mesma semana conta duas vezes. É uma
 * aproximação assumida (o erro é marginal no volume de beta); a taxa da janela
 * inteira, mostrada em destaque na UI, usa o dedupe real.
 */
export function agregarSerie(
  serie: PontoSerieTemporal[],
  granularidade: Granularidade,
): PontoAgregado[] {
  const baldes = new Map<string, { sessoes: number; leadsUnicos: number }>()

  for (const ponto of serie) {
    const chave = granularidade === 'semana' ? inicioDaSemana(ponto.data) : ponto.data
    const atual = baldes.get(chave) ?? { sessoes: 0, leadsUnicos: 0 }
    atual.sessoes += ponto.sessoes
    atual.leadsUnicos += ponto.leadsUnicos
    baldes.set(chave, atual)
  }

  return [...baldes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, valores]) => ({
      chave,
      rotulo: granularidade === 'semana' ? rotuloSemana(chave) : rotuloDia(chave),
      sessoes: valores.sessoes,
      leadsUnicos: valores.leadsUnicos,
      ...calcularTaxaConversao(valores.sessoes, valores.leadsUnicos),
    }))
}

export function montarSerieTemporal(sessoes: RadarSessaoLinha[], leads: RadarLeadLinha[]): PontoSerieTemporal[] {
  const sessoesPorDia = new Map<string, number>()
  for (const s of sessoes) {
    const dia = s.createdAt.slice(0, 10)
    sessoesPorDia.set(dia, (sessoesPorDia.get(dia) ?? 0) + 1)
  }

  const leadsPorDia = new Map<string, Set<string>>()
  for (const l of leads) {
    const dia = l.createdAt.slice(0, 10)
    if (!leadsPorDia.has(dia)) leadsPorDia.set(dia, new Set())
    leadsPorDia.get(dia)!.add(normalizarEmail(l.email))
  }

  const dias = new Set([...sessoesPorDia.keys(), ...leadsPorDia.keys()])
  return [...dias].sort().map((data) => ({
    data,
    sessoes: sessoesPorDia.get(data) ?? 0,
    leadsUnicos: leadsPorDia.get(data)?.size ?? 0,
  }))
}
