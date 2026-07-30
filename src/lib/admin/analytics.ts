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
  /** Veredito: nível (maturidade) ou tipo de solução (oportunidades). `null` = abandonou. */
  resultKey: string | null
  /**
   * Respostas fechadas (id da pergunta → id da opção). `null` em quem abandonou:
   * o PATCH final é o único que grava (§1 da spec) — daí não existir dropout por
   * pergunta. Blocos 4 e 5 leem SÓ os ids fechados; texto livre nunca entra.
   */
  answers: Record<string, string> | null
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
  /** `rascunho` | `em_construcao` | `concluido` — o status nunca regride (314). */
  status: string
  /** Etapas do checklist já fechadas na Caminhada. 0 quando não há plano. */
  etapasFeitas: number
  /** Total de etapas do plano. 0 = rascunho sem plano gerado. */
  etapasTotal: number
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

// ----------------------------------------------------------------------------
// Distribuições (base dos Blocos 4 e 5) — ISSUE-318A2
// Agregam SEMPRE por id fechado, nunca por rótulo: a copy mora no radar
// (PERGUNTAS_*/CONTEUDO_*) e é injetada por `rotularDistribuicao` — no servidor,
// para não arrastar as centenas de linhas de copy do radar/Lab para o bundle
// do painel. Duplicar rótulo aqui criaria uma segunda fonte da verdade.
// ----------------------------------------------------------------------------

export interface ItemDistribuicao {
  id: string
  n: number
  /** % sobre o total de respostas VÁLIDAS da dimensão (não sobre o total de sessões). */
  pct: number
}

export interface Distribuicao {
  /** Quantas sessões responderam esta dimensão — é o denominador de cada `pct`. */
  total: number
  itens: ItemDistribuicao[]
  /** Itens cortados por `limite` (o "e mais N" da UI). */
  ocultados: number
}

/**
 * Conta ocorrências, ordena por frequência e (opcionalmente) corta no top N.
 * Vazio/nulo não conta como categoria — some do numerador E do denominador,
 * senão "não respondeu" viraria a maior barra da tela.
 * Empate desempata por id, pra ordem não dançar entre dois carregamentos.
 */
export function montarDistribuicao(
  valores: (string | null | undefined)[],
  limite?: number,
): Distribuicao {
  const contagem = new Map<string, number>()
  let total = 0

  for (const bruto of valores) {
    const valor = bruto?.trim()
    if (!valor) continue
    total += 1
    contagem.set(valor, (contagem.get(valor) ?? 0) + 1)
  }

  const todos = [...contagem.entries()]
    .map(([id, n]) => ({ id, n, pct: total > 0 ? Math.round((n / total) * 1000) / 10 : 0 }))
    .sort((a, b) => (b.n !== a.n ? b.n - a.n : a.id.localeCompare(b.id)))

  const itens = limite ? todos.slice(0, limite) : todos
  return { total, itens, ocultados: todos.length - itens.length }
}

function respostaDaSessao(s: RadarSessaoLinha, pergunta: string): string | null {
  return s.answers?.[pergunta] ?? null
}

export interface ItemDistribuicaoRotulado extends ItemDistribuicao {
  rotulo: string
}

export interface DistribuicaoRotulada {
  total: number
  itens: ItemDistribuicaoRotulado[]
  ocultados: number
}

/** Id que sumiu do conteúdo (opção renomeada, dado antigo) volta como o próprio id — some, não mente. */
export function rotularDistribuicao(
  distribuicao: Distribuicao,
  rotular: (id: string) => string | undefined,
): DistribuicaoRotulada {
  return {
    ...distribuicao,
    itens: distribuicao.itens.map((item) => ({ ...item, rotulo: rotular(item.id) ?? item.id })),
  }
}

// ----------------------------------------------------------------------------
// Bloco 4 — Quem chega (decisão: conteúdo)
// ----------------------------------------------------------------------------

export interface QuemChega {
  /** Área de atuação (`op_area`) — radar de oportunidades. */
  area: Distribuicao
  /** Nível de fluência (`result_key`) — radar de maturidade, só quem concluiu. */
  nivelMaturidade: Distribuicao
  /** Tipo de solução recomendado (`result_key`) — radar de oportunidades. */
  tipoRecomendado: Distribuicao
}

export function montarQuemChega(sessoes: RadarSessaoLinha[]): QuemChega {
  const oportunidades = sessoes.filter((s) => s.kind === 'oportunidades')
  const maturidade = sessoes.filter((s) => s.kind === 'maturidade')

  return {
    area: montarDistribuicao(oportunidades.map((s) => respostaDaSessao(s, 'op_area'))),
    nivelMaturidade: montarDistribuicao(maturidade.map((s) => s.resultKey)),
    tipoRecomendado: montarDistribuicao(oportunidades.map((s) => s.resultKey)),
  }
}

// ----------------------------------------------------------------------------
// Bloco 5 — O que dói (decisão: conteúdo)
// ----------------------------------------------------------------------------

/** Top N de cada dimensão editorial — 5 é o corte da spec (§5, Bloco 5). */
export const TOP_DORES = 5

