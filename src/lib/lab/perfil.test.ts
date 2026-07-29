// =============================================================================
// LAB — TESTES DO PERFIL DO BUILDER (ISSUE-317)
// =============================================================================

import { describe, expect, it } from 'vitest'

import { OPCOES_AREA, OPCOES_FLUENCIA, OPCOES_FERRAMENTAS, sanitizarPerfil } from './perfil'

describe('sanitizarPerfil', () => {
  it('guarda o que é válido e descarta o que não reconhece', () => {
    const p = sanitizarPerfil({
      role_area: OPCOES_AREA[0].id,
      seniority: 'senior',
      ai_fluency_level: 'operador',
      main_goal: '  Apresentar um caso pronto até o fim do trimestre  ',
      biggest_bottleneck: 'Consolidar planilha toda semana',
      tools_used: [OPCOES_FERRAMENTAS[0].id, 'lixo_invalido'],
      origin: 'radar',
    })
    expect(p.role_area).toBe(OPCOES_AREA[0].id)
    expect(p.seniority).toBe('senior')
    expect(p.ai_fluency_level).toBe('operador')
    expect(p.main_goal).toBe('Apresentar um caso pronto até o fim do trimestre')
    expect(p.biggest_bottleneck).toBe('Consolidar planilha toda semana')
    expect(p.tools_used).toEqual([OPCOES_FERRAMENTAS[0].id])
    expect(p.origin).toBe('radar')
  })

  it('nunca lança — payload nulo/estranho vira perfil vazio com origin default', () => {
    expect(sanitizarPerfil(null).role_area).toBeNull()
    expect(sanitizarPerfil(null).origin).toBe('direto')
    expect(sanitizarPerfil('string').seniority).toBeNull()
    expect(sanitizarPerfil(42).tools_used).toEqual([])
  })

  it('id fora do vocabulário vira null, nunca passa adiante', () => {
    const p = sanitizarPerfil({
      role_area: 'area_inexistente',
      seniority: 'chefao',
      ai_fluency_level: 'lendario',
      origin: 'marketing',
    })
    expect(p.role_area).toBeNull()
    expect(p.seniority).toBeNull()
    expect(p.ai_fluency_level).toBeNull()
    expect(p.origin).toBe('direto')
  })

  it('texto livre vazio ou só espaço vira null', () => {
    expect(sanitizarPerfil({ main_goal: '   ' }).main_goal).toBeNull()
    expect(sanitizarPerfil({ main_goal: 123 }).main_goal).toBeNull()
  })

  it('texto livre é aparado no limite', () => {
    const p = sanitizarPerfil({ main_goal: 'x'.repeat(600) })
    expect(p.main_goal).toHaveLength(500)
  })

  it('tools_used remove duplicatas', () => {
    const id = OPCOES_FERRAMENTAS[0].id
    const p = sanitizarPerfil({ tools_used: [id, id, OPCOES_FERRAMENTAS[1].id] })
    expect(p.tools_used).toEqual([id, OPCOES_FERRAMENTAS[1].id])
  })
})

describe('vocabulários', () => {
  it('OPCOES_FLUENCIA tem os 5 níveis do radar de maturidade, em ordem', () => {
    expect(OPCOES_FLUENCIA.map((o) => o.id)).toEqual([
      'curioso',
      'usuario',
      'operador',
      'builder',
      'referencia',
    ])
  })

  it('OPCOES_AREA deriva do radar (não fica vazio)', () => {
    expect(OPCOES_AREA.length).toBeGreaterThan(0)
  })
})
