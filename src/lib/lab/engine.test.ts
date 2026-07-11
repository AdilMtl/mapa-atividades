// Testes do adaptador wizard→classificação (ISSUE-312). A classificação em si
// já é coberta pelo suite do radar (personas do doc 11 §9) — aqui o foco é:
// (1) fidelidade do adaptador ao motor, (2) cobertura dos 9 tipos via wizard,
// (3) derivações editoriais (potenciais/risco/labels), (4) determinismo/versão.
import { describe, expect, it } from 'vitest'
import { decidirOportunidade } from '../radar/oportunidades'
import {
  ajustarDiagnosticoParaTipo,
  diagnosticar,
  diagnosticarV2,
  ENGINE_VERSION,
  paraRespostasRadar,
} from './engine'
import type { WizardAnswers, WizardAnswersV2 } from './types'
import { WIZARD_SCHEMA_VERSION } from './types'

interface Cenario {
  area?: string | null
  entrega: string
  perda: string
  frequencia: string
  publico: string
  dado: string
  desejo: string
  conforto: string
}

function wizard(c: Cenario): WizardAnswers {
  return {
    schema_version: WIZARD_SCHEMA_VERSION,
    titulo: 'Projeto de teste',
    problema: 'Descrição do problema nas palavras do usuário.',
    area: c.area ?? null,
    entrega: c.entrega,
    perda: c.perda,
    frequencia: c.frequencia,
    publico: c.publico,
    dado: c.dado,
    desejo: c.desejo,
    conforto: c.conforto,
  }
}

// Cenários cobrindo os 9 tipos: os 5 primeiros são personas aprovadas do doc 11
// §9 (Renata, Marcos, Júlia, Fernando, Camila); os 4 restantes foram calculados
// contra a matriz de pesos para fechar a cobertura exigida pela issue.
const CENARIOS: Array<{ nome: string; esperado: string; cenario: Cenario }> = [
  {
    nome: 'Renata (persona 1)',
    esperado: 'dashboard',
    cenario: {
      entrega: 'entrega_planilhas',
      perda: 'perda_consolidando',
      frequencia: 'freq_semanal',
      publico: 'pub_lideranca',
      dado: 'dado_planilha',
      desejo: 'desejo_decisao',
      conforto: 'conf_bom',
    },
  },
  {
    nome: 'Marcos (persona 2)',
    esperado: 'prompt',
    cenario: {
      entrega: 'entrega_textos',
      perda: 'perda_revisando',
      frequencia: 'freq_mensal',
      publico: 'pub_time',
      dado: 'dado_texto_livre',
      desejo: 'desejo_tempo',
      conforto: 'conf_medio',
    },
  },
  {
    nome: 'Júlia (persona 3, dado sensível)',
    esperado: 'template',
    cenario: {
      area: 'area_rh',
      entrega: 'entrega_atendimento',
      perda: 'perda_duvidas',
      frequencia: 'freq_diario',
      publico: 'pub_time',
      dado: 'dado_sensiveis',
      desejo: 'desejo_automatizar',
      conforto: 'conf_medio',
    },
  },
  {
    nome: 'Fernando (persona 4)',
    esperado: 'automacao',
    cenario: {
      entrega: 'entrega_status',
      perda: 'perda_copiando',
      frequencia: 'freq_diario',
      publico: 'pub_time',
      dado: 'dado_sistemas',
      desejo: 'desejo_automatizar',
      conforto: 'conf_alto',
    },
  },
  {
    nome: 'Camila (persona 5)',
    esperado: 'agentico',
    cenario: {
      entrega: 'entrega_atendimento',
      perda: 'perda_buscando',
      frequencia: 'freq_diario',
      publico: 'pub_externo',
      dado: 'dado_sistemas',
      desejo: 'desejo_automatizar',
      conforto: 'conf_muito_alto',
    },
  },
  {
    nome: 'processo em etapas',
    esperado: 'workflow',
    cenario: {
      entrega: 'entrega_processos',
      perda: 'perda_consolidando',
      frequencia: 'freq_semanal',
      publico: 'pub_outra_area',
      dado: 'dado_documentos',
      desejo: 'desejo_erro',
      conforto: 'conf_bom',
    },
  },
  {
    nome: 'ferramenta pessoal com dado sensível',
    esperado: 'app_offline',
    cenario: {
      entrega: 'entrega_reunioes',
      perda: 'perda_analises',
      frequencia: 'freq_semanal',
      publico: 'pub_so_eu',
      dado: 'dado_sensiveis',
      desejo: 'desejo_ferramenta',
      conforto: 'conf_bom',
    },
  },
  {
    nome: 'ferramenta de time em cima de planilha',
    esperado: 'app_tabela',
    cenario: {
      entrega: 'entrega_planilhas',
      perda: 'perda_planilhas',
      frequencia: 'freq_diario',
      publico: 'pub_time',
      dado: 'dado_planilha',
      desejo: 'desejo_ferramenta',
      conforto: 'conf_alto',
    },
  },
  {
    nome: 'sistema para cliente externo',
    esperado: 'orquestrado',
    cenario: {
      entrega: 'entrega_processos',
      perda: 'perda_buscando',
      frequencia: 'freq_semanal',
      publico: 'pub_externo',
      dado: 'dado_sistemas',
      desejo: 'desejo_compartilhar',
      conforto: 'conf_muito_alto',
    },
  },
]

