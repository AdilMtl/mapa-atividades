// Testes do gerador de plano (ISSUE-312): estrutura 4–7 etapas, checklist
// espelhado, slugs sempre dentro do registro canônico (contrato com a 316),
// personalização por área/fluência/diligência e determinismo.
import { describe, expect, it } from 'vitest'
import { CONTEUDO_OPORTUNIDADES, CRUZAMENTO_MATURIDADE } from '../radar/content'
import { COMPLEXIDADE, FAMILIA_POR_TIPO, TIPOS_SOLUCAO } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import { diagnosticar } from './engine'
import {
  gerarPlano,
  GENERATOR_VERSION,
  SLUG_DILIGENCIA,
  SLUGS_CANONICOS,
  SLUGS_POR_TIPO,
} from './plan-generator'
import type { LabDiagnosis, WizardAnswers } from './types'
import { WIZARD_SCHEMA_VERSION } from './types'

/** Diagnóstico sintético mínimo — o suite do engine cobre a geração real. */
function diagnosticoDe(
  tipo: SolutionTypeId,
  overrides: Partial<LabDiagnosis> = {},
): LabDiagnosis {
  return {
    tipo,
    familia: FAMILIA_POR_TIPO[tipo].familia,
    nivel_na_familia: FAMILIA_POR_TIPO[tipo].nivelNaFamilia,
    complexidade: COMPLEXIDADE[tipo],
    complexidade_label: 'media',
    potencial_ia: 'medio',
    potencial_automacao: 'medio',
    risco: 'medio',
    flags: { diligencia: false, rebaixadoPorConforto: false },
    pontuacao: Object.fromEntries(TIPOS_SOLUCAO.map((t) => [t, 0])) as Record<
      SolutionTypeId,
      number
    >,
    vencedor_bruto: tipo,
    estimativa_maturidade: 'operador',
    engine_version: 'lab-engine-test',
    ...overrides,
  }
}

describe('estrutura do plano para os 9 tipos', () => {
  for (const tipo of TIPOS_SOLUCAO) {
    it(`${tipo}: 4–7 etapas, checklist espelhado, slugs canônicos`, () => {
      const plano = gerarPlano(diagnosticoDe(tipo))

      expect(plano.etapas.length).toBeGreaterThanOrEqual(4)
      expect(plano.etapas.length).toBeLessThanOrEqual(7)
      expect(plano.resumo.length).toBeGreaterThan(0)
      expect(plano.artefato_sugerido.length).toBeGreaterThan(0)
      expect(plano.generator_version).toBe(GENERATOR_VERSION)

      // Checklist é espelho fiel das etapas, tudo desmarcado na geração.
      expect(plano.checklist.map((c) => c.id)).toEqual(plano.etapas.map((e) => e.id))
      expect(plano.checklist.map((c) => c.label)).toEqual(plano.etapas.map((e) => e.titulo))
      expect(plano.checklist.every((c) => c.done === false)).toBe(true)

      // Ids únicos (o persist do done da 314 depende disso).
      expect(new Set(plano.etapas.map((e) => e.id)).size).toBe(plano.etapas.length)

      // Zero slug fora do registro canônico (contrato com a ISSUE-316).
      expect(plano.materiais_slugs.length).toBeGreaterThan(0)
      for (const slug of plano.materiais_slugs) {
        expect(SLUGS_CANONICOS).toContain(slug)
      }
    })
  }

  it('registro canônico tem 10 slugs únicos (faixa de 6–10 ativos da ISSUE-316)', () => {
    expect(SLUGS_CANONICOS.length).toBe(10)
    expect(new Set(SLUGS_CANONICOS).size).toBe(SLUGS_CANONICOS.length)
    expect(SLUGS_CANONICOS).toContain(SLUG_DILIGENCIA)
  })
})