export interface OQueDoi {
  /** Onde perde tempo (`op_perda`). */
  perda: Distribuicao
  /** Entrega principal (`op_entrega`). */
  entrega: Distribuicao
  /** O que quer evoluir (`mat_fronteira`) — o sinal editorial mais direto do banco. */
  fronteira: Distribuicao
}

export function montarOQueDoi(sessoes: RadarSessaoLinha[], limite = TOP_DORES): OQueDoi {
  const oportunidades = sessoes.filter((s) => s.kind === 'oportunidades')
  const maturidade = sessoes.filter((s) => s.kind === 'maturidade')

  return {
    perda: montarDistribuicao(oportunidades.map((s) => respostaDaSessao(s, 'op_perda')), limite),
    entrega: montarDistribuicao(oportunidades.map((s) => respostaDaSessao(s, 'op_entrega')), limite),
    fronteira: montarDistribuicao(maturidade.map((s) => respostaDaSessao(s, 'mat_fronteira')), limite),
  }
}

// ----------------------------------------------------------------------------
// Matriz área × tipo recomendado (Bloco 5)
// Célula com N=1 é anedota — a spec manda não renderizar (§5). O corte não é
// cosmético: é o que impede "Jurídico pede dashboard" nascer de uma pessoa só.
// ----------------------------------------------------------------------------

export const MINIMO_CELULA_MATRIZ = 2

export interface CelulaMatriz {
  area: string
  tipo: string
  n: number
}

export interface CelulaMatrizRotulada extends CelulaMatriz {
  rotuloArea: string
  rotuloTipo: string
}

export interface MatrizAreaTipo {
  celulas: CelulaMatriz[]
  /** Sessões com AS DUAS dimensões preenchidas — a base real do cruzamento. */
  pares: number
  /** Combinações que existiram mas ficaram abaixo do corte (a UI diz quantas sumiram). */
  celulasOcultas: number
}

export function montarMatrizAreaTipo(
  sessoes: RadarSessaoLinha[],
  minimo = MINIMO_CELULA_MATRIZ,
): MatrizAreaTipo {
  const contagem = new Map<string, CelulaMatriz>()
  let pares = 0

  for (const s of sessoes) {
    if (s.kind !== 'oportunidades') continue
    const area = respostaDaSessao(s, 'op_area')?.trim()
    const tipo = s.resultKey?.trim()
    if (!area || !tipo) continue

    pares += 1
    const chave = `${area}|${tipo}`
    const atual = contagem.get(chave)
    if (atual) atual.n += 1
    else contagem.set(chave, { area, tipo, n: 1 })
  }

  const todas = [...contagem.values()]
  const celulas = todas
    .filter((c) => c.n >= minimo)
    .sort((a, b) => (b.n !== a.n ? b.n - a.n : `${a.area}|${a.tipo}`.localeCompare(`${b.area}|${b.tipo}`)))

  return { celulas, pares, celulasOcultas: todas.length - celulas.length }
}

export interface MatrizRotulada {
  celulas: CelulaMatrizRotulada[]
  pares: number
  celulasOcultas: number
}

export function rotularMatriz(
  matriz: MatrizAreaTipo,
  rotularArea: (id: string) => string | undefined,
  rotularTipo: (id: string) => string | undefined,
): MatrizRotulada {
  return {
    ...matriz,
    celulas: matriz.celulas.map((c) => ({
      ...c,
      rotuloArea: rotularArea(c.area) ?? c.area,
      rotuloTipo: rotularTipo(c.tipo) ?? c.tipo,
    })),
  }
}

// ----------------------------------------------------------------------------
// Bloco 6 — Pipeline do Lab (decisão: Lab)
//
// ⚠️ Duas metades com UNIDADES diferentes, de propósito separadas: a primeira
// conta PESSOAS (e-mails), a segunda conta PROJETOS. Empilhar tudo num funil só
// — como a leitura literal da spec sugeria — produziria "120% dos convidados"
// assim que alguém criasse dois projetos. Cada metade tem o próprio topo.
//
// ⚠️ Fonte: TABELAS, não eventos. A spec previa `lab_plan_generated` e
// `lab_step_completed` para os degraus de plano e fase, mas §4.2 é a regra mais
// forte ("degrau com tabela equivalente usa a tabela") — e existe equivalente
// exato: `lab_projects.plan` e o checklist dentro dele. Evento só onde não há
// tabela: guias abertos.
// ----------------------------------------------------------------------------

export interface DegrauPipeline {
  id: string
  rotulo: string
  n: number
  pct: number
  direcional: boolean
}

export interface MetadePipeline {
  topo: number
  degraus: DegrauPipeline[]
}

export interface PipelineLab {
  /** interesse → convidados → contas criadas (unidade: pessoa). */
  pessoas: MetadePipeline
  /** projetos → plano gerado → em construção → concluídos (unidade: projeto). */
  projetos: MetadePipeline
}

function degraus(topo: number, linhas: { id: string; rotulo: string; n: number }[]): DegrauPipeline[] {
  return linhas.map((l) => ({
    ...l,
    pct: topo > 0 ? Math.round((l.n / topo) * 1000) / 10 : 0,
    direcional: false,
  }))
}

