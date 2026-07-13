// =============================================================================
// LAB — TIPOS COMPARTILHADOS (ISSUE-312)
// Contratos TS dos JSONB de `lab_projects` (wizard_answers, diagnosis, plan) —
// schema do banco: docs/revamp/ISSUE-310-sql-lab.md · plano: doc 13 §5.
// Motor 100% puro (mesma regra do radar): sem rede, sem DOM, sem Supabase —
// persistência é papel das rotas/UI (ISSUES 313–314).
// Convenção de chaves: snake_case nos campos que o doc 13 §5 nomeia literalmente
// (potencial_ia, materiais_slugs…) — o JSONB gravado é este objeto, sem mapeamento.
// =============================================================================

import type {
  FamilyId,
  MaturityEstimateId,
  MaturityLevelId,
  OpportunityFlags,
  SolutionTypeId,
} from '../radar/types'

// ----------------------------------------------------------------------------
// Respostas do wizard (lab_projects.wizard_answers)
// ----------------------------------------------------------------------------

export const WIZARD_SCHEMA_VERSION = 1

/**
 * Contrato de entrada do motor. Os campos de classificação usam os MESMOS ids
 * de opção do Radar de Oportunidades (`radar/oportunidades.ts`) — ids estáveis,
 * analytics e matriz de pesos dependem deles. A ISSUE-313 (spec do wizard com o
 * dono) decide o TEXTO das perguntas, não estes ids; se aquela sessão cortar ou
 * fundir dimensões, nasce um schema_version 2 — nunca se edita o 1.
 */
export interface WizardAnswers {
  schema_version: typeof WIZARD_SCHEMA_VERSION
  /** Nome do projeto (também vai para lab_projects.title — decisão da 313). */
  titulo: string
  /** Problema ou tarefa, nas palavras do usuário (texto livre; insumo da IA na 1B). */
  problema: string
  /** Contexto adicional (texto livre, opcional). */
  contexto?: string
  /** Área de atuação (`area_*`, peso zero — personaliza exemplos e segmenta). */
  area: string | null
  /** Tipo de entrega que a tarefa produz (`entrega_*`). */
  entrega: string
  /** Onde mais se perde tempo (`perda_*`). */
  perda: string
  /** Frequência da tarefa (`freq_*`). */
  frequencia: string
  /** Quem usa o resultado (`pub_*`). */
  publico: string
  /** Tipo de dado envolvido (`dado_*`). */
  dado: string
  /** O que deveria melhorar (`desejo_*`). */
  desejo: string
  /** Conforto com ferramentas digitais (`conf_*`). */
  conforto: string
  /** Ferramentas que já usa hoje (lista livre, opcional). */
  ferramentas?: string[]
  /** Urgência declarada (opcional — handoff §8.1.2). */
  urgencia?: 'baixa' | 'media' | 'alta'
  /** Impacto esperado, nas palavras do usuário (texto livre, opcional). */
  impacto_esperado?: string
}

// ----------------------------------------------------------------------------
// Respostas do wizard — SCHEMA v2 "Conversa de Consultor" (ISSUE-313 v2.1)
// Spec: docs/revamp/ISSUE-313-spec-wizard.md. O v1 acima segue congelado.
// Regra da 1A: texto livre (relato, arquetipo_outro) NUNCA classifica — a
// heurística só opera sobre ids fechados. Os campos de classificação usam os
// MESMOS ids de opção do radar (contrato herdado do v1).
// ----------------------------------------------------------------------------

export const WIZARD_SCHEMA_VERSION_V2 = 2

/** Porta de entrada da conversa (bloco 1.3 da spec). */
export type PortaEntrada = 'ideia' | 'dor' | 'difusa'

/** Arquétipos da trilha IDEIA — os pedidos reais de workshop (spec §7.2). */
export type ArquetipoId =
  | 'arq_painel'
  | 'arq_organizador'
  | 'arq_input'
  | 'arq_consolidador'
  | 'arq_assistente'
  | 'arq_automatizador'
  | 'arq_outro'

