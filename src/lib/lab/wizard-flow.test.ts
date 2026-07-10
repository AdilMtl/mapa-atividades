// =============================================================================
// LAB — TESTES DA ÁRVORE DO WIZARD (ISSUE-313, spec v2.1)
// Invariantes de integridade da conversa: todo id referenciado existe no radar,
// todo roteiro cobre as dimensões do motor, toda cena tem fallback. O texto em
// si é aprovação editorial (spec §4) — aqui se testa a estrutura.
// =============================================================================

import { describe, expect, it } from 'vitest'

import { MATRIZ_PESOS, PERGUNTAS_OPORTUNIDADES } from '../radar/oportunidades'
import type { PortaEntrada } from './types'
import {
  AMBIENTES,
  ARQUETIPOS,
  CENA_GENERICA,
  CENA_POR_AREA,
  cenaParaArea,
  FLUENCIA_COMPORTAMENTAL,
  LABEL_OPCAO,
  mancheteBeneficio,
  montarEspelho,
  PORTAS,
  roteiro,
  sugerirTitulo,
} from './wizard-flow'

const IDS_OPCAO_RADAR = new Set(
  PERGUNTAS_OPORTUNIDADES.flatMap((p) => p.options.map((o) => o.id)),
)

const idsDe = (prefixo: string) =>
  [...IDS_OPCAO_RADAR].filter((id) => id.startsWith(prefixo))

describe('integridade dos ids (contrato com o radar)', () => {
  it('toda hipótese de arquétipo aponta pra opções reais do radar', () => {
    for (const arq of ARQUETIPOS) {
      if (!arq.hipoteses) continue
      expect(IDS_OPCAO_RADAR.has(arq.hipoteses.entrega), arq.id).toBe(true)
      expect(IDS_OPCAO_RADAR.has(arq.hipoteses.perda), arq.id).toBe(true)
      for (const desejo of arq.desejoPrioritario) {
        expect(IDS_OPCAO_RADAR.has(desejo), `${arq.id}:${desejo}`).toBe(true)
      }
    }
  })

  it('só arq_outro fica sem hipótese (segue trilha DOR)', () => {
    const semHipotese = ARQUETIPOS.filter((a) => a.hipoteses === null)
    expect(semHipotese.map((a) => a.id)).toEqual(['arq_outro'])
  })

  it('fluência comportamental cobre exatamente os 5 conf_* do radar', () => {
    expect(Object.keys(FLUENCIA_COMPORTAMENTAL).sort()).toEqual(idsDe('conf_').sort())
  })

  it('cenas genéricas cobrem exatamente as 10 perda_* do radar', () => {
    expect(Object.keys(CENA_GENERICA).sort()).toEqual(idsDe('perda_').sort())
  })

  it('todo override de cena usa área e perda que existem no radar', () => {
    for (const [area, cenas] of Object.entries(CENA_POR_AREA)) {
      expect(IDS_OPCAO_RADAR.has(area), area).toBe(true)
      for (const perda of Object.keys(cenas)) {
        expect(IDS_OPCAO_RADAR.has(perda), `${area}:${perda}`).toBe(true)
      }
    }
  })

  it('manchete de benefício cobre todos os desejo_* (com e sem horas)', () => {
    for (const desejo of idsDe('desejo_')) {
      expect(mancheteBeneficio(desejo).length).toBeGreaterThan(0)
      expect(mancheteBeneficio(desejo, 4).length).toBeGreaterThan(0)
    }
  })

  it('hipóteses de arquétipo pontuam na matriz (hipótese inerte seria bug)', () => {
    for (const arq of ARQUETIPOS) {
      if (!arq.hipoteses) continue
      expect(MATRIZ_PESOS[arq.hipoteses.entrega], arq.id).toBeDefined()
      expect(MATRIZ_PESOS[arq.hipoteses.perda], arq.id).toBeDefined()
    }
  })
})

