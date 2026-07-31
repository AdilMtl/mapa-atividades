import { describe, expect, it } from 'vitest'

import {
  dataLegivel,
  dispositivoDoUserAgent,
  formatarFeedbackMarkdown,
  formatarFilaMarkdown,
  montarPatchFeedback,
  refCurta,
  type FeedbackLinha,
} from './feedback'

const LINHA: FeedbackLinha = {
  id: 'a1b2c3d4-1111-2222-3333-444455556666',
  createdAt: '2026-07-30T17:22:00.000Z', // 14:22 em São Paulo
  email: null,
  logado: true,
  tipo: 'bug',
  severidade: 'trava',
  mensagem: 'o botão de concluir não aparece quando o checklist está todo marcado',
  rota: '/lab/projeto/[id]',
  contexto: {
    viewport: '390x844',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15',
    app_version: 'a1b2c3d',
  },
  status: 'novo',
  notasAdmin: null,
  issueRef: null,
}

describe('refCurta', () => {
  it('deriva uma referência estável do próprio id', () => {
    expect(refCurta(LINHA.id)).toBe('FB-a1b2c3d4')
  })
})

describe('dataLegivel', () => {
  it('formata em horário de Brasília, independente do fuso do servidor', () => {
    expect(dataLegivel('2026-07-30T17:22:00.000Z')).toBe('2026-07-30 14:22')
  })

  it('não quebra com data inválida', () => {
    expect(dataLegivel('nada disso')).toBe('—')
  })
})

describe('dispositivoDoUserAgent', () => {
  it('reconhece os aparelhos que importam pra reproduzir', () => {
    expect(dispositivoDoUserAgent('... (iPhone; CPU iPhone OS 17_0 ...)')).toBe('iPhone')
    expect(dispositivoDoUserAgent('... (Linux; Android 14; Pixel 8)')).toBe('Android')
    expect(dispositivoDoUserAgent('... (Macintosh; Intel Mac OS X 10_15_7)')).toBe('Mac')
    expect(dispositivoDoUserAgent('... (Windows NT 10.0; Win64; x64)')).toBe('Windows')
    expect(dispositivoDoUserAgent(undefined)).toBeNull()
  })
})

describe('formatarFeedbackMarkdown — contrato do §6.2', () => {
  it('bate o formato exato do exemplo da spec', () => {
    expect(formatarFeedbackMarkdown({ ...LINHA, notasAdmin: 'parece o cache stale da v3.11.19' }))
      .toBe(`### FB-a1b2c3d4 · bug/trava · \`/lab/projeto/[id]\`
**Quando:** 2026-07-30 14:22 · **Quem:** logado · **Onde:** iPhone · 390×844 · \`a1b2c3d\`

> o botão de concluir não aparece quando o checklist está todo marcado

**Triagem:** parece o cache stale da v3.11.19 · **Ref:** —`)
  })

  it('sem severidade, a classificação é só o tipo', () => {
    const md = formatarFeedbackMarkdown({ ...LINHA, tipo: 'ideia', severidade: null })
    expect(md.startsWith('### FB-a1b2c3d4 · ideia · `/lab/projeto/[id]`')).toBe(true)
  })

  it('mostra o e-mail quando existe e marca quem não estava logado', () => {
    const md = formatarFeedbackMarkdown({ ...LINHA, logado: false, email: 'alguem@exemplo.com' })
    expect(md).toContain('**Quem:** anônimo · alguem@exemplo.com')
  })

  it('preenche com travessão o que não veio', () => {
    const md = formatarFeedbackMarkdown({ ...LINHA, rota: null, contexto: null })
    expect(md).toContain('### FB-a1b2c3d4 · bug/trava · —')
    expect(md).toContain('**Onde:** —')
  })

  it('mantém a citação em bloco em mensagem de várias linhas', () => {
    const md = formatarFeedbackMarkdown({ ...LINHA, mensagem: 'primeira linha\nsegunda linha' })
    expect(md).toContain('> primeira linha\n> segunda linha')
  })

  it('separa os itens da fila por uma linha em branco', () => {
    const fila = formatarFilaMarkdown([LINHA, { ...LINHA, id: 'ffffffff-0000-0000-0000-000000000000' }])
    expect(fila).toContain('\n\n### FB-ffffffff')
  })
})

describe('montarPatchFeedback — o registro original é imutável', () => {
  it('ignora mensagem, contexto, user_id e qualquer campo fora da allowlist', () => {
    const patch = montarPatchFeedback({
      status: 'triado',
      mensagem: 'reescrevendo a evidência',
      contexto: { viewport: '1x1' },
      user_id: '00000000-0000-0000-0000-000000000000',
      email: 'outro@exemplo.com',
      created_at: '2020-01-01T00:00:00.000Z',
      rota: '/outra',
    })
    expect(patch).toEqual({ status: 'triado' })
  })

  it('aceita os três campos de triagem', () => {
    expect(montarPatchFeedback({ status: 'em_execucao', notasAdmin: ' nota ', issueRef: 'ISSUE-321' }))
      .toEqual({ status: 'em_execucao', notas_admin: 'nota', issue_ref: 'ISSUE-321' })
  })

  it('string vazia limpa o campo em vez de gravar vazio', () => {
    expect(montarPatchFeedback({ notasAdmin: '   ', issueRef: '' }))
      .toEqual({ notas_admin: null, issue_ref: null })
  })

  it('rejeita status fora do vocabulário', () => {
    expect(montarPatchFeedback({ status: 'arquivado' })).toBeNull()
  })

  it('devolve null quando não sobra nada pra alterar', () => {
    expect(montarPatchFeedback({ mensagem: 'só isso' })).toBeNull()
    expect(montarPatchFeedback(null)).toBeNull()
  })
})
