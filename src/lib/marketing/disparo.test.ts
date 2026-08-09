import { describe, expect, it } from 'vitest'

import {
  classificarDestinatarios,
  executarDisparo,
  montarValores,
  renderEmailMarketing,
  resultadoRadarLegivel,
  substituirVariaveisReais,
  type EnvioPedido,
} from './disparo'
import { chaveEnvio, type ContatoMarketing } from './segmentos'

// ---------------------------------------------------------------------------
// Fixtures — mesmo padrão de segmentos.test.ts: contato "completo" + overrides
// ---------------------------------------------------------------------------

function contato(overrides: Partial<ContatoMarketing> = {}): ContatoMarketing {
  return {
    email: 'marina@exemplo.com',
    nome: 'Marina Rodrigues',
    origemPrimaria: 'radar',
    primeiroContatoEm: '2026-07-01T12:00:00Z',
    fezRadar: true,
    concluiuRadar: true,
    radarKind: 'maturidade',
    radarResult: 'operador',
    radarEm: '2026-07-01T12:00:00Z',
    optinNewsletter: true,
    marcouInteresseLab: true,
    estaAutorizado: false,
    planType: null,
    autorizadoEm: null,
    expiraEm: null,
    temConta: false,
    criouContaEm: null,
    ultimoAcesso: null,
    projetosCount: 0,
    projetosConcluidos: 0,
    ultimoProjetoEm: null,
    ultimoProjetoAbertoEm: null,
    enviosCount: 0,
    ultimoEnvioEm: null,
    ultimoContatoEm: null,
    diasSemContato: 30,
    descadastrado: false,
    ...overrides,
  }
}

function mapa(...contatos: ContatoMarketing[]): Map<string, ContatoMarketing> {
  return new Map(contatos.map((c) => [c.email, c]))
}

const TEMPLATE = {
  slug: 'convite_lab',
  versao: 1,
  assunto: 'Oi, {{primeiro_nome}}, teu convite chegou',
  corpo: 'Oi, {{primeiro_nome}}!\n\nVocê fez {{resultado_radar}}.\n\n{{link_lab}}',
}

const SEM_ESPERA = { aguardar: async () => {}, intervaloMs: 0 }

// ---------------------------------------------------------------------------
// Classificação (critérios de aceite 2 e 3 do §9 — 601C)
// ---------------------------------------------------------------------------

describe('classificarDestinatarios', () => {
  it('sem opt-in e descadastrado ficam bloqueados MESMO com forcarReenvio (não existe caminho de forçar)', () => {
    const semOptin = contato({ email: 'a@x.com', optinNewsletter: false })
    const descadastrado = contato({ email: 'b@x.com', descadastrado: true })
    const r = classificarDestinatarios(
      ['a@x.com', 'b@x.com'],
      mapa(semOptin, descadastrado),
      new Set(),
      'convite_lab',
      true,
    )
    expect(r).toEqual([
      { email: 'a@x.com', status: 'sem_optin', contato: semOptin },
      { email: 'b@x.com', status: 'descadastrado', contato: descadastrado },
    ])
  })

  it('descadastro vence opt-in quando os dois valem pro mesmo contato', () => {
    const c = contato({ descadastrado: true, optinNewsletter: false })
    const [r] = classificarDestinatarios([c.email], mapa(c), new Set(), 'convite_lab', false)
    expect(r.status).toBe('descadastrado')
  })

  it('quem já recebeu o template exige forcarReenvio pra virar apto', () => {
    const c = contato()
    const jaReceberam = new Set([chaveEnvio(c.email, 'convite_lab')])
    const [semForcar] = classificarDestinatarios([c.email], mapa(c), jaReceberam, 'convite_lab', false)
    const [comForcar] = classificarDestinatarios([c.email], mapa(c), jaReceberam, 'convite_lab', true)
    expect(semForcar.status).toBe('ja_recebeu')
    expect(comForcar.status).toBe('apto')
  })

  it('já ter recebido OUTRO template não bloqueia', () => {
    const c = contato()
    const jaReceberam = new Set([chaveEnvio(c.email, 'primeiro_projeto')])
    const [r] = classificarDestinatarios([c.email], mapa(c), jaReceberam, 'convite_lab', false)
    expect(r.status).toBe('apto')
  })

  it('e-mail fora da view vira "desconhecido" (sem contato, não dá pra checar consentimento)', () => {
    const [r] = classificarDestinatarios(['ninguem@x.com'], mapa(), new Set(), 'convite_lab', false)
    expect(r).toEqual({ email: 'ninguem@x.com', status: 'desconhecido', contato: null })
  })

  it('normaliza e deduplica a lista de entrada', () => {
    const c = contato()
    const r = classificarDestinatarios(
      ['  MARINA@exemplo.com ', 'marina@exemplo.com', ''],
      mapa(c),
      new Set(),
      'convite_lab',
      false,
    )
    expect(r).toHaveLength(1)
    expect(r[0].email).toBe('marina@exemplo.com')
  })
})

