// =============================================================================
// LAB — VALIDAÇÃO DO WIZARD v2 (ISSUE-313)
// Guarda de entrada das rotas api/lab/projects: o cliente manda JSON, aqui se
// decide o que entra no banco. Duas posturas distintas de propósito:
//   • RASCUNHO: tolerante — ignora o que não reconhece, guarda o que é válido
//     (abandono no meio não pode falhar por campo faltando).
//   • COMPLETO: estrito — todos os campos de classificação presentes e com id
//     do vocabulário fechado (mesma robustez-por-construção da heurística).
// Puro e sem dependência de rede/DB, no padrão do motor — testável em vitest.
// =============================================================================

import { PERGUNTAS_OPORTUNIDADES, TIPOS_SOLUCAO } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import type { AmbienteId, ArquetipoId, PortaEntrada, WizardAnswersV2 } from './types'
import { WIZARD_SCHEMA_VERSION_V2 } from './types'
import { AMBIENTES, ARQUETIPOS, PORTAS } from './wizard-flow'

// ----------------------------------------------------------------------------
// Vocabulários fechados (derivados das fontes — nada duplicado à mão)
// ----------------------------------------------------------------------------

function idsDaPergunta(perguntaId: string): Set<string> {
  const pergunta = PERGUNTAS_OPORTUNIDADES.find((p) => p.id === perguntaId)
  return new Set(pergunta?.options.map((o) => o.id) ?? [])
}

/** Campo de classificação → ids válidos (fonte: radar, ids congelados). */
export const VOCABULARIO: Record<string, Set<string>> = {
  area: idsDaPergunta('op_area'),
  entrega: idsDaPergunta('op_entrega'),
  perda: idsDaPergunta('op_perda'),
  frequencia: idsDaPergunta('op_frequencia'),
  publico: idsDaPergunta('op_publico'),
  dado: idsDaPergunta('op_dado'),
  desejo: idsDaPergunta('op_desejo'),
  conforto: idsDaPergunta('op_conforto'),
}

const PORTAS_VALIDAS = new Set<string>(PORTAS.map((p) => p.id))
const ARQUETIPOS_VALIDOS = new Set<string>(ARQUETIPOS.map((a) => a.id))
const AMBIENTES_VALIDOS = new Set<string>(AMBIENTES.map((a) => a.id))
const TIPOS_VALIDOS = new Set<string>(TIPOS_SOLUCAO)

/** Toda opção conhecida da matriz (resposta do desempate é uma delas). */
const OPCOES_MATRIZ = new Set<string>(
  PERGUNTAS_OPORTUNIDADES.flatMap((p) => p.options.map((o) => o.id)),
)

// Limites de texto livre (o relato é cor, não é redação — e o DB tem VARCHAR).
const MAX_TITULO = 120 // lab_projects.title VARCHAR(120)
const MAX_RELATO = 2000
const MAX_ARQUETIPO_OUTRO = 200

const CAMPOS_CLASSIFICACAO = [
  'entrega',
  'perda',
  'frequencia',
  'publico',
  'dado',
  'desejo',
  'conforto',
] as const

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function texto(valor: unknown, max: number): string | undefined {
  if (typeof valor !== 'string') return undefined
  const limpo = valor.trim().slice(0, max)
  return limpo.length > 0 ? limpo : undefined
}

function idValido(valor: unknown, vocabulario: Set<string>): string | undefined {
  return typeof valor === 'string' && vocabulario.has(valor) ? valor : undefined
}

function ambienteValido(valor: unknown): AmbienteId[] | undefined {
  if (!Array.isArray(valor)) return undefined
  const unicos = [...new Set(valor)].filter(
    (v): v is AmbienteId => typeof v === 'string' && AMBIENTES_VALIDOS.has(v),
  )
  return unicos
}

function horasValidas(valor: unknown): number | undefined {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return undefined
  const inteiro = Math.round(valor)
  return inteiro >= 0 && inteiro <= 10 ? inteiro : undefined
}

// ----------------------------------------------------------------------------
// Rascunho (tolerante)
// ----------------------------------------------------------------------------

/** Rascunho parcial do wizard — só chaves reconhecidas e valores válidos. */
export type RascunhoWizard = Partial<Omit<WizardAnswersV2, 'schema_version'>> & {
  schema_version: typeof WIZARD_SCHEMA_VERSION_V2
}

