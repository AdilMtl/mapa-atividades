import { describe, expect, it } from 'vitest'

import {
  type ContatoMarketing,
  type SegmentoId,
  SEGMENTOS,
  chaveEnvio,
  contatosDoSegmento,
  elegivelParaMarketing,
  excluidosDoSegmento,
  mapContatoRow,
  montarJaReceberam,
  montarResumoSegmentos,
  resumoSegmento,
} from './segmentos'

const AGORA = new Date('2026-08-08T12:00:00.000Z')

function diasAtras(dias: number): string {
  return new Date(AGORA.getTime() - dias * 24 * 60 * 60 * 1000).toISOString()
}

/** Contato "vazio" — nenhum atributo verdadeiro, todas as datas nulas. Base pros testes. */
function criarContato(overrides: Partial<ContatoMarketing> = {}): ContatoMarketing {
  return {
    email: 'contato@teste.dev',
    nome: null,
    origemPrimaria: 'radar',
    primeiroContatoEm: diasAtras(1),
    fezRadar: false,
    concluiuRadar: false,
    radarKind: null,
    radarResult: null,
    radarEm: null,
    optinNewsletter: true,
    marcouInteresseLab: false,
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
    diasSemContato: null,
    descadastrado: false,
    ...overrides,
  }
}

describe('mapContatoRow', () => {
  it('mapeia uma linha crua (nulos inclusive) sem quebrar', () => {
    const c = mapContatoRow({
      email: 'x@teste.dev',
      nome: null,
      origem_primaria: 'lab_leads',
      primeiro_contato_em: null,
      fez_radar: false,
      concluiu_radar: false,
      radar_kind: null,
      radar_result: null,
      radar_em: null,
      optin_newsletter: true,
      marcou_interesse_lab: true,
      esta_autorizado: false,
      plan_type: null,
      autorizado_em: null,
      expira_em: null,
      tem_conta: false,
      criou_conta_em: null,
      ultimo_acesso: null,
      projetos_count: 0,
      projetos_concluidos: 0,
      ultimo_projeto_em: null,
      ultimo_projeto_aberto_em: null,
      envios_count: 0,
      ultimo_envio_em: null,
      ultimo_contato_em: null,
      dias_sem_contato: null,
      descadastrado: false,
    })
    expect(c.email).toBe('x@teste.dev')
    expect(c.nome).toBeNull()
    expect(c.marcouInteresseLab).toBe(true)
  })
})

describe('cada segmento — casos positivo e negativo (critério de aceite 4: nulos não quebram)', () => {
  it('lead_sem_convite: radar sem convite entra; radar já autorizado não entra', () => {
    const comRadar = criarContato({ fezRadar: true, estaAutorizado: false })
    const jaAutorizado = criarContato({ fezRadar: true, estaAutorizado: true })
    expect(contatosDoSegmento([comRadar, jaAutorizado], 'lead_sem_convite', AGORA)).toEqual([
      comRadar,
    ])
  })

  it('lead_sem_convite: interesse direto no /lab (sem nunca ter feito radar) também entra', () => {
    // O painel de Convites atual (/admin/lab-beta) já unifica radar_leads.lab_interest e
    // lab_leads numa fila só — o Funil absorve essa tela (§5 da spec) e não pode perder
    // quem só passou pelo formulário solto.
    const soInteresseDireto = criarContato({
      fezRadar: false,
      marcouInteresseLab: true,
      estaAutorizado: false,
    })
    expect(contatosDoSegmento([soInteresseDireto], 'lead_sem_convite', AGORA)).toEqual([
      soInteresseDireto,
    ])
  })

  it('convidado_sem_conta: autorizado sem conta entra; autorizado com conta não', () => {
    const semConta = criarContato({ estaAutorizado: true, temConta: false })
    const comConta = criarContato({ estaAutorizado: true, temConta: true })
    expect(contatosDoSegmento([semConta, comConta], 'convidado_sem_conta', AGORA)).toEqual([
      semConta,
    ])
  })

  it('conta_sem_projeto: conta com zero projetos entra; conta com projeto não', () => {
    const semProjeto = criarContato({ temConta: true, projetosCount: 0 })
    const comProjeto = criarContato({ temConta: true, projetosCount: 1 })
    expect(contatosDoSegmento([semProjeto, comProjeto], 'conta_sem_projeto', AGORA)).toEqual([
      semProjeto,
    ])
  })

  it('projeto_parado: projeto aberto há >14 dias entra; projeto aberto recente não', () => {
    const parado = criarContato({
      projetosCount: 1,
      projetosConcluidos: 0,
      ultimoProjetoAbertoEm: diasAtras(20),
    })
    const recente = criarContato({
      projetosCount: 1,
      projetosConcluidos: 0,
      ultimoProjetoAbertoEm: diasAtras(2),
    })
    expect(contatosDoSegmento([parado, recente], 'projeto_parado', AGORA)).toEqual([parado])
  })

  it('projeto_parado: usa ultimoProjetoAbertoEm, não ultimoProjetoEm — 2º projeto concluído recente não esconde o 1º parado', () => {
    // Contato com um projeto concluído ontem (ultimoProjetoEm recente) mas outro projeto
    // ainda aberto e parado há 30 dias — não pode desaparecer do segmento.
    const doisProjetos = criarContato({
      projetosCount: 2,
      projetosConcluidos: 1,
      ultimoProjetoEm: diasAtras(1), // o projeto concluído mexeu ontem
      ultimoProjetoAbertoEm: diasAtras(30), // o projeto aberto está parado há 30 dias
    })
    expect(contatosDoSegmento([doisProjetos], 'projeto_parado', AGORA)).toEqual([doisProjetos])
  })

  it('projeto_parado: todos os projetos concluídos não entra, mesmo com ultimoProjetoAbertoEm nulo', () => {
    const tudoConcluido = criarContato({
      projetosCount: 1,
      projetosConcluidos: 1,
      ultimoProjetoAbertoEm: null,
    })
    expect(contatosDoSegmento([tudoConcluido], 'projeto_parado', AGORA)).toEqual([])
  })

  it('assinante_sem_radar: autorizado como assinante sem radar entra; beta do Lab não conta como assinante', () => {
    const assinante = criarContato({ estaAutorizado: true, planType: null, fezRadar: false })
    const betaLab = criarContato({ estaAutorizado: true, planType: 'lab_beta', fezRadar: false })
    expect(contatosDoSegmento([assinante, betaLab], 'assinante_sem_radar', AGORA)).toEqual([
      assinante,
    ])
  })

  it('concluiu_projeto: pelo menos 1 projeto concluído entra', () => {
    const concluiu = criarContato({ projetosConcluidos: 1 })
    const semConclusao = criarContato({ projetosConcluidos: 0 })
    expect(contatosDoSegmento([concluiu, semConclusao], 'concluiu_projeto', AGORA)).toEqual([
      concluiu,
    ])
  })
})

