// =============================================================================
// MARKETING — pasta de templates (ISSUE-601D)
// Zero I/O aqui: validação de vocabulário fechado, versionamento e o mapeamento
// slug → segmento designado (mesma fonte de `segmentos.ts`, §4 da spec). As
// rotas de API cuidam do Supabase; este módulo só decide se um template pode
// ser salvo e qual o próximo número de versão. Mesmo padrão de `segmentos.ts`.
//
// Decisões travadas na spec (docs/marketing/ISSUE-601-spec-painel-funil.md §6):
// - Vocabulário de variáveis é fechado — salvar com variável fora da lista falha.
// - Corpo é markdown simples, nunca HTML cru.
// - O rodapé de descadastro é injetado pelo sistema no envio — por isso ele
//   nunca é parte do `corpo` editável, e não precisa de validação de remoção.
// =============================================================================

import { SEGMENTOS, type SegmentoId } from './segmentos'

export const VARIAVEIS_VALIDAS = ['primeiro_nome', 'resultado_radar', 'link_lab', 'link_descadastro'] as const
export type VariavelTemplate = (typeof VARIAVEIS_VALIDAS)[number]

const REGEX_VARIAVEL = /\{\{\s*([a-zA-Z_]+)\s*\}\}/g
// Qualquer coisa com cara de tag HTML (abertura ou fechamento) — corpo é markdown, não HTML cru.
const REGEX_HTML_CRU = /<\/?[a-z][a-z0-9]*(\s[^<>]*)?>/i

/** Os 6 slugs que esta issue administra — vem de `SEGMENTOS`, fonte única (§4). `radar_followup` fica de fora: é dinâmico, não um texto único (decisão do dono, 08/08/2026). */
export const SLUGS_GERENCIADOS: string[] = [...new Set(SEGMENTOS.map((s) => s.templateSlug))]

/** Slug → segmento designado (§4) — mesma fonte que a tela de Segmentos já usa. */
export function segmentoDoTemplate(slug: string): SegmentoId | null {
  return SEGMENTOS.find((s) => s.templateSlug === slug)?.id ?? null
}

export function extrairVariaveis(texto: string): string[] {
  const encontradas = new Set<string>()
  for (const m of texto.matchAll(REGEX_VARIAVEL)) encontradas.add(m[1])
  return [...encontradas]
}

export function variaveisInvalidas(texto: string): string[] {
  return extrairVariaveis(texto).filter((v) => !(VARIAVEIS_VALIDAS as readonly string[]).includes(v))
}

export function contemHtmlCru(texto: string): boolean {
  return REGEX_HTML_CRU.test(texto)
}

export interface ValidacaoTemplate {
  valido: boolean
  erros: string[]
}

/** Valida um par assunto/corpo contra as travas do §6.3. Não decide slug nem versão. */
export function validarTemplate(assunto: string, corpo: string): ValidacaoTemplate {
  const erros: string[] = []

  if (!assunto.trim()) erros.push('Assunto não pode ficar vazio.')
  if (!corpo.trim()) erros.push('Corpo não pode ficar vazio.')

  const invalidas = variaveisInvalidas(`${assunto}\n${corpo}`)
  if (invalidas.length > 0) {
    erros.push(
      `Variável desconhecida: ${invalidas.map((v) => `{{${v}}}`).join(', ')}. ` +
        `Válidas: ${VARIAVEIS_VALIDAS.map((v) => `{{${v}}}`).join(', ')}.`,
    )
  }

  if (contemHtmlCru(corpo)) {
    erros.push('Corpo não pode conter HTML — só markdown simples (parágrafos e **negrito**).')
  }

  return { valido: erros.length === 0, erros }
}

/** Próxima versão de um slug a partir das versões já existentes. Vazio → 1. */
export function proximaVersao(versoesExistentes: number[]): number {
  return versoesExistentes.length === 0 ? 1 : Math.max(...versoesExistentes) + 1
}

export type StatusTemplate = 'rascunho' | 'ativo' | 'arquivado'

export interface VersaoTemplate {
  id: string
  slug: string
  versao: number
  assunto: string
  corpo: string
  segmento: string | null
  status: StatusTemplate
  criadoEm: string
  criadoPor: string
}

/** Dentro das versões de um mesmo slug, qual conta como "a que abre no editor": a ativa, senão a mais recente. */
export function versaoParaEditar(versoes: VersaoTemplate[]): VersaoTemplate | null {
  if (versoes.length === 0) return null
  const ativa = versoes.find((v) => v.status === 'ativo')
  if (ativa) return ativa
  return [...versoes].sort((a, b) => b.versao - a.versao)[0]
}