export function montarPipelineLab(input: {
  /** E-mails que pediram o Lab (lab_leads + radar_leads.lab_interest), já sem os do dono. */
  emailsInteresse: string[]
  /** E-mails com `authorized_emails.plan_type = 'lab_beta'`. */
  emailsConvidados: string[]
  /** E-mails que já existem em auth.users. */
  emailsComConta: string[]
  projetos: LabProjetoLinha[]
}): PipelineLab {
  const interesse = new Set(input.emailsInteresse.map(normalizarEmail))
  const convidados = new Set(input.emailsConvidados.map(normalizarEmail))
  const comConta = new Set(input.emailsComConta.map(normalizarEmail))

  // Convidado é sempre gente que estava na lista? Não: o dono pode convidar
  // alguém de fora dela. O topo é a UNIÃO — senão o funil mostraria mais
  // convidados que interessados e pareceria bug.
  const topoPessoas = new Set([...interesse, ...convidados]).size
  const convidadosComConta = [...convidados].filter((e) => comConta.has(e)).length

  const comPlano = input.projetos.filter((p) => p.etapasTotal > 0).length
  const emConstrucao = input.projetos.filter(
    (p) => p.status === 'em_construcao' || p.status === 'concluido',
  ).length
  const concluidos = input.projetos.filter((p) => p.status === 'concluido').length

  return {
    pessoas: {
      topo: topoPessoas,
      degraus: degraus(topoPessoas, [
        { id: 'interesse', rotulo: 'Pediu o Lab', n: interesse.size },
        { id: 'convidados', rotulo: 'Convidado pro beta', n: convidados.size },
        { id: 'conta', rotulo: 'Criou conta', n: convidadosComConta },
      ]),
    },
    projetos: {
      topo: input.projetos.length,
      degraus: degraus(input.projetos.length, [
        { id: 'criados', rotulo: 'Projeto criado', n: input.projetos.length },
        { id: 'plano', rotulo: 'Plano gerado', n: comPlano },
        { id: 'construcao', rotulo: 'Entrou em construção', n: emConstrucao },
        { id: 'concluidos', rotulo: 'Concluiu', n: concluidos },
      ]),
    },
  }
}

/** Progressão média do checklist entre os projetos que já têm plano. */
export function calcularProgressaoChecklist(projetos: LabProjetoLinha[]): {
  mediaPct: number | null
  base: number
} {
  const comPlano = projetos.filter((p) => p.etapasTotal > 0)
  if (comPlano.length === 0) return { mediaPct: null, base: 0 }

  const soma = comPlano.reduce((acc, p) => acc + p.etapasFeitas / p.etapasTotal, 0)
  return { mediaPct: Math.round((soma / comPlano.length) * 1000) / 10, base: comPlano.length }
}

export interface FaseCaminhada {
  /** 1-based, na ordem da Caminhada. */
  indice: number
  /** Projetos cujo plano TEM essa fase (planos têm tamanhos diferentes por tipo). */
  elegiveis: number
  /** Projetos que fecharam essa fase. */
  fecharam: number
  pct: number
  /** Projetos que pararam exatamente aqui — a fase é o último gate fechado e o projeto não concluiu. */
  pararamAqui: number
}

/**
 * Dropout por fase da Caminhada. As fases fecham em ordem (gate "fechei essa
 * fase"), então a contagem de itens marcados basta — não é preciso o id da
 * etapa, e o dado sai exato por projeto em vez de direcional por evento.
 */
export function montarDropoutFases(projetos: LabProjetoLinha[]): {
  topo: number
  fases: FaseCaminhada[]
} {
  const comPlano = projetos.filter((p) => p.etapasTotal > 0)
  const maiorPlano = comPlano.reduce((max, p) => Math.max(max, p.etapasTotal), 0)

  const fases: FaseCaminhada[] = []
  for (let indice = 1; indice <= maiorPlano; indice += 1) {
    const elegiveis = comPlano.filter((p) => p.etapasTotal >= indice).length
    const fecharam = comPlano.filter((p) => p.etapasFeitas >= indice).length
    const pararamAqui = comPlano.filter(
      (p) => p.etapasFeitas === indice && p.status !== 'concluido' && p.etapasFeitas < p.etapasTotal,
    ).length

    fases.push({
      indice,
      elegiveis,
      fecharam,
      pct: elegiveis > 0 ? Math.round((fecharam / elegiveis) * 1000) / 10 : 0,
      pararamAqui,
    })
  }

  return { topo: comPlano.length, fases }
}

export interface AberturaGuia {
  slug: string
  n: number
  /** Título do guia — resolvido no servidor (a copy dos guias não vai pro cliente). */
  titulo?: string
}

/** Guias mais abertos — o único número do Bloco 6 que só existe como evento (direcional). */
export function ordenarAberturasGuias(aberturas: AberturaGuia[]): AberturaGuia[] {
  return aberturas
    .filter((a) => a.n > 0)
    .sort((a, b) => (b.n !== a.n ? b.n - a.n : a.slug.localeCompare(b.slug)))
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
