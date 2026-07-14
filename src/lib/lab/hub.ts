// =============================================================================
// LAB — HUB /lab/inicio (ISSUE-315)
// Motor puro (mesma regra do resultado.ts/continuidade.ts): deriva o
// view-model de cada projeto + o estado geral do hub + toda a composição de
// texto do topo "continue de onde parou" a partir do que já existe em
// `lab_projects` (status + plan). Zero rede, zero DOM — a página só renderiza.
// Reaproveita etapaAtual()/minutosRestantes()/formatarDuracaoMin() da 314B/C:
// o "quanto falta" do hub é o MESMO motor de tempo que já roda na Caminhada.
//
// ⚠️ COPY PENDENTE DE VETO DO DONO (norma da casa). Ver
// docs/revamp/ISSUE-315-spec-hub.md para a spec completa.
// =============================================================================

import { etapaAtual, formatarDuracaoMin, minutosRestantes } from './continuidade'
import type { LabChecklistItem, LabPlan, LabPlanEtapa } from './types'

// ----------------------------------------------------------------------------
// View-model por projeto
// ----------------------------------------------------------------------------

/** O que a página lê de `lab_projects` (Server Component, RLS já filtra pelo dono). */
export interface LabProjectRow {
  id: string
  title: string
  status: string
  plan: LabPlan | null
}

const STATUS_EM_ANDAMENTO = new Set(['rascunho', 'planejado', 'em_construcao'])

export interface ProjetoResumo {
  id: string
  titulo: string
  status: string
  /** Etapas marcadas no checklist (0 se rascunho ou plano ainda sem checklist). */
  feitas: number
  /** Total de etapas do plano (0 se rascunho). */
  total: number
  /** 1-based; null quando tudo feito, concluído, ou plano sem etapas. */
  faseAtual: number | null
  /** Soma dos minutos das etapas pendentes; null se tudo feito ou plano sem estimativa (pré-314C). */
  minutosRestantes: number | null
  /** Soma de todas as etapas (ISSUE-314C); null em planos sem estimativa. */
  duracaoTotalMin: number | null
  /** Pra onde o clique leva (§6 da spec — rascunho retoma O PRÓPRIO rascunho via ?id=). */
  href: string
  /** rascunho | planejado | em_construcao — candidato a "continue de onde parou". */
  emAndamento: boolean
}

export function resumirProjeto(row: LabProjectRow): ProjetoResumo {
  const plan = row.plan
  const etapas: LabPlanEtapa[] = plan?.etapas ?? []
  const checklist: LabChecklistItem[] = plan?.checklist ?? []
  const total = etapas.length
  const feitas = checklist.filter((c) => c.done).length
  const atual = etapaAtual(etapas, checklist)

  return {
    id: row.id,
    titulo: row.title,
    status: row.status,
    feitas,
    total,
    faseAtual: atual ? atual.indice + 1 : null,
    minutosRestantes: total > 0 ? minutosRestantes(etapas, checklist) : null,
    duracaoTotalMin: plan?.duracao_total_min ?? null,
    href:
      row.status === 'rascunho' ? `/lab/novo-projeto?id=${row.id}` : `/lab/projeto/${row.id}`,
    emAndamento: STATUS_EM_ANDAMENTO.has(row.status),
  }
}

// ----------------------------------------------------------------------------
// Estado geral do hub (algoritmo do topo)
// ----------------------------------------------------------------------------

export type EstadoHub = 'vazio' | 'tudo_concluido' | 'retomar_rascunho' | 'em_andamento'

export interface HubView {
  estado: EstadoHub
  /** O projeto em destaque no topo — null em 'vazio'/'tudo_concluido'. */
  destaque: ProjetoResumo | null
  /** Todos os projetos (ordem recebida — o caller busca por updated_at desc). */
  projetos: ProjetoResumo[]
}

/**
 * `rows` já deve vir ordenado por `updated_at desc` (query do Server Component)
 * — o destaque é o primeiro projeto em andamento nessa ordem.
 */