describe('cobertura dos 9 tipos via wizard', () => {
  for (const { nome, esperado, cenario } of CENARIOS) {
    it(`${nome} → ${esperado}`, () => {
      const diagnostico = diagnosticar(wizard(cenario))
      expect(diagnostico.tipo).toBe(esperado)
      // Fidelidade: o adaptador nunca diverge do motor do radar.
      expect(diagnostico.tipo).toBe(
        decidirOportunidade(paraRespostasRadar(wizard(cenario))).tipo,
      )
    })
  }

  it('os 9 tipos estão cobertos pelos cenários', () => {
    expect(new Set(CENARIOS.map((c) => c.esperado)).size).toBe(9)
  })
})

describe('derivações editoriais (handoff §4)', () => {
  it('dashboard: complexidade 2/media, IA baixa, automação média, risco baixo', () => {
    const d = diagnosticar(wizard(CENARIOS[0].cenario))
    expect(d.familia).toBe('visualizacao')
    expect(d.nivel_na_familia).toBe(1)
    expect(d.complexidade).toBe(2)
    expect(d.complexidade_label).toBe('media')
    expect(d.potencial_ia).toBe('baixo')
    expect(d.potencial_automacao).toBe('medio')
    expect(d.risco).toBe('baixo')
  })

  it('prompt: complexidade 1/baixa, IA alta, automação baixa, risco baixo', () => {
    const d = diagnosticar(wizard(CENARIOS[1].cenario))
    expect(d.complexidade).toBe(1)
    expect(d.complexidade_label).toBe('baixa')
    expect(d.potencial_ia).toBe('alto')
    expect(d.potencial_automacao).toBe('baixo')
    expect(d.risco).toBe('baixo')
  })

  it('dado sensível sobe o risco um degrau (template: baixo → medio)', () => {
    const d = diagnosticar(wizard(CENARIOS[2].cenario))
    expect(d.tipo).toBe('template')
    expect(d.flags.diligencia).toBe(true)
    expect(d.risco).toBe('medio')
  })

  it('dado sensível em tipo de complexidade 3 (app_offline): medio → alto', () => {
    const d = diagnosticar(wizard(CENARIOS[6].cenario))
    expect(d.tipo).toBe('app_offline')
    expect(d.flags.diligencia).toBe(true)
    expect(d.risco).toBe('alto')
  })

  it('agêntico: topo da escada — complexidade 5/alta, risco alto mesmo sem diligência', () => {
    const d = diagnosticar(wizard(CENARIOS[4].cenario))
    expect(d.complexidade).toBe(5)
    expect(d.complexidade_label).toBe('alta')
    expect(d.risco).toBe('alto')
    expect(d.potencial_ia).toBe('alto')
    expect(d.potencial_automacao).toBe('alto')
  })

  it('preserva auditoria do motor: pontuação, vencedor bruto e estimativa', () => {
    const w = wizard(CENARIOS[0].cenario)
    const d = diagnosticar(w)
    const r = decidirOportunidade(paraRespostasRadar(w))
    expect(d.pontuacao).toEqual(r.pontuacao)
    expect(d.vencedor_bruto).toBe(r.vencedorBruto)
    expect(d.estimativa_maturidade).toBe(r.estimativaMaturidade)
  })
})

