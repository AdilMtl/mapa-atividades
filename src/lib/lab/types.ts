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
}

/** Parâmetros de personalização do plano (perfil é opcional — o motor tem fallback). */
export interface PlanoOpcoes {
  /** Área (`area_*`) — default: a do diagnóstico/wizard. */
  area?: string | null
  /** Nível REAL de fluência do lab_profiles; sem ele, usa a estimativa do diagnóstico. */
  fluencia?: MaturityLevelId | null
}
