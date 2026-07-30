import { describe, expect, it } from 'vitest'

import {
  agregarSerie,
  calcularAmostra,
  calcularDesde,
  calcularJanelaAnterior,
  calcularMetrica,
  calcularTaxaConversao,
  contarLeadsUnicos,
  resolverGranularidade,
  excluirLeadsDeTeste,
  excluirProjetosDeTeste,
  montarFunilRadar,
  montarNumerosJanela,
  montarOrigemTrafego,
  montarSerieTemporal,
  normalizarEmail,
  resolverEmailsExcluidos,
  type LabProjetoLinha,
  type RadarLeadLinha,
  type RadarSessaoLinha,
} from './analytics'

function sessao(overrides: Partial<RadarSessaoLinha> = {}): RadarSessaoLinha {
  return {
    id: 'sessao-1',
    kind: 'oportunidades',
    createdAt: '2026-07-10T10:00:00.000Z',
    completedAt: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    ...overrides,
  }
}

function lead(overrides: Partial<RadarLeadLinha> = {}): RadarLeadLinha {
  return {
    email: 'pessoa@example.com',
    createdAt: '2026-07-10T10:05:00.000Z',
    kind: 'oportunidades',
    sessionId: 'sessao-1',
    labInterest: false,
    ...overrides,
  }
}

describe('normalizarEmail / contarLeadsUnicos', () => {
  it('dedupe por e-mail (case + espaço) — COUNT(*) seria bug de análise', () => {
    const leads = [
      lead({ email: 'Pessoa@Example.com' }),
      lead({ email: ' pessoa@example.com ' }),
      lead({ email: 'outra@example.com' }),
    ]
    expect(contarLeadsUnicos(leads)).toBe(2)
  })

  it('N=0 e N=1 não quebram', () => {
    expect(contarLeadsUnicos([])).toBe(0)
    expect(contarLeadsUnicos([lead()])).toBe(1)
  })

  it('normalizarEmail trata maiúsculas e espaço nas pontas', () => {
    expect(normalizarEmail(' Fulano@Teste.com ')).toBe('fulano@teste.com')
  })
})

describe('resolverEmailsExcluidos', () => {
  it('sem env, usa a lista padrão do dono', () => {
    expect(resolverEmailsExcluidos(undefined)).toEqual([
      'adilson.matioli@gmail.com',
      'adilson.matioli1@gmail.com',
    ])
  })

  it('com env, usa a lista do env (dedupe + normalizado)', () => {
    expect(resolverEmailsExcluidos('A@b.com, a@b.com , C@d.com')).toEqual(['a@b.com', 'c@d.com'])
  })

  it('env vazio ou só espaço cai no padrão', () => {
    expect(resolverEmailsExcluidos('   ')).toEqual(resolverEmailsExcluidos(undefined))
  })
})

describe('excluirLeadsDeTeste / excluirProjetosDeTeste', () => {
  it('remove leads do tráfego de teste por e-mail (case-insensitive)', () => {
    const leads = [lead({ email: 'Adilson.Matioli@gmail.com' }), lead({ email: 'real@example.com' })]
    const resultado = excluirLeadsDeTeste(leads, ['adilson.matioli@gmail.com'])
    expect(resultado).toHaveLength(1)
    expect(resultado[0]!.email).toBe('real@example.com')
  })

  it('remove projetos do dono por user_id', () => {
    const projetos: LabProjetoLinha[] = [
      { id: 'p1', userId: 'dono-uuid', createdAt: '2026-07-10T00:00:00.000Z' },
      { id: 'p2', userId: 'outro-uuid', createdAt: '2026-07-10T00:00:00.000Z' },
    ]
    const resultado = excluirProjetosDeTeste(projetos, ['dono-uuid'])
    expect(resultado).toEqual([projetos[1]])
  })
})

