// =============================================================================
// LAB — MOTOR DA TRILHA (ISSUE-316, Fatia A)
// Deriva o view-model da biblioteca /lab/biblioteca a partir dos projetos da
// pessoa (lab_projects). Puro — sem rede, sem DOM, sem Supabase (mesma regra de
// hub.ts/continuidade.ts): a página só renderiza o que este motor decidiu.
//
// A biblioteca é o REGISTRO da jornada: cada um dos 9 tipos de solução é um nó
// de uma trilha de complexidade crescente que acende conforme a pessoa constrói.
// 4 estados por nó (conquistado / em construção / ao alcance / horizonte) e um
// mapa de calor por adjacência — o próximo degrau brilha, o horizonte fica
// fosco (prompt nunca revela agente). Os RAMOS de valor brotam dos nós
// concluídos — mas o CONTEÚDO dos ramos é Fatia B; aqui só marcamos o slot
// (`temRamoValor`).
//
// Desbloqueio deriva de `lab_projects` (status + diagnosis.tipo) — zero tabela
// nova, zero estado paralelo. Anti-manipulação: o nó só vira "conquistado" com
// projeto CONCLUÍDO de verdade (spec §6.3 do preparatório).
//
// Spec: docs/revamp/ISSUE-316-spec-tela-trilha.md
// =============================================================================

import { COMPLEXIDADE } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import { guiaAncora } from './materiais'
import type { LabDiagnosis } from './types'

/** Versão do motor — mesma convenção de rastreabilidade dos outros módulos. */
export const TRILHA_VERSION = 'lab-trilha-1.0.0'

/**
 * Ordem da trilha = complexidade crescente (empates pela ordem canônica do
 * radar). É a "escada" que a pessoa sobe um degrau por vez. Confere com
 * `COMPLEXIDADE` (radar/oportunidades.ts): 1,1,2,2,2,3,3,4,5.
 */
export const ORDEM_TRILHA: SolutionTypeId[] = [
  'prompt',
  'template',
  'workflow',
  'automacao',
  'dashboard',
  'app_offline',
  'app_tabela',
  'orquestrado',
  'agentico',
]

/** Nome curto de cada nó (o rótulo na trilha). */
export const NOME_TIPO: Record<SolutionTypeId, string> = {
  prompt: 'Prompt',
  template: 'Template',
  workflow: 'Workflow',
  automacao: 'Automação',
  dashboard: 'Painel',
  app_offline: 'App simples',
  app_tabela: 'App com tabela',
  orquestrado: 'Sistema',
  agentico: 'Agente',
}

export type EstadoNo = 'conquistado' | 'em_construcao' | 'ao_alcance' | 'horizonte'

/** O que a página lê de `lab_projects` (Server Component, RLS filtra pelo dono). */
export interface TrilhaProjectRow {
  id: string
  status: string
  /** Rascunho ainda não tem diagnóstico (logo, não tem tipo) — não conta na trilha. */
  diagnosis: LabDiagnosis | null
}

export interface NoTrilha {
  tipo: SolutionTypeId
  nome: string
  /** Nível de complexidade 1–5 (do motor) — a UI pode mostrar como "degrau". */
  complexidade: number
  estado: EstadoNo
  /** Slug do guia âncora do tipo — pra onde o clique leva (/lab/biblioteca/[slug]). */
  slug: string
  /** true nos nós conquistados: é onde o ramo de valor brota (conteúdo = Fatia B). */
  temRamoValor: boolean
}

export interface TrilhaView {
  nos: NoTrilha[]
  /** Nós conquistados (a barra de progresso: conquistados / total). */
  conquistados: number
  total: number
}

const STATUS_CONCLUIDO = 'concluido'

/**
 * Deriva a trilha a partir dos projetos. Regra dos estados:
 * - **conquistado**: existe projeto CONCLUÍDO daquele tipo.
 * - **em_construcao**: existe projeto daquele tipo com diagnóstico, ainda não concluído.
 * - **ao_alcance**: não alcançado, mas até um degrau à frente da fronteira
 *   (a fronteira = índice mais alto já alcançado). Inclui degraus mais fáceis
 *   que ela ainda não fez (ficam "à mão").
 * - **horizonte**: mais de um degrau à frente — fosco, sem spoiler. Entra no
 *   alcance conforme ela sobe.
 */
export function montarTrilha(rows: TrilhaProjectRow[]): TrilhaView {
  const concluido = new Set<SolutionTypeId>()
  const emConstrucao = new Set<SolutionTypeId>()

  for (const row of rows) {
    const tipo = row.diagnosis?.tipo
    if (!tipo) continue // rascunho / sem diagnóstico não posiciona nada na trilha
    if (row.status === STATUS_CONCLUIDO) concluido.add(tipo)
    else emConstrucao.add(tipo)
  }

  // Fronteira = índice mais alto alcançado (conquistado OU em construção).
  let fronteira = -1
  ORDEM_TRILHA.forEach((tipo, i) => {
    if (concluido.has(tipo) || emConstrucao.has(tipo)) fronteira = i
  })

  const nos: NoTrilha[] = ORDEM_TRILHA.map((tipo, i) => {
    let estado: EstadoNo
    if (concluido.has(tipo)) estado = 'conquistado'
    else if (emConstrucao.has(tipo)) estado = 'em_construcao'
    else if (i <= fronteira + 1) estado = 'ao_alcance' // atrás da fronteira ou o próximo degrau
    else estado = 'horizonte'

    return {
      tipo,
      nome: NOME_TIPO[tipo],
      complexidade: COMPLEXIDADE[tipo],
      estado,
      slug: guiaAncora(tipo).slug,
      temRamoValor: concluido.has(tipo),
    }
  })

  return { nos, conquistados: concluido.size, total: ORDEM_TRILHA.length }
}
