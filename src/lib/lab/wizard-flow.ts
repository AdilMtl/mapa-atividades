// =============================================================================
// LAB — ÁRVORE DO WIZARD v2 "Conversa de Consultor" (ISSUE-313)
// Spec aprovada: docs/revamp/ISSUE-313-spec-wizard.md (v2.1, 2026-07-09).
// Este módulo é a conversa COMO DADO: blocos, roteiro por trilha, textos das
// perguntas, hipóteses por arquétipo e cenas por área. A UI renderiza isto;
// a heurística só consome ids fechados (texto livre nunca classifica — 1A).
// Puro e determinístico, mesmo padrão do motor (sem rede, sem DOM).
// =============================================================================

import { PERGUNTAS_OPORTUNIDADES } from '../radar/oportunidades'
import type {
  AmbienteId,
  ArquetipoId,
  CamposClassificacao,
  PortaEntrada,
} from './types'

// ----------------------------------------------------------------------------
// Labels de opção do radar (fonte única — ids congelados, contrato do types.ts)
// ----------------------------------------------------------------------------

/** id da opção → label aprovado (ISSUE-105). Falha alto se um id sumir do radar. */
export const LABEL_OPCAO: Record<string, string> = Object.fromEntries(
  PERGUNTAS_OPORTUNIDADES.flatMap((p) => p.options.map((o) => [o.id, o.label])),
)

// ----------------------------------------------------------------------------
// Bloco 1 — "Sobre você"
// ----------------------------------------------------------------------------

/** Fluência em linguagem de COMPORTAMENTO (spec 1.1) — mesmos ids `conf_*`. */
export const FLUENCIA_COMPORTAMENTAL: Record<string, string> = {
  conf_baixo: 'Quase nada, tô começando agora',
  conf_medio: 'Uso ChatGPT/Gemini pra textos e ideias',
  conf_bom: 'Escrevo prompts caprichados, com contexto',
  conf_alto: 'Já montei automações ou mini-apps com IA',
  conf_muito_alto: 'Sou eu que ensino os outros',
}

/** Portas de entrada (spec 1.3) — CTAs na 1ª pessoa, nunca função de sistema. */
export const PORTAS: { id: PortaEntrada; label: string }[] = [
  { id: 'ideia', label: 'Já sei o que quero construir' },
  { id: 'dor', label: 'Tem uma tarefa que me consome' },
  { id: 'difusa', label: 'Quero descobrir por onde começar' },
]

// ----------------------------------------------------------------------------
// Bloco 2 — trilha IDEIA: arquétipos e hipóteses (spec §7.2)
// ----------------------------------------------------------------------------

export interface Arquetipo {
  id: ArquetipoId
  label: string
  /** Hipóteses pré-marcadas (2.I3) — corrigíveis com 1 toque, nunca impostas. */
  hipoteses: { entrega: string; perda: string } | null
  /** Ordem de destaque das opções de benefício (2.I2) — todas seguem disponíveis. */
  desejoPrioritario: string[]
}

export const ARQUETIPOS: Arquetipo[] = [
  {
    id: 'arq_painel',
    label: 'Um painel/dashboard pra acompanhar algo',
    hipoteses: { entrega: 'entrega_dashboards', perda: 'perda_consolidando' },
    desejoPrioritario: ['desejo_visualizacao', 'desejo_decisao', 'desejo_compartilhar'],
  },
  {
    id: 'arq_organizador',
    label: 'Um organizador de atividades ou tarefas',
    hipoteses: { entrega: 'entrega_status', perda: 'perda_organizando' },
    desejoPrioritario: ['desejo_tempo', 'desejo_padronizar', 'desejo_compartilhar'],
  },
  {
    id: 'arq_input',
    label: 'Uma tela de input/registro de dados',
    hipoteses: { entrega: 'entrega_planilhas', perda: 'perda_copiando' },
    desejoPrioritario: ['desejo_erro', 'desejo_padronizar', 'desejo_ferramenta'],
  },
  {
    id: 'arq_consolidador',
    label: 'Um consolidador de planilhas',
    hipoteses: { entrega: 'entrega_planilhas', perda: 'perda_consolidando' },
    desejoPrioritario: ['desejo_tempo', 'desejo_erro', 'desejo_automatizar'],
  },
  {
    id: 'arq_assistente',
    label: 'Um assistente de textos ou respostas',
    hipoteses: { entrega: 'entrega_textos', perda: 'perda_revisando' },
    desejoPrioritario: ['desejo_tempo', 'desejo_padronizar', 'desejo_erro'],
  },
  {
    id: 'arq_automatizador',
    label: 'Um automatizador de processo',
    hipoteses: { entrega: 'entrega_processos', perda: 'perda_copiando' },
    desejoPrioritario: ['desejo_automatizar', 'desejo_tempo', 'desejo_erro'],
  },
  {
    // Texto curto vira cor (arquetipo_outro) e a conversa segue a trilha DOR —
    // sem classificar o texto (regra da 1A). O slot de IA da 1B assume aqui.
    id: 'arq_outro',
    label: 'Outra coisa (me conta em uma frase)',
    hipoteses: null,
    desejoPrioritario: [],
  },
]

