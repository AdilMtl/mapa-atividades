// =============================================================================
// WIZARD DO LAB — DADOS DE APRESENTAÇÃO (ISSUE-313)
// Tudo que a UI precisa além do roteiro do wizard-flow: opções por etapa
// (sempre derivadas do vocabulário congelado do radar — nada duplicado),
// as LINHAS DAS NOTAS DO CONSULTOR (a prosa manuscrita que se escreve à
// esquerda→direita enquanto a pessoa responde) e os cards da proposta.
// Puro: sem DOM, sem rede — testável e reusável.
// =============================================================================

import { CONTEUDO_OPORTUNIDADES, TEASERS_OPORTUNIDADES } from '@/lib/radar/content'
import { PERGUNTAS_OPORTUNIDADES, TIPOS_SOLUCAO } from '@/lib/radar/oportunidades'
import type { SolutionTypeId } from '@/lib/radar/types'
import type { AmbienteId, PortaEntrada } from '@/lib/lab/types'
import {
  ARQUETIPO_POR_ID,
  cenaParaArea,
  FLUENCIA_COMPORTAMENTAL,
  LABEL_OPCAO,
  mancheteBeneficio,
} from '@/lib/lab/wizard-flow'

// ----------------------------------------------------------------------------
// Opções por etapa (vocabulário fechado do radar)
// ----------------------------------------------------------------------------

export interface Opcao {
  id: string
  label: string
  /** Texto de apoio do card (cena concreta, comportamento etc.). */
  detalhe?: string
}

function opcoesDoRadar(perguntaId: string): Opcao[] {
  const pergunta = PERGUNTAS_OPORTUNIDADES.find((p) => p.id === perguntaId)
  return (pergunta?.options ?? []).map((o) => ({ id: o.id, label: o.label }))
}

export const OPCOES_AREA = opcoesDoRadar('op_area')
export const OPCOES_ENTREGA = opcoesDoRadar('op_entrega')
export const OPCOES_FREQUENCIA = opcoesDoRadar('op_frequencia')
export const OPCOES_PUBLICO = opcoesDoRadar('op_publico')
export const OPCOES_DADO = opcoesDoRadar('op_dado')
export const OPCOES_DESEJO = opcoesDoRadar('op_desejo')

/** Escala de fluência (1.1) — labels comportamentais, em ordem crescente. */
export const OPCOES_FLUENCIA: Opcao[] = Object.entries(FLUENCIA_COMPORTAMENTAL).map(
  ([id, label]) => ({ id, label }),
)

/** Cenas da trilha DOR/DIFUSA: a pessoa reconhece a cena, o id `perda_*` vem junto. */
export function opcoesCena(area: string | null): Opcao[] {
  return opcoesDoRadar('op_perda').map((o) => ({
    id: o.id,
    label: cenaParaArea(area, o.id),
  }))
}

/** Benefício (2.I2/2.D3): na trilha IDEIA, os prioritários do arquétipo vêm antes. */
export function opcoesBeneficio(arquetipo?: string): Opcao[] {
  const prioridade = arquetipo ? (ARQUETIPO_POR_ID[arquetipo]?.desejoPrioritario ?? []) : []
  if (prioridade.length === 0) return OPCOES_DESEJO
  const primeiro = prioridade
    .map((id) => OPCOES_DESEJO.find((o) => o.id === id))
    .filter((o): o is Opcao => Boolean(o))
  const resto = OPCOES_DESEJO.filter((o) => !prioridade.includes(o.id))
  return [...primeiro, ...resto]
}

// ----------------------------------------------------------------------------
// Notas do consultor — a prosa manuscrita (protagonista da tela)
// ----------------------------------------------------------------------------

/** O que já foi respondido (superset parcial — o orquestrador guarda assim). */
export interface RespostasParciais {
  porta?: PortaEntrada
  arquetipo?: string
  arquetipo_outro?: string
  relato?: string
  titulo?: string
  area?: string | null
  entrega?: string
  perda?: string
  frequencia?: string
  publico?: string
  dado?: string
  desejo?: string
  conforto?: string
  ambiente?: AmbienteId[]
  horas_semana?: number
  hipoteses_confirmadas?: string[]
  escolha_tipo?: SolutionTypeId
}

export interface LinhaNota {
  /** Estável — é como a UI sabe se a linha é nova, mudou ou saiu. */
  id: string
  texto: string
  /** true = reação do consultor (diligência ativa) — ganha destaque visual. */
  destaque?: boolean
}

const NOTA_FLUENCIA: Record<string, string> = {
  conf_baixo: 'tá começando com IA agora',
  conf_medio: 'já usa IA pra textos e ideias',
  conf_bom: 'escreve prompts caprichados, com contexto',
  conf_alto: 'já montou automações e mini-apps com IA',
  conf_muito_alto: 'é quem ensina os outros por lá',
}

const NOTA_PORTA: Record<PortaEntrada, string> = {
  ideia: 'chegou com uma ideia na cabeça',
  dor: 'tem uma tarefa comendo a semana',
  difusa: 'veio descobrir por onde começar',
}

export const NOTA_AMBIENTE: Record<AmbienteId, string> = {
  amb_ia_gratuita: 'IA gratuita',
  amb_ia_premium: 'IA premium',
  amb_workspace: 'Google Workspace',
  amb_copilot: 'Copilot/M365',
  amb_shadow: 'IA por conta própria',
}

