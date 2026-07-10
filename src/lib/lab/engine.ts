// =============================================================================
// LAB — MOTOR DE DIAGNÓSTICO (ISSUE-312)
// Adaptador wizard → motor do Radar de Oportunidades. A CLASSIFICAÇÃO é 100%
// do motor existente (`radar/oportunidades.ts`, doc 11 §3–§8, aprovado pelo
// dono) — aqui não se redecide peso nenhum. O que este módulo adiciona são os
// indicadores editoriais do handoff §4 (potencial de IA, potencial de
// automação, risco), derivados do tipo vencedor + flags, por tabelas fixas
// documentadas abaixo. Puro e determinístico: mesmo input → mesmo output.
// =============================================================================

import { COMPLEXIDADE, decidirOportunidade, FAMILIA_POR_TIPO } from '../radar/oportunidades'
import type { RadarAnswers, SolutionTypeId } from '../radar/types'
import type {
  CamposClassificacao,
  ComplexidadeLabel,
  LabDiagnosis,
  NivelIndicador,
  WizardAnswers,
  WizardAnswersV2,
} from './types'

/**
 * Versão do motor — gravada em `diagnosis.engine_version`. Sobe quando qualquer
 * tabela deste arquivo (ou o motor do radar) muda de comportamento: é o que
 * permite re-diagnosticar projetos antigos sabendo o que mudou.
 */
export const ENGINE_VERSION = 'lab-engine-1.0.0'

/** Complexidade 1–5 (doc 11 §3) → rótulo editorial da UI. */
const LABEL_COMPLEXIDADE: Record<number, ComplexidadeLabel> = {
  1: 'baixa',
  2: 'media',
  3: 'media',
  4: 'alta',
  5: 'alta',
}

/**
 * Potencial de IA generativa NO USO da solução (handoff §4): alto quando a IA
 * é o núcleo do que roda (pedido, preenchimento, decisão); médio quando ela
 * constrói/apoia mas o artefato vive sem ela; baixo quando o valor é o dado.
 */
const POTENCIAL_IA: Record<SolutionTypeId, NivelIndicador> = {
  prompt: 'alto',
  template: 'alto',
  workflow: 'alto',
  automacao: 'medio',
  dashboard: 'baixo',
  app_offline: 'medio',
  app_tabela: 'medio',
  orquestrado: 'medio',
  agentico: 'alto',
}

/**
 * Potencial de automação = quanto da rotina SAI das mãos do usuário quando a
 * solução existe: alto quando roda por gatilho/sozinha; médio quando reduz
 * etapas mas mantém a pessoa no fluxo; baixo quando a pessoa segue executando
 * (só que melhor).
 */
const POTENCIAL_AUTOMACAO: Record<SolutionTypeId, NivelIndicador> = {
  prompt: 'baixo',
  template: 'baixo',
  workflow: 'medio',
  automacao: 'alto',
  dashboard: 'medio',
  app_offline: 'baixo',
  app_tabela: 'medio',
  orquestrado: 'alto',
  agentico: 'alto',
}

/** Risco-base pela complexidade (1–2 baixo · 3 médio · 4–5 alto). */
const RISCO_POR_COMPLEXIDADE: Record<number, NivelIndicador> = {
  1: 'baixo',
  2: 'baixo',
  3: 'medio',
  4: 'alto',
  5: 'alto',
}

/** Dado sensível (flag de diligência, doc 11 §5.1) sobe o risco um degrau. */
const RISCO_ACIMA: Record<NivelIndicador, NivelIndicador> = {
  baixo: 'medio',
  medio: 'alto',
  alto: 'alto',
}

/**
 * Traduz as respostas do wizard para o formato do motor do radar. Os ids de
 * opção são os mesmos por contrato (types.ts) — isto é só remap de chaves.
 * Aceita v1 e v2: os campos de classificação são estruturalmente idênticos
 * (CamposClassificacao) — a diferença dos schemas está na captura, não aqui.
 */
export function paraRespostasRadar(respostas: CamposClassificacao): RadarAnswers {
  return {
    ...(respostas.area ? { op_area: respostas.area } : {}),
    op_entrega: respostas.entrega,
    op_perda: respostas.perda,
    op_frequencia: respostas.frequencia,
    op_publico: respostas.publico,
    op_dado: respostas.dado,
    op_desejo: respostas.desejo,
    op_conforto: respostas.conforto,
  }
}

/**
 * Diagnóstico do projeto: classificação pelo motor do radar + indicadores
 * editoriais. Lança erro se alguma resposta de classificação estiver ausente
 * ou inválida (validação herdada do motor — a rota da 313 traduz em 400).
 */
export function diagnosticar(respostas: WizardAnswers): LabDiagnosis {
  return diagnosticarCampos(respostas)
}

/**
 * Adaptador do schema v2 (spec ISSUE-313 v2.1). Só os ids fechados entram —
 * `relato`/`arquetipo_outro` são cor e JAMAIS tocam a classificação (regra da
 * 1A). `porta`/`arquetipo`/`ambiente` não pontuam: trilha e arsenal mudam a
 * captura e o plano, nunca o motor.
 */
export function diagnosticarV2(respostas: WizardAnswersV2): LabDiagnosis {
  return diagnosticarCampos(respostas)
}

function diagnosticarCampos(respostas: CamposClassificacao): LabDiagnosis {
  const resultado = decidirOportunidade(paraRespostasRadar(respostas))
  const complexidade = COMPLEXIDADE[resultado.tipo]
  const riscoBase = RISCO_POR_COMPLEXIDADE[complexidade]

  return {
    tipo: resultado.tipo,
    familia: FAMILIA_POR_TIPO[resultado.tipo].familia,
    nivel_na_familia: FAMILIA_POR_TIPO[resultado.tipo].nivelNaFamilia,
    complexidade,
    complexidade_label: LABEL_COMPLEXIDADE[complexidade],
    potencial_ia: POTENCIAL_IA[resultado.tipo],
    potencial_automacao: POTENCIAL_AUTOMACAO[resultado.tipo],
    risco: resultado.flags.diligencia ? RISCO_ACIMA[riscoBase] : riscoBase,
    flags: resultado.flags,
    pontuacao: resultado.pontuacao,
    vencedor_bruto: resultado.vencedorBruto,
    estimativa_maturidade: resultado.estimativaMaturidade,
    engine_version: ENGINE_VERSION,
  }
}
