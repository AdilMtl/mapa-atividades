// =============================================================================
// LAB — TESTES DO DESEMPATE CONDICIONAL (ISSUE-313, spec v2.1 §4.3)
// Invariantes: dispara só dentro do limiar; a pergunta derivada da matriz é
// válida pra QUALQUER par dos 9 tipos (36 pares — teste exaustivo); exclusões
// respeitadas; aplicação determinística.
// =============================================================================

import { describe, expect, it } from 'vitest'

import { MATRIZ_PESOS } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import {
  aplicarDesempate,
  LIMIAR_DESEMPATE,
  perguntaDesempate,
  precisaDesempate,
} from './desempate'

const TIPOS: SolutionTypeId[] = [
  'prompt',
  'template',
  'workflow',
  'automacao',
  'dashboard',
  'app_offline',
  'app_tabela',
  'orquestrado',
  'agentico',
]

function pontuacao(valores: Partial<Record<SolutionTypeId, number>>): Record<SolutionTypeId, number> {
  return Object.fromEntries(TIPOS.map((t) => [t, valores[t] ?? 0])) as Record<
    SolutionTypeId,
    number
  >
}

describe('precisaDesempate', () => {
  it('vencedor claro (margem > limiar) → sem desempate', () => {
    expect(precisaDesempate(pontuacao({ dashboard: 10, automacao: 8 }))).toBeNull()
  })

  it('margem de 1 ponto NÃO dispara (calibragem da auditoria — vira alternativa na proposta)', () => {
    expect(precisaDesempate(pontuacao({ dashboard: 10, automacao: 9 }))).toBeNull()
  })

  it('empate exato → par líder, ordem estável do motor', () => {
    expect(precisaDesempate(pontuacao({ automacao: 10, dashboard: 10 }))).toEqual([
      'automacao',
      'dashboard',
    ])
    expect(precisaDesempate(pontuacao({ prompt: 7, agentico: 7 }))).toEqual([
      'prompt',
      'agentico',
    ])
  })

  it('limiar calibrado: empate exato apenas (auditoria: 56% em limiar 1 vs ~23% em 0)', () => {
    expect(LIMIAR_DESEMPATE).toBe(0)
  })
})

describe('perguntaDesempate — exaustivo nos 36 pares', () => {
  it('todo par de tipos tem pergunta válida (sem exclusões)', () => {
    for (let i = 0; i < TIPOS.length; i++) {
      for (let j = 0; j < TIPOS.length; j++) {
        if (i === j) continue
        const par: [SolutionTypeId, SolutionTypeId] = [TIPOS[i], TIPOS[j]]
        const q = perguntaDesempate(par)
        expect(q, `${par.join(' vs ')}`).not.toBeNull()
        expect(q!.opcaoA.tipo).toBe(par[0])
        expect(q!.opcaoB.tipo).toBe(par[1])
        expect(q!.opcaoA.diferencial).toBeGreaterThan(0)
        expect(q!.opcaoB.diferencial).toBeGreaterThan(0)
        expect(q!.opcaoA.opcao).not.toBe(q!.opcaoB.opcao)
        expect(q!.opcaoA.label.length).toBeGreaterThan(0)
        expect(q!.opcaoB.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('opções já escolhidas pela pessoa são excluídas da busca', () => {
    const par: [SolutionTypeId, SolutionTypeId] = ['dashboard', 'automacao']
    const sem = perguntaDesempate(par)!
    const com = perguntaDesempate(par, [sem.opcaoA.opcao])!
    expect(com.opcaoA.opcao).not.toBe(sem.opcaoA.opcao)
    expect(com.opcaoA.diferencial).toBeLessThanOrEqual(sem.opcaoA.diferencial)
  })

  it('sem contraste possível → null (fallback: alternativas na proposta)', () => {
    const par: [SolutionTypeId, SolutionTypeId] = ['dashboard', 'automacao']
    const todas = Object.keys(MATRIZ_PESOS)
    expect(perguntaDesempate(par, todas)).toBeNull()
  })

  it('é determinística (mesma entrada → mesma pergunta)', () => {
    const par: [SolutionTypeId, SolutionTypeId] = ['prompt', 'app_tabela']
    expect(perguntaDesempate(par)).toEqual(perguntaDesempate(par))
  })
})

describe('aplicarDesempate', () => {
  const q = perguntaDesempate(['dashboard', 'automacao'])!

  it('escolha declara o vencedor correspondente', () => {
    expect(aplicarDesempate(q, q.opcaoA.opcao)).toBe('dashboard')
    expect(aplicarDesempate(q, q.opcaoB.opcao)).toBe('automacao')
  })

  it('resposta desconhecida mantém o líder atual (nunca quebra)', () => {
    expect(aplicarDesempate(q, 'opcao_que_nao_existe')).toBe('dashboard')
  })
})