export function montarHub(rows: LabProjectRow[]): HubView {
  const projetos = rows.map(resumirProjeto)
  if (projetos.length === 0) {
    return { estado: 'vazio', destaque: null, projetos }
  }

  const destaque = projetos.find((p) => p.emAndamento) ?? null
  if (!destaque) {
    return { estado: 'tudo_concluido', destaque: null, projetos }
  }
  if (destaque.status === 'rascunho') {
    return { estado: 'retomar_rascunho', destaque, projetos }
  }
  return { estado: 'em_andamento', destaque, projetos }
}

// ----------------------------------------------------------------------------
// Nome da pessoa (best-effort — fonte real vem com o Perfil, ISSUE-317)
// ----------------------------------------------------------------------------

interface UsuarioParaNome {
  user_metadata?: Record<string, unknown> | null
  email?: string | null
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/** Só letras (sem dígito) — evita "virar nome" um prefixo de e-mail tipo "joao123". */
const PARECE_NOME = /^[a-zA-ZÀ-ÿ]+$/

export function primeiroNome(user: UsuarioParaNome | null): string | null {
  if (!user) return null

  const candidatosMeta = [
    user.user_metadata?.full_name,
    user.user_metadata?.name,
    user.user_metadata?.nome,
  ]
  for (const candidato of candidatosMeta) {
    if (typeof candidato !== 'string') continue
    const primeiro = candidato.trim().split(/\s+/)[0] ?? ''
    if (primeiro.length >= 2 && PARECE_NOME.test(primeiro)) return capitalizar(primeiro)
  }

  if (user.email) {
    const local = user.email.split('@')[0] ?? ''
    const primeiro = local.split(/[._]/)[0] ?? ''
    if (primeiro.length >= 2 && PARECE_NOME.test(primeiro)) return capitalizar(primeiro)
  }

  return null
}

function sufixoNome(nome: string | null): string {
  return nome ? `, ${nome}` : ''
}

// ----------------------------------------------------------------------------
// Copy do topo "continue de onde parou" (§5.1/§5.2 da spec)
// ----------------------------------------------------------------------------

export type TierHeadline = 'planejado' | 'comecando' | 'quase' | 'fechou_fases'

/** Só faz sentido para destaque não-rascunho (planejado/em_construcao). */
export function tierHeadline(destaque: ProjetoResumo): TierHeadline {
  if (destaque.status === 'planejado') return 'planejado'
  const ratio = destaque.total > 0 ? destaque.feitas / destaque.total : 0
  if (ratio >= 1) return 'fechou_fases'
  if (ratio >= 0.5) return 'quase'
  return 'comecando'
}

const HEADLINE_POR_TIER: Record<TierHeadline, (suf: string) => string> = {
  planejado: (suf) => `Teu plano tá pronto${suf} — agora é tirar do papel.`,
  comecando: (suf) => `Você já começou${suf}. Bora seguir de onde parou.`,
  quase: (suf) => `Falta pouco pra fechar${suf}.`,
  fechou_fases: (suf) => `Você fechou todas as fases${suf} — falta só concluir.`,
}

export interface TopoContent {
  eyebrow: string
  headline: string
  subtexto: string
  /** null = sem barra/meta (estado rascunho, que ainda não tem plano). */
  metaProgresso: string | null
  ctaLabel: string
  href: string
}

/** Meta "X de Y feitas · faltam ~Zmin" — mesma fórmula pro topo e pra lista (§5.4). */
function metaProgressoDe(p: ProjetoResumo): string {
  const tempo = p.minutosRestantes !== null ? formatarDuracaoMin(p.minutosRestantes) : null
  return tempo ? `${p.feitas} de ${p.total} fases feitas · faltam ${tempo}` : `${p.feitas} de ${p.total} fases feitas`
}

export function montarTopo(destaque: ProjetoResumo, nome: string | null): TopoContent {
  const suf = sufixoNome(nome)

  if (destaque.status === 'rascunho') {
    return {
      eyebrow: 'VOCÊ COMEÇOU E PAROU',
      headline: `Teu diagnóstico ficou pela metade${suf}.`,
      subtexto:
        `Você começou a mapear o "${destaque.titulo}" e parou antes de eu fechar o ` +
        'diagnóstico. O Lab guardou tudo — é só voltar de onde você deixou.',
      metaProgresso: null,
      ctaLabel: 'Terminar o diagnóstico →',
      href: destaque.href,
    }
  }

  const tier = tierHeadline(destaque)
  const tempo = destaque.minutosRestantes !== null ? formatarDuracaoMin(destaque.minutosRestantes) : null

  let subtexto: string
  let ctaLabel: string
  if (tier === 'planejado') {
    subtexto =
      `O "${destaque.titulo}" tem ${destaque.total} fases prontas pra sair do papel. ` +
      'Começa quando quiser — o primeiro passo já tá te esperando.'
    ctaLabel = 'Começar a construir →'
  } else if (tier === 'fechou_fases') {
    subtexto = `Você já fechou todas as ${destaque.total} fases do "${destaque.titulo}". Falta só o último passo: concluir e ver o resultado.`
    ctaLabel = 'Concluir o projeto →'
  } else {
    subtexto = tempo
      ? `O "${destaque.titulo}" parou na fase ${destaque.faseAtual} de ${destaque.total}. ` +
        `Retoma de onde você deixou — daqui a ${tempo} de foco ele sai do plano e vira coisa ` +
        'que você usa no trabalho.'
      : `O "${destaque.titulo}" parou na fase ${destaque.faseAtual} de ${destaque.total}. Retoma de onde você deixou e segue construindo.`
    ctaLabel = 'Voltar pro projeto →'
  }

  return {
    eyebrow: 'CONTINUE DE ONDE PAROU',
    headline: HEADLINE_POR_TIER[tier](suf),
    subtexto,
    metaProgresso: metaProgressoDe(destaque),
    ctaLabel,
    href: destaque.href,
  }
}

// ----------------------------------------------------------------------------
// Copy da lista "Teus projetos" (§5.4)
// ----------------------------------------------------------------------------

const BADGE_POR_STATUS: Record<string, string> = {
  rascunho: 'em rascunho',
  planejado: 'plano pronto',
  em_construcao: 'construindo',
  concluido: 'concluído',
}

export function badgeStatus(status: string): string {
  return BADGE_POR_STATUS[status] ?? 'plano pronto'
}

export function metaLinha(p: ProjetoResumo): string {
  switch (p.status) {
    case 'rascunho':
      return 'diagnóstico pela metade · retomar'
    case 'em_construcao': {
      const tempo = p.minutosRestantes !== null ? formatarDuracaoMin(p.minutosRestantes) : null
      return tempo ? `${p.feitas}/${p.total} fases · faltam ${tempo}` : `${p.feitas}/${p.total} fases`
    }
    case 'concluido':
      return 'concluído'
    case 'planejado':
    default: {
      const tempo = p.duracaoTotalMin !== null ? formatarDuracaoMin(p.duracaoTotalMin) : null
      return tempo ? `${p.total} fases · ${tempo} de foco` : `${p.total} fases`
    }
  }
}

// ----------------------------------------------------------------------------
// Copy dos estados sem destaque (§5.5/§5.6)
// ----------------------------------------------------------------------------

export function saudacaoVazia(nome: string | null): string {
  return `Bem-vindo ao Lab${sufixoNome(nome)}.`
}

export interface SaudacaoTudoConcluido {
  headline: string
  linha: string
}

export function saudacaoTudoConcluido(nome: string | null, quantidade: number): SaudacaoTudoConcluido {
  const plural = quantidade === 1 ? 'projeto' : 'projetos'
  return {
    headline: `De volta${sufixoNome(nome)}.`,
    linha: `Você já fechou ${quantidade} ${plural} aqui. Quando quiser pegar o próximo problema, é só começar.`,
  }
}
