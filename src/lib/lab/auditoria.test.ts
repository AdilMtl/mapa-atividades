// =============================================================================
// LAB — AUDITORIA EXAUSTIVA DO ESPAÇO FECHADO (ISSUE-313, spec v2.1 §7.4)
// A resposta de engenharia ao risco "parece robusto mas só funciona pra casos
// específicos": como a conversa é 100% fechada, o espaço de respostas é FINITO
// (10×10×5×5×7×8×5 = 700.000 combinações) — então roda-se TODAS contra o motor
// e valida-se cada invariante de verdade, não por amostragem. Se uma mudança
// futura de pesos quebrar um invariante, este arquivo grita antes do deploy.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest'

import { COMPLEXIDADE, decidirOportunidade } from '../radar/oportunidades'
import type { SolutionTypeId } from '../radar/types'
import { perguntaDesempate, precisaDesempate } from './desempate'
import { gerarPlano } from './plan-generator'
import type { AmbienteId, LabDiagnosis } from './types'
import { AMBIENTES } from './wizard-flow'

const ENTREGAS = [
  'entrega_relatorios',
  'entrega_planilhas',
  'entrega_apresentacoes',
  'entrega_analises',
  'entrega_textos',
  'entrega_status',
  'entrega_dashboards',
  'entrega_processos',
  'entrega_atendimento',
  'entrega_reunioes',
]
const PERDAS = [
  'perda_consolidando',
  'perda_copiando',
  'perda_revisando',
  'perda_apresentacoes',
  'perda_planilhas',
  'perda_duvidas',
  'perda_buscando',
  'perda_analises',
  'perda_organizando',
  'perda_alinhando',
]
const FREQUENCIAS = ['freq_raramente', 'freq_mensal', 'freq_semanal', 'freq_varias_semana', 'freq_diario']
const PUBLICOS = ['pub_so_eu', 'pub_time', 'pub_outra_area', 'pub_lideranca', 'pub_externo']
const DADOS = [
  'dado_texto_livre',
  'dado_planilha',
  'dado_sistemas',
  'dado_documentos',
  'dado_emails',
  'dado_sensiveis',
  'dado_nao_sei',
]
const DESEJOS = [
  'desejo_tempo',
  'desejo_erro',
  'desejo_padronizar',
  'desejo_visualizacao',
  'desejo_decisao',
  'desejo_compartilhar',
  'desejo_automatizar',
  'desejo_ferramenta',
]
const CONFORTOS = ['conf_baixo', 'conf_medio', 'conf_bom', 'conf_alto', 'conf_muito_alto']

const TETO_ESPERADO: Record<string, number> = {
  conf_baixo: 2,
  conf_medio: 3,
  conf_bom: Infinity,
  conf_alto: Infinity,
  conf_muito_alto: Infinity,
}

interface Agregado {
  total: number
  vencedores: Map<SolutionTypeId, number>
  violacoesTeto: number
  sensivelSemDiligencia: number
  diligenciaSemSensivel: number
  desempatesDisparados: number
  empatesExatos: number
  paresDeDesempate: Set<string>
}

const agg: Agregado = {
  total: 0,
  vencedores: new Map(),
  violacoesTeto: 0,
  sensivelSemDiligencia: 0,
  diligenciaSemSensivel: 0,
  desempatesDisparados: 0,
  empatesExatos: 0,
  paresDeDesempate: new Set(),
}

// Uma passada única pelas 700k combinações; os `it` validam os agregados.
beforeAll(() => {
  for (const entrega of ENTREGAS)
    for (const perda of PERDAS)
      for (const frequencia of FREQUENCIAS)
        for (const publico of PUBLICOS)
          for (const dado of DADOS)
            for (const desejo of DESEJOS)
              for (const conforto of CONFORTOS) {
                const r = decidirOportunidade({
                  op_entrega: entrega,
                  op_perda: perda,
                  op_frequencia: frequencia,
                  op_publico: publico,
                  op_dado: dado,
                  op_desejo: desejo,
                  op_conforto: conforto,
                })
                agg.total++
                agg.vencedores.set(r.tipo, (agg.vencedores.get(r.tipo) ?? 0) + 1)

                if (COMPLEXIDADE[r.tipo] > TETO_ESPERADO[conforto]) agg.violacoesTeto++
                if (dado === 'dado_sensiveis' && !r.flags.diligencia) agg.sensivelSemDiligencia++
                if (dado !== 'dado_sensiveis' && r.flags.diligencia) agg.diligenciaSemSensivel++

                const par = precisaDesempate(r.pontuacao)
                if (par) {
                  agg.desempatesDisparados++
                  agg.paresDeDesempate.add(par.join('|'))
                  if (r.pontuacao[par[0]] === r.pontuacao[par[1]]) agg.empatesExatos++
                }
              }
}, 300_000)