/** Arsenal em uma frase curta (espelho 4.1 e chips de ajuste). */
export function descreverArsenal(ambiente: AmbienteId[] | undefined): string {
  if (!ambiente || ambiente.length === 0) return 'o básico: IA de janela + navegador'
  return ambiente.map((a) => NOTA_AMBIENTE[a]).join(' + ')
}

function baixa(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

/**
 * As notas do caso, na ordem em que a conversa captura. Determinístico:
 * mesmas respostas → mesmas linhas (a animação de escrita é papel da UI).
 */
export function notasDoCaso(r: RespostasParciais): LinhaNota[] {
  const linhas: LinhaNota[] = []
  const nota = (id: string, texto: string, destaque?: boolean) =>
    linhas.push({ id, texto, ...(destaque ? { destaque } : {}) })

  if (r.conforto && NOTA_FLUENCIA[r.conforto]) nota('conforto', NOTA_FLUENCIA[r.conforto])
  if (r.area && LABEL_OPCAO[r.area]) nota('area', `atua em ${baixa(LABEL_OPCAO[r.area])}`)
  if (r.porta) nota('porta', NOTA_PORTA[r.porta])

  if (r.arquetipo === 'arq_outro' && r.arquetipo_outro) {
    nota('arquetipo', `“${r.arquetipo_outro}” — vamos aterrissar isso juntos`)
  } else if (r.arquetipo && ARQUETIPO_POR_ID[r.arquetipo]) {
    nota('arquetipo', `quer construir ${baixa(ARQUETIPO_POR_ID[r.arquetipo].label)}`)
  }

  if (r.desejo) nota('desejo', `o que busca: ${mancheteBeneficio(r.desejo)}`)
  if (r.perda) {
    nota('perda', `o incômodo real: ${baixa(cenaParaArea(r.area ?? null, r.perda))}`)
  }
  if (r.entrega && LABEL_OPCAO[r.entrega]) {
    nota('entrega', `no fim, sai: ${baixa(LABEL_OPCAO[r.entrega])}`)
  }
  if (r.frequencia && LABEL_OPCAO[r.frequencia]) {
    nota('frequencia', `acontece: ${baixa(LABEL_OPCAO[r.frequencia])}`)
  }
  if (typeof r.horas_semana === 'number' && r.horas_semana > 0) {
    nota('horas', `~${r.horas_semana}h${r.horas_semana >= 10 ? '+' : ''} por semana nisso`)
  }
  if (r.dado && LABEL_OPCAO[r.dado]) nota('dado', `insumo: ${baixa(LABEL_OPCAO[r.dado])}`)
  if (r.publico && LABEL_OPCAO[r.publico]) {
    nota('publico', `quem usa: ${baixa(LABEL_OPCAO[r.publico])}`)
  }

  if (r.ambiente) {
    const arsenal =
      r.ambiente.length > 0
        ? r.ambiente.map((a) => NOTA_AMBIENTE[a]).join(' + ')
        : 'o básico que todo mundo alcança: IA de janela + navegador'
    nota('ambiente', `arsenal: ${arsenal}`)
    if (r.ambiente.includes('amb_shadow') && r.dado === 'dado_sensiveis') {
      nota('shadow', 'atenção: dado da firma não sobe pra conta pessoal', true)
    }
  }

  if (r.relato) {
    const curto = r.relato.length > 80 ? `${r.relato.slice(0, 77)}…` : r.relato
    nota('relato', `nas palavras da pessoa: “${curto}”`)
  }

  return linhas
}

// ----------------------------------------------------------------------------
// Proposta assistida (4.4) — cards no formato consultor
// ----------------------------------------------------------------------------

/** Nome curto de cada tipo (coerente com os labels de família do content.ts). */
export const NOME_TIPO: Record<SolutionTypeId, string> = {
  prompt: 'Prompt estruturado',
  template: 'Template reutilizável / GPT personalizado',
  workflow: 'Workflow assistido',
  automacao: 'Automação que roda sozinha',
  dashboard: 'Dashboard automático',
  app_offline: 'App pessoal, sem backend',
  app_tabela: 'App conectado a uma planilha',
  orquestrado: 'Sistema orquestrado',
  agentico: 'Sistema com agentes',
}

export interface CardProposta {
  tipo: SolutionTypeId
  nome: string
  familiaLabel: string
  /** Por que serve pro TEU caso (frase de direção do radar). */
  porque: string
  /** Versão de corredor pra começar — alcançável com qualquer arsenal. */
  corredor: string
  /** Pode evoluir para (nível acima da família). */
  evoluiPara: string
}

function cardDoTipo(tipo: SolutionTypeId): CardProposta {
  const teaser = TEASERS_OPORTUNIDADES[tipo]
  const conteudo = CONTEUDO_OPORTUNIDADES[tipo]
  return {
    tipo,
    nome: NOME_TIPO[tipo],
    familiaLabel: teaser.familiaLabel,
    porque: teaser.fraseDirecao,
    corredor: conteudo.naPratica.comeceAssim,
    evoluiPara: conteudo.naPratica.umNivelAcima,
  }
}

/**
 * Proposta + alternativas: o líder (pós-desempate, quando houve) primeiro e
 * os 2 melhores colocados seguintes da pontuação (ordem estável do motor).
 */
export function cardsProposta(
  lider: SolutionTypeId,
  pontuacao: Record<SolutionTypeId, number>,
): CardProposta[] {
  const alternativas = [...TIPOS_SOLUCAO]
    .filter((t) => t !== lider)
    .sort((a, b) => pontuacao[b] - pontuacao[a])
    .slice(0, 2)
  return [lider, ...alternativas].map(cardDoTipo)
}
