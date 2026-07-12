// =============================================================================
// LAB — TESTES DA CONTINUIDADE ENTRE ETAPAS (ISSUE-314B)
// Etapa atual derivada do checklist · retomada só com caminhada real ·
// beat apresenta a próxima (ou o fechamento) — nunca aponta pra um beco.
// =============================================================================

import { describe, expect, it } from 'vitest'

import { beatTransicao, etapaAtual, textoRetomada } from './continuidade'
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
  it('nada marcado → a primeira etapa', () => {
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

  it('etapa sem entrada no checklist é pulada (o PATCH rejeitaria a marcação)', () => {
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

  it('caminhada no meio → posição e título da etapa atual', () => {
    expect(textoRetomada(ETAPAS, checklist({ e1: true }))).toBe(
      'Da última vez você parou na etapa 2 de 3 — "Estruture o prompt em quatro partes".',
    )
  })
})

describe('beatTransicao', () => {
  it('ainda tem próxima → apresenta ela pelo título', () => {
    expect(beatTransicao(ETAPAS, checklist({ e1: true }))).toBe(
      'Fechamos essa. A próxima da fila é "Estruture o prompt em quatro partes" — tá destacada aí no plano.',
    )
  })

  it('era a última → aponta pro botão de concluir', () => {
    expect(beatTransicao(ETAPAS, checklist({ e1: true, e2: true, e3: true }))).toBe(
      'Essa era a última — agora é só apertar o botão de concluir aqui embaixo.',
    )
  })
})