// ---------------------------------------------------------------------------
// Variáveis reais
// ---------------------------------------------------------------------------

describe('substituirVariaveisReais + montarValores', () => {
  const link = 'https://site.test/descadastrar?t=abc'

  it('troca as 4 variáveis pelos valores reais do contato', () => {
    const v = montarValores(contato(), 'convite_lab', 'https://site.test', link)
    const r = substituirVariaveisReais(
      '{{primeiro_nome}} | {{resultado_radar}} | {{link_lab}} | {{link_descadastro}}',
      v,
    )
    expect(r).toBe(
      'Marina | nível Operador no Radar de Maturidade | ' +
        'https://site.test/auth?next=%2Flab%2Finicio&utm_source=email&utm_medium=marketing&utm_campaign=convite_lab | ' +
        'https://site.test/descadastrar?t=abc',
    )
  })

  it('contato sem nome: saudação fica limpa ("Oi, !" vira "Oi!")', () => {
    const v = montarValores(contato({ nome: null }), 'convite_lab', 'https://s.test', link)
    expect(substituirVariaveisReais('Oi, {{primeiro_nome}}!\n\nBora?', v)).toBe('Oi!\n\nBora?')
  })

  it('variável fora do vocabulário fica intacta (a validação é do salvamento, não do envio)', () => {
    const v = montarValores(contato(), 'convite_lab', 'https://s.test', link)
    expect(substituirVariaveisReais('{{sobrenome}}', v)).toBe('{{sobrenome}}')
  })
})

describe('resultadoRadarLegivel', () => {
  it('maturidade usa o nome do nível vindo do conteúdo real', () => {
    expect(resultadoRadarLegivel(contato())).toBe('nível Operador no Radar de Maturidade')
  })

  it('oportunidades usa o nome do tipo', () => {
    const c = contato({ radarKind: 'oportunidades', radarResult: 'automacao' })
    expect(resultadoRadarLegivel(c)).toBe('caminho Automação no Radar de Oportunidades')
  })

  it('sem radar (ou result_key desconhecido) cai no texto neutro — campo nulo não quebra (§9.4)', () => {
    expect(resultadoRadarLegivel(contato({ radarKind: null, radarResult: null }))).toBe('o teu resultado do radar')
    expect(resultadoRadarLegivel(contato({ radarResult: 'chave_que_nao_existe' }))).toBe('o teu resultado do radar')
  })
})

// ---------------------------------------------------------------------------
// Render do e-mail real
// ---------------------------------------------------------------------------

describe('renderEmailMarketing', () => {
  it('injeta o rodapé de descadastro com o link real — por fora do corpo editável', () => {
    const html = renderEmailMarketing('Assunto', 'Corpo do e-mail.', 'https://site.test/descadastrar?t=tok123')
    expect(html).toContain('href="https://site.test/descadastrar?t=tok123"')
    expect(html).toContain('Descadastrar-se')
  })

  it('corpo é markdown renderizado (parágrafos, negrito, URL clicável) e HTML cru sai escapado', () => {
    const html = renderEmailMarketing(
      'A',
      'Linha **forte**.\n\nAcesse https://site.test/lab hoje.\n\n<script>x</script>',
      'https://d.test',
    )
    expect(html).toContain('<strong')
    expect(html).toContain('<a href="https://site.test/lab"')
    expect(html).not.toContain('<script>')
  })
})

