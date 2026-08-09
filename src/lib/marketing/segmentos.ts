// =============================================================================
// MARKETING — segmentos do painel de Funil (ISSUE-601A)
// Zero I/O aqui: as funções recebem os contatos já buscados de
// `vw_marketing_contatos` (mapeados via `mapContatoRow`) e o lookup de quem já
// recebeu qual template (de `marketing_sends`), e devolvem os 6 segmentos do §4
// da spec. Mesmo padrão de `lib/admin/analytics.ts` — 100% testável com fixtures.
//
// Decisão travada na spec (docs/marketing/ISSUE-601-spec-painel-funil.md):
// - Segmentos são consultas sobre ATRIBUTOS, não uma fase única por contato — um
//   contato pode aparecer em mais de um segmento quando as definições não são
//   logicamente exclusivas entre si (§2 da spec: "as populações se cruzam").
// - Todo segmento exclui descadastrado=true e optin_newsletter=false (§3.3, §3.4).
// =============================================================================

import type { RadarKind } from '@/lib/radar/types'

// ----------------------------------------------------------------------------
// Forma bruta da linha de `vw_marketing_contatos` (snake_case, direto do Supabase)
// ----------------------------------------------------------------------------

export interface ContatoMarketingRow {
  email: string
  nome: string | null
  origem_primaria: 'radar' | 'lab_leads' | 'authorized_emails' | 'conta'
  primeiro_contato_em: string | null
  fez_radar: boolean
  concluiu_radar: boolean
  radar_kind: RadarKind | null
  radar_result: string | null
  radar_em: string | null
  optin_newsletter: boolean
  marcou_interesse_lab: boolean
  esta_autorizado: boolean
  plan_type: string | null
  autorizado_em: string | null
  expira_em: string | null
  tem_conta: boolean
  criou_conta_em: string | null
  ultimo_acesso: string | null
  projetos_count: number
  projetos_concluidos: number
  ultimo_projeto_em: string | null
  ultimo_projeto_aberto_em: string | null
  envios_count: number
  ultimo_envio_em: string | null
  ultimo_contato_em: string | null
  dias_sem_contato: number | null
  descadastrado: boolean
}

// ----------------------------------------------------------------------------
// Forma da aplicação (camelCase)
// ----------------------------------------------------------------------------

export interface ContatoMarketing {
  email: string
  nome: string | null
  origemPrimaria: ContatoMarketingRow['origem_primaria']
  primeiroContatoEm: string | null
  fezRadar: boolean
  concluiuRadar: boolean
  radarKind: RadarKind | null
  radarResult: string | null
  radarEm: string | null
  optinNewsletter: boolean
  marcouInteresseLab: boolean
  estaAutorizado: boolean
  planType: string | null
  autorizadoEm: string | null
  expiraEm: string | null
  temConta: boolean
  criouContaEm: string | null
  ultimoAcesso: string | null
  projetosCount: number
  projetosConcluidos: number
  ultimoProjetoEm: string | null
  ultimoProjetoAbertoEm: string | null
  enviosCount: number
  ultimoEnvioEm: string | null
  ultimoContatoEm: string | null
  diasSemContato: number | null
  descadastrado: boolean
}

export function mapContatoRow(row: ContatoMarketingRow): ContatoMarketing {
  return {
    email: row.email,
    nome: row.nome,
    origemPrimaria: row.origem_primaria,
    primeiroContatoEm: row.primeiro_contato_em,
    fezRadar: row.fez_radar,
    concluiuRadar: row.concluiu_radar,
    radarKind: row.radar_kind,
    radarResult: row.radar_result,
    radarEm: row.radar_em,
    optinNewsletter: row.optin_newsletter,
    marcouInteresseLab: row.marcou_interesse_lab,
    estaAutorizado: row.esta_autorizado,
    planType: row.plan_type,
    autorizadoEm: row.autorizado_em,
    expiraEm: row.expira_em,
    temConta: row.tem_conta,
    criouContaEm: row.criou_conta_em,
    ultimoAcesso: row.ultimo_acesso,
    projetosCount: row.projetos_count,
    projetosConcluidos: row.projetos_concluidos,
    ultimoProjetoEm: row.ultimo_projeto_em,
    ultimoProjetoAbertoEm: row.ultimo_projeto_aberto_em,
    enviosCount: row.envios_count,
    ultimoEnvioEm: row.ultimo_envio_em,
    ultimoContatoEm: row.ultimo_contato_em,
    diasSemContato: row.dias_sem_contato,
    descadastrado: row.descadastrado,
  }
}

// ----------------------------------------------------------------------------
// Os 6 segmentos (§4) — cada um com UM template designado
// ----------------------------------------------------------------------------

export type SegmentoId =
  | 'lead_sem_convite'
  | 'convidado_sem_conta'
  | 'conta_sem_projeto'
  | 'projeto_parado'
  | 'assinante_sem_radar'
  | 'concluiu_projeto'

/** Projeto aberto e parado há mais de N dias (só entre os não concluídos). */
const DIAS_PROJETO_PARADO = 14
/** Card de segmento mostra "há mais de N dias sem qualquer contato" (§4). */
const DIAS_SEM_CONTATO_ALERTA = 14

