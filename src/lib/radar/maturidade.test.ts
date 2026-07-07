import { describe, expect, it } from 'vitest'
import { calcularMaturidade, nivelPorScore, PERGUNTAS_MATURIDADE } from './maturidade'
import type { RadarAnswers } from './types'

const PONTUADAS = [
  'mat_delegacao',
  'mat_amplitude',
  'mat_descricao',
  'mat_construcao',
  'mat_discernimento',
  'mat_formato',
  'mat_diligencia',
]

/** Monta respostas a partir dos pontos (1–5) de cada pergunta, na ordem acima. */
function respostas(scores: number[], fronteira?: string): RadarAnswers {
  const r: RadarAnswers = {}
  PONTUADAS.forEach((id, i) => {
    r[id] = `${id}_${scores[i]}`
  })
  if (fronteira) r['mat_fronteira'] = fronteira
  return r
}

describe('estrutura das perguntas', () => {
  it('tem 7 perguntas pontuadas + 1 não pontuada (fronteira), todas com 5 opções', () => {
    expect(PERGUNTAS_MATURIDADE).toHaveLength(8)
    expect(PERGUNTAS_MATURIDADE.filter((p) => p.scored)).toHaveLength(7)
    const fronteira = PERGUNTAS_MATURIDADE.find((p) => !p.scored)
    expect(fronteira?.id).toBe('mat_fronteira')
    for (const p of PERGUNTAS_MATURIDADE) expect(p.options).toHaveLength(5)
  })

  it('opções pontuadas valem 1–5 pela posição (escada monotônica)', () => {
    for (const p of PERGUNTAS_MATURIDADE.filter((q) => q.scored)) {
      expect(p.options.map((o) => o.score)).toEqual([1, 2, 3, 4, 5])
    }
  })
})

describe('faixas de score (doc operacional §10.6)', () => {
  it.each([
    [7, 'curioso'],
    [11, 'curioso'],
    [12, 'usuario'],
    [17, 'usuario'],
    [18, 'operador'],
    [24, 'operador'],
    [25, 'builder'],
    [31, 'builder'],
    [32, 'referencia'],
    [35, 'referencia'],
  ])('score %i → %s', (score, nivel) => {
    expect(nivelPorScore(score)).toBe(nivel)
  })

  it('rejeita score fora de 7–35', () => {
    expect(() => nivelPorScore(6)).toThrow()
    expect(() => nivelPorScore(36)).toThrow()
  })
})

describe('calcularMaturidade', () => {
  it('extremo inferior: tudo 1 → 7 pontos, Curioso', () => {
    const r = calcularMaturidade(respostas([1, 1, 1, 1, 1, 1, 1]))
    expect(r.score).toBe(7)
    expect(r.nivel).toBe('curioso')
  })

  it('extremo superior: tudo 5 → 35 pontos, Referência', () => {
    const r = calcularMaturidade(respostas([5, 5, 5, 5, 5, 5, 5]))
    expect(r.score).toBe(35)
    expect(r.nivel).toBe('referencia')
  })

  it('bordas das faixas: 11→Curioso e 12→Usuário; 24→Operador e 25→Builder', () => {
    expect(calcularMaturidade(respostas([1, 1, 1, 2, 2, 2, 2])).nivel).toBe('curioso') // 11
    expect(calcularMaturidade(respostas([1, 1, 2, 2, 2, 2, 2])).nivel).toBe('usuario') // 12
    expect(calcularMaturidade(respostas([3, 3, 3, 3, 4, 4, 4])).nivel).toBe('operador') // 24
    expect(calcularMaturidade(respostas([3, 3, 3, 4, 4, 4, 4])).nivel).toBe('builder') // 25
  })

  it('expõe os 7 eixos do gráfico radar com rótulos sem jargão e valores 1–5', () => {
    const r = calcularMaturidade(respostas([1, 2, 3, 4, 5, 1, 2]))
    expect(r.eixos.map((e) => e.label)).toEqual([
      'Delegação',
      'Amplitude',
      'Descrição',
      'Construção',
      'Discernimento',
      'Clareza de formato',
      'Diligência',
    ])
    expect(r.eixos.map((e) => e.valor)).toEqual([1, 2, 3, 4, 5, 1, 2])
  })

  it('P8 (fronteira) não pontua, mas viaja no resultado', () => {
    const com = calcularMaturidade(respostas([3, 3, 3, 3, 3, 3, 3], 'mat_fronteira_comecar'))
    const sem = calcularMaturidade(respostas([3, 3, 3, 3, 3, 3, 3]))
    expect(com.score).toBe(sem.score)
    expect(com.fronteira).toBe('mat_fronteira_comecar')
    expect(sem.fronteira).toBeNull()
  })

  it('é determinístico: mesmas respostas → mesmo resultado', () => {
    const a = respostas([2, 4, 3, 1, 5, 2, 4], 'mat_fronteira_solucoes')
    expect(calcularMaturidade(a)).toEqual(calcularMaturidade(a))
  })

  it('lança erro se faltar resposta pontuada', () => {
    const incompleta = respostas([1, 1, 1, 1, 1, 1, 1])
    delete incompleta['mat_formato']
    expect(() => calcularMaturidade(incompleta)).toThrow(/mat_formato/)
  })
})
