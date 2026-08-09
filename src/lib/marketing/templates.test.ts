import { describe, expect, it } from 'vitest'

import {
  SLUGS_GERENCIADOS,
  type VersaoTemplate,
  contemHtmlCru,
  extrairVariaveis,
  proximaVersao,
  segmentoDoTemplate,
  validarTemplate,
  variaveisInvalidas,
  versaoParaEditar,
} from './templates'

describe('SLUGS_GERENCIADOS', () => {
  it('tem os 6 slugs designados pelos segmentos, sem radar_followup', () => {
    expect(SLUGS_GERENCIADOS.sort()).toEqual(
      [
        'convidado_nao_entrou',
        'convite_lab',
        'convite_radar',
        'pedido_de_relato',
        'primeiro_projeto',
        'retomar_projeto',
      ].sort(),
    )
    expect(SLUGS_GERENCIADOS).not.toContain('radar_followup')
  })
})

describe('segmentoDoTemplate', () => {
  it('acha o segmento designado de um slug conhecido', () => {
    expect(segmentoDoTemplate('convite_lab')).toBe('lead_sem_convite')
    expect(segmentoDoTemplate('pedido_de_relato')).toBe('concluiu_projeto')
  })

  it('devolve null pra slug desconhecido', () => {
    expect(segmentoDoTemplate('nao_existe')).toBeNull()
    expect(segmentoDoTemplate('radar_followup')).toBeNull()
  })
})

describe('extrairVariaveis', () => {
  it('acha todas as variáveis usadas, sem repetir', () => {
    const texto = 'Oi, {{primeiro_nome}}! Seu resultado: {{resultado_radar}}. De novo: {{primeiro_nome}}.'
    expect(extrairVariaveis(texto).sort()).toEqual(['primeiro_nome', 'resultado_radar'])
  })

  it('devolve vazio quando não há variável', () => {
    expect(extrairVariaveis('texto sem chaves nenhuma')).toEqual([])
  })
})

describe('variaveisInvalidas', () => {
  it('não acusa nada quando só usa o vocabulário fechado', () => {
    const texto = '{{primeiro_nome}} {{resultado_radar}} {{link_lab}} {{link_descadastro}}'
    expect(variaveisInvalidas(texto)).toEqual([])
  })

  it('acusa variável fora do vocabulário', () => {
    expect(variaveisInvalidas('Oi {{nome_completo}}')).toEqual(['nome_completo'])
  })
})

describe('contemHtmlCru', () => {
  it('detecta tag HTML no meio do texto', () => {
    expect(contemHtmlCru('Oi <b>Fulano</b>, tudo bem?')).toBe(true)
    expect(contemHtmlCru('<script>alert(1)</script>')).toBe(true)
  })

  it('não acusa markdown simples nem sinais de menor/maior soltos', () => {
    expect(contemHtmlCru('Oi, **Fulano**! 2 < 3 e 5 > 4.')).toBe(false)
  })
})

describe('validarTemplate', () => {
  it('aceita assunto e corpo válidos', () => {
    const r = validarTemplate('Seu convite chegou', 'Oi, {{primeiro_nome}}! {{link_lab}}')
    expect(r).toEqual({ valido: true, erros: [] })
  })

  it('rejeita assunto vazio', () => {
    const r = validarTemplate('   ', 'corpo válido')
    expect(r.valido).toBe(false)
    expect(r.erros).toContain('Assunto não pode ficar vazio.')
  })

  it('rejeita corpo vazio', () => {
    const r = validarTemplate('assunto válido', '')
    expect(r.valido).toBe(false)
    expect(r.erros).toContain('Corpo não pode ficar vazio.')
  })

  it('rejeita variável fora do vocabulário, listando as válidas', () => {
    const r = validarTemplate('assunto', 'Oi {{sobrenome}}')
    expect(r.valido).toBe(false)
    expect(r.erros.some((e) => e.includes('sobrenome') && e.includes('link_lab'))).toBe(true)
  })

  it('rejeita HTML cru no corpo', () => {
    const r = validarTemplate('assunto', '<p>Oi</p>')
    expect(r.valido).toBe(false)
    expect(r.erros.some((e) => e.toLowerCase().includes('html'))).toBe(true)
  })

  it('acumula mais de um erro ao mesmo tempo', () => {
    const r = validarTemplate('', '<b>{{sobrenome}}</b>')
    expect(r.erros.length).toBeGreaterThanOrEqual(2)
  })
})

describe('proximaVersao', () => {
  it('devolve 1 quando não há versão nenhuma', () => {
    expect(proximaVersao([])).toBe(1)
  })

  it('devolve o maior + 1', () => {
    expect(proximaVersao([1, 2, 3])).toBe(4)
    expect(proximaVersao([1, 5, 2])).toBe(6)
  })
})

function criarVersao(overrides: Partial<VersaoTemplate> = {}): VersaoTemplate {
  return {
    id: 'id-1',
    slug: 'convite_lab',
    versao: 1,
    assunto: 'assunto',
    corpo: 'corpo',
    segmento: 'lead_sem_convite',
    status: 'rascunho',
    criadoEm: '2026-08-08T00:00:00.000Z',
    criadoPor: 'teste',
    ...overrides,
  }
}

describe('versaoParaEditar', () => {
  it('devolve null pra lista vazia', () => {
    expect(versaoParaEditar([])).toBeNull()
  })

  it('prioriza a versão ativa, mesmo que não seja a mais recente', () => {
    const v1 = criarVersao({ versao: 1, status: 'arquivado' })
    const v2 = criarVersao({ versao: 2, status: 'ativo' })
    const v3 = criarVersao({ versao: 3, status: 'rascunho' })
    expect(versaoParaEditar([v1, v2, v3])?.versao).toBe(2)
  })

  it('sem versão ativa, devolve a mais recente', () => {
    const v1 = criarVersao({ versao: 1, status: 'rascunho' })
    const v2 = criarVersao({ versao: 3, status: 'rascunho' })
    const v3 = criarVersao({ versao: 2, status: 'arquivado' })
    expect(versaoParaEditar([v1, v2, v3])?.versao).toBe(3)
  })
})