describe('calcularAmostra', () => {
  it('marca truncada quando lidas < total (teto de 1000 linhas do client)', () => {
    expect(calcularAmostra(1500, 1000)).toEqual({ total: 1500, lidas: 1000, truncada: true })
  })

  it('não trunca quando lidas == total', () => {
    expect(calcularAmostra(42, 42)).toEqual({ total: 42, lidas: 42, truncada: false })
  })
})

describe('calcularDesde / calcularJanelaAnterior', () => {
  const agora = new Date('2026-07-30T12:00:00.000Z')

  it('janela 7 sem corte manual', () => {
    const desde = calcularDesde('7', agora, null)
    expect(desde?.toISOString()).toBe('2026-07-23T12:00:00.000Z')
  })

  it('janela "tudo" sem corte não tem piso', () => {
    expect(calcularDesde('tudo', agora, null)).toBeNull()
  })

  it('data de corte mais recente que a janela vence (é o piso mais restritivo)', () => {
    const desde = calcularDesde('90', agora, '2026-07-25')
    expect(desde?.toISOString()).toBe('2026-07-25T00:00:00.000Z')
  })

  it('janela mais restritiva que o corte antigo vence a janela', () => {
    const desde = calcularDesde('7', agora, '2026-01-01')
    expect(desde?.toISOString()).toBe('2026-07-23T12:00:00.000Z')
  })

  it('"tudo" com corte usa o corte como piso', () => {
    const desde = calcularDesde('tudo', agora, '2026-07-01')
    expect(desde?.toISOString()).toBe('2026-07-01T00:00:00.000Z')
  })

  it('janela anterior tem a mesma duração, terminando onde a atual começa', () => {
    const desde = calcularDesde('7', agora, null)!
    const anterior = calcularJanelaAnterior(desde, agora)
    expect(anterior?.ate.toISOString()).toBe(desde.toISOString())
    expect(anterior?.desde.toISOString()).toBe('2026-07-16T12:00:00.000Z')
  })

  it('sem piso (tudo), não há janela anterior comparável', () => {
    expect(calcularJanelaAnterior(null, agora)).toBeNull()
  })
})

describe('calcularMetrica', () => {
  it('sem variação quando N atual ou anterior < 20 (evita taxa de amostra insuficiente)', () => {
    expect(calcularMetrica(5, 3)).toEqual({ valor: 5, variacaoPct: null })
    expect(calcularMetrica(25, 10)).toEqual({ valor: 25, variacaoPct: null })
  })

  it('calcula variação quando os dois lados têm N >= 20', () => {
    expect(calcularMetrica(30, 20)).toEqual({ valor: 30, variacaoPct: 50 })
  })

  it('anterior=0 nunca divide por zero', () => {
    expect(calcularMetrica(25, 0)).toEqual({ valor: 25, variacaoPct: null })
  })
})

describe('montarNumerosJanela', () => {
  it('agrega sessões, conclusões, leads únicos e projetos, com variação da janela anterior', () => {
    const sessoesAtual = [
      sessao({ id: 's1', completedAt: '2026-07-10T11:00:00.000Z' }),
      sessao({ id: 's2', completedAt: null }),
    ]
    const numeros = montarNumerosJanela({
      sessoesAtual,
      sessoesAnterior: [],
      leadsAtual: [lead({ email: 'a@x.com' }), lead({ email: 'a@x.com' })],
      leadsAnterior: [],
      projetosAtual: [{ id: 'p1', userId: 'u1', createdAt: '2026-07-10T00:00:00.000Z' }],
      projetosAnterior: [],
    })
    expect(numeros.sessoes.valor).toBe(2)
    expect(numeros.conclusoes.valor).toBe(1)
    expect(numeros.leadsUnicos.valor).toBe(1)
    expect(numeros.projetosLab.valor).toBe(1)
    expect(numeros.sessoes.variacaoPct).toBeNull() // N < 20 dos dois lados
  })
})