export const ARQUETIPO_POR_ID: Record<string, Arquetipo> = Object.fromEntries(
  ARQUETIPOS.map((a) => [a.id, a]),
)

// ----------------------------------------------------------------------------
// Bloco 2 — trilhas DOR/DIFUSA: cenas por área
// A pergunta mostra CENAS concretas, não categorias — a pessoa reconhece a
// dela e o id `perda_*` vem junto. Override por área quando temos exemplo
// melhor; fallback genérico caprichado sempre existe (invariante testada).
// ----------------------------------------------------------------------------

export const CENA_GENERICA: Record<string, string> = {
  perda_consolidando: 'Juntar informação de várias fontes pra montar a mesma entrega de sempre',
  perda_copiando: 'Copiar dado de um lugar e colar em outro, de novo e de novo',
  perda_revisando: 'Reescrever e revisar textos até saírem no tom certo',
  perda_apresentacoes: 'Montar apresentação em cima de conteúdo que já existe',
  perda_planilhas: 'Atualizar a mesma planilha na mão, linha por linha',
  perda_duvidas: 'Responder as mesmas perguntas que chegam toda semana',
  perda_buscando: 'Caçar informação que você sabe que existe, mas nunca sabe onde',
  perda_analises: 'Fazer análise na mão pra descobrir o que os números já dizem',
  perda_organizando: 'Organizar tarefas e cobranças espalhadas em mil lugares',
  perda_alinhando: 'Alinhar gente por mensagem, reunião e follow-up sem fim',
}

/** Overrides por área — só onde o exemplo concreto ganha do genérico. */
export const CENA_POR_AREA: Record<string, Partial<Record<string, string>>> = {
  area_vendas: {
    perda_consolidando: 'Juntar números de 3 planilhas pro relatório comercial de segunda-feira',
    perda_duvidas: 'Responder no WhatsApp as mesmas perguntas de preço e prazo',
    perda_copiando: 'Passar pedido do WhatsApp pro CRM, campo por campo',
    perda_alinhando: 'Correr atrás do time pra fechar o forecast do mês',
  },
  area_operacoes: {
    perda_consolidando: 'Consolidar o status de cada frente num report só',
    perda_planilhas: 'Atualizar a planilha de controle que virou o sistema oficial',
    perda_copiando: 'Tirar dado do sistema e recolocar na planilha de controle',
    perda_duvidas: 'Explicar o mesmo procedimento pra cada pessoa nova',
  },
  area_marketing: {
    perda_revisando: 'Ajustar o mesmo texto pro tom da marca em cada canal',
    perda_apresentacoes: 'Montar o report de campanha em slide todo mês',
    perda_analises: 'Cruzar métricas de plataformas diferentes na mão',
    perda_consolidando: 'Juntar resultado de 4 plataformas num report só',
  },
  area_financas: {
    perda_planilhas: 'Alimentar a planilha de fechamento célula por célula',
    perda_consolidando: 'Consolidar os números das áreas no fim do mês',
    perda_analises: 'Explicar a variação do mês caçando linha por linha',
    perda_copiando: 'Migrar extrato/ERP pra planilha de conciliação',
  },
  area_rh: {
    perda_duvidas: 'Responder as mesmas dúvidas de benefícios e férias toda semana',
    perda_organizando: 'Acompanhar cada vaga em planilhas paralelas',
    perda_consolidando: 'Compilar respostas de formulário em relatório de clima',
    perda_alinhando: 'Caçar gestor por e-mail pra fechar avaliação de desempenho',
  },
}