/** Arsenal de ferramentas (bloco 3.3) — modula o plano, nunca a classificação. */
export type AmbienteId =
  | 'amb_ia_gratuita'
  | 'amb_ia_premium'
  | 'amb_workspace'
  | 'amb_copilot'
  | 'amb_shadow'

/** Registro do desempate condicional (bloco 4.3) — auditável. */
export interface DesempateRegistro {
  par: [SolutionTypeId, SolutionTypeId]
  /** Id da opção binária escolhida (derivada da matriz de pesos — desempate.ts). */
  resposta: string
}

export interface WizardAnswersV2 {
  schema_version: typeof WIZARD_SCHEMA_VERSION_V2
  porta: PortaEntrada
  /** Trilha IDEIA (bloco 2.I1). `arq_outro` segue a trilha DOR sem classificar o texto. */
  arquetipo?: ArquetipoId
  /** Texto curto quando `arq_outro` — cor, jamais entra na heurística (1A). */
  arquetipo_outro?: string
  /** "Nas tuas palavras" (bloco 4.2) — cor opcional; insumo do slot de IA da 1B. */
  relato?: string
  /** Sugerido por template (wizard-flow), editável — espelha lab_projects.title. */
  titulo: string
  /** Campos de classificação: MESMOS ids do radar/v1 (congelados). */
  area: string | null
  entrega: string
  perda: string
  frequencia: string
  publico: string
  dado: string
  desejo: string
  conforto: string
  /** Arsenal (multiselect) — vazio = base universal (IA de janela + HTML + CSV). */
  ambiente: AmbienteId[]
  /** Slider "quanto tempo isso come por semana?" — cor quantificadora da manchete. */
  horas_semana?: number
  /** Dimensões aceitas sem correção (analytics: termômetro do acerto das hipóteses). */
  hipoteses_confirmadas?: string[]
  desempate?: DesempateRegistro
  /** Tipo escolhido na proposta assistida (pode diferir do vencedor do motor). */
  escolha_tipo?: SolutionTypeId
}

/** Campos que alimentam o motor — compartilhados estruturalmente por v1 e v2. */
export type CamposClassificacao = Pick<
  WizardAnswersV2,
  'area' | 'entrega' | 'perda' | 'frequencia' | 'publico' | 'dado' | 'desejo' | 'conforto'
>

// ----------------------------------------------------------------------------
// Diagnóstico (lab_projects.diagnosis)
// ----------------------------------------------------------------------------

/** Escala editorial dos indicadores (potencial de IA, de automação e risco). */
export type NivelIndicador = 'baixo' | 'medio' | 'alto'

/** Rótulo de complexidade para a UI (o número 1–5 fica junto, auditável). */
export type ComplexidadeLabel = 'baixa' | 'media' | 'alta'

export interface LabDiagnosis {
  /** Tipo vencedor após modificadores/teto/guard-rails — decisão do motor do radar. */
  tipo: SolutionTypeId
  familia: FamilyId
  nivel_na_familia: 1 | 2
  /** Escala 1–5 do doc 11 §3. */
  complexidade: number
  complexidade_label: ComplexidadeLabel
  /** Indicadores editoriais derivados do tipo + flags (handoff §4) — não são pesos do motor. */
  potencial_ia: NivelIndicador
  potencial_automacao: NivelIndicador
  risco: NivelIndicador
  flags: OpportunityFlags
  /** Pontuação final por tipo (pós-modificadores) — auditável, herdada do motor. */
  pontuacao: Record<SolutionTypeId, number>
  /** Líder da soma bruta (antes de teto/guard-rails) — o "pode evoluir para". */
  vencedor_bruto: SolutionTypeId
  /** Estimativa leve de maturidade pelo conforto (doc 11 §8). */
  estimativa_maturidade: MaturityEstimateId
  /** Versão do motor que gerou este diagnóstico — re-diagnóstico sobrescreve com versão nova. */
  engine_version: string
}

