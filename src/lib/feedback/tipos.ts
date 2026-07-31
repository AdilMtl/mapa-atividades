// =============================================================================
// FEEDBACK — vocabulário fechado e limites (ISSUE-318D)
// Compartilhado entre o widget (cliente) e a rota (servidor): os valores aqui
// são os MESMOS do CHECK das colunas em `feedback`. Mudar um lado sem o outro
// derruba o INSERT com 23514.
// =============================================================================

export const TIPOS_FEEDBACK = ['bug', 'melhoria', 'ideia', 'confuso', 'elogio'] as const
export type TipoFeedback = (typeof TIPOS_FEEDBACK)[number]

export const SEVERIDADES_FEEDBACK = ['trava', 'incomoda', 'cosmetico'] as const
export type SeveridadeFeedback = (typeof SEVERIDADES_FEEDBACK)[number]

// Triagem (ISSUE-318E): a rota pública nunca escreve nada disto — só o painel
// de admin. Descartar é `descartado`, não DELETE: histórico não se apaga.
export const STATUS_FEEDBACK = ['novo', 'triado', 'em_execucao', 'resolvido', 'descartado'] as const
export type StatusFeedback = (typeof STATUS_FEEDBACK)[number]

export const NOTAS_MAX = 2000
export const ISSUE_REF_MAX = 50

export const MENSAGEM_MIN = 3
export const MENSAGEM_MAX = 2000
export const ROTA_MAX = 500
export const EMAIL_MAX = 255

/** Severidade só faz sentido em bug — nos outros tipos a pergunta nem aparece. */
export function aceitaSeveridade(tipo: TipoFeedback): boolean {
  return tipo === 'bug'
}