/** Cena a exibir para (área, perda): override quando existe, genérico sempre. */
export function cenaParaArea(area: string | null, perda: string): string {
  const override = area ? CENA_POR_AREA[area]?.[perda] : undefined
  return override ?? CENA_GENERICA[perda]
}

// ----------------------------------------------------------------------------
// Bloco 3 — arsenal (spec 3.3)
// ----------------------------------------------------------------------------

export const AMBIENTES: { id: AmbienteId; label: string }[] = [
  { id: 'amb_ia_gratuita', label: 'ChatGPT/Gemini gratuito' },
  { id: 'amb_ia_premium', label: 'IA premium (GPT Plus, Gemini Advanced…)' },
  { id: 'amb_workspace', label: 'Google Workspace (Sheets, AppScript)' },
  { id: 'amb_copilot', label: 'Copilot/M365 da firma' },
  { id: 'amb_shadow', label: 'Uso IA por conta própria — a firma não liberou' },
]

/** Reação de diligência ativa (dado sensível + shadow) — consultor, na hora. */
export const REACAO_SHADOW_SENSIVEL =
  'Anotado — o plano vai incluir como fazer isso sem subir dado da firma pra tua conta pessoal.'

// ----------------------------------------------------------------------------
// Roteiro — a ordem da conversa por trilha (spec §4)
// ----------------------------------------------------------------------------

export type FormatoEtapa =
  | 'escala'
  | 'chips'
  | 'cards'
  | 'multiselect'
  | 'slider'
  | 'texto'
  | 'confirmacao'
  | 'espelho'
  | 'proposta'

export interface EtapaWizard {
  id: string
  bloco: 1 | 2 | 3 | 4
  formato: FormatoEtapa
  /** Campos do schema v2 que a etapa grava ([] = etapa de apresentação). */
  grava: string[]
  pergunta: string
  apoio?: string
  opcional?: boolean
}

export const NOME_BLOCO: Record<1 | 2 | 3 | 4, string> = {
  1: 'Sobre você',
  2: 'Teu caso',
  3: 'Teu ambiente',
  4: 'Fechamento',
}

const BLOCO_1: EtapaWizard[] = [
  {
    id: 'fluencia',
    bloco: 1,
    formato: 'escala',
    grava: ['conforto'],
    pergunta: 'Pra eu falar tua língua: o quanto você já usa IA hoje?',
  },
  {
    id: 'area',
    bloco: 1,
    formato: 'chips',
    grava: ['area'],
    pergunta: 'Em qual área você atua?',
  },
  {
    id: 'porta',
    bloco: 1,
    formato: 'cards',
    grava: ['porta'],
    pergunta: 'O que te traz aqui hoje?',
  },
]

const BLOCO_2_IDEIA: EtapaWizard[] = [
  {
    id: 'arquetipo',
    bloco: 2,
    formato: 'cards',
    grava: ['arquetipo'],
    pergunta: 'O que você tem em mente?',
  },
  {
    id: 'beneficio',
    bloco: 2,
    formato: 'cards',
    grava: ['desejo'],
    pergunta: 'E o que isso muda no teu dia?',
    apoio: 'É isso que você vai usar pra vender a ideia aí dentro — escolhe o ganho mais real.',
  },
  {
    id: 'confirmacao_rotina',
    bloco: 2,
    formato: 'confirmacao',
    grava: ['entrega', 'perda'],
    pergunta: 'Aposto que teu dia tem bastante disso aqui. Acertei?',
    apoio: 'Hipótese minha pelo que você escolheu — corrige à vontade.',
  },
  {
    id: 'frequencia',
    bloco: 2,
    formato: 'cards',
    grava: ['frequencia'],
    pergunta: 'E a tarefa que isso resolve — acontece com que frequência?',
  },
  {
    id: 'horas',
    bloco: 2,
    formato: 'slider',
    grava: ['horas_semana'],
    pergunta: 'Chutando baixo: quanto tempo isso come por semana?',
    opcional: true,
  },
]