// ----------------------------------------------------------------------------
// Plano (lab_projects.plan)
// ----------------------------------------------------------------------------

export interface LabPlanEtapa {
  /** Id estável da etapa (o checklist referencia por ele). */
  id: string
  titulo: string
  descricao: string
  /**
   * Estimativa de foco ativo em minutos (ISSUE-314C) — não é tempo de calendário
   * (ex.: "use por uma semana" estima o esforço de acompanhar, não os 7 dias).
   * Opcional: planos gerados antes da 314C (persistidos em `lab_projects.plan`)
   * não têm este campo — a UI precisa tolerar `undefined`.
   */
  duracao_min?: number
}

export interface LabChecklistItem {
  /** Mesmo id da etapa correspondente. */
  id: string
  label: string
  /** Único campo que a UI muta (ISSUE-314) — o resto do plano é imutável pós-geração. */
  done: boolean
}

export interface LabPlan {
  resumo: string
  /** 4–7 etapas na voz da newsletter — método, nunca promessa de app pronto. */
  etapas: LabPlanEtapa[]
  /** Espelho das etapas (id/label), tudo done=false na geração. */
  checklist: LabChecklistItem[]
  artefato_sugerido: string
  /** Slugs de `lab_assets` — registro canônico em plan-generator.ts (a 316 semeia a partir dele). */
  materiais_slugs: string[]
  generator_version: string
  /** Soma de `etapas[].duracao_min` (ISSUE-314C) — `undefined` em planos pré-314C. */
  duracao_total_min?: number
  /**
   * Mini-diagnóstico de resultado preenchido na conclusão (ISSUE-314D).
   * `undefined` enquanto o projeto não foi concluído, ou quando a pessoa pulou
   * o check-up. Mora no JSONB do plano (zero SQL) — só as respostas fechadas
   * são persistidas; a devolutiva é recomposta na leitura (mesma regra da
   * Caminhada: derivar, não guardar texto derivado).
   */
  resultado?: LabResultado
}

// ----------------------------------------------------------------------------
// Mini-diagnóstico de resultado (ISSUE-314D) — check-up de conclusão
// Perguntas fechadas (como a abertura do wizard), heurística determinística.
// A costura pra IA (ISSUE-320/321) troca a composição da devolutiva sem mexer
// no formato persistido nem na UI.
// ----------------------------------------------------------------------------

/** Chegou a rodar? (eixo principal da devolutiva de resultado). */
export type ResultadoChegouId = 'chegou_usei' | 'chegou_montei' | 'chegou_meio'
/** Comparado ao manual (nuance). */
export type ResultadoComparadoId =
  | 'comp_melhor'
  | 'comp_consistente'
  | 'comp_ainda_nao'
  | 'comp_sem_base'
/** Próximo movimento (orienta o next step). */
export type ResultadoProximoId = 'prox_rotina' | 'prox_ajustar' | 'prox_mostrar' | 'prox_proximo'

export interface ResultadoRespostas {
  chegou: ResultadoChegouId
  comparado: ResultadoComparadoId
  proximo: ResultadoProximoId
}

export interface LabResultado {
  /** As 3 respostas fechadas — única coisa persistida (vocabulário fechado). */
  respostas: ResultadoRespostas
  /** Versão da heurística que compôs a devolutiva (troca quando a IA entrar). */
  versao: string
}

/** Parâmetros de personalização do plano (perfil é opcional — o motor tem fallback). */
export interface PlanoOpcoes {
  /** Área (`area_*`) — default: a do diagnóstico/wizard. */
  area?: string | null
  /** Nível REAL de fluência do lab_profiles; sem ele, usa a estimativa do diagnóstico. */
  fluencia?: MaturityLevelId | null
  /** Arsenal do wizard v2 — modula a linha de ampliação e a diligência shadow (spec §7.3). */
  ambiente?: AmbienteId[]
  /** Horas/semana declaradas no slider — quantifica a manchete do resumo. */
  horasSemana?: number
}
