// =============================================================================
// RADAR DE MATURIDADE — perguntas + scoring (ISSUE-104)
// Fonte canônica: docs/revamp/11_motor_radar_pesos_personas.md §2 (aprovado
// 2026-07-06). P1/P3/P5/P7 são as versões sutis mapeadas à AI Fluency; P2/P4/P6
// são as originais do doc operacional §10.5; P8 não pontua (personaliza).
// Escala: cada resposta vale 1–5 (posição na escada) · total 7–35 · faixas
// literais do doc operacional §10.6.
// =============================================================================

import type {
  MaturityAxis,
  MaturityLevelId,
  MaturityResult,
  RadarAnswers,
  RadarQuestion,
} from './types'

/** Gera as 5 opções de uma pergunta pontuada (score = posição 1–5). */
function escada(perguntaId: string, labels: [string, string, string, string, string]) {
  return labels.map((label, i) => ({
    id: `${perguntaId}_${i + 1}`,
    label,
    score: i + 1,
  }))
}

export const PERGUNTAS_MATURIDADE: RadarQuestion[] = [
  {
    id: 'mat_delegacao',
    text: 'Pense na sua última semana de trabalho. Qual frase soa mais como você?',
    scored: true,
    options: escada('mat_delegacao', [
      'IA ainda não entrou de verdade na minha rotina',
      'Usei IA em momentos pontuais, quando lembrei',
      'Usei IA nas tarefas que se repetem toda semana',
      'Várias entregas minhas já começam pela IA',
      'Escolho conscientemente o que fica comigo e o que vai para a IA',
    ]),
  },
  {
    id: 'mat_amplitude',
    text: 'Para que você mais usa IA hoje?',
    scored: true,
    options: escada('mat_amplitude', [
      'Curiosidade e testes',
      'Textos, resumos e ideias',
      'Análises e apoio à decisão',
      'Processos recorrentes e tarefas repetitivas',
      'Construção de ferramentas, apps ou fluxos',
    ]),
  },
  {
    id: 'mat_descricao',
    text: "Quando a resposta da IA vem 'mais ou menos', o que você costuma fazer?",
    scored: true,
    options: escada('mat_descricao', [
      'Desisto e faço manualmente',
      'Tento perguntar de outro jeito, no improviso',
      'Acrescento contexto e exemplos até melhorar',
      'Tenho um jeito próprio de estruturar pedidos que costuma funcionar de primeira',
      'Meus prompts viram padrão que outras pessoas reutilizam',
    ]),
  },
  {
    id: 'mat_construcao',
    text: 'Você já criou alguma ferramenta, dashboard, app ou automação com apoio de IA?',
    scored: true,
    options: escada('mat_construcao', [
      'Não',
      'Só testei',
      'Sim, algo simples para mim',
      'Sim, algo que outras pessoas usaram',
      'Sim, e isso virou referência ou processo no time',
    ]),
  },
  {
    id: 'mat_discernimento',
    text: 'A IA te entrega uma análise que parece ótima. O que acontece antes de você usar?',
    scored: true,
    options: escada('mat_discernimento', [
      'Se parece boa, uso direto',
      'Dou uma lida por cima',
      'Confiro os pontos-chave com o contexto e as fontes que conheço',
      'Tenho critérios claros do que precisa estar certo antes de sair',
      'Ajudo outras pessoas a criar esse filtro também',
    ]),
  },
  {
    id: 'mat_formato',
    text: 'Você sabe diferenciar quando uma tarefa pede prompt, automação, dashboard, app ou processo?',
    scored: true,
    options: escada('mat_formato', [
      'Não',
      'Mais ou menos',
      'Em alguns casos',
      'Sim, com boa segurança',
      'Sim, e ajudo outras pessoas a decidir',
    ]),
  },
  {
    id: 'mat_diligencia',
    text: 'E usar IA com informações do trabalho — como você lida com isso?',
    scored: true,
    options: escada('mat_diligencia', [
      'Nunca parei para pensar nisso',
      'Evito, mas mais por receio do que por critério',
      'Tomo cuidados básicos (não colo dado sensível)',
      'Sigo critérios claros do que pode e do que não pode',
      'Oriento outras pessoas sobre uso responsável',
    ]),
  },
  {
    // Não pontuada — personaliza o "próximo passo" do resultado e alimenta analytics.
    id: 'mat_fronteira',
    text: 'Qual é sua maior dificuldade hoje?',
    scored: false,
    options: [
      { id: 'mat_fronteira_comecar', label: 'Entender por onde começar' },
      { id: 'mat_fronteira_consistencia', label: 'Usar IA com mais consistência' },
      { id: 'mat_fronteira_tarefas_reais', label: 'Aplicar IA em tarefas reais' },
      { id: 'mat_fronteira_solucoes', label: 'Construir soluções mais completas' },
      { id: 'mat_fronteira_escalar', label: 'Escalar, governar ou ensinar outras pessoas' },
    ],
  },
]