describe('montarFunilRadar', () => {
  it('separa por kind e calcula % relativo ao topo, marcando eventos como direcionais', () => {
    const sessoes = [
      sessao({ id: 's1', kind: 'oportunidades', completedAt: '2026-07-10T11:00:00.000Z' }),
      sessao({ id: 's2', kind: 'oportunidades', completedAt: null }),
      sessao({ id: 's3', kind: 'maturidade', completedAt: '2026-07-10T11:00:00.000Z' }),
    ]
    const leads = [
      lead({ sessionId: 's1', kind: 'oportunidades', email: 'lead1@x.com', labInterest: true }),
    ]

    const funil = montarFunilRadar({
      kind: 'oportunidades',
      sessoes,
      leads,
      eventoGateViews: 2,
      eventoLeituraClicks: 1,
    })

    expect(funil.topo).toBe(2)
    const porId = Object.fromEntries(funil.degraus.map((d) => [d.id, d]))
    expect(porId.abriu).toMatchObject({ n: 2, pct: 100, direcional: false })
    expect(porId.concluiu).toMatchObject({ n: 1, pct: 50, direcional: false })
    expect(porId.viu_gate).toMatchObject({ n: 2, pct: 100, direcional: true })
    expect(porId.virou_lead).toMatchObject({ n: 1, pct: 50, direcional: false })
    expect(porId.pediu_lab).toMatchObject({ n: 1, pct: 50, direcional: false })
    expect(porId.clicou_leitura).toMatchObject({ n: 1, pct: 50, direcional: true })
  })

  it('topo=0 não produz NaN/Infinity no percentual', () => {
    const funil = montarFunilRadar({
      kind: 'maturidade',
      sessoes: [],
      leads: [],
      eventoGateViews: 0,
      eventoLeituraClicks: 0,
    })
    expect(funil.topo).toBe(0)
    expect(funil.degraus.every((d) => Number.isFinite(d.pct))).toBe(true)
  })
})

describe('montarOrigemTrafego', () => {
  it('agrupa por utm_source/medium/campaign e atribui leads via session_id', () => {
    const sessoes = [
      sessao({ id: 's1', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'radar', completedAt: '2026-07-10T11:00:00.000Z' }),
      sessao({ id: 's2', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'radar', completedAt: null }),
      sessao({ id: 's3', utmSource: null }),
    ]
    const leads = [lead({ sessionId: 's1', email: 'a@x.com' }), lead({ sessionId: 's3', email: 'b@x.com' })]

    const linhas = montarOrigemTrafego(sessoes, leads)
    expect(linhas).toHaveLength(2)

    const google = linhas.find((l) => l.utmSource === 'google')!
    expect(google.sessoes).toBe(2)
    expect(google.conclusoes).toBe(1)
    expect(google.pctConclusao).toBe(50)
    expect(google.leadsUnicos).toBe(1)

    const direto = linhas.find((l) => l.chave === 'direto / sem UTM')!
    expect(direto.sessoes).toBe(1)
    expect(direto.leadsUnicos).toBe(1)
  })

  it('ordena por sessões desc', () => {
    const sessoes = [
      sessao({ id: 's1', utmSource: 'a' }),
      sessao({ id: 's2', utmSource: 'b' }),
      sessao({ id: 's3', utmSource: 'b' }),
    ]
    const linhas = montarOrigemTrafego(sessoes, [])
    expect(linhas[0]!.utmSource).toBe('b')
  })
})

describe('montarSerieTemporal', () => {
  it('agrupa sessões e leads únicos por dia', () => {
    const sessoes = [
      sessao({ id: 's1', createdAt: '2026-07-10T08:00:00.000Z' }),
      sessao({ id: 's2', createdAt: '2026-07-10T20:00:00.000Z' }),
      sessao({ id: 's3', createdAt: '2026-07-11T08:00:00.000Z' }),
    ]
    const leads = [
      lead({ createdAt: '2026-07-10T09:00:00.000Z', email: 'a@x.com' }),
      lead({ createdAt: '2026-07-10T10:00:00.000Z', email: 'a@x.com' }), // mesmo dia, mesma pessoa
    ]

    const serie = montarSerieTemporal(sessoes, leads)
    expect(serie).toEqual([
      { data: '2026-07-10', sessoes: 2, leadsUnicos: 1 },
      { data: '2026-07-11', sessoes: 1, leadsUnicos: 0 },
    ])
  })
})

