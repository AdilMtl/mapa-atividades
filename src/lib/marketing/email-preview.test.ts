import { describe, expect, it } from 'vitest'

import { markdownSimplesParaHtml, renderPreviewEmail, substituirVariaveisDeExemplo } from './email-preview'

describe('substituirVariaveisDeExemplo', () => {
  it('troca variáveis válidas por valores de exemplo', () => {
    const r = substituirVariaveisDeExemplo('Oi, {{primeiro_nome}}! Veja: {{link_lab}}')
    expect(r).not.toContain('{{primeiro_nome}}')
    expect(r).toContain('Marina')
    expect(r).toContain('https://')
  })

  it('mantém intacta uma variável fora do vocabulário (não é dela decidir se é válida)', () => {
    expect(substituirVariaveisDeExemplo('Oi {{sobrenome}}')).toBe('Oi {{sobrenome}}')
  })
})

describe('markdownSimplesParaHtml', () => {
  it('separa parágrafos por linha em branco', () => {
    const html = markdownSimplesParaHtml('Primeiro parágrafo.\n\nSegundo parágrafo.')
    expect(html.match(/<p /g)?.length).toBe(2)
  })

  it('escapa HTML cru em vez de renderizar', () => {
    const html = markdownSimplesParaHtml('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('converte **negrito** em <strong>', () => {
    expect(markdownSimplesParaHtml('isso é **importante**')).toContain('<strong')
  })
})

describe('renderPreviewEmail', () => {
  it('monta um HTML completo com o assunto e o corpo dados', () => {
    const html = renderPreviewEmail('Teu convite pro Lab chegou', 'Oi, {{primeiro_nome}}!')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Teu convite pro Lab chegou')
    expect(html).toContain('Marina')
  })

  it('mostra estado vazio quando corpo/assunto ainda são rascunho', () => {
    const html = renderPreviewEmail('', '')
    expect(html).toContain('sem assunto ainda')
    expect(html).toContain('corpo vazio')
  })
})