describe('auditoria exaustiva — 700.000 combinações contra o motor', () => {
  it('varreu o espaço completo', () => {
    expect(agg.total).toBe(10 * 10 * 5 * 5 * 7 * 8 * 5)
  })

  it('(a) todos os 9 tipos são alcançáveis por combinações reais', () => {
    expect([...agg.vencedores.keys()].sort()).toEqual(
      [
        'agentico',
        'app_offline',
        'app_tabela',
        'automacao',
        'dashboard',
        'orquestrado',
        'prompt',
        'template',
        'workflow',
      ].sort(),
    )
    // Registro da distribuição — sobe pro output do CI para acompanhamento.
    console.info(
      '[auditoria] vencedores: ' +
        JSON.stringify(
          Object.fromEntries([...agg.vencedores.entries()].sort((a, b) => b[1] - a[1])),
        ) +
        ` | desempates (limiar atual): ${((agg.desempatesDisparados / agg.total) * 100).toFixed(1)}%` +
        ` | empates exatos: ${((agg.empatesExatos / agg.total) * 100).toFixed(1)}%`,
    )
  })

  it('(b) o teto de conforto NUNCA é violado (fluência baixa não recebe projeto acima dela)', () => {
    expect(agg.violacoesTeto).toBe(0)
  })

  it('(c) dado sensível SEMPRE liga diligência — e nunca por engano', () => {
    expect(agg.sensivelSemDiligencia).toBe(0)
    expect(agg.diligenciaSemSensivel).toBe(0)
  })

  it('(d2) o desempate é exceção, não regra (taxa < 30% — calibragem da spec §4.3)', () => {
    expect(agg.desempatesDisparados / agg.total).toBeLessThan(0.3)
  })

  it('(d) todo par que empata na prática tem pergunta de desempate derivável', () => {
    expect(agg.paresDeDesempate.size).toBeGreaterThan(0)
    for (const chave of agg.paresDeDesempate) {
      const par = chave.split('|') as [SolutionTypeId, SolutionTypeId]
      expect(perguntaDesempate(par), chave).not.toBeNull()
    }
  })
})

describe('(e) todo plano tem versão de corredor pra QUALQUER arsenal', () => {
  const diagnosticoDe = (tipo: SolutionTypeId, diligencia: boolean): LabDiagnosis => ({
    tipo,
    familia: 'construcao',
    nivel_na_familia: 1,
    complexidade: COMPLEXIDADE[tipo],
    complexidade_label: 'media',
    potencial_ia: 'medio',
    potencial_automacao: 'medio',
    risco: 'medio',
    flags: { diligencia, rebaixadoPorConforto: false },
    pontuacao: Object.fromEntries(
      Object.keys(COMPLEXIDADE).map((t) => [t, 0]),
    ) as Record<SolutionTypeId, number>,
    vencedor_bruto: tipo,
    estimativa_maturidade: 'operador',
    engine_version: 'auditoria',
  })

  const arsenais: AmbienteId[][] = [[], ...AMBIENTES.map((a) => [a.id])]

  it('9 tipos × 6 arsenais × com/sem diligência → plano íntegro sempre', () => {
    for (const tipo of Object.keys(COMPLEXIDADE) as SolutionTypeId[]) {
      for (const ambiente of arsenais) {
        for (const diligencia of [false, true]) {
          const plano = gerarPlano(diagnosticoDe(tipo, diligencia), { ambiente })
          expect(plano.resumo.length, `${tipo}/${ambiente.join(',')}`).toBeGreaterThan(0)
          expect(plano.etapas.length).toBeGreaterThanOrEqual(4)
          expect(plano.materiais_slugs.length).toBeGreaterThan(0)
          if (diligencia) expect(plano.etapas[0].id).toBe('diligencia')
        }
      }
    }
  })
})
