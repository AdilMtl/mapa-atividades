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
import { montarMarcoTrajetoria, slugRamo, type MarcoView } from './valor'

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

/**
 * "O que é isso" — 1ª pergunta do detalhe do nó (ISSUE-316 Fatia B).
 * Copy aprovada pelo dono em 2026-07-14 (`ISSUE-316-copy-para-aprovacao.md` §3).
 */
export const DESCRICAO_TIPO: Record<SolutionTypeId, string> = {
  prompt: 'Um pedido bem-feito, salvo e reutilizável — sem construir ferramenta nenhuma.',
  template: 'Um molde: a estrutura da entrega congelada, com os campos que mudam marcados.',
  workflow: 'Uma sequência de passos, cada um com o seu material, o seu resultado e o seu pedido pra IA.',
  automacao: 'Uma regra rodando sozinha: quando tal coisa acontece, tal coisa é feita. Sem você no meio.',
  dashboard: 'Uma tela que responde sozinha as três perguntas que te fazem toda semana.',
  app_offline: 'Uma ferramenta que roda no navegador, sem servidor, sem login, sem pedir permissão a ninguém.',
  app_tabela: 'Um app com memória: uma tabela viva por baixo, uma tela por cima.',
  orquestrado: 'Um sistema de verdade, nascido de um recorte pequeno o bastante pra existir.',
  agentico: 'Um sistema que consulta, decide e age — com você definindo onde ele NÃO pode agir sozinho.',
}

/**
 * "Como isso te ajuda" — 2ª pergunta do detalhe do nó. É a pergunta que a pessoa
 * realmente tem ("isso serve pro meu caso?"), e que a Fatia A não respondia.
 */
export const COMO_AJUDA_TIPO: Record<SolutionTypeId, string> = {
  prompt:
    'Quando a tarefa é sempre a mesma e só o conteúdo muda, você para de explicar tudo de novo pra IA a cada rodada.',
  template:
    'Se a entrega tem sempre a mesma cara e você já sabe como ela fica boa, você deixa de montar do zero toda vez.',
  workflow:
    'Quando não é uma tarefa, são cinco disfarçadas de uma — aqui você para de jogar tudo num pedido só e deixar a IA adivinhar.',
  automacao: 'Tira do teu colo a tarefa que chega sempre igual e sempre na hora errada.',
  dashboard:
    'Você para de remontar o mesmo relatório — e a pessoa que pergunta passa a se servir sozinha.',
  app_offline:
    'Quando a tarefa precisa de uma tela de verdade e o dado não precisa ser guardado, você resolve sem depender de TI.',
  app_tabela:
    'Serve quando o problema não é fazer a conta — é que a informação some, se perde ou vive em quinze lugares.',
  orquestrado:
    'Quando tem mais de um tipo de usuário e mais de um fluxo, é o que te impede de passar seis meses desenhando e zero construindo.',
  agentico:
    'Só faz sentido quando as respostas da tua base já são confiáveis. Enquanto forem "mais ou menos", ele espera.',
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
  /** "O que é isso" — 1ª pergunta do detalhe. */
  descricao: string
  /** "Como isso te ajuda" — 2ª pergunta do detalhe (Fatia B). */
  comoAjuda: string
  /** Nível de complexidade 1–5 (do motor) — a UI pode mostrar como "degrau". */
  complexidade: number
  estado: EstadoNo
  /** Slug do guia âncora do tipo — só o nó desbloqueado navega pra leitura. */
  slug: string
  /** true nos nós desbloqueados: é onde o ramo de valor brota. */
  temRamoValor: boolean
  /** Slug do ramo de valor (`valor-<tipo>`) — só faz sentido com `temRamoValor`. */
  slugRamo: string
}

export interface TrilhaView {
  nos: NoTrilha[]
  /** Nós desbloqueados (a barra de progresso: desbloqueados / total). */
  conquistados: number
  total: number
  /** Índice do próximo degrau (o nó a desbloquear em seguida) — null se já chegou ao topo. */
  proximoPassoIndice: number | null
  /** Marco de trajetória (Fatia B) — abre com 3 projetos TERMINADOS, não com 3 tipos. */
  marco: MarcoView
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
  /** Marco conta PROJETOS terminados (não tipos distintos): três projetos do
   *  mesmo tipo também viram hábito. É o que a copy promete. */
  let projetosTerminados = 0

  for (const row of rows) {
    const tipo = row.diagnosis?.tipo
    if (!tipo) continue // rascunho / sem diagnóstico não posiciona nada na trilha
    if (row.status === STATUS_CONCLUIDO) {
      concluido.add(tipo)
      projetosTerminados += 1
    } else {
      emConstrucao.add(tipo)
    }
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
      descricao: DESCRICAO_TIPO[tipo],
      comoAjuda: COMO_AJUDA_TIPO[tipo],
      complexidade: COMPLEXIDADE[tipo],
      estado,
      slug: guiaAncora(tipo).slug,
      temRamoValor: concluido.has(tipo),
      slugRamo: slugRamo(tipo),
    }
  })

  // Próximo degrau = o nó logo acima da fronteira, se ainda existir e não estiver alcançado.
  const proxIdx = fronteira + 1
  const proximoPassoIndice =
    proxIdx < ORDEM_TRILHA.length && nos[proxIdx]!.estado === 'ao_alcance' ? proxIdx : null

  return {
    nos,
    conquistados: concluido.size,
    total: ORDEM_TRILHA.length,
    proximoPassoIndice,
    marco: montarMarcoTrajetoria(projetosTerminados),
  }
}