describe('contrato e determinismo', () => {
  it('carimba a versão do motor (re-diagnóstico auditável)', () => {
    expect(diagnosticar(wizard(CENARIOS[0].cenario)).engine_version).toBe(ENGINE_VERSION)
  })

  it('mesmo input → mesmo output', () => {
    const w = wizard(CENARIOS[7].cenario)
    expect(diagnosticar(w)).toEqual(diagnosticar(w))
  })

  it('área é opcional (peso zero) e não muda a classificação', () => {
    const sem = diagnosticar(wizard(CENARIOS[1].cenario))
    const com = diagnosticar(wizard({ ...CENARIOS[1].cenario, area: 'area_marketing' }))
    expect(com.tipo).toBe(sem.tipo)
    expect(com.pontuacao).toEqual(sem.pontuacao)
  })

  it('resposta de classificação inválida propaga o erro do motor', () => {
    const invalida = wizard({ ...CENARIOS[1].cenario, conforto: 'conf_inexistente' })
    expect(() => diagnosticar(invalida)).toThrow(/op_conforto/)
  })
})

// ----------------------------------------------------------------------------
// Adaptador do schema v2 (ISSUE-313, spec v2.1)
// ----------------------------------------------------------------------------

describe('diagnosticarV2 (schema v2 — Conversa de Consultor)', () => {
  function wizardV2(c: Cenario): WizardAnswersV2 {
    return {
      schema_version: 2,
      porta: 'ideia',
      arquetipo: 'arq_painel',
      titulo: 'Projeto v2 de teste',
      area: c.area ?? null,
      entrega: c.entrega,
      perda: c.perda,
      frequencia: c.frequencia,
      publico: c.publico,
      dado: c.dado,
      desejo: c.desejo,
      conforto: c.conforto,
      ambiente: ['amb_ia_gratuita'],
    }
  }

  it('v1 e v2 com os mesmos ids fechados → diagnóstico idêntico', () => {
    for (const { cenario } of CENARIOS) {
      expect(diagnosticarV2(wizardV2(cenario))).toEqual(diagnosticar(wizard(cenario)))
    }
  })

  it('relato/arquetipo_outro/porta/ambiente/horas NUNCA mudam a classificação (regra da 1A)', () => {
    const base = wizardV2(CENARIOS[0].cenario)
    const carregado: WizardAnswersV2 = {
      ...base,
      porta: 'difusa',
      arquetipo: 'arq_outro',
      arquetipo_outro: 'quero um robô que faz tudo sozinho com dados do SAP',
      relato: 'na real o que me consome é planilha de vendas todo santo dia',
      ambiente: ['amb_shadow', 'amb_copilot'],
      horas_semana: 9,
      hipoteses_confirmadas: ['entrega', 'perda'],
      escolha_tipo: 'agentico',
    }
    expect(diagnosticarV2(carregado)).toEqual(diagnosticarV2(base))
  })

  it('validação do motor segue valendo no v2', () => {
    const invalida = wizardV2({ ...CENARIOS[1].cenario, dado: 'dado_inexistente' })
    expect(() => diagnosticarV2(invalida)).toThrow(/op_dado/)
  })
})

// ----------------------------------------------------------------------------
// Ajuste do diagnóstico ao tipo ESCOLHIDO (ISSUE-313 — proposta assistida)
// ----------------------------------------------------------------------------

describe('ajustarDiagnosticoParaTipo', () => {
  const base = diagnosticar(wizard(CENARIOS[0].cenario)) // dashboard

  it('mesmo tipo → devolve o diagnóstico intacto (mesma referência)', () => {
    expect(ajustarDiagnosticoParaTipo(base, base.tipo)).toBe(base)
  })

  it('tipo novo → recalcula derivados e preserva o que veio da conversa', () => {
    const ajustado = ajustarDiagnosticoParaTipo(base, 'automacao')
    expect(ajustado.tipo).toBe('automacao')
    expect(ajustado.familia).toBe('fluxo')
    expect(ajustado.nivel_na_familia).toBe(2)
    expect(ajustado.complexidade).toBe(2)
    expect(ajustado.potencial_automacao).toBe('alto')
    // Preservados: a conversa não muda porque a escolha mudou.
    expect(ajustado.pontuacao).toEqual(base.pontuacao)
    expect(ajustado.vencedor_bruto).toBe(base.vencedor_bruto)
    expect(ajustado.flags).toEqual(base.flags)
    expect(ajustado.engine_version).toBe(ENGINE_VERSION)
  })

  it('diligência continua subindo o risco no tipo ajustado', () => {
    const sensivel = diagnosticar(
      wizard({ ...CENARIOS[0].cenario, dado: 'dado_sensiveis' }),
    )
    expect(sensivel.flags.diligencia).toBe(true)
    const ajustado = ajustarDiagnosticoParaTipo(sensivel, 'prompt')
    // prompt: complexidade 1 → risco base baixo, diligência sobe pra médio.
    expect(ajustado.risco).toBe('medio')
  })
})