const BLOCO_2_DOR: EtapaWizard[] = [
  {
    id: 'cena',
    bloco: 2,
    formato: 'cards',
    grava: ['perda'],
    pergunta: 'Qual dessas cenas é a tua?',
  },
  {
    id: 'entrega',
    bloco: 2,
    formato: 'cards',
    grava: ['entrega'],
    pergunta: 'E essa tarefa produz o quê no final?',
  },
  {
    id: 'beneficio',
    bloco: 2,
    formato: 'cards',
    grava: ['desejo'],
    pergunta: 'Se ela sumir da tua semana, o que você ganha primeiro?',
    apoio: 'É isso que você vai usar pra vender a ideia aí dentro — escolhe o ganho mais real.',
  },
  {
    id: 'frequencia',
    bloco: 2,
    formato: 'cards',
    grava: ['frequencia'],
    pergunta: 'Ela acontece com que frequência?',
  },
  {
    id: 'horas',
    bloco: 2,
    formato: 'slider',
    grava: ['horas_semana'],
    pergunta: 'Chutando baixo: quanto tempo ela come por semana?',
    opcional: true,
  },
]

/** DIFUSA = mecânica da DOR com abertura exploratória (spec §4). */
const BLOCO_2_DIFUSA: EtapaWizard[] = [
  {
    ...BLOCO_2_DOR[0],
    pergunta: 'Pensa na tua última semana de trabalho. Qual dessas cenas te soa familiar?',
  },
  ...BLOCO_2_DOR.slice(1),
]

const BLOCO_3: EtapaWizard[] = [
  {
    id: 'dado',
    bloco: 3,
    formato: 'cards',
    grava: ['dado'],
    pergunta: 'De onde vem o insumo disso hoje?',
  },
  {
    id: 'publico',
    bloco: 3,
    formato: 'cards',
    grava: ['publico'],
    pergunta: 'Quem usa o resultado além de você?',
  },
  {
    id: 'arsenal',
    bloco: 3,
    formato: 'multiselect',
    grava: ['ambiente'],
    pergunta: 'O que você tem à mão — oficial ou por conta própria?',
  },
]

const BLOCO_4: EtapaWizard[] = [
  {
    id: 'espelho',
    bloco: 4,
    formato: 'espelho',
    grava: ['hipoteses_confirmadas'],
    pergunta: 'Deixa eu ver se entendi teu caso.',
  },
  {
    id: 'relato',
    bloco: 4,
    formato: 'texto',
    grava: ['relato'],
    pergunta: 'Quer registrar o caso do teu jeito?',
    apoio: 'Opcional — vai afinar a conversa quando o assistente chegar.',
    opcional: true,
  },
  // O desempate condicional (spec 4.3) entra AQUI em runtime, quando o motor
  // pedir — ver desempate.ts. Não é etapa fixa do roteiro.
  {
    id: 'titulo_proposta',
    bloco: 4,
    formato: 'proposta',
    grava: ['titulo', 'escolha_tipo', 'desempate'],
    pergunta: 'Teu projeto, teus caminhos.',
  },
]

/** O roteiro completo da conversa para uma trilha. */
export function roteiro(porta: PortaEntrada): EtapaWizard[] {
  const bloco2 =
    porta === 'ideia' ? BLOCO_2_IDEIA : porta === 'dor' ? BLOCO_2_DOR : BLOCO_2_DIFUSA
  return [...BLOCO_1, ...bloco2, ...BLOCO_3, ...BLOCO_4]
}

// ----------------------------------------------------------------------------
// Título sugerido (spec 4.4) — nunca campo vazio obrigatório
// ----------------------------------------------------------------------------

const NOME_CURTO_AREA: Record<string, string> = {
  area_vendas: 'de vendas',
  area_operacoes: 'de operações',
  area_cx: 'de atendimento',
  area_marketing: 'de marketing',
  area_produto: 'de produto',
  area_estrategia: 'de estratégia',
  area_rh: 'de RH',
  area_financas: 'de finanças',
  area_juridico: 'do jurídico',
  area_estudante: 'dos estudos',
  area_empreendedor: 'do negócio',
}