/** Rótulos dos eixos do gráfico radar — sem jargão de framework na tela (doc 11 §2.3). */
const EIXOS: { perguntaId: string; label: string }[] = [
  { perguntaId: 'mat_delegacao', label: 'Delegação' },
  { perguntaId: 'mat_amplitude', label: 'Amplitude' },
  { perguntaId: 'mat_descricao', label: 'Descrição' },
  { perguntaId: 'mat_construcao', label: 'Construção' },
  { perguntaId: 'mat_discernimento', label: 'Discernimento' },
  { perguntaId: 'mat_formato', label: 'Clareza de formato' },
  { perguntaId: 'mat_diligencia', label: 'Diligência' },
]

/** Faixas literais do doc operacional §10.6. */
const FAIXAS: { min: number; max: number; nivel: MaturityLevelId }[] = [
  { min: 7, max: 11, nivel: 'curioso' },
  { min: 12, max: 17, nivel: 'usuario' },
  { min: 18, max: 24, nivel: 'operador' },
  { min: 25, max: 31, nivel: 'builder' },
  { min: 32, max: 35, nivel: 'referencia' },
]

export function nivelPorScore(score: number): MaturityLevelId {
  const faixa = FAIXAS.find((f) => score >= f.min && score <= f.max)
  if (!faixa) throw new Error(`Score de maturidade fora da faixa 7–35: ${score}`)
  return faixa.nivel
}

/**
 * Calcula o resultado da maturidade a partir das respostas (id da pergunta →
 * id da opção). Puro e determinístico. Lança erro se faltar resposta pontuada
 * ou se alguma opção não existir — a UI (ISSUE-103) garante seleção obrigatória.
 */
export function calcularMaturidade(respostas: RadarAnswers): MaturityResult {
  const eixos: MaturityAxis[] = EIXOS.map(({ perguntaId, label }) => {
    const pergunta = PERGUNTAS_MATURIDADE.find((p) => p.id === perguntaId)!
    const opcaoId = respostas[perguntaId]
    const opcao = pergunta.options.find((o) => o.id === opcaoId)
    if (!opcao?.score) {
      throw new Error(`Resposta ausente ou inválida para ${perguntaId}: ${opcaoId}`)
    }
    return { id: perguntaId, label, valor: opcao.score }
  })

  const score = eixos.reduce((total, eixo) => total + eixo.valor, 0)

  const fronteiraId = respostas['mat_fronteira'] ?? null
  const fronteiraValida = PERGUNTAS_MATURIDADE.find((p) => p.id === 'mat_fronteira')!
    .options.some((o) => o.id === fronteiraId)

  return {
    kind: 'maturidade',
    score,
    nivel: nivelPorScore(score),
    eixos,
    fronteira: fronteiraValida ? fronteiraId : null,
  }
}