function diasDesde(iso: string | null, agora: Date): number | null {
  if (!iso) return null
  const ms = agora.getTime() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return null
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

/**
 * `lab_interest=true` no radar e o formulário solto de `/lab` (§3.2, coluna
 * `marcou_interesse_lab`) valem o mesmo sinal de interesse — a Fila unificada
 * atual (`/admin/lab-beta`) já trata as duas origens juntas; o Funil absorve
 * essa tela (§5) e não pode perder gente que só passou pelo formulário solto.
 */
export interface SegmentoDef {
  id: SegmentoId
  rotulo: string
  templateSlug: string
  pertence: (c: ContatoMarketing, agora: Date) => boolean
}

export const SEGMENTOS: SegmentoDef[] = [
  {
    id: 'lead_sem_convite',
    rotulo: 'Lead sem convite',
    templateSlug: 'convite_lab',
    pertence: (c) => (c.fezRadar || c.marcouInteresseLab) && !c.estaAutorizado,
  },
  {
    id: 'convidado_sem_conta',
    rotulo: 'Convidado sem conta',
    templateSlug: 'convidado_nao_entrou',
    pertence: (c) => c.estaAutorizado && !c.temConta,
  },
  {
    id: 'conta_sem_projeto',
    rotulo: 'Conta sem projeto',
    templateSlug: 'primeiro_projeto',
    pertence: (c) => c.temConta && c.projetosCount === 0,
  },
  {
    id: 'projeto_parado',
    rotulo: 'Projeto parado',
    templateSlug: 'retomar_projeto',
    pertence: (c, agora) => {
      if (c.projetosCount === 0 || c.projetosConcluidos >= c.projetosCount) return false
      const dias = diasDesde(c.ultimoProjetoAbertoEm, agora)
      return dias !== null && dias > DIAS_PROJETO_PARADO
    },
  },
  {
    id: 'assinante_sem_radar',
    rotulo: 'Assinante sem radar',
    templateSlug: 'convite_radar',
    // plan_type='lab_beta' é convidado do beta, não assinante — mesmo critério do
    // código já em produção (src/lib/admin.ts / rotina da ISSUE-318).
    pertence: (c) => c.estaAutorizado && c.planType !== 'lab_beta' && !c.fezRadar,
  },
  {
    id: 'concluiu_projeto',
    rotulo: 'Concluiu projeto',
    templateSlug: 'pedido_de_relato',
    pertence: (c) => c.projetosConcluidos >= 1,
  },
]

/** Regra global (§3.3, §3.4): descadastro vence optin; nenhum dos dois passa. */
export function elegivelParaMarketing(c: ContatoMarketing): boolean {
  return !c.descadastrado && c.optinNewsletter
}

export function contatosDoSegmento(
  contatos: ContatoMarketing[],
  segmentoId: SegmentoId,
  agora: Date,
): ContatoMarketing[] {
  const def = SEGMENTOS.find((s) => s.id === segmentoId)
  if (!def) return []
  return contatos.filter((c) => elegivelParaMarketing(c) && def.pertence(c, agora))
}

/** Chave de lookup em `marketing_sends`: e-mail (lower) + slug do template. */
export function chaveEnvio(email: string, templateSlug: string): string {
  return `${email.trim().toLowerCase()}|${templateSlug}`
}

/** Constrói o Set de `chaveEnvio` a partir das linhas de `marketing_sends` (só sucesso). */
export function montarJaReceberam(
  envios: { email: string; template_slug: string; status: string }[],
): Set<string> {
  return new Set(
    envios.filter((e) => e.status === 'enviado').map((e) => chaveEnvio(e.email, e.template_slug)),
  )
}

export interface ResumoSegmento {
  id: SegmentoId
  rotulo: string
  templateSlug: string
  total: number
  semEnvioDesignado: number
  mais14DiasSemContato: number
}

export function resumoSegmento(
  contatos: ContatoMarketing[],
  segmentoId: SegmentoId,
  jaReceberam: Set<string>,
  agora: Date,
): ResumoSegmento {
  const def = SEGMENTOS.find((s) => s.id === segmentoId)
  if (!def) throw new Error(`segmento desconhecido: ${segmentoId}`)

  const membros = contatosDoSegmento(contatos, segmentoId, agora)
  const semEnvio = membros.filter((c) => !jaReceberam.has(chaveEnvio(c.email, def.templateSlug)))
  const semContato = membros.filter(
    (c) => c.diasSemContato !== null && c.diasSemContato > DIAS_SEM_CONTATO_ALERTA,
  )

  return {
    id: def.id,
    rotulo: def.rotulo,
    templateSlug: def.templateSlug,
    total: membros.length,
    semEnvioDesignado: semEnvio.length,
    mais14DiasSemContato: semContato.length,
  }
}

export function montarResumoSegmentos(
  contatos: ContatoMarketing[],
  jaReceberam: Set<string>,
  agora: Date,
): ResumoSegmento[] {
  return SEGMENTOS.map((def) => resumoSegmento(contatos, def.id, jaReceberam, agora))
}
