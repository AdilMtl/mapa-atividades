import { describe, expect, it } from 'vitest'

import { ROTAS_SEM_FEEDBACK, rotaPermiteFeedback } from './supressao'

describe('rotaPermiteFeedback', () => {
  it('libera as rotas onde a pessoa tem o que comentar', () => {
    for (const rota of ['/', '/lab', '/newsletter', '/obrigado', '/privacidade', '/dashboard', '/lab/inicio']) {
      expect(rotaPermiteFeedback(rota)).toBe(true)
    }
  })

  it('suprime o funil legado e as telas transacionais de entrada', () => {
    for (const rota of ROTAS_SEM_FEEDBACK) {
      expect(rotaPermiteFeedback(rota)).toBe(false)
    }
  })

  it('suprime também as rotas filhas das suprimidas', () => {
    expect(rotaPermiteFeedback('/auth/callback')).toBe(false)
    expect(rotaPermiteFeedback('/pre-diagnostico/resultado')).toBe(false)
  })

  it('não suprime por prefixo de string solta', () => {
    expect(rotaPermiteFeedback('/authorizacao')).toBe(true)
    expect(rotaPermiteFeedback('/pre-diagnostico-novo')).toBe(true)
  })

  it('ignora barra final e trata pathname ausente como suprimido', () => {
    expect(rotaPermiteFeedback('/auth/')).toBe(false)
    expect(rotaPermiteFeedback('/lab/')).toBe(true)
    expect(rotaPermiteFeedback(null)).toBe(false)
    expect(rotaPermiteFeedback(undefined)).toBe(false)
  })

  it('mantém a home liberada mesmo com a normalização de barra', () => {
    expect(rotaPermiteFeedback('/')).toBe(true)
  })
})
