// =============================================================================
// LAB — PERFIL DO BUILDER (ISSUE-317)
// Vocabulário fechado + sanitização de `lab_profiles`. Mesma postura das rotas
// de projeto (validacao.ts): id fora do vocabulário nunca entra no banco.
// `role_area` reusa os IDs do radar (op_area); `ai_fluency_level` reusa os IDs
// da maturidade (MaturityLevelId); `tools_used` espelha o `ambiente[]` do
// wizard (decisão da pergunta 16, 00b_open_questions.md) — vocabulário único,
// nada duplicado à mão. Puro — sem rede, sem DOM, testável em vitest.
// =============================================================================

import { PERGUNTAS_OPORTUNIDADES } from '../radar/oportunidades'
import type { MaturityLevelId } from '../radar/types'
import type { AmbienteId } from './types'
import { AMBIENTES } from './wizard-flow'

export interface Opcao {
  id: string
  label: string
}

function opcoesDoRadar(perguntaId: string): Opcao[] {
  const pergunta = PERGUNTAS_OPORTUNIDADES.find((p) => p.id === perguntaId)
  return (pergunta?.options ?? []).map((o) => ({ id: o.id, label: o.label }))
}

export const OPCOES_AREA: Opcao[] = opcoesDoRadar('op_area')

/** Sem equivalente no radar — vocabulário novo, só do Perfil. */
export const OPCOES_SENIORIDADE: Opcao[] = [
  { id: 'junior', label: 'Júnior / estagiário(a)' },
  { id: 'pleno', label: 'Pleno' },
  { id: 'senior', label: 'Sênior / especialista' },
  { id: 'lideranca', label: 'Liderança (coordenação, gerência)' },
  { id: 'executivo', label: 'Diretoria / C-level' },
]

/** Mesmos IDs/ordem do radar de maturidade — nomes de `content.ts` (CONTEUDO_MATURIDADE). */
export const OPCOES_FLUENCIA: { id: MaturityLevelId; label: string }[] = [
  { id: 'curioso', label: 'Curioso' },
  { id: 'usuario', label: 'Usuário' },
  { id: 'operador', label: 'Operador' },
  { id: 'builder', label: 'Builder' },
  { id: 'referencia', label: 'Referência' },
]

/** Espelho do arsenal do wizard (`ambiente[]`) — mesmos IDs, mesmos labels. */
export const OPCOES_FERRAMENTAS = AMBIENTES

const AREA_VALIDAS = new Set(OPCOES_AREA.map((o) => o.id))
const SENIORIDADE_VALIDAS = new Set(OPCOES_SENIORIDADE.map((o) => o.id))
const FLUENCIA_VALIDAS = new Set(OPCOES_FLUENCIA.map((o) => o.id))
const FERRAMENTAS_VALIDAS = new Set<string>(AMBIENTES.map((a) => a.id))
export const ORIGENS_VALIDAS = ['workshop', 'radar', 'direto'] as const
export type OrigemPerfil = (typeof ORIGENS_VALIDAS)[number]

const MAX_TEXTO_LIVRE = 500 // lab_profiles.main_goal/biggest_bottleneck são TEXT — sem limite no DB, mas evita abuso

export interface PerfilBuilder {
  role_area: string | null
  seniority: string | null
  ai_fluency_level: MaturityLevelId | null
  main_goal: string | null
  biggest_bottleneck: string | null
  tools_used: AmbienteId[]
  /** Só é gravado na criação — a rota nunca sobrescreve origin em update. */
  origin: OrigemPerfil
}

function idOuNulo<T extends string>(valor: unknown, vocabulario: Set<string>): T | null {
  return typeof valor === 'string' && vocabulario.has(valor) ? (valor as T) : null
}

function textoOuNulo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const limpo = valor.trim().slice(0, MAX_TEXTO_LIVRE)
  return limpo.length > 0 ? limpo : null
}

function ferramentasValidas(valor: unknown): AmbienteId[] {
  if (!Array.isArray(valor)) return []
  return [...new Set(valor)].filter(
    (v): v is AmbienteId => typeof v === 'string' && FERRAMENTAS_VALIDAS.has(v),
  )
}

/** Sanitiza o payload do formulário — nunca lança; vocabulário inválido vira null/[]. */
export function sanitizarPerfil(payload: unknown): PerfilBuilder {
  const bruto = (payload ?? {}) as Record<string, unknown>
  return {
    role_area: idOuNulo(bruto.role_area, AREA_VALIDAS),
    seniority: idOuNulo(bruto.seniority, SENIORIDADE_VALIDAS),
    ai_fluency_level: idOuNulo<MaturityLevelId>(bruto.ai_fluency_level, FLUENCIA_VALIDAS),
    main_goal: textoOuNulo(bruto.main_goal),
    biggest_bottleneck: textoOuNulo(bruto.biggest_bottleneck),
    tools_used: ferramentasValidas(bruto.tools_used),
    origin: idOuNulo<OrigemPerfil>(bruto.origin, new Set(ORIGENS_VALIDAS)) ?? 'direto',
  }
}