describe('descadastro e optin vencem qualquer segmento (critério de aceite 6, §3.3/§3.4)', () => {
  it('elegivelParaMarketing: descadastrado=false é o único jeito de passar', () => {
    expect(elegivelParaMarketing(criarContato())).toBe(true)
    expect(elegivelParaMarketing(criarContato({ descadastrado: true }))).toBe(false)
    expect(elegivelParaMarketing(criarContato({ optinNewsletter: false }))).toBe(false)
  })

  it('e-mail descadastrado não aparece em NENHUM dos 6 segmentos, mesmo satisfazendo a definição', () => {
    const baseDescadastrada = criarContato({
      descadastrado: true,
      fezRadar: true,
      estaAutorizado: true,
      temConta: true,
      projetosCount: 1,
      projetosConcluidos: 1,
      planType: null,
    })
    for (const def of SEGMENTOS) {
      expect(contatosDoSegmento([baseDescadastrada], def.id, AGORA)).toEqual([])
    }
  })

  it('optin_newsletter=false não aparece em nenhum dos 6 segmentos', () => {
    const semOptin = criarContato({
      optinNewsletter: false,
      fezRadar: true,
      estaAutorizado: true,
      temConta: true,
      projetosCount: 1,
      projetosConcluidos: 1,
      planType: null,
    })
    for (const def of SEGMENTOS) {
      expect(contatosDoSegmento([semOptin], def.id, AGORA)).toEqual([])
    }
  })
})

describe('resumoSegmento — os 3 números do card (§4)', () => {
  it('total, semEnvioDesignado e mais14DiasSemContato batem com uma contagem manual (critério de aceite 5)', () => {
    const contatos: ContatoMarketing[] = [
      criarContato({ email: 'a@teste.dev', fezRadar: true, estaAutorizado: false, diasSemContato: 20 }),
      criarContato({ email: 'b@teste.dev', fezRadar: true, estaAutorizado: false, diasSemContato: 3 }),
      criarContato({ email: 'c@teste.dev', fezRadar: true, estaAutorizado: false, diasSemContato: null }),
      // não entra no segmento (já autorizado) — não deve contar em nada
      criarContato({ email: 'd@teste.dev', fezRadar: true, estaAutorizado: true, diasSemContato: 99 }),
    ]
    const jaReceberam = montarJaReceberam([
      { email: 'a@teste.dev', template_slug: 'convite_lab', status: 'enviado' },
      { email: 'b@teste.dev', template_slug: 'convite_lab', status: 'falhou' }, // falha não conta como recebido
    ])

    const resumo = resumoSegmento(contatos, 'lead_sem_convite', jaReceberam, AGORA)

    // manual: total = a,b,c (3) — d fica de fora (já autorizado)
    expect(resumo.total).toBe(3)
    // manual: sem envio designado = b (falhou) + c (nunca enviado) = 2; a já recebeu com sucesso
    expect(resumo.semEnvioDesignado).toBe(2)
    // manual: só a tem diasSemContato > 14
    expect(resumo.mais14DiasSemContato).toBe(1)
  })

  it('montarResumoSegmentos devolve exatamente os 6 segmentos, mesmo com lista vazia', () => {
    const resumos = montarResumoSegmentos([], new Set(), AGORA)
    expect(resumos).toHaveLength(6)
    const ids = resumos.map((r) => r.id).sort()
    const esperado: SegmentoId[] = [
      'assinante_sem_radar',
      'concluiu_projeto',
      'conta_sem_projeto',
      'convidado_sem_conta',
      'lead_sem_convite',
      'projeto_parado',
    ]
    expect(ids).toEqual(esperado.sort())
    expect(resumos.every((r) => r.total === 0)).toBe(true)
  })
})

