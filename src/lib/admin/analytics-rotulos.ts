// =============================================================================
// ADMIN — rótulos do painel de Analytics (ISSUE-318A2)
// Traduz os ids fechados que as agregações contam (`area_rh`, `perda_copiando`,
// `dashboard`, `curioso`, slug de guia) para o texto que o dono lê na tela.
//
// ⚠️ SÓ O SERVIDOR importa este módulo (a rota `api/admin/analytics`). Ele puxa
// o conteúdo do radar e do Lab — centenas de linhas de copy — e nada disso
// precisa viajar até o navegador: a API já devolve os rótulos prontos.
//
// A fonte da verdade continua sendo o conteúdo original (PERGUNTAS_*,
// CONTEUDO_MATURIDADE, NOME_TIPO, GUIAS). Aqui não se escreve rótulo novo: se
// uma opção for renomeada lá, o painel acompanha sozinho.
// =============================================================================

import { guiaPorSlug } from '@/lib/lab/materiais'
import { NOME_TIPO } from '@/lib/lab/trilha'
import { CONTEUDO_MATURIDADE } from '@/lib/radar/content'
import { PERGUNTAS_MATURIDADE } from '@/lib/radar/maturidade'
import { PERGUNTAS_OPORTUNIDADES } from '@/lib/radar/oportunidades'
import type { MaturityLevelId, RadarQuestion, SolutionTypeId } from '@/lib/radar/types'

/** Índice `id da opção → label`, montado uma vez a partir das perguntas dos dois radares. */
const LABEL_POR_OPCAO: Record<string, string> = {};

([...PERGUNTAS_MATURIDADE, ...PERGUNTAS_OPORTUNIDADES] as RadarQuestion[]).forEach((pergunta) => {
  pergunta.options.forEach((opcao) => {
    LABEL_POR_OPCAO[opcao.id] = opcao.label
  })
})

/** Opção de qualquer pergunta dos radares (`area_rh`, `perda_copiando`, `mat_fronteira_comecar`). */
export function rotuloOpcaoRadar(id: string): string | undefined {
  return LABEL_POR_OPCAO[id]
}

/** `result_key` do radar de maturidade → nome do nível ("Curioso", "Builder"…). */
export function rotuloNivelMaturidade(id: string): string | undefined {
  return CONTEUDO_MATURIDADE[id as MaturityLevelId]?.nome
}

/** `result_key` do radar de oportunidades / `diagnosis.tipo` → nome curto do tipo. */
export function rotuloTipoSolucao(id: string): string | undefined {
  return NOME_TIPO[id as SolutionTypeId]
}

/** Slug de guia da biblioteca → título do guia. */
export function rotuloGuia(slug: string): string | undefined {
  return guiaPorSlug(slug)?.titulo
}

/** Status de `lab_projects` — os três valores do CHECK da tabela. */
const ROTULO_STATUS: Record<string, string> = {
  rascunho: 'rascunho',
  em_construcao: 'em construção',
  concluido: 'concluído',
}

export function rotuloStatusProjeto(id: string): string | undefined {
  return ROTULO_STATUS[id]
}