describe('calcularTaxaConversao', () => {
  it('sessões=0 devolve null (0/0 não é 0%)', () => {
    expect(calcularTaxaConversao(0, 0)).toEqual({ taxaConversaoPct: null, amostraPequena: true })
  })

  it('marca amostra pequena abaixo de N=20', () => {
    expect(calcularTaxaConversao(4, 1)).toEqual({ taxaConversaoPct: 25, amostraPequena: true })
  })

  it('N >= 20 não é amostra pequena', () => {
    expect(calcularTaxaConversao(40, 6)).toEqual({ taxaConversaoPct: 15, amostraPequena: false })
  })
})

describe('resolverGranularidade', () => {
  it('até 31 pontos fica em dia', () => {
    const serie = Array.from({ length: 31 }, (_, i) => ({
      data: `2026-07-${String(i + 1).padStart(2, '0')}`,
      sessoes: 1,
      leadsUnicos: 0,
    }))
    expect(resolverGranularidade(serie)).toBe('dia')
  })

  it('acima de 31 pontos agrupa por semana (evita over-plotting)', () => {
    const serie = Array.from({ length: 45 }, (_, i) => ({
      data: `2026-0${i < 30 ? '6' : '7'}-${String((i % 30) + 1).padStart(2, '0')}`,
      sessoes: 1,
      leadsUnicos: 0,
    }))
    expect(resolverGranularidade(serie)).toBe('semana')
  })
})

describe('agregarSerie', () => {
  const serie = [
    { data: '2026-07-06', sessoes: 10, leadsUnicos: 2 }, // segunda
    { data: '2026-07-08', sessoes: 20, leadsUnicos: 3 }, // quarta, mesma semana
    { data: '2026-07-13', sessoes: 5, leadsUnicos: 0 }, // segunda seguinte
  ]

  it('em dia, preserva cada ponto e calcula a taxa', () => {
    const pontos = agregarSerie(serie, 'dia')
    expect(pontos).toHaveLength(3)
    expect(pontos[0]).toMatchObject({
      chave: '2026-07-06',
      rotulo: '06/07',
      sessoes: 10,
      leadsUnicos: 2,
      taxaConversaoPct: 20,
      amostraPequena: true, // 10 < 20
    })
    expect(pontos[1]).toMatchObject({ taxaConversaoPct: 15, amostraPequena: false })
  })

  it('em semana, soma os dias da mesma semana ISO (segunda a domingo)', () => {
    const pontos = agregarSerie(serie, 'semana')
    expect(pontos).toHaveLength(2)
    expect(pontos[0]).toMatchObject({
      chave: '2026-07-06',
      rotulo: '06–12/07',
      sessoes: 30,
      leadsUnicos: 5,
      amostraPequena: false,
    })
    expect(pontos[1]).toMatchObject({ chave: '2026-07-13', sessoes: 5 })
  })

  it('domingo pertence à semana que começou na segunda anterior', () => {
    const pontos = agregarSerie([{ data: '2026-07-12', sessoes: 3, leadsUnicos: 1 }], 'semana')
    expect(pontos[0]!.chave).toBe('2026-07-06')
  })

  it('rótulo de semana que vira o mês mostra os dois meses', () => {
    const pontos = agregarSerie([{ data: '2026-07-01', sessoes: 1, leadsUnicos: 0 }], 'semana')
    expect(pontos[0]!.rotulo).toBe('29/06–05/07')
  })

  it('série vazia não quebra', () => {
    expect(agregarSerie([], 'dia')).toEqual([])
  })
})
