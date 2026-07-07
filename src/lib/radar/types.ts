// =============================================================================
// RADAR — TIPOS COMPARTILHADOS (ISSUE-104)
// Especificação canônica: docs/revamp/11_motor_radar_pesos_personas.md (v2,
// aprovada pelo dono em 2026-07-06). Qualquer mudança de regra volta ao doc 11
// antes de mudar aqui.
// Motor 100% puro: sem rede, sem DOM, sem sessionStorage (persistência é papel
// da UI — ISSUE-103). IDs de pergunta/opção são estáveis: analytics depende deles.
// =============================================================================

export type RadarKind = 'maturidade' | 'oportunidades'

/** Resposta do usuário: id da pergunta → id da opção escolhida. */
export type RadarAnswers = Record<string, string>

export interface RadarOption {
  id: string
  label: string
  /** Maturidade: 1–5 (posição na escada). Oportunidades: ausente — pesos vivem na matriz. */
  score?: number
}

export interface RadarQuestion {
  id: string
  text: string
  options: RadarOption[]
  /** false = não pontua (P8 "fronteira" da maturidade; P1 "área" do oportunidades). */
  scored: boolean
}

// ----------------------------------------------------------------------------
// Radar de Maturidade
// ----------------------------------------------------------------------------

export type MaturityLevelId =
  | 'curioso'
  | 'usuario'
  | 'operador'
  | 'builder'
  | 'referencia'

/** Eixo do gráfico radar da maturidade (rótulos sem jargão de framework). */
export interface MaturityAxis {
  id: string
  label: string
  /** Pontos da resposta correspondente (1–5). */
  valor: number
}

export interface MaturityResult {
  kind: 'maturidade'
  /** Soma das 7 perguntas pontuadas (7–35). */
  score: number
  nivel: MaturityLevelId
  eixos: MaturityAxis[]
  /** Opção escolhida na P8 (não pontuada) — personaliza o próximo passo. */
  fronteira: string | null
}

// ----------------------------------------------------------------------------
// Radar de Oportunidades
// ----------------------------------------------------------------------------

export type SolutionTypeId =
  | 'prompt'
  | 'template'
  | 'workflow'
  | 'automacao'
  | 'dashboard'
  | 'app_offline'
  | 'app_tabela'
  | 'orquestrado'
  | 'agentico'

/** Famílias de oportunidade (camada de apresentação — doc 11 §3.1). */
export type FamilyId = 'conversacao' | 'fluxo' | 'visualizacao' | 'construcao'

export interface OpportunityFlags {
  /** P6 = dados sensíveis: penalidade aplicada + bloco de Diligência no resultado. */
  diligencia: boolean
  /** O teto de conforto (P8) mudou o vencedor — o conteúdo começa menor sem esconder o potencial. */
  rebaixadoPorConforto: boolean
}

/** Eixo do gráfico radar do teaser (normalizado 0–100 — doc 11 §7.1). */
export interface TeaserAxis {
  id: string
  label: string
  valor: number
}

/** Sinal que pesou no resultado (dado estruturado; a copy é da ISSUE-105/103). */
export interface OpportunitySignal {
  perguntaId: string
  opcaoId: string
  contribuicao: number
}

/** Camada grátis do resultado (mostrada SEM e-mail — escada de captura, doc 10). */
export interface OpportunityTeaser {
  familia: FamilyId
  /** 1 = nível de entrada da família · 2 = nível de evolução (doc 11 §3.1). */
  nivelNaFamilia: 1 | 2
  eixos: TeaserAxis[]
  /** 2–3 respostas que mais contribuíram para o tipo vencedor. */
  sinais: OpportunitySignal[]
}

/** Faixa estimada de maturidade quando não há resultado real do degrau 1 (doc 11 §8). */
export type MaturityEstimateId =
  | 'curioso_usuario'
  | 'usuario_operador'
  | 'operador'
  | 'operador_builder'
  | 'builder_referencia'

export interface OpportunityResult {
  kind: 'oportunidades'
  /** Tipo vencedor após modificadores, teto e guard-rails. */
  tipo: SolutionTypeId
  /** Líder da soma bruta (antes de teto/guard-rails) — auditoria e provocação "pode evoluir para". */
  vencedorBruto: SolutionTypeId
  flags: OpportunityFlags
  teaser: OpportunityTeaser
  /** true: o diagnóstico completo fica atrás do e-mail (sempre true neste radar — doc 10). */
  gated: true
  /** Estimativa leve por P8, usada quando a UI não tem o nível real da maturidade. */
  estimativaMaturidade: MaturityEstimateId
  /** Área (P1, peso zero) — personaliza exemplos e segmenta analytics. */
  area: string | null
  /** Pontuação final por tipo (pós-modificadores) — auditável e testável. */
  pontuacao: Record<SolutionTypeId, number>
  /** Pontuação bruta por tipo (soma da matriz, antes dos modificadores). */
  pontuacaoBruta: Record<SolutionTypeId, number>
}

// ----------------------------------------------------------------------------
// Conteúdo (preenchido pela ISSUE-105 em content.ts)
// ----------------------------------------------------------------------------

export interface Reading {
  titulo: string
  url: string
}

/** Resultado de maturidade: conteúdo GRÁTIS, inteiro na tela (degrau 1 da escada). */
export interface MaturityContent {
  nivel: MaturityLevelId
  nome: string
  titulo: string
  corpo: string
  risco: string
  proximoSalto: string
  leituras: Reading[]
  /** CTA primário = ponte para o /radar/oportunidades (nunca formulário de e-mail). */
  ctaPonte: string
  /** CTA secundário/suave de e-mail (interpretação + trilha) — opcional, não bloqueia nada. */
  ctaEmailSuave: string
  /** Personalização do próximo passo pela P8 (fronteira): id da opção → frase. */
  proximoPassoPorFronteira: Record<string, string>
}

/** Bloco "Na prática" — 9º bloco de todo diagnóstico completo (doc 11 §8.1). */
export interface NaPraticaContent {
  /** "Sabia que você consegue [coisa concreta] com [ferramenta acessível no Brasil]?" */
  gancho: string
  comeceAssim: string
  umNivelAcima: string
  /** Ponte para o e-mail: o mini-guia (passo a passo + prompts) chega lá (ISSUE-113). */
  comoFazerNoEmail: string
}

/** Teaser de direção (grátis na tela), no tom exploração — nunca veredito. */
export interface OpportunityTeaserContent {
  tipo: SolutionTypeId
  familiaLabel: string
  fraseDirecao: string
  nivelNaFamiliaLabel: string
  promessaCompleto: string
}

/** Diagnóstico completo (atrás do e-mail): 8 blocos do doc operacional §11.6 + "Na prática". */
export interface OpportunityContent {
  tipo: SolutionTypeId
  titulo: string
  porque: string
  complexidade: string
  risco: string
  primeiroPasso: string
  leituras: Reading[]
  ctaNewsletter: string
  ctaLab: string
  naPratica: NaPraticaContent
  /** Exemplo curto por área (P1) — inclui os públicos novos Estudante e Empreendedor. */
  exemploPorArea?: Record<string, string>
}

/** Copy do cruzamento de maturidade dentro do diagnóstico completo (doc 11 §8). */
export interface MaturityCrossContent {
  /** Nível real vindo do degrau 1 (sessionStorage na UI): id do nível → frase. */
  comNivelReal: Record<MaturityLevelId, string>
  /** Sem nível real: faixa estimada por P8 → frase. */
  comEstimativa: Record<MaturityEstimateId, string>
}