describe('personalização', () => {
  it('diligência: etapa de cuidado com dados entra PRIMEIRO + material dedicado', () => {
    const plano = gerarPlano(
      diagnosticoDe('template', { flags: { diligencia: true, rebaixadoPorConforto: false } }),
    )
    expect(plano.etapas[0].id).toBe('diligencia')
    expect(plano.checklist[0].id).toBe('diligencia')
    expect(plano.materiais_slugs).toContain(SLUG_DILIGENCIA)
    expect(plano.etapas.length).toBe(6) // 5 base + diligência
  })

  it('sem diligência não há etapa nem material de dado sensível', () => {
    const plano = gerarPlano(diagnosticoDe('template'))
    expect(plano.etapas.some((e) => e.id === 'diligencia')).toBe(false)
    expect(plano.materiais_slugs).not.toContain(SLUG_DILIGENCIA)
  })

  it('fluência real alta (builder) ganha a etapa "um nível acima" no fim', () => {
    const plano = gerarPlano(diagnosticoDe('workflow'), { fluencia: 'builder' })
    const ultima = plano.etapas[plano.etapas.length - 1]
    expect(ultima.id).toBe('um_nivel_acima')
    expect(ultima.descricao).toBe(CONTEUDO_OPORTUNIDADES.workflow.naPratica.umNivelAcima)
  })

  it('fluência real baixa (usuario) não ganha a etapa extra', () => {
    const plano = gerarPlano(diagnosticoDe('workflow'), { fluencia: 'usuario' })
    expect(plano.etapas.some((e) => e.id === 'um_nivel_acima')).toBe(false)
  })

  it('sem fluência real, a estimativa alta do diagnóstico decide', () => {
    const plano = gerarPlano(
      diagnosticoDe('prompt', { estimativa_maturidade: 'builder_referencia' }),
    )
    expect(plano.etapas[plano.etapas.length - 1].id).toBe('um_nivel_acima')
  })

  it('fluência real tem precedência sobre a estimativa', () => {
    const plano = gerarPlano(
      diagnosticoDe('prompt', { estimativa_maturidade: 'builder_referencia' }),
      { fluencia: 'usuario' },
    )
    expect(plano.etapas.some((e) => e.id === 'um_nivel_acima')).toBe(false)
    expect(plano.resumo).toContain(CRUZAMENTO_MATURIDADE.comNivelReal.usuario)
  })

  it('área com exemplo entra no resumo; área sem exemplo não quebra', () => {
    const comExemplo = gerarPlano(diagnosticoDe('prompt'), { area: 'area_marketing' })
    expect(comExemplo.resumo).toContain(
      CONTEUDO_OPORTUNIDADES.prompt.exemploPorArea!.area_marketing,
    )
    // prompt não tem exemplo para area_juridico — o resumo fica sem o parágrafo, sem erro.
    const semExemplo = gerarPlano(diagnosticoDe('prompt'), { area: 'area_juridico' })
    expect(semExemplo.resumo).toContain(CRUZAMENTO_MATURIDADE.comEstimativa.operador)
    expect(semExemplo.resumo.split('\n\n').length).toBe(2)
    expect(comExemplo.resumo.split('\n\n').length).toBe(3)
  })
})

describe('determinismo e integração com o motor', () => {
  it('mesmo diagnóstico + mesmas opções → mesmo plano', () => {
    const d = diagnosticoDe('automacao')
    expect(gerarPlano(d, { area: 'area_vendas', fluencia: 'operador' })).toEqual(
      gerarPlano(d, { area: 'area_vendas', fluencia: 'operador' }),
    )
  })

  it('ponta a ponta: wizard → diagnóstico → plano coerente (caso Renata)', () => {
    const respostas: WizardAnswers = {
      schema_version: WIZARD_SCHEMA_VERSION,
      titulo: 'Painel da carteira',
      problema: 'Consolido a planilha de vendas na mão toda semana para a liderança.',
      area: 'area_vendas',
      entrega: 'entrega_planilhas',
      perda: 'perda_consolidando',
      frequencia: 'freq_semanal',
      publico: 'pub_lideranca',
      dado: 'dado_planilha',
      desejo: 'desejo_decisao',
      conforto: 'conf_bom',
    }
    const diagnostico = diagnosticar(respostas)
    const plano = gerarPlano(diagnostico, { area: respostas.area })

    expect(diagnostico.tipo).toBe('dashboard')
    expect(plano.materiais_slugs).toEqual(SLUGS_POR_TIPO.dashboard)
    expect(plano.etapas.length).toBe(5)
    expect(plano.resumo).toContain(
      CONTEUDO_OPORTUNIDADES.dashboard.exemploPorArea!.area_vendas,
    )
    // Estimativa da Renata é "operador" (conf_bom) — linha de fluência correspondente.
    expect(plano.resumo).toContain(CRUZAMENTO_MATURIDADE.comEstimativa.operador)
  })
})
