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

export const MENSAGEM_MIN = 3
export const MENSAGEM_MAX = 2000
export const ROTA_MAX = 500
export const EMAIL_MAX = 255

/** Severidade só faz sentido em bug — nos outros tipos a pergunta nem aparece. */
export function aceitaSeveridade(tipo: TipoFeedback): boolean {
  return tipo === 'bug'
}
