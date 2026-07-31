// =============================================================================
// TRIAGEM DE FEEDBACK — funções puras (ISSUE-318E)
// Duas responsabilidades, as duas testadas:
// 1. `formatarFeedbackMarkdown` — o CONTRATO de export (§6.2 da spec). O texto
//    sai daqui e entra em docs/revamp/feedback-inbox.md sem edição; por isso o
//    formato é teste de snapshot, não improviso de render.
// 2. `montarPatchFeedback` — allowlist do que a triagem pode alterar. Mensagem,
//    contexto e user_id são EVIDÊNCIA: imutáveis por design.
// Sem I/O e sem DOM (regra do vitest.config.ts).
// =============================================================================

import {
  ISSUE_REF_MAX,
  NOTAS_MAX,
  STATUS_FEEDBACK,
  type SeveridadeFeedback,
  type StatusFeedback,
  type TipoFeedback,
} from '../feedback/tipos' // relativo: o vitest.config.ts não resolve o alias `@`

export interface ContextoFeedback {
  viewport?: string
  rota_anterior?: string
  utm?: Record<string, string>
  user_agent?: string
  app_version?: string
  logado?: boolean
}

export interface FeedbackLinha {
  id: string
  createdAt: string
  email: string | null
  logado: boolean
  tipo: TipoFeedback
  severidade: SeveridadeFeedback | null
  mensagem: string
  rota: string | null
  contexto: ContextoFeedback | null
  status: StatusFeedback
  notasAdmin: string | null
  issueRef: string | null
}

/**
 * Referência curta e humana pro item. A tabela não tem sequência (o id é UUID),
 * então o `FB-0042` da spec virou os 8 primeiros caracteres do próprio id — que
 * continuam achando a linha no banco (`id::text LIKE 'a1b2c3d4%'`).
 */
export function refCurta(id: string): string {
  return `FB-${id.replace(/-/g, '').slice(0, 8)}`
}

/**
 * Data legível e DETERMINÍSTICA: fixa em São Paulo porque o servidor da Vercel
 * roda em UTC e o dono lê em horário de Brasília. Sem o timeZone explícito, o
 * mesmo feedback sairia com hora diferente dependendo de onde o código rodasse
 * (e o teste de snapshot quebraria por ambiente).
 */
export function dataLegivel(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(data)
  const pegar = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '00'
  return `${pegar('year')}-${pegar('month')}-${pegar('day')} ${pegar('hour')}:${pegar('minute')}`
}

/** Device pelo user agent — o suficiente pra reproduzir, sem parser pesado. */
export function dispositivoDoUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent) return null
  if (/iPhone/i.test(userAgent)) return 'iPhone'
  if (/iPad/i.test(userAgent)) return 'iPad'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac'
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'outro'
}

function quem(linha: FeedbackLinha): string {
  const base = linha.logado ? 'logado' : 'anônimo'
  return linha.email ? `${base} · ${linha.email}` : base
}

function onde(linha: FeedbackLinha): string {
  const contexto = linha.contexto ?? {}
  const pedacos = [
    dispositivoDoUserAgent(contexto.user_agent),
    contexto.viewport?.replace('x', '×'),
    contexto.app_version ? `\`${contexto.app_version}\`` : null,
  ].filter(Boolean)
  return pedacos.length > 0 ? pedacos.join(' · ') : '—'
}

/**
 * Contrato de export (§6.2). Cabe numa issue quase sem edição — é isso que faz
 * o ciclo "testo → registro → a gente executa" fechar sem retranscrição.
 */
export function formatarFeedbackMarkdown(linha: FeedbackLinha): string {
  const classificacao = linha.severidade ? `${linha.tipo}/${linha.severidade}` : linha.tipo
  const rota = linha.rota ? `\`${linha.rota}\`` : '—'
  const citacao = linha.mensagem
    .trim()
    .split('\n')
    .map((trecho) => `> ${trecho}`.trimEnd())
    .join('\n')

  return [
    `### ${refCurta(linha.id)} · ${classificacao} · ${rota}`,
    `**Quando:** ${dataLegivel(linha.createdAt)} · **Quem:** ${quem(linha)} · **Onde:** ${onde(linha)}`,
    '',
    citacao,
    '',
    `**Triagem:** ${linha.notasAdmin?.trim() || '—'} · **Ref:** ${linha.issueRef?.trim() || '—'}`,
  ].join('\n')
}

export function formatarFilaMarkdown(linhas: FeedbackLinha[]): string {
  return linhas.map(formatarFeedbackMarkdown).join('\n\n')
}

export interface PatchFeedback {
  status?: StatusFeedback
  notas_admin?: string | null
  issue_ref?: string | null
}

/**
 * Allowlist da triagem. Só o que está aqui chega no UPDATE — `mensagem`,
 * `contexto`, `user_id`, `email`, `rota` e `created_at` são ignorados
 * silenciosamente, venham eles como vierem no body.
 */
export function montarPatchFeedback(body: unknown): PatchFeedback | null {
  if (!body || typeof body !== 'object') return null
  const fonte = body as Record<string, unknown>
  const patch: PatchFeedback = {}

  if (typeof fonte.status === 'string') {
    if (!STATUS_FEEDBACK.includes(fonte.status as StatusFeedback)) return null
    patch.status = fonte.status as StatusFeedback
  }

  if (typeof fonte.notasAdmin === 'string') {
    const notas = fonte.notasAdmin.trim()
    patch.notas_admin = notas ? notas.slice(0, NOTAS_MAX) : null
  }

  if (typeof fonte.issueRef === 'string') {
    const ref = fonte.issueRef.trim()
    patch.issue_ref = ref ? ref.slice(0, ISSUE_REF_MAX) : null
  }

  return Object.keys(patch).length > 0 ? patch : null
}