describe('roteiro por trilha', () => {
  const OBRIGATORIAS = [
    'conforto',
    'area',
    'porta',
    'entrega',
    'perda',
    'frequencia',
    'publico',
    'dado',
    'desejo',
    'ambiente',
    'titulo',
  ]

  const portas: PortaEntrada[] = ['ideia', 'dor', 'difusa']

  it.each(portas)('trilha %s grava todas as dimensões obrigatórias', (porta) => {
    const gravadas = new Set(roteiro(porta).flatMap((e) => e.grava))
    for (const campo of OBRIGATORIAS) {
      expect(gravadas.has(campo), `${porta} não grava ${campo}`).toBe(true)
    }
  })

  it.each(portas)('trilha %s: nenhuma dimensão gravada duas vezes', (porta) => {
    const gravadas = roteiro(porta).flatMap((e) => e.grava)
    expect(new Set(gravadas).size).toBe(gravadas.length)
  })

  it.each(portas)('trilha %s: blocos em ordem e ~14 interações', (porta) => {
    const etapas = roteiro(porta)
    const blocos = etapas.map((e) => e.bloco)
    expect([...blocos].sort((a, b) => a - b)).toEqual(blocos)
    expect(etapas.length).toBeGreaterThanOrEqual(12)
    expect(etapas.length).toBeLessThanOrEqual(16)
  })

  it('texto obrigatório não existe em nenhuma trilha (regra da 1A)', () => {
    for (const porta of portas) {
      for (const etapa of roteiro(porta)) {
        if (etapa.formato === 'texto') {
          expect(etapa.opcional, `${porta}:${etapa.id}`).toBe(true)
        }
      }
    }
  })

  it('difusa = mecânica da dor com abertura própria', () => {
    const dor = roteiro('dor')
    const difusa = roteiro('difusa')
    expect(difusa.map((e) => e.id)).toEqual(dor.map((e) => e.id))
    expect(difusa.find((e) => e.id === 'cena')!.pergunta).not.toBe(
      dor.find((e) => e.id === 'cena')!.pergunta,
    )
  })
})

describe('cenas, título e espelho', () => {
  it('cenaParaArea: override quando existe, genérico como fallback', () => {
    expect(cenaParaArea('area_vendas', 'perda_consolidando')).toContain('relatório comercial')
    expect(cenaParaArea('area_juridico', 'perda_consolidando')).toBe(
      CENA_GENERICA.perda_consolidando,
    )
    expect(cenaParaArea(null, 'perda_duvidas')).toBe(CENA_GENERICA.perda_duvidas)
  })

  it('sugerirTitulo nunca devolve vazio, pra qualquer combinação', () => {
    for (const arq of ARQUETIPOS) {
      expect(
        sugerirTitulo({ porta: 'ideia', arquetipo: arq.id, area: 'area_vendas' }).length,
      ).toBeGreaterThan(0)
    }
    for (const perda of Object.keys(CENA_GENERICA)) {
      expect(sugerirTitulo({ porta: 'dor', perda }).length).toBeGreaterThan(0)
    }
    expect(sugerirTitulo({ porta: 'difusa' })).toBe('Meu projeto no Lab')
  })

  it('espelho: manchete quantificada com horas, genérica sem', () => {
    const base = {
      area: 'area_vendas',
      entrega: 'entrega_relatorios',
      perda: 'perda_consolidando',
      frequencia: 'freq_semanal',
      publico: 'pub_lideranca',
      dado: 'dado_planilha',
      desejo: 'desejo_tempo',
      conforto: 'conf_medio',
    }
    expect(montarEspelho({ ...base, horas_semana: 4 }).manchete).toContain('~4h')
    expect(montarEspelho(base).manchete).toContain('ganhar tempo')
    expect(montarEspelho(base).corpo).toContain('relatórios')
  })

  it('PORTAS e AMBIENTES têm os ids do contrato v2', () => {
    expect(PORTAS.map((p) => p.id)).toEqual(['ideia', 'dor', 'difusa'])
    expect(AMBIENTES.map((a) => a.id)).toEqual([
      'amb_ia_gratuita',
      'amb_ia_premium',
      'amb_workspace',
      'amb_copilot',
      'amb_shadow',
    ])
  })

  it('LABEL_OPCAO resolve qualquer id de classificação', () => {
    expect(LABEL_OPCAO.entrega_relatorios).toBe('Relatórios')
    expect(LABEL_OPCAO.pub_lideranca).toBe('Liderança')
  })
})