/**
 * Sanitiza um rascunho: pega do payload APENAS o que é reconhecível e válido.
 * Nunca lança — rascunho ruim vira rascunho menor, não erro pro usuário.
 */
export function sanitizarRascunho(payload: unknown): RascunhoWizard {
  const bruto = (payload ?? {}) as Record<string, unknown>
  const rascunho: RascunhoWizard = { schema_version: WIZARD_SCHEMA_VERSION_V2 }

  const porta = idValido(bruto.porta, PORTAS_VALIDAS)
  if (porta) rascunho.porta = porta as PortaEntrada

  const arquetipo = idValido(bruto.arquetipo, ARQUETIPOS_VALIDOS)
  if (arquetipo) rascunho.arquetipo = arquetipo as ArquetipoId

  const arquetipoOutro = texto(bruto.arquetipo_outro, MAX_ARQUETIPO_OUTRO)
  if (arquetipoOutro) rascunho.arquetipo_outro = arquetipoOutro

  const relato = texto(bruto.relato, MAX_RELATO)
  if (relato) rascunho.relato = relato

  const titulo = texto(bruto.titulo, MAX_TITULO)
  if (titulo) rascunho.titulo = titulo

  // `area` aceita null explícito (pessoa pulou) — diferente de ausente.
  if (bruto.area === null) rascunho.area = null
  const area = idValido(bruto.area, VOCABULARIO.area)
  if (area) rascunho.area = area

  for (const campo of CAMPOS_CLASSIFICACAO) {
    const valor = idValido(bruto[campo], VOCABULARIO[campo])
    if (valor) rascunho[campo] = valor
  }

  const ambiente = ambienteValido(bruto.ambiente)
  if (ambiente) rascunho.ambiente = ambiente

  const horas = horasValidas(bruto.horas_semana)
  if (horas !== undefined) rascunho.horas_semana = horas

  if (Array.isArray(bruto.hipoteses_confirmadas)) {
    rascunho.hipoteses_confirmadas = bruto.hipoteses_confirmadas
      .filter((v): v is string => typeof v === 'string')
      .slice(0, 10)
      .map((v) => v.slice(0, 30))
  }

  const desempate = bruto.desempate as Record<string, unknown> | undefined
  if (
    desempate &&
    Array.isArray(desempate.par) &&
    desempate.par.length === 2 &&
    desempate.par.every((t) => typeof t === 'string' && TIPOS_VALIDOS.has(t)) &&
    typeof desempate.resposta === 'string' &&
    OPCOES_MATRIZ.has(desempate.resposta)
  ) {
    rascunho.desempate = {
      par: desempate.par as [SolutionTypeId, SolutionTypeId],
      resposta: desempate.resposta,
    }
  }

  const escolha = idValido(bruto.escolha_tipo, TIPOS_VALIDOS)
  if (escolha) rascunho.escolha_tipo = escolha as SolutionTypeId

  return rascunho
}

// ----------------------------------------------------------------------------
// Completo (estrito — é o que roda o motor e vira projeto `planejado`)
// ----------------------------------------------------------------------------

export type ResultadoValidacao =
  | { ok: true; respostas: WizardAnswersV2 }
  | { ok: false; erros: string[] }

/**
 * Valida o wizard completo. Regras além do rascunho: porta obrigatória, todos
 * os campos de classificação presentes, título presente, e trilha IDEIA com
 * arquétipo. `ambiente` ausente vira [] (base universal, decisão da spec).
 */
export function validarCompleto(payload: unknown): ResultadoValidacao {
  const r = sanitizarRascunho(payload)
  const erros: string[] = []

  if (!r.porta) erros.push('porta ausente ou inválida')
  if (r.porta === 'ideia' && !r.arquetipo) erros.push('trilha IDEIA sem arquétipo')
  if (!r.titulo) erros.push('título ausente')
  if (r.area === undefined) erros.push('area ausente ou inválida')
  for (const campo of CAMPOS_CLASSIFICACAO) {
    if (!r[campo]) erros.push(`${campo} ausente ou inválido`)
  }

  if (erros.length > 0) return { ok: false, erros }

  return {
    ok: true,
    respostas: {
      ...r,
      porta: r.porta!,
      titulo: r.titulo!,
      area: r.area ?? null,
      entrega: r.entrega!,
      perda: r.perda!,
      frequencia: r.frequencia!,
      publico: r.publico!,
      dado: r.dado!,
      desejo: r.desejo!,
      conforto: r.conforto!,
      ambiente: r.ambiente ?? [],
    },
  }
}
