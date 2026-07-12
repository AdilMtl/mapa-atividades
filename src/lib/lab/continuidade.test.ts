// =============================================================================
// LAB — TESTES DA CAMINHADA (ISSUE-314B v2)
// Fase atual derivada do checklist · retomada só com caminhada real · beat
// sem número (marcar fora de ordem não pode contar errado) · material mora
// na fase que fala de prompt/IA, com fallback na primeira.
// =============================================================================

import { describe, expect, it } from 'vitest'

import { beatTransicao, etapaAtual, faseDoMaterial, textoRetomada } from './continuidade'
import type { LabChecklistItem, LabPlanEtapa } from './types'

const ETAPAS: LabPlanEtapa[] = [
  { id: 'e1', titulo: 'Descreva a tarefa como você faz hoje', descricao: 'd1' },
  { id: 'e2', titulo: 'Estruture o prompt em quatro partes', descricao: 'd2' },
  { id: 'e3', titulo: 'Teste na tarefa real', descricao: 'd3' },
]

function checklist(done: Record<string, boolean>): LabChecklistItem[] {
  return ETAPAS.map((e) => ({ id: e.id, label: e.titulo, done: done[e.id] ?? false }))
}

describe('etapaAtual', () => {
  it('nada marcado → a primeira fase', () => {
    expect(etapaAtual(ETAPAS, checklist({}))).toEqual({
      id: 'e1',
      indice: 0,
      titulo: ETAPAS[0].titulo,
    })
  })

  it('marcadas em ordem → a primeira pendente', () => {
    expect(etapaAtual(ETAPAS, checklist({ e1: true }))?.id).toBe('e2')
  })

  it('marcada fora de ordem → a atual segue sendo a primeira pendente', () => {
    expect(etapaAtual(ETAPAS, checklist({ e1: true, e3: true }))?.id).toBe('e2')
  })

  it('tudo marcado → null', () => {
    expect(etapaAtual(ETAPAS, checklist({ e1: true, e2: true, e3: true }))).toBeNull()
  })

  it('plano sem etapas → null', () => {
    expect(etapaAtual([], [])).toBeNull()
  })

  it('fase sem entrada no checklist é pulada (o PATCH rejeitaria a marcação)', () => {
    const soDuas: LabChecklistItem[] = [
      { id: 'e2', label: 'x', done: false },
      { id: 'e3', label: 'y', done: false },
    ]
    expect(etapaAtual(ETAPAS, soDuas)?.id).toBe('e2')
  })
})

describe('textoRetomada', () => {
  it('nada feito ainda → sem cartão (a página inteira é o convite)', () => {
    expect(textoRetomada(ETAPAS, checklist({}))).toBeNull()
  })

  it('tudo feito → sem cartão (o que falta é concluir, não retomar)', () => {
    expect(textoRetomada(ETAPAS, checklist({ e1: true, e2: true, e3: true }))).toBeNull()
  })

  it('caminhada no meio → posição e título da fase atual', () => {
    expect(textoRetomada(ETAPAS, checklist({ e1: true }))).toBe(
      'Da última vez você parou na fase 2 de 3 — "Estruture o prompt em quatro partes".',
    )
  })
})

describe('beatTransicao', () => {
  it('ainda tem próxima → convida pra fase recém-aberta, sem número', () => {
    expect(beatTransicao(ETAPAS, checklist({ e1: true }))).toBe(
      'Fechamos essa. A próxima já tá aberta aqui embaixo — segue no teu ritmo.',
    )
  })

  it('era a última → aponta pro botão de concluir', () => {
    expect(beatTransicao(ETAPAS, checklist({ e1: true, e2: true, e3: true }))).toBe(
      'Essa era a última — agora é só apertar o botão de concluir aqui embaixo.',
    )
  })
})

describe('faseDoMaterial', () => {
  it('acha a primeira fase que fala de prompt', () => {
    expect(faseDoMaterial(ETAPAS)).toBe('e2')
  })

  it('acha fase que fala de IA quando não há "prompt"', () => {
    const etapas: LabPlanEtapa[] = [
      { id: 'a', titulo: 'Mapeie o fluxo', descricao: 'x' },
      { id: 'b', titulo: 'Monte com a IA', descricao: 'y' },
    ]
    expect(faseDoMaterial(etapas)).toBe('b')
  })

  it('não casa "IA" dentro de outra palavra (ex.: "diariamente")', () => {
    const etapas: LabPlanEtapa[] = [
      { id: 'a', titulo: 'Rotina', descricao: 'revise diariamente o quadro' },
      { id: 'b', titulo: 'Prompt final', descricao: 'z' },
    ]
    expect(faseDoMaterial(etapas)).toBe('b')
  })

  it('nenhuma fala de prompt/IA → primeira fase', () => {
    const etapas: LabPlanEtapa[] = [
      { id: 'a', titulo: 'Mapeie o fluxo', descricao: 'x' },
      { id: 'b', titulo: 'Valide com o time', descricao: 'y' },
    ]
    expect(faseDoMaterial(etapas)).toBe('a')
  })

  it('plano vazio → null', () => {
    expect(faseDoMaterial([])).toBeNull()
  })
})
