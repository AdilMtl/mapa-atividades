// =============================================================================
// LAB — DESEMPATE CONDICIONAL (ISSUE-313, spec v2.1 §4.3)
// "Teu caso tá entre dois caminhos — me responde mais uma." Dispara no máximo
// UMA vez, só quando a pontuação do 1º e 2º colocados fica dentro do limiar.
// A pergunta extra é DERIVADA da matriz de pesos (nada escrito à mão por par):
// para o par (A, B), busca-se a opção que mais separa A de B e a que mais
// separa B de A — a escolha binária da pessoa decide o líder. Determinístico,
// transparente e auditável (o registro vai em wizard_answers.desempate).
// =============================================================================

import { MATRIZ_PESOS } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import { LABEL_OPCAO } from './wizard-flow'

/**
 * Diferença de pontos (1º − 2º) que dispara o desempate. Calibrado pela
 * auditoria exaustiva (auditoria.test.ts, 700k combinações): limiar 1
 * dispararia em 56% dos casos ("sistema sempre em dúvida" — quebra a spec);
 * empate EXATO dispara em ~23% — uma pergunta extra só quando o motor está
 * genuinamente indeciso. Margem de 1 ponto segue coberta pelas alternativas
 * fortes na proposta (spec §4.4).
 */
export const LIMIAR_DESEMPATE = 0

/** Ordem editorial usada só para desempatar EMPATE EXATO do par (menor = antes). */
const ORDEM_ESTAVEL: SolutionTypeId[] = [
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

/**
 * Par líder quando a disputa está apertada; null quando o vencedor é claro.
 * O primeiro do par é o líder atual (pontuação maior; empate exato segue a
 * ordem estável do motor — mesma convenção do doc 11 §6).
 */
export function precisaDesempate(
  pontuacao: Record<SolutionTypeId, number>,
): [SolutionTypeId, SolutionTypeId] | null {
  const ranking = [...ORDEM_ESTAVEL].sort((a, b) => pontuacao[b] - pontuacao[a])
  const [lider, vice] = ranking
  return pontuacao[lider] - pontuacao[vice] <= LIMIAR_DESEMPATE ? [lider, vice] : null
}

export interface OpcaoDesempate {
  /** Id da opção do radar (mesmo vocabulário fechado de sempre). */
  opcao: string
  label: string
  /** Tipo que esta escolha declara vencedor. */
  tipo: SolutionTypeId
  /** Quanto esta opção separa o par na matriz — auditável. */
  diferencial: number
}

export interface PerguntaDesempate {
  par: [SolutionTypeId, SolutionTypeId]
  pergunta: string
  opcaoA: OpcaoDesempate
  opcaoB: OpcaoDesempate
}

/** Peso de um tipo numa opção da matriz (ausente = 0). */
function peso(opcao: string, tipo: SolutionTypeId): number {
  return MATRIZ_PESOS[opcao]?.[tipo] ?? 0
}

/**
 * A opção que MAIS separa `aFavor` de `contra` na matriz, ignorando as que a
 * pessoa já escolheu (repetir a escolha dela não traria informação nova).
 * Varredura em ordem alfabética — empate de diferencial resolve estável.
 */
function opcaoMaisDiscriminante(
  aFavor: SolutionTypeId,
  contra: SolutionTypeId,
  excluir: Set<string>,
): OpcaoDesempate | null {
  let melhor: OpcaoDesempate | null = null
  for (const opcao of Object.keys(MATRIZ_PESOS).sort()) {
    if (excluir.has(opcao)) continue
    const diferencial = peso(opcao, aFavor) - peso(opcao, contra)
    if (diferencial <= 0) continue
    if (!melhor || diferencial > melhor.diferencial) {
      melhor = { opcao, label: LABEL_OPCAO[opcao], tipo: aFavor, diferencial }
    }
  }
  return melhor
}

/**
 * Monta a pergunta binária do desempate para o par líder. `jaEscolhidas` são
 * os ids que a pessoa já respondeu na conversa (excluídos da busca). Devolve
 * null quando não há contraste válido — aí NÃO há desempate e os dois tipos
 * seguem para a proposta como alternativas fortes (fallback da spec).
 */
export function perguntaDesempate(
  par: [SolutionTypeId, SolutionTypeId],
  jaEscolhidas: string[] = [],
): PerguntaDesempate | null {
  const excluir = new Set(jaEscolhidas)
  const opcaoA = opcaoMaisDiscriminante(par[0], par[1], excluir)
  const opcaoB = opcaoMaisDiscriminante(par[1], par[0], excluir)
  if (!opcaoA || !opcaoB) return null
  return {
    par,
    pergunta:
      'Teu caso tá entre dois caminhos — me responde mais uma. ' +
      `Se tivesse que escolher UM: “${opcaoA.label}” ou “${opcaoB.label}”?`,
    opcaoA,
    opcaoB,
  }
}

/** O líder declarado pela resposta do desempate. Resposta estranha → mantém o líder atual. */
export function aplicarDesempate(
  pergunta: PerguntaDesempate,
  respostaOpcaoId: string,
): SolutionTypeId {
  if (respostaOpcaoId === pergunta.opcaoB.opcao) return pergunta.opcaoB.tipo
  return pergunta.opcaoA.tipo
}