const NOME_ARQUETIPO: Record<string, string> = {
  arq_painel: 'Painel',
  arq_organizador: 'Organizador',
  arq_input: 'Registro',
  arq_consolidador: 'Consolidador',
  arq_assistente: 'Assistente',
  arq_automatizador: 'Automatizador',
  arq_outro: 'Projeto',
}

const TITULO_POR_PERDA: Record<string, string> = {
  perda_consolidando: 'Fim da consolidação manual',
  perda_copiando: 'Adeus copia-e-cola',
  perda_revisando: 'Texto no tom de primeira',
  perda_apresentacoes: 'Apresentação sem madrugada',
  perda_planilhas: 'Planilha que se atualiza',
  perda_duvidas: 'Respostas sem repetição',
  perda_buscando: 'Informação no lugar certo',
  perda_analises: 'Análise sem trabalho braçal',
  perda_organizando: 'Tudo num lugar só',
  perda_alinhando: 'Alinhamento sem follow-up infinito',
}

/** Título determinístico a partir do que a pessoa escolheu — editável na UI. */
export function sugerirTitulo(dados: {
  porta: PortaEntrada
  arquetipo?: string
  area?: string | null
  perda?: string
}): string {
  if (dados.porta === 'ideia' && dados.arquetipo && dados.arquetipo !== 'arq_outro') {
    const nome = NOME_ARQUETIPO[dados.arquetipo]
    const area = dados.area ? NOME_CURTO_AREA[dados.area] : undefined
    return area ? `${nome} ${area}` : nome
  }
  if (dados.perda && TITULO_POR_PERDA[dados.perda]) return TITULO_POR_PERDA[dados.perda]
  return 'Meu projeto no Lab'
}

// ----------------------------------------------------------------------------
// Espelho (spec 4.1) — template com slots. É o FALLBACK do slot de IA #2:
// quando a 1B chegar, a IA redige esta prosa citando as palavras da pessoa;
// até lá, este template segura a experiência.
// ----------------------------------------------------------------------------

/** Manchete por benefício — quantificada quando o slider foi preenchido. */
export function mancheteBeneficio(desejo: string, horasSemana?: number): string {
  if (desejo === 'desejo_tempo' && horasSemana && horasSemana > 0) {
    return `comprar de volta ~${horasSemana}h da tua semana`
  }
  const manchetes: Record<string, string> = {
    desejo_tempo: 'ganhar tempo de volta',
    desejo_erro: 'parar de retrabalhar por erro bobo',
    desejo_padronizar: 'entregar sempre no mesmo nível',
    desejo_visualizacao: 'ver o dado sem montar relatório',
    desejo_decisao: 'decidir mais rápido, com o número na mão',
    desejo_compartilhar: 'deixar de ser o gargalo da informação',
    desejo_automatizar: 'tirar essa tarefa das tuas mãos',
    desejo_ferramenta: 'ter uma ferramenta tua, do teu jeito',
  }
  return manchetes[desejo] ?? 'resolver isso de vez'
}

export interface Espelho {
  manchete: string
  corpo: string
}

/** Espelho do caso (template com slots — determinístico e testável). */
export function montarEspelho(
  dados: CamposClassificacao & { horas_semana?: number; ambiente?: AmbienteId[] },
): Espelho {
  const manchete = `O que você quer: ${mancheteBeneficio(dados.desejo, dados.horas_semana)}.`
  const partes = [
    `Você produz ${LABEL_OPCAO[dados.entrega].toLowerCase()}`,
    `${LABEL_OPCAO[dados.frequencia].toLowerCase()}`,
    `a partir de ${LABEL_OPCAO[dados.dado].toLowerCase()}`,
    `pra ${LABEL_OPCAO[dados.publico].toLowerCase()}`,
  ]
  const horas =
    dados.horas_semana && dados.horas_semana > 0 ? ` (~${dados.horas_semana}h/semana)` : ''
  const incomodo = `O incômodo real: ${(
    CENA_GENERICA[dados.perda] ?? LABEL_OPCAO[dados.perda]
  ).toLowerCase()}${horas}.`
  return { manchete, corpo: `${partes.join(', ')}. ${incomodo}` }
}
