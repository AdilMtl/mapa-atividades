// Cruzamento de maturidade entre os dois radares (doc 11 §8, ISSUE-103).
// Fica FORA de lib/radar/* de propósito: o motor é puro (zero sessionStorage) — só a UI lê/grava.

import type { MaturityLevelId } from './radar/types'

const CHAVE_MATURIDADE = 'conversaas.radar.maturidade'

interface MaturidadeReal {
  nivel: MaturityLevelId
  score: number
}

export function salvarMaturidadeReal(nivel: MaturityLevelId, score: number): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CHAVE_MATURIDADE, JSON.stringify({ nivel, score }))
  } catch {
    // sessionStorage indisponível (modo privado etc.) — oportunidades cai para estimativa por P8.
  }
}

export function lerMaturidadeReal(): MaturidadeReal | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(CHAVE_MATURIDADE)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.nivel === 'string' && typeof parsed?.score === 'number') {
      return parsed as MaturidadeReal
    }
    return null
  } catch {
    return null
  }
}
