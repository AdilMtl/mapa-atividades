import { describe, expect, it } from 'vitest'

import { montarJornadaFunil } from './jornada'

describe('montarJornadaFunil', () => {
  it('estrutura as 7 etapas na ordem certa, com topo = sessões de radar', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 267,
      concluiramRadar: 72,
      leadsUnicos: 15,
      convidadosLab: 0,
      criaramConta: 0,
      criaramProjeto: 0,
      concluiramProjeto: 0,
    })
    expect(jornada.topo).toBe(267)
    expect(jornada.etapas.map((e) => e.id)).toEqual([
      'sessoes_radar',
      'concluiram_radar',
      'deixaram_email',
      'convidados_lab',
      'criaram_conta',
      'criaram_projeto',
      'concluiram_projeto',
    ])
  })

  it('primeira etapa não tem pctAnterior nem parede (não existe etapa anterior)', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 267,
      concluiramRadar: 72,
      leadsUnicos: 15,
      convidadosLab: 0,
      criaramConta: 0,
      criaramProjeto: 0,
      concluiramProjeto: 0,
    })
    const primeira = jornada.etapas[0]
    expect(primeira.pctAnterior).toBeNull()
    expect(primeira.parede).toBe(false)
  })

  it('parede = true quando a etapa anterior tinha gente e esta é zero (critério do §4: zero é porta fechada)', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 267,
      concluiramRadar: 72,
      leadsUnicos: 15,
      convidadosLab: 0, // 15 leads, zero convidados — porta fechada de verdade (o dado real da 601)
      criaramConta: 0,
      criaramProjeto: 0,
      concluiramProjeto: 0,
    })
    const convidadosLab = jornada.etapas.find((e) => e.id === 'convidados_lab')!
    expect(convidadosLab.parede).toBe(true)
    expect(convidadosLab.pctAnterior).toBe(0)
  })

  it('sem parede quando ambas as etapas (anterior e atual) já são zero — não é queda, é continuação', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 267,
      concluiramRadar: 72,
      leadsUnicos: 15,
      convidadosLab: 0,
      criaramConta: 0, // anterior (convidados_lab) já era 0 — não é uma NOVA parede
      criaramProjeto: 0,
      concluiramProjeto: 0,
    })
    const criaramConta = jornada.etapas.find((e) => e.id === 'criaram_conta')!
    expect(criaramConta.parede).toBe(false)
    expect(criaramConta.pctAnterior).toBeNull()
  })

  it('pctAnterior calcula corretamente uma queda parcial', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 267,
      concluiramRadar: 72,
      leadsUnicos: 15,
      convidadosLab: 0,
      criaramConta: 0,
      criaramProjeto: 0,
      concluiramProjeto: 0,
    })
    const concluiramRadar = jornada.etapas.find((e) => e.id === 'concluiram_radar')!
    // 72/267 = 26.966...% → arredonda pra 27.0
    expect(concluiramRadar.pctAnterior).toBe(27)
  })

  it('cadeia toda positiva (hipotética) não tem nenhuma parede', () => {
    const jornada = montarJornadaFunil({
      sessoesRadar: 100,
      concluiramRadar: 50,
      leadsUnicos: 20,
      convidadosLab: 5,
      criaramConta: 3,
      criaramProjeto: 2,
      concluiramProjeto: 1,
    })
    expect(jornada.etapas.every((e) => !e.parede)).toBe(true)
  })
})
