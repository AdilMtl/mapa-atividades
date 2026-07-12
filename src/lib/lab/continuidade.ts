// =============================================================================
// LAB — CONTINUIDADE ENTRE ETAPAS DO PLANO (ISSUE-314B)
// "Onde você parou" derivado do checklist (primeira etapa não marcada) — o
// checklist já persiste no banco, então a posição da pessoa sobrevive a
// sessão/dispositivo sem SQL novo. Módulo puro (mesma regra do materiais.ts):
// composição de texto testável, sem DOM, sem rede. A UI só renderiza.
// Decisões de voz/interação: sessão de design de 2026-07-11 com o dono
// (pergunta 18 do 00b_open_questions.md).
// =============================================================================

import type { LabChecklistItem, LabPlanEtapa } from './types'

export interface EtapaAtualInfo {
  id: string
  /** Índice na ordem das etapas (0-based). */
  indice: number
  titulo: string
}

/**
 * A etapa em que a pessoa está: a PRIMEIRA (na ordem do plano) ainda não
 * marcada. Marcar fora de ordem não quebra — a atual continua sendo a primeira
 * pendente. Etapa cujo id não exista no checklist é pulada (o PATCH rejeitaria
 * a marcação — melhor não apontar a pessoa pra um beco). `null` = tudo feito
 * ou plano sem etapas.
 */
export function etapaAtual(
  etapas: LabPlanEtapa[],
  checklist: LabChecklistItem[],
): EtapaAtualInfo | null {
  const doneById = new Map(checklist.map((c) => [c.id, c.done]))
  for (let i = 0; i < etapas.length; i++) {
    const done = doneById.get(etapas[i].id)
    if (done === false) return { id: etapas[i].id, indice: i, titulo: etapas[i].titulo }
  }
  return null
}

/**
 * Cartão de retomada da revisita (modo documento). Só existe quando há
 * caminhada de verdade pra retomar: pelo menos uma etapa feita E pelo menos
 * uma pendente. Antes disso a página inteira já é o convite; depois disso o
 * que falta é concluir, não retomar.
 */
export function textoRetomada(
  etapas: LabPlanEtapa[],
  checklist: LabChecklistItem[],
): string | null {
  const atual = etapaAtual(etapas, checklist)
  if (!atual) return null
  const algumaFeita = checklist.some((c) => c.done)
  if (!algumaFeita) return null
  return `Da última vez você parou na etapa ${atual.indice + 1} de ${etapas.length} — "${atual.titulo}".`
}

/**
 * O beat do consultor logo depois de uma etapa marcada: apresenta a próxima
 * (ou o fechamento, quando era a última). Chamar com o checklist JÁ
 * atualizado. A 314C vai somar os minutos estimados a esta frase — o texto
 * já foi desenhado pra receber esse acréscimo sem reescrever.
 */
export function beatTransicao(
  etapas: LabPlanEtapa[],
  checklist: LabChecklistItem[],
): string {
  const proxima = etapaAtual(etapas, checklist)
  if (!proxima) {
    return 'Essa era a última — agora é só apertar o botão de concluir aqui embaixo.'
  }
  return `Fechamos essa. A próxima da fila é "${proxima.titulo}" — tá destacada aí no plano.`
}