// ---------------------------------------------------------------------------
// Execução — a armadilha do Resend (§7: { error } no retorno, sem exceção)
// ---------------------------------------------------------------------------

describe('executarDisparo', () => {
  const base = {
    template: TEMPLATE,
    siteUrl: 'https://site.test',
    gerarLinkDescadastro: (email: string) => `https://site.test/descadastrar?t=tok-${email}`,
    ...SEM_ESPERA,
  }

  it('resposta { error } do Resend vira status="falhou" COM o motivo — nunca sucesso silencioso', async () => {
    const r = await executarDisparo({
      ...base,
      aptos: [{ email: 'a@x.com', contato: contato({ email: 'a@x.com' }) }],
      enviar: async () => ({ error: { message: 'domain not verified' } }),
    })
    expect(r).toEqual([{ email: 'a@x.com', status: 'falhou', erro: 'domain not verified' }])
  })

  it('{ error } sem mensagem também falha, com motivo padrão', async () => {
    const r = await executarDisparo({
      ...base,
      aptos: [{ email: 'a@x.com', contato: contato({ email: 'a@x.com' }) }],
      enviar: async () => ({ error: {} }),
    })
    expect(r[0].status).toBe('falhou')
    expect(r[0].erro).toContain('Resend recusou')
  })

  it('envio parcial: falhas no meio não derrubam o lote — cada e-mail sai com seu resultado (§9.4 da 601C)', async () => {
    const aptos = ['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com'].map((email) => ({
      email,
      contato: contato({ email }),
    }))
    const r = await executarDisparo({
      ...base,
      aptos,
      enviar: async ({ to }: EnvioPedido) =>
        to === 'b@x.com' ? { error: { message: 'bounce' } } : { error: null },
    })
    expect(r.map((x) => x.status)).toEqual(['enviado', 'falhou', 'enviado', 'enviado'])
    expect(r[1].erro).toBe('bounce')
  })

  it('exceção inesperada no envio também vira "falhou" com o motivo', async () => {
    const r = await executarDisparo({
      ...base,
      aptos: [{ email: 'a@x.com', contato: contato({ email: 'a@x.com' }) }],
      enviar: async () => {
        throw new Error('rede caiu')
      },
    })
    expect(r).toEqual([{ email: 'a@x.com', status: 'falhou', erro: 'rede caiu' }])
  })

  it('cada destinatário recebe o e-mail personalizado com SEU link de descadastro', async () => {
    const pedidos: EnvioPedido[] = []
    await executarDisparo({
      ...base,
      aptos: [
        { email: 'a@x.com', contato: contato({ email: 'a@x.com', nome: 'Ana Silva' }) },
        { email: 'b@x.com', contato: contato({ email: 'b@x.com', nome: 'Bruno Costa' }) },
      ],
      enviar: async (p) => {
        pedidos.push(p)
        return { error: null }
      },
    })
    expect(pedidos[0].subject).toBe('Oi, Ana, teu convite chegou')
    expect(pedidos[0].html).toContain('t=tok-a@x.com')
    expect(pedidos[1].subject).toBe('Oi, Bruno, teu convite chegou')
    expect(pedidos[1].html).toContain('t=tok-b@x.com')
    expect(pedidos[1].html).not.toContain('t=tok-a@x.com')
  })

  it('respeita o intervalo entre envios (rate limit do Resend)', async () => {
    const esperas: number[] = []
    await executarDisparo({
      ...base,
      aptos: ['a@x.com', 'b@x.com', 'c@x.com'].map((email) => ({ email, contato: contato({ email }) })),
      enviar: async () => ({ error: null }),
      aguardar: async (ms) => {
        esperas.push(ms)
      },
      intervaloMs: 600,
    })
    expect(esperas).toEqual([600, 600])
  })
})
