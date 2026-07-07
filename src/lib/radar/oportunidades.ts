// =============================================================================
// RADAR DE OPORTUNIDADES — perguntas + matriz de pesos + motor (ISSUE-104)
// Fonte canônica: docs/revamp/11_motor_radar_pesos_personas.md §3–§8 (aprovado
// pelo dono em 2026-07-06, 7 personas validadas). A matriz abaixo é transcrição
// literal do §4; modificadores/guard-rails do §5; desempate do §6; eixos do
// teaser do §7.1; estimativa de maturidade do §8. Qualquer ajuste de peso volta
// ao doc 11 primeiro — nunca se decide aqui.
// Perguntas/opções literais do doc operacional §11.4, com 2 áreas novas na P1
// (Estudante, Empreendedor — decisão do dono, peso zero como as demais).
// =============================================================================

import type {
  FamilyId,
  MaturityEstimateId,
  OpportunityResult,
  OpportunitySignal,
  RadarAnswers,
  RadarQuestion,
  SolutionTypeId,
  TeaserAxis,
} from './types'

export const TIPOS_SOLUCAO: SolutionTypeId[] = [
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

/** Escala de complexidade (doc 11 §3) — usada em rebaixamentos e desempate. */
export const COMPLEXIDADE: Record<SolutionTypeId, number> = {
  prompt: 1,
  template: 1,
  workflow: 2,
  automacao: 2,
  dashboard: 2,
  app_offline: 3,
  app_tabela: 3,
  orquestrado: 4,
  agentico: 5,
}

/** Ordem fixa do desempate final (doc 11 §6) — menor índice vence. */
const ORDEM_DESEMPATE: SolutionTypeId[] = [
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

/** Famílias em 2 níveis — camada de apresentação (doc 11 §3.1). */
export const FAMILIA_POR_TIPO: Record<
  SolutionTypeId,
  { familia: FamilyId; nivelNaFamilia: 1 | 2 }
> = {
  prompt: { familia: 'conversacao', nivelNaFamilia: 1 },
  template: { familia: 'conversacao', nivelNaFamilia: 2 },
  workflow: { familia: 'fluxo', nivelNaFamilia: 1 },
  automacao: { familia: 'fluxo', nivelNaFamilia: 2 },
  dashboard: { familia: 'visualizacao', nivelNaFamilia: 1 },
  app_offline: { familia: 'construcao', nivelNaFamilia: 1 },
  app_tabela: { familia: 'construcao', nivelNaFamilia: 1 },
  orquestrado: { familia: 'construcao', nivelNaFamilia: 2 },
  agentico: { familia: 'construcao', nivelNaFamilia: 2 },
}

export const PERGUNTAS_OPORTUNIDADES: RadarQuestion[] = [
  {
    // Peso ZERO — personaliza exemplos (ISSUE-105) e segmenta analytics.
    id: 'op_area',
    text: 'Em qual área você atua?',
    scored: false,
    options: [
      { id: 'area_vendas', label: 'Vendas / Comercial' },
      { id: 'area_operacoes', label: 'Operações' },
      { id: 'area_cx', label: 'CX / Atendimento' },
      { id: 'area_marketing', label: 'Marketing' },
      { id: 'area_produto', label: 'Produto' },
      { id: 'area_estrategia', label: 'Estratégia / Business Analysis' },
      { id: 'area_rh', label: 'RH / Pessoas' },
      { id: 'area_financas', label: 'Finanças' },
      { id: 'area_juridico', label: 'Jurídico / Compliance' },
      { id: 'area_estudante', label: 'Estudante' },
      { id: 'area_empreendedor', label: 'Empreendedor / dono de negócio' },
      { id: 'area_outra', label: 'Outra' },
    ],
  },
  {
    id: 'op_entrega',
    text: 'Qual tipo de entrega você mais produz?',
    scored: true,
    options: [
      { id: 'entrega_relatorios', label: 'Relatórios' },
      { id: 'entrega_planilhas', label: 'Planilhas' },
      { id: 'entrega_apresentacoes', label: 'Apresentações' },
      { id: 'entrega_analises', label: 'Análises' },
      { id: 'entrega_textos', label: 'Textos / comunicações' },
      { id: 'entrega_status', label: 'Status reports' },
      { id: 'entrega_dashboards', label: 'Dashboards' },
      { id: 'entrega_processos', label: 'Processos / fluxos' },
      { id: 'entrega_atendimento', label: 'Atendimento / respostas' },
      { id: 'entrega_reunioes', label: 'Reuniões / decisões' },
    ],
  },
  {
    id: 'op_perda',
    text: 'Onde você mais perde tempo?',
    scored: true,
    options: [
      { id: 'perda_consolidando', label: 'Consolidando informação' },
      { id: 'perda_copiando', label: 'Copiando e colando dados' },
      { id: 'perda_revisando', label: 'Revisando textos' },
      { id: 'perda_apresentacoes', label: 'Criando apresentações' },
      { id: 'perda_planilhas', label: 'Atualizando planilhas' },
      { id: 'perda_duvidas', label: 'Respondendo dúvidas repetidas' },
      { id: 'perda_buscando', label: 'Buscando informações' },
      { id: 'perda_analises', label: 'Fazendo análises manuais' },
      { id: 'perda_organizando', label: 'Organizando tarefas' },
      { id: 'perda_alinhando', label: 'Alinhando pessoas' },
    ],
  },
  {
    id: 'op_frequencia',
    text: 'Essa tarefa acontece com que frequência?',
    scored: true,
    options: [
      { id: 'freq_raramente', label: 'Raramente' },
      { id: 'freq_mensal', label: 'Mensalmente' },
      { id: 'freq_semanal', label: 'Semanalmente' },
      { id: 'freq_varias_semana', label: 'Várias vezes por semana' },
      { id: 'freq_diario', label: 'Todos os dias' },
    ],
  },
  {
    id: 'op_publico',
    text: 'O resultado dessa tarefa é usado por quem?',
    scored: true,
    options: [
      { id: 'pub_so_eu', label: 'Só por mim' },
      { id: 'pub_time', label: 'Meu time' },
      { id: 'pub_outra_area', label: 'Outra área' },
      { id: 'pub_lideranca', label: 'Liderança' },
      { id: 'pub_externo', label: 'Cliente / usuário externo' },
    ],
  },
  {
    id: 'op_dado',
    text: 'Que tipo de dado entra nessa tarefa?',
    scored: true,
    options: [
      { id: 'dado_texto_livre', label: 'Texto livre' },
      { id: 'dado_planilha', label: 'Planilha simples' },
      { id: 'dado_sistemas', label: 'Dados de sistemas' },
      { id: 'dado_documentos', label: 'Documentos' },
      { id: 'dado_emails', label: 'E-mails / mensagens' },
      { id: 'dado_sensiveis', label: 'Dados sensíveis' },
      { id: 'dado_nao_sei', label: 'Não sei' },
    ],
  },
  {
    id: 'op_desejo',
    text: 'O que você gostaria que melhorasse?',
    scored: true,
    options: [
      { id: 'desejo_tempo', label: 'Ganhar tempo' },
      { id: 'desejo_erro', label: 'Reduzir erro' },
      { id: 'desejo_padronizar', label: 'Padronizar entrega' },
      { id: 'desejo_visualizacao', label: 'Melhorar visualização' },
      { id: 'desejo_decisao', label: 'Facilitar decisão' },
      { id: 'desejo_compartilhar', label: 'Compartilhar com outras pessoas' },
      { id: 'desejo_automatizar', label: 'Automatizar parte do processo' },
      { id: 'desejo_ferramenta', label: 'Criar uma ferramenta reutilizável' },
    ],
  },
  {
    id: 'op_conforto',
    text: 'Qual seu nível de conforto com ferramentas digitais?',
    scored: true,
    options: [
      { id: 'conf_baixo', label: 'Baixo' },
      { id: 'conf_medio', label: 'Médio' },
      { id: 'conf_bom', label: 'Bom' },
      { id: 'conf_alto', label: 'Alto' },
      { id: 'conf_muito_alto', label: 'Muito alto' },
    ],
  },
]

type Pesos = Partial<Record<SolutionTypeId, number>>

/**
 * MATRIZ DE PESOS — transcrição literal do doc 11 §4.
 * Convenção: dominantes (frequência, dado, público, desejo) usam 2–3;
 * contextuais (entrega, perda de tempo) usam 1–2. Chave = id da opção
 * (globalmente único), valor = pontos por tipo.
 */
export const MATRIZ_PESOS: Record<string, Pesos> = {
  // P4 — Frequência (dominante)
  freq_raramente: { prompt: 3, template: 1 },
  freq_mensal: { prompt: 2, template: 2, workflow: 1 },
  freq_semanal: { template: 2, workflow: 2, dashboard: 1 },
  freq_varias_semana: { workflow: 2, automacao: 2, dashboard: 2, app_tabela: 1 },
  freq_diario: { automacao: 3, app_tabela: 2, dashboard: 2, orquestrado: 1 },

  // P6 — Tipo de dado (dominante)
  dado_texto_livre: { prompt: 3, template: 2, workflow: 1 },
  dado_planilha: { app_tabela: 3, dashboard: 2, automacao: 1 },
  dado_sistemas: { orquestrado: 3, dashboard: 2, automacao: 1, agentico: 2 },
  dado_documentos: { prompt: 2, workflow: 2, template: 1 },
  dado_emails: { workflow: 2, automacao: 2, template: 1 },
  dado_sensiveis: { app_offline: 2, prompt: 1 }, // + modificador §5.1
  dado_nao_sei: {}, // zero — o conteúdo orienta a descobrir; não distorce o scoring

  // P5 — Público da entrega (dominante)
  pub_so_eu: { prompt: 2, app_offline: 2, template: 1 },
  pub_time: { template: 2, dashboard: 2, app_tabela: 2 },
  pub_outra_area: { dashboard: 2, app_tabela: 2, workflow: 1, orquestrado: 1 },
  pub_lideranca: { dashboard: 3, template: 1, app_tabela: 1 },
  pub_externo: { orquestrado: 3, automacao: 1, dashboard: 1, agentico: 2 },

  // P7 — Resultado desejado (dominante)
  desejo_tempo: { automacao: 2, workflow: 2, prompt: 1 },
  desejo_erro: { template: 2, workflow: 2, automacao: 1 },
  desejo_padronizar: { template: 3, workflow: 2 },
  desejo_visualizacao: { dashboard: 3 },
  desejo_decisao: { dashboard: 3, app_offline: 1 },
  desejo_compartilhar: { app_tabela: 2, dashboard: 2, orquestrado: 1 },
  desejo_automatizar: { automacao: 3, workflow: 1, orquestrado: 1, agentico: 1 },
  desejo_ferramenta: { app_tabela: 3, app_offline: 2, orquestrado: 1 },

  // P2 — Tipo de entrega (contextual)
  entrega_relatorios: { template: 1, dashboard: 1 },
  entrega_planilhas: { app_tabela: 1, dashboard: 1 },
  entrega_apresentacoes: { template: 1, prompt: 1 },
  entrega_analises: { prompt: 1, dashboard: 1 },
  entrega_textos: { prompt: 2 },
  entrega_status: { automacao: 1, template: 1 },
  entrega_dashboards: { dashboard: 2 },
  entrega_processos: { workflow: 2 },
  entrega_atendimento: { template: 1, agentico: 2 },
  entrega_reunioes: { prompt: 1, app_offline: 1 },

  // P3 — Perda de tempo (contextual)
  perda_consolidando: { workflow: 1, dashboard: 1 },
  perda_copiando: { automacao: 2 },
  perda_revisando: { prompt: 2 },
  perda_apresentacoes: { template: 2 },
  perda_planilhas: { app_tabela: 2, automacao: 1 },
  perda_duvidas: { template: 1, workflow: 1, agentico: 2 },
  perda_buscando: { workflow: 1, agentico: 2 },
  perda_analises: { dashboard: 1, prompt: 1 },
  perda_organizando: { automacao: 1, app_tabela: 1 },
  perda_alinhando: { template: 1, workflow: 1 },
}

/** §5.1 — Dados sensíveis: penalidade nos tipos que empurram dado pra fora. */
const PENALIDADE_SENSIVEL: Pesos = {
  automacao: -3,
  orquestrado: -3,
  agentico: -3,
  app_tabela: -2,
  workflow: -1,
}

/** §5.2 — Conforto digital: teto de complexidade. */
const TETO_POR_CONFORTO: Record<string, number> = {
  conf_baixo: 2,
  conf_medio: 3,
  conf_bom: Infinity,
  conf_alto: Infinity,
  conf_muito_alto: Infinity,
}

/** §7.1 — Eixos do gráfico radar do teaser (normalizados 0–100). */
const EIXO_REPETICAO: Record<string, number> = {
  freq_raramente: 10,
  freq_mensal: 30,
  freq_semanal: 55,
  freq_varias_semana: 80,
  freq_diario: 100,
}
const EIXO_ESTRUTURA: Record<string, number> = {
  dado_texto_livre: 20,
  dado_documentos: 40,
  dado_emails: 40,
  dado_nao_sei: 50,
  dado_planilha: 70,
  dado_sistemas: 95,
  dado_sensiveis: 50, // não sabemos a forma real do dado
}
const EIXO_ALCANCE: Record<string, number> = {
  pub_so_eu: 15,
  pub_time: 45,
  pub_outra_area: 65,
  pub_lideranca: 80,
  pub_externo: 100,
}
const EIXO_REUSO: Record<string, number> = {
  desejo_tempo: 30,
  desejo_erro: 30,
  desejo_padronizar: 55,
  desejo_visualizacao: 55,
  desejo_decisao: 55,
  desejo_compartilhar: 70,
  desejo_automatizar: 85,
  desejo_ferramenta: 100,
}
const EIXO_AUTONOMIA: Record<string, number> = {
  conf_baixo: 15,
  conf_medio: 40,
  conf_bom: 60,
  conf_alto: 80,
  conf_muito_alto: 100,
}

function eixoCuidado(dadoId: string): number {
  if (dadoId === 'dado_sensiveis') return 100
  if (dadoId === 'dado_sistemas') return 60
  return 25
}

/** §8 — Estimativa leve de maturidade por P8 (quando não há nível real do degrau 1). */
const ESTIMATIVA_POR_CONFORTO: Record<string, MaturityEstimateId> = {
  conf_baixo: 'curioso_usuario',
  conf_medio: 'usuario_operador',
  conf_bom: 'operador',
  conf_alto: 'operador_builder',
  conf_muito_alto: 'builder_referencia',
}

const PERGUNTAS_PONTUADAS = [
  'op_entrega',
  'op_perda',
  'op_frequencia',
  'op_publico',
  'op_dado',
  'op_desejo',
  'op_conforto',
] as const

function validarRespostas(respostas: RadarAnswers): void {
  for (const perguntaId of PERGUNTAS_PONTUADAS) {
    const pergunta = PERGUNTAS_OPORTUNIDADES.find((p) => p.id === perguntaId)!
    const opcaoId = respostas[perguntaId]
    if (!pergunta.options.some((o) => o.id === opcaoId)) {
      throw new Error(`Resposta ausente ou inválida para ${perguntaId}: ${opcaoId}`)
    }
  }
}

function zerarPontuacao(): Record<SolutionTypeId, number> {
  return Object.fromEntries(TIPOS_SOLUCAO.map((t) => [t, 0])) as Record<
    SolutionTypeId,
    number
  >
}

/** Desempate (doc 11 §6): maior pontuação → menor complexidade → ordem fixa. */
function melhorEntre(
  candidatos: SolutionTypeId[],
  pontuacao: Record<SolutionTypeId, number>,
): SolutionTypeId {
  return [...candidatos].sort((a, b) => {
    if (pontuacao[b] !== pontuacao[a]) return pontuacao[b] - pontuacao[a]
    if (COMPLEXIDADE[a] !== COMPLEXIDADE[b]) return COMPLEXIDADE[a] - COMPLEXIDADE[b]
    return ORDEM_DESEMPATE.indexOf(a) - ORDEM_DESEMPATE.indexOf(b)
  })[0]
}

/** Sinais que pesaram: as respostas que mais contribuíram para o tipo vencedor. */
function sinaisDominantes(
  respostas: RadarAnswers,
  vencedor: SolutionTypeId,
): OpportunitySignal[] {
  const contribuicoes: OpportunitySignal[] = []
  for (const perguntaId of PERGUNTAS_PONTUADAS) {
    const opcaoId = respostas[perguntaId]
    const contribuicao = MATRIZ_PESOS[opcaoId]?.[vencedor] ?? 0
    if (contribuicao > 0) contribuicoes.push({ perguntaId, opcaoId, contribuicao })
  }
  return contribuicoes
    .sort((a, b) => b.contribuicao - a.contribuicao)
    .slice(0, 3)
}

/**
 * Motor do Radar de Oportunidades (doc 11 §3–§8). Puro e determinístico:
 * soma aditiva da matriz → penalidade de dado sensível → elegibilidade
 * (teto de conforto + guard-rail do agêntico) → desempate.
 */
export function decidirOportunidade(respostas: RadarAnswers): OpportunityResult {
  validarRespostas(respostas)

  const dadoId = respostas['op_dado']
  const confortoId = respostas['op_conforto']
  const sensivel = dadoId === 'dado_sensiveis'

  // 1. Soma aditiva da matriz (P1 área fica de fora — peso zero).
  const pontuacaoBruta = zerarPontuacao()
  for (const perguntaId of PERGUNTAS_PONTUADAS) {
    const pesos = MATRIZ_PESOS[respostas[perguntaId]] ?? {}
    for (const [tipo, pontos] of Object.entries(pesos)) {
      pontuacaoBruta[tipo as SolutionTypeId] += pontos
    }
  }

  // 2. Modificador §5.1 — dado sensível SEMPRE penaliza (e marca diligência).
  const pontuacao = { ...pontuacaoBruta }
  if (sensivel) {
    for (const [tipo, pena] of Object.entries(PENALIDADE_SENSIVEL)) {
      pontuacao[tipo as SolutionTypeId] += pena
    }
  }

  const vencedorBruto = melhorEntre(TIPOS_SOLUCAO, pontuacaoBruta)
  const vencedorSemTeto = melhorEntre(TIPOS_SOLUCAO, pontuacao)

  // 3. Elegibilidade: teto de conforto (§5.2) + agêntico nunca é entrada (§5.3).
  const teto = TETO_POR_CONFORTO[confortoId]
  const agenticoLiberado =
    (confortoId === 'conf_alto' || confortoId === 'conf_muito_alto') &&
    dadoId === 'dado_sistemas'
  const elegiveis = TIPOS_SOLUCAO.filter((tipo) => {
    if (COMPLEXIDADE[tipo] > teto) return false
    if (tipo === 'agentico' && !agenticoLiberado) return false // rebaixa p/ próximo ≤4
    return true
  })

  const tipo = melhorEntre(elegiveis, pontuacao)

  return {
    kind: 'oportunidades',
    tipo,
    vencedorBruto,
    flags: {
      diligencia: sensivel,
      rebaixadoPorConforto: COMPLEXIDADE[vencedorSemTeto] > teto && tipo !== vencedorSemTeto,
    },
    teaser: {
      familia: FAMILIA_POR_TIPO[tipo].familia,
      nivelNaFamilia: FAMILIA_POR_TIPO[tipo].nivelNaFamilia,
      eixos: montarEixosTeaser(respostas),
      sinais: sinaisDominantes(respostas, tipo),
    },
    gated: true,
    estimativaMaturidade: ESTIMATIVA_POR_CONFORTO[confortoId],
    area: respostas['op_area'] ?? null,
    pontuacao,
    pontuacaoBruta,
  }
}

function montarEixosTeaser(respostas: RadarAnswers): TeaserAxis[] {
  return [
    { id: 'repeticao', label: 'Repetição', valor: EIXO_REPETICAO[respostas['op_frequencia']] },
    { id: 'estrutura', label: 'Estrutura do dado', valor: EIXO_ESTRUTURA[respostas['op_dado']] },
    { id: 'alcance', label: 'Alcance', valor: EIXO_ALCANCE[respostas['op_publico']] },
    { id: 'reuso', label: 'Ambição de reuso', valor: EIXO_REUSO[respostas['op_desejo']] },
    { id: 'cuidado', label: 'Cuidado exigido', valor: eixoCuidado(respostas['op_dado']) },
    { id: 'autonomia', label: 'Autonomia digital', valor: EIXO_AUTONOMIA[respostas['op_conforto']] },
  ]
}