describe('pares logicamente exclusivos nunca se sobrepõem (critério de aceite 1)', () => {
  // Só testo pares cuja EXCLUSÃO é garantida pela própria definição (§2 da spec deixa
  // claro que segmentos podem se cruzar de propósito — ex.: assinante_sem_radar pode
  // conviver com convidado_sem_conta). Os pares abaixo são mutuamente exclusivos por
  // construção: um exige esta_autorizado=false, o outro esta_autorizado=true, etc.
  const paresExclusivos: [SegmentoId, SegmentoId][] = [
    ['lead_sem_convite', 'convidado_sem_conta'], // !esta_autorizado vs esta_autorizado
    ['lead_sem_convite', 'conta_sem_projeto'], // !esta_autorizado vs tem_conta (implica autorizado hoje ou já foi)
    ['convidado_sem_conta', 'conta_sem_projeto'], // !tem_conta vs tem_conta
    ['convidado_sem_conta', 'projeto_parado'], // !tem_conta vs tem_conta
    ['conta_sem_projeto', 'projeto_parado'], // projetosCount=0 vs projetosCount>0
  ]

  it.each(paresExclusivos)('%s e %s nunca têm o mesmo contato', (idA, idB) => {
    // Amostra ampla de combinações plausíveis de atributos — nenhuma pode cair nos dois.
    const amostras = [
      criarContato({ estaAutorizado: false, temConta: false, projetosCount: 0 }),
      criarContato({ estaAutorizado: true, temConta: false, projetosCount: 0 }),
      criarContato({ estaAutorizado: true, temConta: true, projetosCount: 0 }),
      criarContato({
        estaAutorizado: true,
        temConta: true,
        projetosCount: 1,
        projetosConcluidos: 0,
        ultimoProjetoAbertoEm: diasAtras(30),
      }),
      criarContato({
        estaAutorizado: true,
        temConta: true,
        projetosCount: 1,
        projetosConcluidos: 1,
      }),
    ]
    for (const c of amostras) {
      const noA = contatosDoSegmento([c], idA, AGORA).length > 0
      const noB = contatosDoSegmento([c], idB, AGORA).length > 0
      expect(noA && noB).toBe(false)
    }
  })
})

describe('excluidosDoSegmento — a contagem que a tela mostra (aceite 5 da 601C)', () => {
  const leadBase = { fezRadar: true, estaAutorizado: false }

  it('conta separado quem está fora por opt-in e quem pediu descadastro', () => {
    const contatos = [
      criarContato({ email: 'apto@x.com', ...leadBase }),
      criarContato({ email: 'sem-optin@x.com', ...leadBase, optinNewsletter: false }),
      criarContato({ email: 'saiu@x.com', ...leadBase, descadastrado: true }),
      // descadastro vence opt-in: os dois juntos contam SÓ como descadastrado
      criarContato({ email: 'ambos@x.com', ...leadBase, optinNewsletter: false, descadastrado: true }),
    ]
    expect(excluidosDoSegmento(contatos, 'lead_sem_convite', AGORA)).toEqual({
      semOptin: 1,
      descadastrados: 2,
    })
  })

  it('quem nem pertence ao segmento não entra na contagem de excluídos', () => {
    const contatos = [
      criarContato({ email: 'outro@x.com', fezRadar: false, optinNewsletter: false }),
    ]
    expect(excluidosDoSegmento(contatos, 'lead_sem_convite', AGORA)).toEqual({
      semOptin: 0,
      descadastrados: 0,
    })
  })
})

describe('chaveEnvio', () => {
  it('normaliza e-mail para lower/trim antes de montar a chave', () => {
    expect(chaveEnvio('  Fulano@Teste.DEV ', 'convite_lab')).toBe('fulano@teste.dev|convite_lab')
  })
})
