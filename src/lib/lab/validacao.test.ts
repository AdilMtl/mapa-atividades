// =============================================================================
// LAB — TESTES DA VALIDAÇÃO DO WIZARD v2 (ISSUE-313)
// Rascunho tolerante · completo estrito · texto livre nunca vira id (1A).
// =============================================================================

import { describe, expect, it } from 'vitest'

import { WIZARD_SCHEMA_VERSION_V2 } from './types'
import { sanitizarRascunho, validarCompleto } from './validacao'

/** Respostas completas válidas — o caminho feliz da trilha DOR. */
const COMPLETO_DOR = {
  porta: 'dor',
  titulo: 'Fim da consolidação manual',
  area: 'area_vendas',
  entrega: 'entrega_relatorios',
  perda: 'perda_consolidando',
  frequencia: 'freq_semanal',
  publico: 'pub_lideranca',
  dado: 'dado_planilha',
  desejo: 'desejo_tempo',
  conforto: 'conf_medio',
  ambiente: ['amb_ia_gratuita', 'amb_workspace'],
  horas_semana: 4,
}

describe('sanitizarRascunho', () => {
  it('guarda o que é válido e ignora o que não reconhece', () => {
    const r = sanitizarRascunho({
      porta: 'ideia',
      arquetipo: 'arq_painel',
      area: 'area_vendas',
      campo_inventado: 'lixo',
      entrega: 'entrega_inexistente', // id fora do vocabulário → some
      conforto: 'conf_alto',
    })
    expect(r.schema_version).toBe(WIZARD_SCHEMA_VERSION_V2)
    expect(r.porta).toBe('ideia')
    expect(r.arquetipo).toBe('arq_painel')
    expect(r.conforto).toBe('conf_alto')
    expect(r.entrega).toBeUndefined()
    expect('campo_inventado' in r).toBe(false)
  })

  it('nunca lança — payload nulo/estranho vira rascunho vazio', () => {
    expect(sanitizarRascunho(null).schema_version).toBe(WIZARD_SCHEMA_VERSION_V2)
    expect(sanitizarRascunho('string').porta).toBeUndefined()
    expect(sanitizarRascunho(42).titulo).toBeUndefined()
  })

  it('area aceita null explícito (pulou) e distingue de ausente', () => {
    expect(sanitizarRascunho({ area: null }).area).toBeNull()
    expect(sanitizarRascunho({}).area).toBeUndefined()
  })

  it('texto livre é aparado no limite e não vira classificação', () => {
    const r = sanitizarRascunho({ relato: `  ${'x'.repeat(5000)}  ` })
    expect(r.relato).toHaveLength(2000)
    expect(r.entrega).toBeUndefined()
  })

  it('ambiente deduplica e derruba slug inválido; horas arredonda e limita 0–10', () => {
    const r = sanitizarRascunho({
      ambiente: ['amb_shadow', 'amb_shadow', 'amb_fake'],
      horas_semana: 7.6,
    })
    expect(r.ambiente).toEqual(['amb_shadow'])
    expect(r.horas_semana).toBe(8)
    expect(sanitizarRascunho({ horas_semana: 99 }).horas_semana).toBeUndefined()
  })

  it('desempate só entra íntegro (par de tipos + resposta do vocabulário)', () => {
    const ok = sanitizarRascunho({
      desempate: { par: ['dashboard', 'automacao'], resposta: 'desejo_visualizacao' },
    })
    expect(ok.desempate?.par).toEqual(['dashboard', 'automacao'])
    const ruim = sanitizarRascunho({
      desempate: { par: ['dashboard', 'tipo_fake'], resposta: 'desejo_visualizacao' },
    })
    expect(ruim.desempate).toBeUndefined()
  })
})

describe('validarCompleto', () => {
  it('aceita o caminho feliz da trilha DOR', () => {
    const v = validarCompleto(COMPLETO_DOR)
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.respostas.porta).toBe('dor')
      expect(v.respostas.ambiente).toEqual(['amb_ia_gratuita', 'amb_workspace'])
    }
  })

  it('trilha IDEIA exige arquétipo', () => {
    const v = validarCompleto({ ...COMPLETO_DOR, porta: 'ideia' })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.erros.join(' ')).toContain('arquétipo')
  })

  it('campo de classificação faltando reprova com erro nomeado', () => {
    const semDesejo = Object.fromEntries(
      Object.entries(COMPLETO_DOR).filter(([campo]) => campo !== 'desejo'),
    )
    const v = validarCompleto(semDesejo)
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.erros.some((e) => e.startsWith('desejo'))).toBe(true)
  })

  it('ambiente ausente vira [] (base universal da spec)', () => {
    const semAmbiente = Object.fromEntries(
      Object.entries(COMPLETO_DOR).filter(([campo]) => campo !== 'ambiente'),
    )
    const v = validarCompleto(semAmbiente)
    expect(v.ok).toBe(true)
    if (v.ok) expect(v.respostas.ambiente).toEqual([])
  })
})
